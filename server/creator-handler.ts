import {timingSafeEqual} from 'node:crypto';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {creatorStatuses,eventNames,validateCreator,type CreatorStatus,type GuideEvent} from '../shared/creators';
import {makeRedisStore,type CreatorStore} from './creator-store';
type Request=IncomingMessage&{body?:unknown};
export function makeCreatorHandler(kind:'interest'|'admin'|'events',env:NodeJS.ProcessEnv=process.env,providedStore?:CreatorStore){
  return async(req:Request,res:ServerResponse)=>{
    const send=(status:number,data:unknown)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data))};
    const ready=!!(env.UPSTASH_REDIS_REST_URL&&env.UPSTASH_REDIS_REST_TOKEN&&env.CREATOR_ADMIN_TOKEN&&env.CREATOR_ADMIN_TOKEN.length>=32);
    if(kind==='interest'&&req.method==='GET')return send(200,{accepting:ready});
    const allowed=kind==='admin'?['GET','PATCH','DELETE']:['POST'];
    if(!allowed.includes(req.method||'')){res.setHeader('Allow',kind==='interest'?'GET, POST':allowed.join(', '));return send(405,{error:'Method not allowed.'})}
    if(!ready)return send(503,{error:'The creator list isn’t open just yet. Please check back soon.'});
    const store=providedStore??makeRedisStore(env);
    try{
      const ip=String(req.headers['x-vercel-forwarded-for']??req.socket?.remoteAddress??'unknown').split(',')[0];
      if(kind==='admin'){
        const supplied=Buffer.from(String(req.headers.authorization??'').replace(/^Bearer /,'')), expected=Buffer.from(env.CREATOR_ADMIN_TOKEN!);
        if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected)){
          if(!await store.limit('admin:'+ip,10,60)){res.setHeader('Retry-After','60');return send(429,{error:'Too many attempts. Please wait a minute.'})}
          return send(401,{error:'Enter the creator inbox access key.'});
        }
      }
      // Browser mutations must originate from this deployment. No permissive CORS.
      if(req.method!=='GET'){
        const origin=req.headers.origin;
        if(!origin)return send(403,{error:'Please submit from this guide.'});
        let originHost='';try{originHost=new URL(origin).host}catch{}
        if(originHost!==req.headers.host)return send(403,{error:'Please submit from this guide.'});
        if(!String(req.headers['content-type']).startsWith('application/json'))return send(415,{error:'Use a JSON request.'});
      }
      if(kind==='admin'&&req.method==='GET'){
        const url=new URL(req.url??'/', 'https://local.invalid'), offset=Number(url.searchParams.get('offset')||'0');
        if(!Number.isInteger(offset)||offset<0||offset>100000)return send(400,{error:'Invalid page.'});
        const page=await store.page(offset);return send(200,{...page,...(offset===0?{metrics:await store.metrics(),analyticsEnabled:env.CREATOR_ANALYTICS_ENABLED==='true'}:{})});
      }
      let raw=req.body;
      if(raw===undefined){let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>4096)return send(413,{error:'Form is too large.'})}raw=text}
      if(Buffer.byteLength(typeof raw==='string'?raw:JSON.stringify(raw))>4096)return send(413,{error:'Form is too large.'});
      let body:Record<string,unknown>;try{body=typeof raw==='string'?JSON.parse(raw):raw as Record<string,unknown>;if(!body||typeof body!=='object'||Array.isArray(body))throw 0}catch{return send(400,{error:'Please check the form and try again.'})}
      if(kind==='admin'){
        const id=String(body.id??'');if(!/^[a-f0-9]{64}$/.test(id))return send(400,{error:'Invalid request ID.'});
        if(req.method==='DELETE'){await store.remove(id);return send(200,{ok:true})}
        if(!creatorStatuses.includes(body.status as CreatorStatus))return send(400,{error:'Invalid status.'});
        return await store.status(id,body.status as CreatorStatus)?send(200,{ok:true}):send(404,{error:'Request not found.'});
      }
      if(kind==='events'){
        if(env.CREATOR_ANALYTICS_ENABLED!=='true'||req.headers.dnt==='1'||req.headers['sec-gpc']==='1')return send(200,{ok:true});
        if(!eventNames.includes(body.event as GuideEvent)||body.event==='creator_submitted')return send(400,{error:'Unknown event.'});
        if(!await store.limit('events:'+ip,120,60))return send(429,{error:'Please slow down.'});
        await store.event(body.event as GuideEvent);return send(200,{ok:true});
      }
      if(!await store.limit('signup:'+ip,5,60)){res.setHeader('Retry-After','60');return send(429,{error:'A few too many tries. Please wait a minute and try again.'})}
      if(body.website)return send(400,{error:'Please check the form and try again.'});
      let input;try{input=validateCreator(body)}catch(error){return send(400,{error:(error as Error).message})}
      const added=await store.add(input);
      // Metrics failure must not turn a durable signup into a failed response.
      if(added&&env.CREATOR_ANALYTICS_ENABLED==='true')await store.event('creator_submitted').catch(()=>{});
      return send(200,{ok:true});
    }catch{return send(503,{error:'I couldn’t save that right now. Please try again shortly.'})}
  };
}
