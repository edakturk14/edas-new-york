// Uses the separately approved local headless browser, never the user's desktop pane.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const env={...process.env};delete env.AGENT_BROWSER_CDP;delete env.FACTORY_DESKTOP_CDP_PORT;delete env.AGENT_BROWSER_PIN_TAB;
const run=(...args)=>execFileSync('agent-browser',['--session','eda-walk-guide-regression',...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const evaluate=expression=>JSON.parse(run('eval',expression));
const getState=()=>evaluate(`(()=>({id:new URL(location.href).searchParams.get('place'),title:document.querySelector('.detail-copy h2')?.textContent,stops:[...document.querySelectorAll('.walk-stops strong')].map(e=>e.textContent),href:document.querySelector('.detail-actions a')?.href,pins:document.querySelectorAll('.walk-stop-pin').length,overflow:document.documentElement.scrollWidth>innerWidth}))()`);
const showWalks=()=>{run('find','role','button','click','--name','Walks & parks','--exact');run('wait','--fn',`[...document.querySelectorAll('.walk-pin')].every(e=>{const r=e.getBoundingClientRect();return r.top>200&&r.bottom<innerHeight-80&&r.left>390&&r.right<innerWidth})`);};
try{
run('open','http://127.0.0.1:4173/');run('set','viewport','1440','900');
run('wait','--fn','document.querySelectorAll(".walk-pin").length===9');
showWalks();
assert.equal(evaluate('document.querySelectorAll(".place-row").length'),8);assert.equal(evaluate('document.querySelectorAll(".place-pin").length'),0);assert.equal(evaluate('document.querySelectorAll(".walk-pin").length'),8);
run('screenshot','/Users/edaakturk/Desktop/Factory/edas-new-york/screenshots/desktop-parks-pins.png');
for(const [id,name] of [['central-park','Central Park'],['prospect-park','Prospect Park'],['brooklyn-bridge-park-and-heights','Brooklyn Bridge Park + Brooklyn Heights'],['hudson-river-park','West Side Highway / Hudson River Park'],['bryant-park','Bryant Park']]){
 run('click',`.walk-pin[data-entry-id="${id}"]`);assert.equal(getState().title,name);assert.equal(getState().id,id);assert.match(evaluate('document.querySelector(".walk-guide").textContent'),/not a specific entrance/);run('click','button[aria-label="Close panel"]');showWalks();
}
run('click','.walk-pin[data-entry-id="brooklyn-bridge-walk"]');
let state=getState();assert.equal(state.id,'brooklyn-bridge-walk');assert.equal(state.stops.length,2);assert.equal(state.pins,2);let directions=new URL(state.href);assert.match(directions.searchParams.get('origin'),/Brooklyn/);assert.match(directions.searchParams.get('destination'),/Manhattan/);assert.equal(directions.searchParams.get('travelmode'),'walking');
run('find','role','button','click','--name','Save Brooklyn Bridge','--exact');run('click','.desktop-saved');assert.equal(evaluate('document.querySelectorAll(".walk-pin").length'),1);run('find','role','button','click','--name','Brooklyn Bridge','--exact');assert.equal(getState().stops.length,2);run('click','.desktop-saved');
for(const [id,count] of [['brooklyn-bridge-walk',2],['high-line',3],['greenpoint-waterfront',2]]){
 run('open',`http://127.0.0.1:4173/?place=${id}`);run('set','viewport','390','844');run('wait','--fn',`document.querySelectorAll('.walk-stop-pin').length===${count}`);assert.equal(getState().stops.length,count);assert.equal(getState().overflow,false);
 run('wait','--fn',`(()=>{const pins=[...document.querySelectorAll('.walk-stop-pin')].map(e=>e.getBoundingClientRect());const sheet=document.querySelector('.drawer').getBoundingClientRect();return pins.every(p=>p.top>220&&p.bottom<sheet.top&&p.left>=0&&p.right<=innerWidth)})()`);
 run('screenshot',`/Users/edaakturk/Desktop/Factory/edas-new-york/screenshots/mobile-${id}.png`);
 run('click','button[aria-label="Close panel"]');run('find','role','button','click','--name','Walks & parks','--exact');run('find','role','button','click','--name',id==='high-line'?'The High Line':id==='greenpoint-waterfront'?'Greenpoint waterfront':'Brooklyn Bridge','--exact');assert.equal(getState().stops.length,count);console.log('Mobile map/list/deep link',id,getState());
}
run('click','button[aria-label="Close panel"]');run('click','.before-button');assert.equal(evaluate('document.querySelector(".visitor-notes").textContent.includes("Walk it this way")'),false);
console.log('All eight park/walk pins, walking links, mobile bounds, list, deep links and saved walk passed.');
}finally{console.log(run('close'));}
