// Run against `npm run preview -- --host 127.0.0.1 --port 4173`.
// Uses a separate local browser, never the user's Factory pane.
import {execFileSync} from 'node:child_process';
const env={...process.env};delete env.AGENT_BROWSER_CDP;delete env.FACTORY_DESKTOP_CDP_PORT;delete env.AGENT_BROWSER_PIN_TAB;
const session='eda-marker-regression';
const run=(...args)=>execFileSync('agent-browser',['--session',session,...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']});
try{
console.log(run('open','http://127.0.0.1:4173/?place=radio-bakery'));
console.log(run('set','viewport','390','844'));
console.log(run('open','http://127.0.0.1:4173/?place=radio-bakery'));
console.log(run('wait','--fn','Number(document.querySelector(".city-map").dataset.zoom)>15'));
console.log(run('eval',`(()=>{const pin=document.querySelector('.place-pin.selected'),sheet=document.querySelector('.drawer');if(!pin||!sheet)throw Error('Missing selected pin or sheet');const p=pin.getBoundingClientRect(),s=sheet.getBoundingClientRect();if(getComputedStyle(pin).position!=='absolute')throw Error('Marker must remain absolutely positioned');if(p.left<0||p.right>innerWidth||p.top<210||p.bottom>=s.top)throw Error('Selected marker is clipped or hidden by mobile chrome: '+JSON.stringify({pin:p.toJSON(),sheet:s.toJSON()}));return {passed:true,pin:p.toJSON(),sheetTop:s.top};})()`));
}finally{console.log(run('close'));}
