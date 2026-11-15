// Measures first-load cost of a running production preview in an isolated headless browser.
// Usage: node --experimental-websocket scripts/measure-load.mjs [url] [runs]
// Uses its own agent-browser session, never the user's Factory pane.
import {execFileSync} from 'node:child_process';
const url=process.argv[2]??'http://127.0.0.1:4173/';const runs=Number(process.argv[3]??3);
const env={...process.env};delete env.AGENT_BROWSER_CDP;delete env.FACTORY_DESKTOP_CDP_PORT;delete env.AGENT_BROWSER_PIN_TAB;
const session='eda-load-measure';
const ab=(...args)=>execFileSync('agent-browser',['--session',session,...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
ab('open','about:blank');const ws=new WebSocket(ab('get','cdp-url'));
await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail});
let id=0;const pending=new Map();const listeners=new Set();
ws.onmessage=m=>{const msg=JSON.parse(m.data);if(msg.id&&pending.has(msg.id)){const {ok,fail}=pending.get(msg.id);pending.delete(msg.id);msg.error?fail(Error(msg.error.message)):ok(msg.result)}else listeners.forEach(l=>l(msg))};
const send=(method,params={},sessionId)=>new Promise((ok,fail)=>{const n=++id;pending.set(n,{ok,fail});ws.send(JSON.stringify({id:n,method,params,sessionId}))});
const profiles={
 desktop:{width:1440,height:900,mobile:false,dpr:1,cpu:1,network:null},
 mobile:{width:390,height:844,mobile:true,dpr:2,cpu:4,network:{offline:false,latency:150,downloadThroughput:1.6e6/8,uploadThroughput:750e3/8}}
};
// Records when the HUD, the first map canvas and the ready map (status overlay gone) appear.
const probe=`(()=>{const t={};window.__load=t;const check=()=>{const now=performance.now();
if(!t.shell&&document.querySelector('h1'))t.shell=now;
if(!t.canvas&&document.querySelector('.city-map canvas'))t.canvas=now;
if(!t.mapReady&&document.querySelector('.city-map canvas')?.clientHeight>0&&!document.querySelector('.map-status'))t.mapReady=now;
if(!t.buildings&&document.querySelector('.city-map[data-buildings="ready"]'))t.buildings=now;
if(!t.mapReady||!t.shell||!t.buildings)requestAnimationFrame(check)};requestAnimationFrame(check)})()`;
async function measure(name,p){
 const {browserContextId}=await send('Target.createBrowserContext');
 const {targetId}=await send('Target.createTarget',{url:'about:blank',browserContextId});
 const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const s=(m,params)=>send(m,params,sessionId);
 await s('Network.enable');await s('Page.enable');await s('Network.setCacheDisabled',{cacheDisabled:true});
 await s('Emulation.setDeviceMetricsOverride',{width:p.width,height:p.height,deviceScaleFactor:p.dpr,mobile:p.mobile});
 await s('Emulation.setCPUThrottlingRate',{rate:p.cpu});
 if(p.network)await s('Network.emulateNetworkConditions',p.network);
 await s('Page.addScriptToEvaluateOnNewDocument',{source:probe});
 const reqs=new Map();const done=[];let start=0;
 // MapLibre fetches GeoJSON and tiles from a worker, so attach to workers and throttle them too.
 const sessions=new Set([sessionId]);
 const setup=async id=>{await send('Network.enable',{},id);await send('Network.setCacheDisabled',{cacheDisabled:true},id);if(p.network)await send('Network.emulateNetworkConditions',p.network,id);};
 const listener=msg=>{if(msg.method==='Target.attachedToTarget'&&sessions.has(msg.sessionId)){const child=msg.params.sessionId;sessions.add(child);setup(child).catch(()=>{}).finally(()=>send('Runtime.runIfWaitingForDebugger',{},child).catch(()=>{}));return}
  if(!sessions.has(msg.sessionId))return;const q=msg.params;
  if(msg.method==='Target.attachedToTarget'){const child=q.sessionId;sessions.add(child);setup(child).catch(()=>{}).finally(()=>send('Runtime.runIfWaitingForDebugger',{},child).catch(()=>{}));return}
  if(msg.method==='Network.requestWillBeSent')reqs.set(q.requestId,{url:q.request.url,type:q.type});
  if(msg.method==='Network.loadingFinished'){const r=reqs.get(q.requestId);if(r)done.push({...r,bytes:q.encodedDataLength,at:q.timestamp})}};
 listeners.add(listener);
 await s('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:true,flatten:true});
 start=Date.now();await s('Page.navigate',{url});
 let t={};const deadline=Date.now()+120000;
 while(Date.now()<deadline){await new Promise(r=>setTimeout(r,250));const v=await s('Runtime.evaluate',{expression:'JSON.stringify(window.__load||{})',returnByValue:true});t=JSON.parse(v.result.value);if(t.mapReady)break;}
 // Deferred building geometry: wait for it (builds without the marker have it before mapReady).
 const buildingsDeadline=Date.now()+30000;
 while(!t.buildings&&Date.now()<buildingsDeadline){await new Promise(r=>setTimeout(r,250));const v=await s('Runtime.evaluate',{expression:'JSON.stringify(window.__load||{})',returnByValue:true});t=JSON.parse(v.result.value);if(!t.buildings&&!(await s('Runtime.evaluate',{expression:'!!document.querySelector("script[src*=CityMap],link[href*=CityMap]")||performance.getEntriesByType("resource").some(r=>r.name.includes("CityMap"))',returnByValue:true})).result.value)break;}
 // Let remaining work settle so total bytes include it.
 await new Promise(r=>setTimeout(r,p.network?8000:3000));
 listeners.delete(listener);
 const own=done.filter(d=>d.url.startsWith(new URL(url).origin));const ext=done.filter(d=>!d.url.startsWith(new URL(url).origin)&&!d.url.startsWith('data:'));
 const sum=a=>a.reduce((n,d)=>n+d.bytes,0);
 const big=own.filter(d=>d.bytes>20000).map(d=>`${new URL(d.url).pathname.split('/').pop()}=${Math.round(d.bytes/1024)}KB`);
 await send('Target.closeTarget',{targetId});await send('Target.disposeBrowserContext',{browserContextId});
 return {profile:name,shellMs:Math.round(t.shell),mapCanvasMs:Math.round(t.canvas),mapReadyMs:Math.round(t.mapReady),buildingsMs:Math.round(t.buildings??t.mapReady),ownKB:Math.round(sum(own)/1024),externalKB:Math.round(sum(ext)/1024),requests:done.length,big:big.join(' ')};
}
const only=process.argv[4];
try{for(const [name,p] of Object.entries(profiles)){if(only&&only!==name)continue;for(let i=0;i<runs;i++)console.log(JSON.stringify(await measure(name,p)));}}
finally{ws.close();ab('close');}
