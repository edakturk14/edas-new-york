// Spreadsheet workflow for ordinary single-location places. See README "Add or edit a place".
import {neighborhoods as knownNeighborhoods,neighborhoodLabel,cameraTargets} from '../src/data/content';

export const CSV_PATH='docs/content/places.csv';
export const MANAGED_MARKER='docs/content/places.csv';
export const COLUMNS=['id','name','categories','neighborhood','address','latitude','longitude','eda_note','description','website','tags','eda_hasnt_been'] as const;
type Column=typeof COLUMNS[number];
export type Row=Record<Column,string>&{line:number};
// Matches the area the map shows and the bounds the content tests enforce.
export const BOUNDS={minLng:-74.1,maxLng:-73.8,minLat:40.6,maxLat:40.9};

type Json=Record<string,any>;
export type Seed={categories:{id:string;label:string}[];entries:Json[]}&Json;

export function parseCsv(text:string){
 text=text.replace(/^\uFEFF/,'');
 const firstLine=text.split(/\r?\n/,1)[0];
 const delimiter=[',',';','\t'].map(d=>[d,firstLine.split(d).length] as const).sort((a,b)=>b[1]-a[1])[0][0];
 const records:{cells:string[];line:number}[]=[];let cells:string[]=[];let cell='';let quoted=false;let line=1;let start=1;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else quoted=false}else{if(c==='\n')line++;cell+=c}continue}
  if(c==='"'&&cell==='')quoted=true;
  else if(c===delimiter){cells.push(cell);cell=''}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;cells.push(cell);records.push({cells,line:start});cells=[];cell='';line++;start=line}
  else cell+=c;}
 if(cell!==''||cells.length){cells.push(cell);records.push({cells,line:start})}
 return records.filter(r=>r.cells.some(c=>c.trim()!==''));
}

export function toCsv(rows:Record<string,string>[]){
 const esc=(v:string)=>/[",\n\r]/.test(v)||/^\s|\s$/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;
 return [COLUMNS.join(','),...rows.map(r=>COLUMNS.map(c=>esc(r[c]??'')).join(','))].join('\n')+'\n';
}

export const slug=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’‘]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const key=(s:string)=>slug(s).replace(/-/g,'');
const split=(s:string)=>s.split(/[,;|/]/).map(v=>v.trim()).filter(Boolean);
const splitTags=(s:string)=>s.split(/[,;|]/).map(v=>v.trim()).filter(Boolean);

export function readRows(text:string){
 const errors:string[]=[];const records=parseCsv(text);
 if(!records.length)return {rows:[] as Row[],errors:['The file is empty. Keep the header row: '+COLUMNS.join(',')]};
 const header=records[0].cells.map(h=>slug(h).replace(/-/g,'_'));
 const unknown=header.filter(h=>h&&!(COLUMNS as readonly string[]).includes(h));
 if(unknown.length)errors.push(`Unknown column(s): ${unknown.join(', ')}. Allowed columns: ${COLUMNS.join(', ')}.`);
 const missing=(['name','categories','neighborhood','address','latitude'] as Column[]).filter(c=>!header.includes(c));
 if(missing.length)errors.push(`Missing column(s): ${missing.join(', ')}.`);
 const rows=records.slice(1).map(r=>{const row={line:r.line} as Row;COLUMNS.forEach(c=>{const i=header.indexOf(c);row[c]=i<0?'':(r.cells[i]??'').trim()});return row});
 return {rows,errors};
}

type Place={id:string;name:string;categories:string[];neighborhoods:string[];address:string;coordinates:[number,number];note:string|null;description:string;website:string;tags:string[];notVisited:boolean};

export function validate(rows:Row[],seed:Seed,managedIds:Set<string>){
 const errors:string[]=[];const places:Place[]=[];const filledIds:Row[]=[];
 const categories=seed.categories.filter(c=>c.id!=='neighborhoods');
 const hoods=[...new Set([...knownNeighborhoods,...Object.keys(cameraTargets)])];
 const otherIds=new Set(seed.entries.map(e=>e.id).filter(id=>!managedIds.has(id)));
 const seen=new Map<string,number>();
 for(const row of rows){
  const at=`Row ${row.line}${row.name?` (${row.name})`:''}`;const problems:string[]=[];
  if(!row.name)problems.push('name is empty');
  let id=row.id;
  if(!id&&row.name){id=slug(row.name);row.id=id;filledIds.push(row);}
  if(id&&!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))problems.push(`id "${id}" must use lowercase letters, numbers and dashes, like "${slug(id)}"`);
  if(id&&seen.has(id))problems.push(`id "${id}" is already used on row ${seen.get(id)}. Each place needs its own id`);
  if(id&&otherIds.has(id))problems.push(`id "${id}" is already used by a place kept in guide-seed.json (walks, areas, multi-branch places). Choose another id`);
  if(id)seen.set(id,row.line);
  const cats:string[]=[];for(const c of split(row.categories)){const match=categories.find(k=>key(k.id)===key(c)||key(k.label)===key(c));if(match){if(!cats.includes(match.id))cats.push(match.id)}else problems.push(`unknown category "${c}". Use: ${categories.map(k=>k.id).join(', ')}`);}
  if(!row.categories)problems.push(`categories is empty. Use one or more of: ${categories.map(k=>k.id).join(', ')}`);
  const ns:string[]=[];for(const n of split(row.neighborhood)){const match=hoods.find(h=>key(h)===key(n)||key(neighborhoodLabel(h))===key(n));if(match){if(!ns.includes(match))ns.push(match)}else problems.push(`unknown neighborhood "${n}". Use one of: ${hoods.sort().join(', ')}`);}
  if(!row.neighborhood)problems.push('neighborhood is empty');
  if(!row.address)problems.push('address is empty');
  let latText=row.latitude,lngText=row.longitude;
  if(latText.includes(',')&&!lngText)[latText,lngText]=latText.split(',').map(s=>s.trim());
  const lat=Number(latText),lng=Number(lngText);
  if(latText.includes(',')&&lngText)problems.push(`latitude "${latText}" holds both numbers. Leave longitude empty when you paste the pair, or split it into the two columns`);
  else if(!latText||!lngText)problems.push('latitude and longitude are both required (paste them from Google Maps)');
  else if(!Number.isFinite(lat)||!Number.isFinite(lng))problems.push(`coordinates "${latText}, ${lngText}" are not numbers`);
  else{const inside=(x:number,y:number)=>x>=BOUNDS.minLng&&x<=BOUNDS.maxLng&&y>=BOUNDS.minLat&&y<=BOUNDS.maxLat;
   if(!inside(lng,lat))problems.push(inside(lat,lng)?`latitude and longitude look swapped: latitude is the first Google Maps number (about 40.7), longitude the second (about -73.9)`:`coordinates ${lat}, ${lng} are outside the New York map area (latitude ${BOUNDS.minLat} to ${BOUNDS.maxLat}, longitude ${BOUNDS.minLng} to ${BOUNDS.maxLng})`);}
  if(row.website&&!/^https:\/\/[^\s]+\.[^\s]+$/.test(row.website))problems.push(`website "${row.website}" must be a full link starting with https://`);
  const flag=row.eda_hasnt_been.toLowerCase();if(flag&&!['yes','y','true','x'].includes(flag)&&!['no','n','false'].includes(flag))problems.push(`eda_hasnt_been must be "yes" or empty, not "${row.eda_hasnt_been}"`);
  if(problems.length){errors.push(`${at}: ${problems.join('; ')}.`);continue}
  places.push({id,name:row.name,categories:cats,neighborhoods:ns,address:row.address,coordinates:[lng,lat],note:row.eda_note||null,description:row.description,website:row.website,tags:splitTags(row.tags),notVisited:['yes','y','true','x'].includes(flag)});
 }
 return {places,errors,filledIds};
}

const mapsPoint=([lng,lat]:[number,number])=>`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
const mapsAddress=(name:string,address:string)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);

export function managedIdsOf(seed:Seed){return new Set(seed.entries.filter(e=>e.editableIn===MANAGED_MARKER).map(e=>e.id));}

export function merge(seedIn:Seed,locationsIn:Json[],places:Place[],photoIds:Set<string>,today:string){
 const seed:Seed=structuredClone(seedIn);let locations:Json[]=structuredClone(locationsIn);
 const managed=managedIdsOf(seed);const changes:string[]=[];const errors:string[]=[];
 for(const p of places){
  let entry=seed.entries.find(e=>e.id===p.id);
  if(!entry){
   const locationId=`${p.id}-${p.neighborhoods[0]}`;
   entry={id:p.id,name:p.name,categories:p.categories,neighborhoodHints:p.neighborhoods,...(p.description?{description:p.description}:{}),tags:p.tags,...(p.website?{officialUrl:p.website}:{}),defaultLocationId:locationId,sourceSection:"Eda's places sheet",kind:'venue',aliases:[],edaNoteOriginal:p.note,edaNoteDisplay:p.note,visitStatus:p.notVisited?'not-visited':'not-stated',isExplicitFavorite:false,locationScope:'single-or-unspecified',locations:[],geometry:null,verificationStatus:'owner-provided',editableIn:MANAGED_MARKER,
    sources:[{type:'owner-provided',reference:MANAGED_MARKER,providedAt:today},...(p.website?[{type:'official',url:p.website,checkedAt:today,supports:['venue information']}]:[])]};
   seed.entries.push(entry);
   locations.push({id:locationId,entryId:p.id,branchLabel:neighborhoodLabel(p.neighborhoods[0]),address:p.address,neighborhoodIds:p.neighborhoods,coordinates:p.coordinates,coordinateSource:mapsPoint(p.coordinates),addressSource:p.website||mapsAddress(p.name,p.address),verifiedAt:today,officialUrl:p.website,status:'owner-provided'});
   changes.push(`Added ${p.name} (${p.id})`);continue;
  }
  const location=locations.find(l=>l.entryId===p.id);if(!location){errors.push(`${p.id} has no location in src/data/locations.json`);continue}
  const changed:string[]=[];
  const set=(target:Json,field:string,value:unknown,label:string)=>{if(value===undefined?field in target:!same(target[field],value)){if(value===undefined)delete target[field];else target[field]=value;if(!changed.includes(label))changed.push(label)}};
  set(entry,'name',p.name,'name');set(entry,'categories',p.categories,'categories');
  if(!same(location.neighborhoodIds,p.neighborhoods)){if(location.branchLabel===neighborhoodLabel(location.neighborhoodIds[0]))location.branchLabel=neighborhoodLabel(p.neighborhoods[0]);set(location,'neighborhoodIds',p.neighborhoods,'neighborhood');if(entry.neighborhoodHints.length)entry.neighborhoodHints=p.neighborhoods;}
  if(location.address!==p.address){set(location,'address',p.address,'address');location.addressSource=p.website||mapsAddress(p.name,p.address);location.verifiedAt=today;location.status='owner-provided'}
  if(!same(location.coordinates,p.coordinates)){set(location,'coordinates',p.coordinates,'coordinates');location.coordinateSource=mapsPoint(p.coordinates);location.verifiedAt=today;location.status='owner-provided'}
  if(entry.edaNoteDisplay!==p.note){set(entry,'edaNoteDisplay',p.note,"Eda's note");entry.edaNoteOriginal=p.note;}
  set(entry,'description',p.description||undefined,'description');
  if((location.officialUrl??'')!==p.website){set(location,'officialUrl',p.website,'website');if('officialUrl' in entry||p.website)set(entry,'officialUrl',p.website||undefined,'website');}
  set(entry,'tags',p.tags,'tags');
  if((entry.visitStatus==='not-visited')!==p.notVisited)set(entry,'visitStatus',p.notVisited?'not-visited':'not-stated','eda_hasnt_been');
  if(changed.length)changes.push(`Updated ${p.name} (${p.id}): ${changed.join(', ')}`);
 }
 const kept=new Set(places.map(p=>p.id));
 for(const id of managed){if(kept.has(id))continue;const entry=seed.entries.find(e=>e.id===id)!;const ls=locations.filter(l=>l.entryId===id);
  if(photoIds.has(id)||ls.some(l=>photoIds.has(l.id))){errors.push(`${entry.name} (${id}) was removed from the sheet but has a photo. Delete its record in src/data/place-photos.json or area-photos.json and its image files first, or keep the row.`);continue}
  seed.entries=seed.entries.filter(e=>e.id!==id);locations=locations.filter(l=>l.entryId!==id);changes.push(`Removed ${entry.name} (${id})`);}
 return {seed,locations,changes,errors};
}

export function exportRows(seed:Seed,locations:Json[]){
 return seed.entries.filter(e=>e.editableIn===MANAGED_MARKER).map(e=>{const l=locations.find(l=>l.entryId===e.id)!;return {id:e.id,name:e.name,categories:e.categories.join(', '),neighborhood:l.neighborhoodIds.join(', '),address:l.address,latitude:String(l.coordinates[1]),longitude:String(l.coordinates[0]),eda_note:e.edaNoteDisplay??'',description:e.description??'',website:l.officialUrl??'',tags:e.tags.join(', '),eda_hasnt_been:e.visitStatus==='not-visited'?'yes':''};});
}
