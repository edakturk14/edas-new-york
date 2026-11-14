import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const env={...process.env};delete env.AGENT_BROWSER_CDP;delete env.FACTORY_DESKTOP_CDP_PORT;delete env.AGENT_BROWSER_PIN_TAB;
const run=(...args)=>execFileSync('agent-browser',['--session','eda-search-reset-regression',...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const evaluate=expression=>JSON.parse(run('eval',expression));
const input='input[aria-label="Find a place or neighborhood"]';
const button=name=>run('find','role','button','click','--name',name,'--exact');
const state=()=>evaluate(`(()=>({query:document.querySelector('input').value,neighborhood:document.querySelector('select[aria-label="Neighborhood"]').value,category:document.querySelector('.category-chip.active').textContent,listCount:document.querySelectorAll('.place-row').length,selected:new URL(location.href).searchParams.get('place'),zoom:Number(document.querySelector('.city-map').dataset.zoom),drawer:document.querySelector('.drawer')?.getAttribute('aria-label'),saved:JSON.parse(localStorage.getItem('edas-new-york:saved:v1')??'{"items":[]}').items,savedMode:document.querySelector('.desktop-saved').getAttribute('aria-pressed')}))()`);
function searchOpen(){run('fill',input,'Radio');button('Radio Bakery');run('wait','--fn','Number(document.querySelector(".city-map").dataset.zoom)>15.4');}
function eraseKeyboard(){run('click',input);run('press','End');for(let i=0;i<5;i++)run('press','Backspace');}
function clearSelection(){run('click',input);run('press','End');for(let i=0;i<5;i++)run('press','Shift+ArrowLeft');const selection=evaluate(`(()=>{const e=document.querySelector('input');return {start:e.selectionStart,end:e.selectionEnd,length:e.value.length}})()`);assert.equal(selection.start,0);assert.equal(selection.end,selection.length);run('press','Backspace');}
function assertAll(label){const s=state();assert.equal(s.query,'');assert.equal(s.neighborhood,'all');assert.equal(s.category,'All spots');assert.equal(s.selected,null,`${label}: clear the old focused place`);assert.equal(s.listCount,52,`${label}: restore every recommendation`);run('wait','--fn','Number(document.querySelector(".city-map").dataset.zoom)<12.4');assert.equal(state().savedMode,'false');console.log(label,state());}
try{
run('open','http://127.0.0.1:4173/');run('set','viewport','1440','900');searchOpen();eraseKeyboard();assertAll('erase a search after opening a result');
evaluate('history.back()');run('wait','--fn','new URL(location.href).searchParams.get("place")===null');button('List 52');assertAll('browser Back after clearing does not reopen the old place');run('open',evaluate('location.href'));button('List 52');assertAll('refresh after clearing does not reopen the old place');
searchOpen();button('Clear search');assertAll('clear button after opening a result');
searchOpen();button('Close panel');eraseKeyboard();assertAll('erase search after closing a focused result');
button('Cafés & bakeries');run('select','select[aria-label="Neighborhood"]','greenpoint');searchOpen();clearSelection();assertAll('select-all/backspace after category and neighborhood filters');
run('fill',input,'unfindable-place-xyz');assert.equal(state().listCount,0);button('Clear search');assertAll('clear an empty-result search');
run('set','viewport','390','844');searchOpen();eraseKeyboard();assertAll('phone keyboard erasing');
button('Radio Bakery');button('Save Radio Bakery');run('click','.desktop-saved');run('fill',input,'Radio');button('Radio Bakery');eraseKeyboard();let s=state();assert.equal(s.savedMode,'true');assert.equal(s.drawer,'Saved places');assert.equal(s.listCount,1);assert.equal(s.saved.length,1);assert.equal(s.saved[0].entryId,'radio-bakery');assert.equal(s.selected,null);assert.equal(s.category,'All spots');assert.equal(s.neighborhood,'all');console.log('Clearing Saved search keeps bookmark/context',s);
run('click','.desktop-saved');button('List 52');assertAll('leave Saved after clearing its search');
console.log('Search clearing restores full results/map, clears stale focus, resets filters and preserves bookmarks.');
}finally{console.log(run('close'));}
