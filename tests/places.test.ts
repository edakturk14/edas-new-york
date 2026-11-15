import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readRows,validate,merge,managedIdsOf,exportRows,toCsv,parseCsv,COLUMNS,type Seed} from '../scripts/places-lib';
const seed:Seed=JSON.parse(readFileSync(new URL('../docs/content/guide-seed.json',import.meta.url),'utf8'));
const locations=JSON.parse(readFileSync(new URL('../src/data/locations.json',import.meta.url),'utf8'));
const csv=readFileSync(new URL('../docs/content/places.csv',import.meta.url),'utf8');
const header=COLUMNS.join(',');
const check=(rows:string)=>{const read=readRows(header+'\n'+rows);return validate(read.rows,seed,managedIdsOf(seed));};
const newPlace='new-spot,New Spot,"Cafés & bakeries, food",Greenpoint,"1 India Street, Brooklyn, NY 11222",40.7318,-73.9586,So good.,A tiny café.,https://example.com,coffee,';
test('places.csv is in sync with the guide data',()=>{const {rows,errors}=readRows(csv);assert.deepEqual(errors,[]);const v=validate(rows,seed,managedIdsOf(seed));assert.deepEqual(v.errors,[]);assert.equal(v.filledIds.length,0);const m=merge(seed,locations,v.places,new Set(),'2026-01-01');assert.deepEqual(m.errors,[]);assert.deepEqual(m.changes,[],'Run npm run places to apply sheet edits');});
test('export round-trips through the checker without changes',()=>{const {rows}=readRows(toCsv(exportRows(seed,locations)));const v=validate(rows,seed,managedIdsOf(seed));assert.deepEqual(v.errors,[]);assert.deepEqual(merge(seed,locations,v.places,new Set(),'2026-01-01').changes,[]);});
test('sheet covers ordinary venues; walks, areas and multi-branch Bakeri stay in JSON',()=>{const ids=managedIdsOf(seed);assert.equal(ids.size,30);for(const id of ['bakeri','high-line','central-park','times-square','west-village'])assert(!ids.has(id));});
test('a new row becomes an entry with one mapped location and keeps notes exact',()=>{const v=check(csv.split('\n').slice(1).join('\n')+newPlace);assert.deepEqual(v.errors,[]);const m=merge(seed,locations,v.places,new Set(),'2026-01-01');assert.deepEqual(m.changes,['Added New Spot (new-spot)']);const e=m.seed.entries.find(e=>e.id==='new-spot')!;assert.deepEqual(e.categories,['cafes','food']);assert.equal(e.edaNoteDisplay,'So good.');assert.equal(e.edaNoteOriginal,'So good.');const l=m.locations.find(l=>l.entryId==='new-spot')!;assert.deepEqual(l.coordinates,[-73.9586,40.7318]);assert.deepEqual(l.neighborhoodIds,['greenpoint']);assert.match(l.coordinateSource,/^https:\/\//);assert.match(l.addressSource,/^https:\/\//);});
test('an empty note stays missing and a removed row removes only that place',()=>{const v=check(csv.split('\n').slice(1).filter(r=>!r.startsWith('beco,')).join('\n')+newPlace.replace('So good.',''));assert.deepEqual(v.errors,[]);const m=merge(seed,locations,v.places,new Set(),'2026-01-01');assert.equal(m.seed.entries.find(e=>e.id==='new-spot')!.edaNoteDisplay,null);assert.deepEqual(m.changes,['Added New Spot (new-spot)','Removed Beco (beco)']);assert(!m.locations.some(l=>l.entryId==='beco'));assert.equal(m.seed.entries.length,seed.entries.length);});
test('removing a place that has a photo is refused with instructions',()=>{const v=check(csv.split('\n').slice(1).filter(r=>!r.startsWith('moma,')).join('\n'));const m=merge(seed,locations,v.places,new Set(['moma']),'2026-01-01');assert.match(m.errors[0],/MoMA \(moma\).*has a photo/);});
test('validation explains each mistake',()=>{
const v=check([
 'the-met,Dup,museums,Midtown,"1 A St",40.75,-73.98,,,,,',
 'the-met,Dup Two,museums,Midtown,"1 A St",40.75,-73.98,,,,,',
 'high-line,Clash,walks,Chelsea,"1 A St",40.75,-73.98,,,,,',
 ',Pizza Place,pizza,Atlantis,,-73.98,40.75,,,www.x.com,,maybe',
 'far,Far Away,food,Midtown,"1 A St",34.05,-118.24,,,,,',
 'paste,Pasted,food,Midtown,"1 A St","40.7323915, -73.9550678",,,,,,',
].join('\n'));
const all=v.errors.join('\n');
assert.match(all,/id "the-met" is already used on row 2/);assert.match(all,/id "high-line" is already used by a place kept in guide-seed\.json/);assert.match(all,/unknown category "pizza"/);assert.match(all,/unknown neighborhood "Atlantis"/);assert.match(all,/address is empty/);assert.match(all,/look swapped/);assert.match(all,/must be a full link starting with https/);assert.match(all,/eda_hasnt_been must be "yes"/);assert.match(all,/outside the New York map area/);
assert.equal(v.places.find(p=>p.id==='paste')?.coordinates[1],40.7323915);assert.equal(v.filledIds.length,1);assert.equal(v.filledIds[0].id,'pizza-place');});
test('CSV parsing handles quotes, line breaks, BOM and semicolon exports',()=>{assert.deepEqual(parseCsv('\uFEFFa,b\r\n"x, ""y""","line\nbreak"\r\n').map(r=>r.cells),[['a','b'],['x, "y"','line\nbreak']]);assert.deepEqual(parseCsv('a;b\n1,5;2\n').map(r=>r.cells),[['a','b'],['1,5','2']]);const {errors}=readRows('name,colour\n');assert.match(errors.join(' '),/Unknown column\(s\): colour/);});
