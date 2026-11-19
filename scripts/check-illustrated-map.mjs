// Run against `npm run preview -- --host 127.0.0.1 --port 4173`.
// Illustrated Greenpoint pilot: fixed camera angle, decorations never block pins, no character-hunting UI, reduced motion.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const env={...process.env};delete env.AGENT_BROWSER_CDP;delete env.FACTORY_DESKTOP_CDP_PORT;delete env.AGENT_BROWSER_PIN_TAB;
const run=(...args)=>execFileSync('agent-browser',['--session','eda-illustrated-regression',...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const evaluate=expression=>JSON.parse(run('eval',expression));
const button=name=>run('find','role','button','click','--name',name,'--exact');
const base='http://127.0.0.1:4173/';
const settle=()=>{run('wait','400');run('wait','--fn',`(()=>{const m=document.querySelector('.city-map').dataset;return !!m.zoom&&!('moving' in m)})()`);};
const angle=label=>{settle();const a=evaluate(`(()=>{const m=document.querySelector('.city-map').dataset;return {pitch:Number(m.pitch),bearing:Number(m.bearing)}})()`);assert(Math.abs(a.pitch-55)<.01&&Math.abs(a.bearing-38)<.01,`${label}: camera angle changed ${JSON.stringify(a)}`);console.log('Fixed angle after',label);};
const pinsClickable=ids=>evaluate(`(()=>${JSON.stringify(ids)}.map(id=>{const p=document.querySelector('.place-pin[data-location-id="'+id+'"]');if(!p)return id+': missing';const r=p.getBoundingClientRect();if(r.right<0||r.left>innerWidth||r.bottom<0||r.top>innerHeight)return id+': offscreen';const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return p.contains(hit)?'ok':id+': covered by '+(hit?.className?.baseVal??hit?.className)}))()`);
try{
run('open',base);run('set','viewport','1440','900');run('eval','localStorage.removeItem("edas-new-york:find-eda:v1");localStorage.setItem("edas-new-york:saved:v1",JSON.stringify({version:1,items:[{entryId:"radio-bakery",savedAt:"2026-11-15T00:00:00.000Z",preferredLocationId:"radio-bakery-greenpoint"}]}))');run('open',base);
angle('Greenpoint opening');
assert(Number(evaluate('document.querySelector(".city-map").dataset.zoom'))>17);
assert.equal(evaluate('getComputedStyle(document.querySelector(".scene-dom")).pointerEvents'),'none');
button('Greenpoint');run('wait','--fn','Number(document.querySelector(".city-map").dataset.zoom)>15.9');angle('Explore Greenpoint');
assert.deepEqual(pinsClickable(['radio-bakery-greenpoint']),['ok']);
assert.equal(evaluate('getComputedStyle(document.querySelector(".place-pin")).position'),'absolute');
run('eval',`(()=>{const c=document.querySelector('.maplibregl-canvas');for(const key of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'])c.dispatchEvent(new KeyboardEvent('keydown',{key,keyCode:{ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40}[key],shiftKey:true,bubbles:true}));return true})()`);angle('keyboard rotate/pitch attempt');
run('click','.place-pin[data-location-id="radio-bakery-greenpoint"]');run('wait','--fn','document.querySelector(".detail-copy h2")?.textContent==="Radio Bakery"');angle('opening a place');
assert.match(evaluate('document.querySelector(".detail-actions a").href'),/google\.com\/maps/);
button('Close panel');button('All New York');angle('reset city view');
run('click','.place-pin:has(.cluster-count)');angle('cluster');
run('click','.desktop-saved');run('wait','--fn','document.querySelectorAll(".place-row").length===1');angle('Saved');run('click','.desktop-saved');
// Filtering must preserve both a close view and a manually chosen wider view.
const cameraState=()=>evaluate('(()=>{const d=document.querySelector(".city-map").dataset;return {zoom:Number(d.zoom),center:d.center,pitch:Number(d.pitch),bearing:Number(d.bearing)}})()');
for(const view of ['Greenpoint','All New York']){
button(view);settle();const beforeFilter=cameraState();
for(const category of ['Walks & parks','Cafés & bakeries','All spots']){
button(category);settle();assert.deepEqual(cameraState(),beforeFilter,`${category} must preserve the ${view} camera`);
}
}
button('Greenpoint');angle('return from category checks');
assert.equal(evaluate('document.querySelector(".eda-avatar,.game-chip,.find-eda-card,.eda-celebration")'),null);
assert.deepEqual(evaluate('JSON.parse(localStorage.getItem("edas-new-york:saved:v1")).items.map(i=>i.entryId)'),['radio-bakery']);
console.log('Character hunt removed; saved collection remains intact.');
run('set','media','light','reduced-motion');run('open',base);button('Greenpoint');settle();
assert.equal(evaluate('getComputedStyle(document.querySelector(".steam span")).animationName'),'none');
const ferry=()=>evaluate('document.querySelector(".ferry").style.transform');const before=ferry();run('wait','1500');assert.equal(ferry(),before);
console.log('Reduced motion stops steam, tail and ferry movement.');
run('set','viewport','390','844');run('set','media','light','no-preference');run('open',base);angle('mobile overview');button('Greenpoint');angle('mobile Explore Greenpoint');assert.equal(evaluate('document.documentElement.scrollWidth>innerWidth'),false);
console.log('Illustrated map checks passed.');
}finally{console.log(run('close'));}
