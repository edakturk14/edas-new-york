// Run against the production preview on port 4173.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const env={...process.env};delete env.AGENT_BROWSER_CDP;delete env.FACTORY_DESKTOP_CDP_PORT;delete env.AGENT_BROWSER_PIN_TAB;
const session='eda-saved-toggle-regression';
const run=(...args)=>execFileSync('agent-browser',['--session',session,...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const evaluate=expression=>JSON.parse(run('eval',expression));
const snapshot=()=>evaluate(`(()=>({saved:JSON.parse(localStorage.getItem('edas-new-york:saved:v1')??'{"items":[]}').items.map(s=>s.entryId),savedActive:document.querySelector('.desktop-saved').classList.contains('active'),drawer:document.querySelector('.drawer')?.getAttribute('aria-label')??null,list:document.querySelector('.map-switch').textContent,locations:[...document.querySelectorAll('.place-pin')].reduce((n,p)=>n+Number(p.querySelector('.cluster-count')?.textContent??1),0),guides:document.querySelectorAll('.walk-pin').length}))()`);
let baseline;
function assertExplore(label){const state=snapshot();assert.equal(state.savedActive,false,`${label}: Saved must toggle off`);assert.equal(evaluate('document.querySelector(".desktop-saved").getAttribute("aria-pressed")'),'false');assert.equal(state.drawer,null,`${label}: show the full map`);assert.equal(state.list,baseline.list,`${label}: restore all recommendations`);assert.equal(state.locations,baseline.locations,`${label}: restore every venue location`);assert.equal(state.guides,9,`${label}: restore all park, walk and area pins`);assert.deepEqual(state.saved,['radio-bakery'],`${label}: keep bookmarks`);console.log(label,state);}
try{
run('open','http://127.0.0.1:4173/?place=radio-bakery');run('set','viewport','1440','900');
run('find','role','button','click','--name','Save Radio Bakery','--exact');
run('wait','--fn','document.querySelectorAll(".place-pin").length>0');
baseline=snapshot();assert.equal(baseline.locations,32);assert.equal(baseline.guides,9);
run('click','.desktop-saved');assert.equal(snapshot().savedActive,true);assert.equal(snapshot().locations,1);
run('click','.desktop-saved');assertExplore('desktop repeated Saved click');
run('select','select[aria-label="Neighborhood"]','greenpoint');
run('click','.desktop-saved');run('click','button[aria-label="Close panel"]');run('click','.desktop-saved');assertExplore('exit Saved map after closing panel and earlier filters');
run('set','viewport','390','844');
for(const selector of ['.desktop-saved','.mobile-nav button:last-child']){run('click',selector);assert.equal(snapshot().savedActive,true);run('click',selector);assertExplore(`mobile toggle ${selector}`);}
run('open','http://127.0.0.1:4173/');run('wait','--fn','document.querySelectorAll(".place-pin").length>0');assertExplore('reload keeps bookmarks and all places');
run('click','.before-button');assert.equal(evaluate(`document.querySelector('.visitor-notes').textContent.includes('A few things I’d tell a friend before they head out.')`),false);assert.equal(evaluate(`document.querySelector('.visitor-notes h3').textContent`),'Subway, made simple');console.log('Before you go intro removed; visitor guidance retained');
}finally{console.log(run('close'));}
