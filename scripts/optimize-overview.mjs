import {readFile,writeFile} from 'node:fs/promises';
const path=new URL('../public/data/nyc-overview.geojson',import.meta.url);
const data=JSON.parse(await readFile(path,'utf8'));const features=[];
for(const f of data.features){const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
for(const poly of polygons){const ring=poly[0];const [x,y]=ring[0];if(x< -74.025||x> -73.925||y<40.65||y>40.8)continue;const hash=Math.abs(Math.round(x*1e5)*31+Math.round(y*1e5)*17);if(f.properties.height<55&&hash%4!==0)continue;
let pts=ring.map(p=>p.map(v=>Math.round(v*1e5)/1e5));pts=pts.filter((p,i)=>i===0||p[0]!==pts[i-1][0]||p[1]!==pts[i-1][1]);if(pts.length<4)continue;if(pts[0][0]!==pts.at(-1)[0]||pts[0][1]!==pts.at(-1)[1])pts.push(pts[0]);features.push({type:'Feature',properties:f.properties,geometry:{type:'Polygon',coordinates:[pts]}});
}}
await writeFile(path,JSON.stringify({type:'FeatureCollection',features}));console.log({features:features.length});
