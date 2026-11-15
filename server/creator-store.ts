import {createHmac} from 'node:crypto';
import type {CreatorInput,CreatorRecord,CreatorStatus,GuideEvent} from '../shared/creators';
export type CreatorStore = {
  limit(bucket:string,limit:number,seconds:number):Promise<boolean>;
  add(input:CreatorInput):Promise<boolean>;
  page(offset:number):Promise<{records:CreatorRecord[];total:number;next:number|null}>;
  status(id:string,status:CreatorStatus):Promise<boolean>;
  remove(id:string):Promise<void>;
  event(name:GuideEvent):Promise<void>;
  metrics():Promise<Record<string,number>>;
};
export function makeRedisStore(env:NodeJS.ProcessEnv=process.env):CreatorStore {
  const url=env.UPSTASH_REDIS_REST_URL!, token=env.UPSTASH_REDIS_REST_TOKEN!;
  // Preview data must never mix with real creator requests.
  const namespace=env.CREATOR_DATA_NAMESPACE || `edas-new-york:${env.VERCEL_ENV==='production'?'production':'preview'}`;
  const hash=(value:string)=>createHmac('sha256',token).update(value).digest('hex');
  const records=namespace+':creators', index=namespace+':creator-index';
  async function command<T>(...args:(string|number)[]):Promise<T>{
    const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});
    const data=await response.json() as {result:T;error?:string};
    if(!response.ok||data.error)throw new Error('Creator storage unavailable');
    return data.result;
  }
  return {
    async limit(bucket,limit,seconds){const count=await command<number>('EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",1,namespace+':limit:'+hash(bucket),seconds);return count<=limit},
    async add(input){
      const now=new Date().toISOString(), id=hash(input.email);
      const record:CreatorRecord={...input,id,createdAt:now,updatedAt:now,status:'interested',guideId:'edas-new-york',consentVersion:'creator-invite-v1'};
      // Atomic deduplication + index insertion. Repeated requests never reset follow-up status or replace someone's profile.
      const added=await command<number>('EVAL',"if redis.call('HEXISTS',KEYS[1],ARGV[1])==1 then return 0 end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[2]); redis.call('ZADD',KEYS[2],ARGV[3],ARGV[1]); return 1",2,records,index,id,JSON.stringify(record),Date.now());
      return added===1;
    },
    async page(offset){const total=await command<number>('ZCARD',index), ids=await command<string[]>('ZREVRANGE',index,offset,offset+24);const rows=ids.length?await command<(string|null)[]>('HMGET',records,...ids):[];return {records:rows.filter((r):r is string=>r!==null).map(r=>JSON.parse(r) as CreatorRecord),total,next:offset+25<total?offset+25:null}},
    async status(id,status){return !!await command<number>('EVAL',"local v=redis.call('HGET',KEYS[1],ARGV[1]); if not v then return 0 end; local r=cjson.decode(v); r.status=ARGV[2]; r.updatedAt=ARGV[3]; redis.call('HSET',KEYS[1],ARGV[1],cjson.encode(r)); return 1",1,records,id,status,new Date().toISOString())},
    async remove(id){await command('EVAL',"redis.call('HDEL',KEYS[1],ARGV[1]); redis.call('ZREM',KEYS[2],ARGV[1]); return 1",2,records,index,id)},
    async event(name){const key=namespace+':events:'+new Date().toISOString().slice(0,10);await command('EVAL',"redis.call('HINCRBY',KEYS[1],ARGV[1],1); redis.call('EXPIRE',KEYS[1],7776000); return 1",1,key,name)},
    async metrics(){const totals:Record<string,number>={};const days=Array.from({length:30},(_,i)=>new Date(Date.now()-i*86400000).toISOString().slice(0,10));const rows=await Promise.all(days.map(day=>command<string[]>('HGETALL',namespace+':events:'+day)));for(const row of rows)for(let i=0;i<row.length;i+=2)totals[row[i]]=(totals[row[i]]||0)+Number(row[i+1]);return totals},
  };
}
