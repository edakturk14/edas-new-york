// Builds the decorative Greenpoint scene layout from real OpenStreetMap geometry.
// Bounded offline download per OpenFreeMap terms: 4 z14 tiles, run manually by a developer.
// Output is static; visitors never trigger this script or any generation.
import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const z=14,tiles=[[4825,6158],[4826,6158],[4825,6159],[4826,6159]];
const center=[-73.9562,40.7298],core=340,edge=860;
const mx=111320*Math.cos(center[1]*Math.PI/180),my=110540;
const meters=([a,b],[c,d])=>Math.hypot((a-c)*mx,(b-d)*my);
let seed=20261115;const rand=()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=list=>list[Math.floor(rand()*list.length)];
const inRing=(p,ring)=>{let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(yi>p[1]!==yj>p[1]&&p[0]<(xj-xi)*(p[1]-yi)/(yj-yi)+xi)inside=!inside}return inside};
const polys=geo=>geo.type==='Polygon'?[geo.coordinates]:geo.type==='MultiPolygon'?geo.coordinates:[];
const lines=geo=>geo.type==='LineString'?[geo.coordinates]:geo.type==='MultiLineString'?geo.coordinates:[];
const area=ring=>{let s=0;for(let i=1;i<ring.length;i++)s+=(ring[i-1][0]*mx)*(ring[i][1]*my)-(ring[i][0]*mx)*(ring[i-1][1]*my);return Math.abs(s/2)};
const tilejson=await (await fetch('https://tiles.openfreemap.org/planet')).json();const template=tilejson.tiles[0];
const buildings=[],parks=[],water=[],streets=[];const seen=new Set();
for(const [x,y] of tiles){const res=await fetch(template.replace('{z}',z).replace('{x}',x).replace('{y}',y),{headers:{'User-Agent':'EdasTravelGuide-local-dev/1.0 (one-off Greenpoint scene layout)'}});if(!res.ok)throw Error(`Tile ${x}/${y}: ${res.status}`);
const tile=new VectorTile(new PbfReader(new Uint8Array(await res.arrayBuffer())));
const each=(name,fn)=>{const layer=tile.layers[name];if(layer)for(let i=0;i<layer.length;i++){const f=layer.feature(i);fn(f,f.toGeoJSON(x,y,z).geometry)}};
each('building',(f,g)=>{for(const p of polys(g)){const ring=p[0];const c=[ring.reduce((s,v)=>s+v[0],0)/ring.length,ring.reduce((s,v)=>s+v[1],0)/ring.length];const key=c.map(v=>v.toFixed(5)).join();if(seen.has(key))continue;seen.add(key);buildings.push({ring,c,area:area(ring),h:f.properties.render_height??8})}});
each('park',(f,g)=>polys(g).forEach(p=>parks.push({ring:p[0],name:f.properties.name})));
each('water',(f,g)=>polys(g).forEach(p=>water.push(p[0])));
each('transportation',(f,g)=>{if(['minor','tertiary','secondary','primary'].includes(f.properties.class)&&!f.properties.brunnel)lines(g).forEach(l=>streets.push({line:l,cls:f.properties.class}))});}
const locations=JSON.parse(await readFile('src/data/locations.json','utf8')).filter(l=>l.coordinates).map(l=>l.coordinates);
const density=p=>{const d=meters(p,center);return d<core?1:d>edge?0:1-(d-core)/(edge-core)};
const items=[];const near=(p,r,kinds)=>items.some(i=>(!kinds||kinds.includes(i.kind))&&meters(i.c,p)<r);
const clearOfVenues=(p,r)=>!locations.some(l=>meters(l,p)<r);
const inside=(p,list)=>list.some(r=>inRing(p,r));
const transmitter=parks.filter(p=>/Transmitter/i.test(p.name??''))[0];
const parkCenter=ring=>[ring.reduce((s,v)=>s+v[0],0)/ring.length,ring.reduce((s,v)=>s+v[1],0)/ring.length];
// Eda and the picnic must sit on the park's lawn, not the pier or the river.
const lawn=[];if(transmitter){const xs=transmitter.ring.map(v=>v[0]),ys=transmitter.ring.map(v=>v[1]);for(let x=Math.min(...xs);x<=Math.max(...xs);x+=.00004)for(let y=Math.min(...ys);y<=Math.max(...ys);y+=.00003){const p=[x,y];if(inRing(p,transmitter.ring)&&!inside(p,water))lawn.push(p)}}
const lawnMid=lawn.length?[lawn.reduce((s,p)=>s+p[0],0)/lawn.length,lawn.reduce((s,p)=>s+p[1],0)/lawn.length]:[-73.9598,40.7297];
const byMid=[...lawn].sort((a,b)=>meters(a,lawnMid)-meters(b,lawnMid));
const eda=byMid[0]??lawnMid;
const add=(kind,c,o=1)=>items.push({kind,c:c.map(v=>+v.toFixed(6)),o:+o.toFixed(2)});
const houses=['brownstone-rose','brownstone-peach','brownstone-lavender','brownstone-butter','brownstone-sage','storefront-pink'];const cafes=['cafe-raspberry','cafe-mint','bakery-butter'];
let cafeCount=0;
for(const b of buildings.sort(()=>rand()-.5)){const p=b.c,w=density(p);if(!w||rand()>w*1.05)continue;if(!clearOfVenues(p,42)||meters(p,eda)<45||inside(p,water))continue;
if(b.h>24||b.area<45)continue;if(b.area>900){if(!near(p,40)&&rand()<.5)add('rooftop-garden',p,w);continue}
if(near(p,38))continue;const cafeOk=cafeCount<9&&clearOfVenues(p,120)&&!near(p,110,cafes)&&rand()<.28;if(cafeOk){cafeCount++;add(pick(cafes),p,w)}else add(pick(houses),p,w)}
const sidewalk=[];for(const s of streets){const l=s.line;for(let i=1;i<l.length;i++){const a=l[i-1],b=l[i],len=meters(a,b),steps=Math.floor(len/34);const dx=(b[0]-a[0])*mx/len,dy=(b[1]-a[1])*my/len;for(let k=0;k<steps;k++){const t=(k+.5)/steps,base=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],side=rand()<.5?-1:1;sidewalk.push({p:[base[0]-dy*9*side/mx,base[1]+dx*9*side/my],base,cls:s.cls})}}}
const street=sidewalk.filter(s=>density(s.p)>0&&!inside(s.p,water)&&clearOfVenues(s.p,32)&&meters(s.p,eda)>40).sort(()=>rand()-.5);
const quota={'walker-dog':6,'coffee-walker':9,'cyclist':2,'bench':8,'planter':10,'cafe-tables':6,'pigeon-bagel':1};
for(const s of street){const w=density(s.p);if(rand()>w)continue;if(near(s.p,21))continue;
const options=Object.entries(quota).filter(([,n])=>n>0).map(([k])=>k);const r=rand();
if(r<.55){add(pick(['tree-round','tree-blossom','tree-round']),s.p,w);continue}
if(!options.length||r>.8||w<.6)continue;const kind=pick(options);if(kind==='cyclist'){if(s.cls==='minor')continue;add(kind,s.base,w)}else if(kind==='cafe-tables'){if(!near(s.p,60,cafes))continue;add(kind,s.p,w)}else add(kind,s.p,w);quota[kind]--}
for(const park of parks){const c=parkCenter(park.ring);if(!density(c))continue;for(let k=0;k<14;k++){const p=[c[0]+(rand()-.5)*.003,c[1]+(rand()-.5)*.002];if(inRing(p,park.ring)&&!inside(p,water)&&!near(p,18)&&meters(p,eda)>30&&clearOfVenues(p,32))add(pick(['tree-round','tree-blossom']),p,density(p))}}
add('picnic',byMid.find(p=>meters(p,eda)>26&&meters(p,eda)<40)??[eda[0]+.0004,eda[1]-.0002]);
const cafeItems=items.filter(i=>cafes.includes(i.kind)).sort((a,b)=>meters(a.c,center)-meters(b.c,center));
const dog=items.filter(i=>i.kind==='walker-dog').sort((a,b)=>meters(a.c,center)-meters(b.c,center))[0];
const out={source:'OpenStreetMap via OpenFreeMap z14 tiles, layout only',center,eda:eda.map(v=>+v.toFixed(6)),ferry:[[-73.9636,40.7252],[-73.9629,40.7298],[-73.9638,40.7344]],steam:cafeItems.slice(0,3).map(i=>i.c),tailDog:dog?.c??null,items:items.filter(i=>i!==dog)};
await mkdir('src/map-art',{recursive:true});await writeFile('src/map-art/greenpoint-scene.json',JSON.stringify(out));
const counts={};for(const i of out.items)counts[i.kind]=(counts[i.kind]??0)+1;console.log(JSON.stringify({buildings:buildings.length,parks:parks.map(p=>p.name).filter(Boolean),streets:streets.length,eda:out.eda,counts,total:out.items.length}));
