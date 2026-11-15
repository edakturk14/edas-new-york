// npm run places        check docs/content/places.csv and merge it into the guide data
// npm run places:check  check only, change nothing
// npm run places:export rewrite places.csv from the current guide data
import {readFileSync,writeFileSync} from 'node:fs';
import {CSV_PATH,readRows,validate,merge,managedIdsOf,exportRows,toCsv,type Seed} from './places-lib';
const root=new URL('../',import.meta.url);
const file=(p:string)=>new URL(p,root);
const SEED='docs/content/guide-seed.json',LOCATIONS='src/data/locations.json';
const readJson=(p:string)=>JSON.parse(readFileSync(file(p),'utf8'));
const writeJson=(p:string,data:unknown)=>writeFileSync(file(p),JSON.stringify(data,null,2)+'\n');
const mode=process.argv[2]??'merge';
const seed:Seed=readJson(SEED);const locations=readJson(LOCATIONS);
if(mode==='--export'){const rows=exportRows(seed,locations);writeFileSync(file(CSV_PATH),toCsv(rows));console.log(`Wrote ${rows.length} places to ${CSV_PATH}.`);process.exit(0);}
const check=mode==='--check';
const fail=(errors:string[])=>{console.error(`\n${CSV_PATH} has ${errors.length} problem${errors.length===1?'':'s'}. Nothing was changed.\n`);for(const e of errors)console.error('  • '+e);console.error('\nFix these in the sheet, export it as CSV again, and rerun.');process.exit(1);};
const {rows,errors:readErrors}=readRows(readFileSync(file(CSV_PATH),'utf8'));
if(readErrors.length)fail(readErrors);
const {places,errors,filledIds}=validate(rows,seed,managedIdsOf(seed));
if(errors.length)fail(errors);
const photoIds=new Set([...Object.keys(readJson('src/data/place-photos.json')),...Object.keys(readJson('src/data/area-photos.json'))]);
const result=merge(seed,locations,places,photoIds,new Date().toISOString().slice(0,10));
if(result.errors.length)fail(result.errors);
for(const row of filledIds)console.log(`  • Row ${row.line}: gave ${row.name} the id "${row.id}"`);
for(const change of result.changes)console.log('  • '+change);
if(check){console.log(`\n${CSV_PATH} looks good: ${places.length} places, ${result.changes.length+filledIds.length} pending change${result.changes.length+filledIds.length===1?'':'s'}. Run npm run places to apply.`);process.exit(0);}
if(!result.changes.length&&!filledIds.length){console.log(`${CSV_PATH} looks good. The guide already matches it (${places.length} places).`);process.exit(0);}
writeJson(SEED,result.seed);writeJson(LOCATIONS,result.locations);
// Write generated ids back so a place keeps its id (and visitors' saves) if its name changes later.
if(filledIds.length)writeFileSync(file(CSV_PATH),toCsv(rows));
console.log(`\nUpdated ${SEED} and ${LOCATIONS}. Next: npm test, then npm run dev to look at it.`);
