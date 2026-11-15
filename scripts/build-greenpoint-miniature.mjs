// Original miniature geometry derived from a bounded OSM/OpenFreeMap extract.
// Run manually, never in a visitor session. Four requests, sequential, < 50 MB.
import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
import {writeFile} from 'node:fs/promises';
const center=[-73.957,40.7312], mx=111320*Math.cos(center[1]*Math.PI/180),my=110540;
const local=p=>[(p[0]-center[0])*mx,(p[1]-center[1])*my];
const geo=p=>[+(center[0]+p[0]/mx).toFixed(7),+(center[1]+p[1]/my).toFixed(7)];
const bounds=[-73.9617,40.7271,-73.9508,40.7353];
const inside=p=>p[0]>bounds[0]&&p[0]<bounds[2]&&p[1]>bounds[1]&&p[1]<bounds[3];
const poly=g=>g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
const line=g=>g.type==='LineString'?[g.coordinates]:g.type==='MultiLineString'?g.coordinates:[];
const centerOf=r=>r.slice(0,-1).reduce((s,p)=>[s[0]+p[0]/(r.length-1),s[1]+p[1]/(r.length-1)],[0,0]);
const buildings=[],streets=[],parks=[],seen=new Set();let bytes=0;
const metadataResponse=await fetch('https://tiles.openfreemap.org/planet');if(!metadataResponse.ok)throw Error('Could not read OpenFreeMap tile metadata');
const meta=await metadataResponse.json();
for(const [x,y] of [[4825,6158],[4826,6158],[4825,6159],[4826,6159]]){
 const url=meta.tiles[0].replace('{z}',14).replace('{x}',x).replace('{y}',y);
 const res=await fetch(url,{headers:{'User-Agent':'EdasNewYork-miniature-development/1.0 (bounded Greenpoint artwork)'}});if(!res.ok)throw Error(res.status);
 const data=await res.arrayBuffer();bytes+=data.byteLength;if(bytes>50e6)throw Error('Download budget exceeded');
 const tile=new VectorTile(new PbfReader(new Uint8Array(data)));
 for(const name of ['building','transportation','park']){const layer=tile.layers[name];if(!layer)continue;
 for(let i=0;i<layer.length;i++){const f=layer.feature(i),g=f.toGeoJSON(x,y,14).geometry;
 if(name==='building')for(const [ring] of poly(g)){const c=centerOf(ring);if(!inside(c)||f.properties.hide_3d)continue;const key=c.map(v=>v.toFixed(6)).join();if(seen.has(key))continue;seen.add(key);buildings.push({ring:ring.map(local),c:local(c),h:Number(f.properties.render_height)||12});}
 if(name==='transportation'&&['minor','tertiary','secondary','primary'].includes(f.properties.class)&&!f.properties.brunnel)for(const l of line(g))for(let j=1;j<l.length;j++){if(inside(l[j])&&inside(l[j-1]))streets.push([local(l[j-1]),local(l[j])]);}
 if(name==='park')for(const [ring] of poly(g)){if(ring.some(inside))parks.push({ring:ring.map(local),name:f.properties.name??''});}
 }}
}
const features=[],featureKeys=new Set(),coffeeTables=[];
function add(r,base,height,color,kind='detail'){if(r.length<3)return;const ring=[...r];if(ring[0][0]!==ring.at(-1)[0]||ring[0][1]!==ring.at(-1)[1])ring.push(ring[0]);const feature={type:'Feature',properties:{base,height,color,kind},geometry:{type:'Polygon',coordinates:[ring.map(geo)]}};const key=JSON.stringify(feature);if(!featureKeys.has(key)){featureKeys.add(key);features.push(feature);}}
function rect(c,w,d,base,h,color,kind='detail',angle=0){const ux=Math.cos(angle),uy=Math.sin(angle);add([[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([x,y])=>[c[0]+ux*x-uy*y,c[1]+uy*x+ux*y]),base,h,color,kind);}
function segment(a,b,width,base,h,color,kind='detail'){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.1)return;rect([(a[0]+b[0])/2,(a[1]+b[1])/2],len,width,base,h,color,kind,Math.atan2(dy,dx));}
function disk(c,r,base,h,color,kind='detail'){add(Array.from({length:10},(_,i)=>[c[0]+Math.cos(i*Math.PI/5)*r,c[1]+Math.sin(i*Math.PI/5)*r]),base,h,color,kind);}
const distSegment=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t)};
const distanceStreet=p=>Math.min(...streets.map(([a,b])=>distSegment(p,a,b)));
// Street surfaces establish a connected plane. Streets follow the source geometry.
for(const [a,b] of streets){segment(a,b,20,0,.28,'#e8dac4','ground');segment(a,b,13,.28,.30,'#d4c7c3','ground');segment(a,b,.35,.3,.32,'#f7ead6','road-line');}
const palette=['#dcb1a9','#e4be9a','#bfc9b3','#c5b5cc','#e4c6a2','#dcbec5','#b6c9c8'];
let detailCount=0;
for(const [i,b] of buildings.entries()){
 const r=b.ring,c=b.c,area=Math.abs(r.slice(1).reduce((s,p,j)=>s+r[j][0]*p[1]-p[0]*r[j][1],0)/2);if(area<28)continue;
 const detail=Math.hypot(c[0]-100,c[1]-85)<165&&area<2000;
 const h=Math.min(b.h,detail?23:32),height=Math.max(9,h),wall=palette[i%palette.length];
 // Low plinth, solid walls, cream roof and coping; no camera-facing building artwork.
 add(r,.3,height,wall,'building');add(r,height,height+.35,'#f5e8d6','roof');
 const shadow=r.map(p=>[p[0]+height*.30,p[1]+height*.24]);add(shadow,.32,.33,'#bdaeb4','shadow');
 if(!detail)continue;detailCount++;
 for(let j=1;j<r.length;j++){
 const a=r[j-1],b=r[j],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<2)continue;
 segment(a,b,.42,height+.35,height+.95,'#e7d5c4','roof');
 const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(distanceStreet(mid)>17||len>55)continue;
 const ux=(b[0]-a[0])/len,uy=(b[1]-a[1])/len;
 let nx=-uy,ny=ux;if((mid[0]-c[0])*nx+(mid[1]-c[1])*ny<0){nx=-nx;ny=-ny;}
 const at=(t,out=0)=>[a[0]+ux*t+nx*out,a[1]+uy*t+ny*out];
 const angle=Math.atan2(uy,ux),cols=Math.max(1,Math.floor(len/3.4)),floors=Math.floor((height-2)/3.5);
 const face=detailCount%5===0?'#557e73':'#66536d';
 for(let floor=1;floor<=floors;floor++)for(let col=0;col<cols;col++){
 const t=len*(col+.5)/cols,z=floor*3.4;
 rect(at(t,.15),1.45,.3,z,z+1.9,'#fff1d9','window',angle);
 rect(at(t,.32),1.02,.13,z+.2,z+1.68,face,'window',angle);
 rect(at(t,.42),1.7,.65,z-.12,z+.08,'#e7d1b9','window',angle);
 rect(at(t,.43),.1,.12,z+.2,z+1.68,'#f5e6cc','window',angle);
 if(floor===1&&col%2===0){rect(at(t,.65),1.8,.65,z-.7,z-.2,'#b57f87','detail',angle);rect(at(t,.65),1.65,.7,z-.2,z+.12,'#93ad80','detail',angle);}
 }
 // A street-facing door and broad stoop, with enough open pavement left around it.
 const door=at(len*.35,.23);rect(door,1.7,.45,.35,3.05,face,'detail',angle);
 rect(at(len*.35,.49),.85,.12,1.45,2.65,'#c5d9cb','detail',angle);
 if(i%3){for(let s=0;s<3;s++)rect(at(len*.35,1.2+s*.55),2.4,.65,.3,1.2-s*.28,'#c3a395','detail',angle);}
 else if(len>6){
 // Striped awning plus a glazed shopfront. Decorative, never branded as the actual business.
 const width=Math.min(8,len*.65),aw=at(len*.63,1.2);
 rect(at(len*.63,.25),width,.35,.4,2.65,'#668c86','detail',angle);
 for(let s=0;s<8;s++){const p=[aw[0]+ux*width*((s+.5)/8-.5),aw[1]+uy*width*((s+.5)/8-.5)];rect(p,width/8,2.7,3.1,3.38,s%2?'#fff1db':i%2?'#ae5777':'#7b9c83','detail',angle);}
 const table=at(len*.75,4.6);coffeeTables.push(table);disk(table,1.0,1.1,1.35,'#f0d6a4');disk(table,.15,.3,1.1,'#7c6563');
 for(const side of [-1,1]){const chair=[table[0]+ux*1.6*side,table[1]+uy*1.6*side];rect(chair,.9,.9,.3,.8,'#b87788','detail',angle);}
 }
 }
 if(i%4===0){const roof=c;rect(roof,3.5,2,height+.35,height+1.05,'#b08386','detail');disk(roof,1.6,height+1,height+2.2,'#9bae82');}
}
// Trees are layered geometric crowns with trunks, planted beside source streets.
function tree(p,i){disk([p[0]+2,p[1]+1],3.5,.32,.34,'#b6b6a3','shadow');disk(p,.32,.3,3,'#9d7c6c');disk(p,2.8,2.5,4.4,i%5?'#93b28a':'#dca6b8');disk([p[0]-.3,p[1]-.2],2.25,4.4,5.65,i%5?'#b4ca96':'#edbfcc');disk(p,1.3,5.65,6.4,i%5?'#c4d7a5':'#f4d4dc');}
let ti=0;for(const [a,b] of streets){const len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<20)continue;const u=[(b[0]-a[0])/len,(b[1]-a[1])/len];for(let d=15;d<len;d+=29){const side=ti++%2?1:-1;const p=[a[0]+u[0]*d-u[1]*8.5*side,a[1]+u[1]*d+u[0]*8.5*side];if(Math.hypot(...p)<420)tree(p,ti);}}
// Transmitter Park's mapped boundary, a low physical edge, and deliberately sparse furniture.
for(const park of parks.filter(p=>/Transmitter/.test(p.name))){add(park.ring,0,.85,'#9db78f','ground');add(park.ring,.85,1,'#bfd1a4','ground');}
const park=local([-73.960717,40.72987]);for(const [i,offset] of [[-18,12],[12,25],[25,-8],[-12,-18]].entries()){const p=[park[0]+offset[0],park[1]+offset[1]];tree(p,i);}
// A picnic and two benches; all are original scenery, not mapped amenities.
rect([park[0]+10,park[1]+3],4,3,1,1.04,'#d99bab');for(const dx of [-9,17]){const p=[park[0]+dx,park[1]-7];rect(p,4.5,1.3,1.4,1.7,'#ba8e7d');rect([p[0],p[1]-.6],4.5,.25,1.7,2.5,'#ba8e7d');}
// Sort static shadows below structures. Depth for all solids is owned by MapLibre.
features.sort((a,b)=>(a.properties.kind==='shadow'?-1:0)-(b.properties.kind==='shadow'?-1:0));
await writeFile('public/data/greenpoint-miniature.geojson',JSON.stringify({type:'FeatureCollection',features}));
await writeFile('src/map-art/miniature-bounds.json',JSON.stringify({bounds,center,source:'OpenStreetMap via OpenFreeMap',license:'ODbL-1.0',licenseUrl:'https://www.openstreetmap.org/copyright',tileTemplate:meta.tiles[0],downloadBytes:bytes,buildingCount:buildings.length,detailedBuildings:detailCount,featureCount:features.length,steamAnchors:coffeeTables.sort((a,b)=>Math.hypot(a[0]-100,a[1]-85)-Math.hypot(b[0]-100,b[1]-85)).filter((p,i,a)=>i===0||a.slice(0,i).every(q=>Math.hypot(p[0]-q[0],p[1]-q[1])>25)).slice(0,3).map(geo)}));
console.log({bytes,buildings:buildings.length,detailed:detailCount,features:features.length});
