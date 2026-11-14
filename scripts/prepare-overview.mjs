// Bounded offline download per OpenFreeMap terms: <=4 requests, <50 MB.
// Geographic OSM building footprints, simplified by the provider at z13.
import {VectorTile} from '@mapbox/vector-tile';
import {PbfReader} from 'pbf';
import {mkdir,writeFile} from 'node:fs/promises';
const z=14,n=2**z,bbox=[-74.025,40.65,-73.925,40.8];
const tx=lng=>Math.floor((lng+180)/360*n);
const ty=lat=>Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n);
const tiles=[];for(let x=tx(bbox[0]);x<=tx(bbox[2]);x++)for(let y=ty(bbox[3]);y<=ty(bbox[1]);y++)tiles.push([x,y]);
const features=[];let bytes=0;const seen=new Set();
for(let i=0;i<tiles.length;i+=4){await Promise.all(tiles.slice(i,i+4).map(async([x,y])=>{
const res=await fetch(`https://tiles.openfreemap.org/planet/20261101_080013_pt/${z}/${x}/${y}.pbf`,{headers:{'User-Agent':'EdasTravelGuide-local-preview/1.0 (NYC bounded overview geometry)'}});if(!res.ok)throw Error(`Tile ${x}/${y}: ${res.status}`);const buffer=await res.arrayBuffer();bytes+=buffer.byteLength;if(bytes>50e6)throw Error('Download budget exceeded');const tile=new VectorTile(new PbfReader(new Uint8Array(buffer)));const layer=tile.layers.building;if(!layer)return;
for(let j=0;j<layer.length;j++){const f=layer.feature(j);if(f.properties.hide_3d)continue;const geo=f.toGeoJSON(x,y,z);const coords=geo.geometry.coordinates;const center=coords.flat(4).filter(v=>typeof v==='number');if(!center.length)continue;const key=f.id??JSON.stringify(coords);if(seen.has(key))continue;seen.add(key);const height=Number(f.properties.render_height)||8;if(height<20&&j%6!==0)continue;
const round=a=>Array.isArray(a)?a.map(round):Math.round(a*1e6)/1e6;
features.push({type:'Feature',geometry:{...geo.geometry,coordinates:round(coords)},properties:{height,base:Number(f.properties.render_min_height)||0}});
}}));}
await mkdir(new URL('../public/data/',import.meta.url),{recursive:true});await writeFile(new URL('../public/data/nyc-overview.geojson',import.meta.url),JSON.stringify({type:'FeatureCollection',features}));console.log(JSON.stringify({tiles:tiles.length,downloadBytes:bytes,features:features.length}));
