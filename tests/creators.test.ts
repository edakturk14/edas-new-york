import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {makeCreatorHandler} from '../server/creator-handler';
import {memoryCreatorStore} from '../scripts/fixtures/creator-store';
import {validateCreator,creatorsCsv} from '../shared/creators';
import {makeRedisStore} from '../server/creator-store';
const input={email:'  Creator@Example.com ',city:'Istanbul',profile:'https://example.com/creator',hasList:'yes',consent:true};
const key='test-admin-key-with-at-least-32-characters';
const env={UPSTASH_REDIS_REST_URL:'https://unused.invalid',UPSTASH_REDIS_REST_TOKEN:'test',CREATOR_ADMIN_TOKEN:key,CREATOR_ANALYTICS_ENABLED:'true'};
async function fixture(fn:(request:(path:string,method?:string,body?:unknown,headers?:Record<string,string>)=>Promise<Response>,store:ReturnType<typeof memoryCreatorStore>)=>Promise<void>,environment=env){
  const store=memoryCreatorStore();const handlers={interest:makeCreatorHandler('interest',environment,store),admin:makeCreatorHandler('admin',environment,store),events:makeCreatorHandler('events',environment,store)};
  const server=createServer((req,res)=>{const kind=(req.url?.split('?')[0].slice(1)||'interest') as keyof typeof handlers;void handlers[kind](req,res)});
  server.listen(0,'127.0.0.1');await once(server,'listening');const {port}=server.address() as {port:number};const origin='http://127.0.0.1:'+port;
  try{await fn((path,method='GET',body,headers={})=>fetch(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...headers},...(body!==undefined?{body:typeof body==='string'?body:JSON.stringify(body)}:{})}),store)}finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()))}
}
test('creator validation normalizes email, requires consent and rejects unsafe/oversized links',()=>{
  assert.equal(validateCreator(input).email,'creator@example.com');
  for(const change of [{email:'bad'},{city:''},{city:'x'.repeat(101)},{profile:'javascript:alert(1)'},{profile:'https://user:pass@example.com'},{consent:false},{hasList:'maybe'}])assert.throws(()=>validateCreator({...input,...change}));
});
test('unconfigured deployments do not accept or pretend to save a signup',()=>fixture(async request=>{
  assert.deepEqual(await(await request('/interest')).json(),{accepting:false});
  assert.equal((await request('/interest','POST',input)).status,503);
},{...env,UPSTASH_REDIS_REST_TOKEN:''}));
test('signup, deduplication, private inbox, status change, metrics and deletion form one working flow',()=>fixture(async(request,store)=>{
  assert.equal((await request('/admin')).status,401);
  assert.equal((await request('/interest','POST',input)).status,200);
  const auth={Authorization:'Bearer '+key};
  let page=await(await request('/admin','GET',undefined,auth)).json();
  assert.equal(page.total,1);assert.equal(page.records[0].email,'creator@example.com');assert.equal(page.metrics.creator_submitted,1);
  const id=page.records[0].id;
  assert.equal((await request('/admin','PATCH',{id,status:'contacted'},auth)).status,200);
  await request('/interest','POST',{...input,city:'Overwritten?'});
  page=await(await request('/admin','GET',undefined,auth)).json();assert.equal(page.total,1);assert.equal(page.records[0].status,'contacted');assert.equal(page.records[0].city,'Istanbul');
  await request('/events','POST',{event:'creator_opened',email:'must-not-be-stored'});
  assert.equal((await store.metrics()).creator_opened,1);
  await request('/events','POST',{event:'place_saved'},{DNT:'1'});assert.equal((await store.metrics()).place_saved,undefined);
  assert.equal((await request('/events','POST',{event:'creator_submitted'})).status,400);
  assert.equal((await request('/admin','DELETE',{id},auth)).status,200);assert.equal((await store.page(0)).total,0);
}));
test('same-origin, JSON, validation, size, honeypot and rate limits are enforced',()=>fixture(async request=>{
  assert.equal((await request('/interest','POST',input,{Origin:'https://elsewhere.example'})).status,403);
  assert.equal((await request('/interest','POST',input,{'Content-Type':'text/plain'})).status,415);
  assert.equal((await request('/interest','POST','{bad json')).status,400);
  assert.equal((await request('/interest','POST',{...input,city:'x'.repeat(5000)})).status,413);
  assert.equal((await request('/interest','POST',{...input,website:'bot'})).status,400);
  assert.equal((await request('/interest','POST',{...input,consent:false})).status,400);
  for(let i=0;i<3;i++)await request('/interest','POST',input);
  const limited=await request('/interest','POST',input);assert.equal(limited.status,429);assert.equal(limited.headers.get('Retry-After'),'60');
}));
test('storage failure gives an error instead of a success and does not expose credentials',()=>fixture(async(request,store)=>{
  store.add=async()=>{throw new Error('secret backend details')};
  const response=await request('/interest','POST',input);assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/secret/);
}));
test('CSV protects spreadsheet formula injection and quotes',async()=>{
  const store=memoryCreatorStore();await store.add(validateCreator({...input,city:'=HYPERLINK("x")'}));
  const csv=creatorsCsv((await store.page(0)).records);assert.match(csv,/'=HYPERLINK/);assert.match(csv,/""x""/);
});
test('Redis writes use atomic deduplication and separate preview namespaces',async()=>{
  const original=globalThis.fetch;const commands:unknown[][]=[];
  globalThis.fetch=async(_url,options)=>{commands.push(JSON.parse(String(options?.body)));return new Response(JSON.stringify({result:1}),{status:200})};
  try{
    const store=makeRedisStore({...env,VERCEL_ENV:'preview'});await store.add(validateCreator(input));await store.limit('signup:1.2.3.4',5,60);
    assert.equal(commands[0][0],'EVAL');assert.match(String(commands[0][1]),/HEXISTS/);assert.match(String(commands[0][3]),/:preview:creators/);
    assert.doesNotMatch(String(commands[1][3]),/1\.2\.3\.4/);
  }finally{globalThis.fetch=original}
});
