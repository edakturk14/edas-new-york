import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Map as GLMap} from 'maplibre-gl';
import {renderToStaticMarkup} from 'react-dom/server';
import {Icon} from './Icon';
import {cameraTargets,entries,type Entry,type Location} from './data/content';
import {mapGuides,guidePoints} from './data/map-guides';
import {cityStyle} from './map-style';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre 6 ships an ESM worker. Let Vite emit its URL for dev and production.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
maplibregl.setWorkerUrl(workerUrl);
export type CameraAction={serial:number;kind:'city'|'place'|'neighborhood'|'saved'|'zoom'|'stop';id?:string;locations?:Location[];entryIds?:string[];coordinates?:[number,number];delta?:number};
const labels:[string,number,number,string][]=[['MANHATTAN',-73.987,40.756,'borough'],['BROOKLYN',-73.951,40.687,'borough'],['LONG ISLAND CITY',-73.946,40.751,''],['GREENPOINT',-73.944,40.731,''],['WILLIAMSBURG',-73.945,40.713,''],['DUMBO',-73.989,40.703,''],['PROSPECT PARK',-73.965,40.66,''],['CENTRAL PARK',-73.965,40.782,'']];
export function CityMap({visible,saved,selected,onSelect,action,drawer}:{visible:Entry[];saved:string[];selected:string|null;onSelect:(id:string,locationId?:string)=>void;action:CameraAction;drawer:boolean}){
const container=useRef<HTMLDivElement>(null);const map=useRef<GLMap|null>(null);const [ready,setReady]=useState(false);const [error,setError]=useState(false);const [attempt,setAttempt]=useState(0);const callback=useRef(onSelect);callback.current=onSelect;
const [viewport,setViewport]=useState(0);useEffect(()=>{const resize=()=>setViewport(v=>v+1);addEventListener('resize',resize);return()=>removeEventListener('resize',resize)},[]);
const markers=useRef<maplibregl.Marker[]>([]);const guideMarkers=useRef<maplibregl.Marker[]>([]);const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function padding(open=drawer){const mobile=innerWidth<760;return {top:mobile?210:190,bottom:mobile?(open?innerHeight*.45:105):90,left:mobile?25:open?425:100,right:mobile?25:95};}
function overview(m:GLMap,duration=0){m.easeTo({center:innerWidth<760?[-73.974,40.731]:[-73.974,40.718],zoom:innerWidth<760?11.95:12.25,pitch:45,bearing:28,padding:{top:100,bottom:35,left:0,right:0},duration});}
useEffect(()=>{if(!container.current)return;let m:GLMap;setError(false);try{m=new maplibregl.Map({container:container.current,style:cityStyle,center:[-73.98,40.728],zoom:12.2,pitch:48,bearing:-25,maxPitch:65,minZoom:10,maxZoom:18,attributionControl:{compact:true},canvasContextAttributes:{antialias:true}});map.current=m;}catch{setError(true);return;}
const timer=setTimeout(()=>{if(!m.loaded())setError(true)},18000);
m.on('moveend',()=>{if(container.current){container.current.dataset.zoom=String(m.getZoom());container.current.dataset.center=m.getCenter().toArray().join(',');}});
m.on('load',()=>{clearTimeout(timer);setReady(true);setError(false);overview(m);});
m.on('error',()=>{if(!m.isStyleLoaded())setError(true)});
const nameMarkers=labels.map(([label,lng,lat,cls])=>{const el=document.createElement('div');el.className='map-label '+cls;el.textContent=label;return new maplibregl.Marker({element:el}).setLngLat([lng,lat]).addTo(m)});
const boat=document.createElement('div');boat.className='ferry';boat.innerHTML='<svg viewBox="0 0 50 30" width="44" height="28"><path d="M3 18h43l-7 9H12Z" fill="#fff4d9" stroke="#493047" stroke-width="2"/><path d="M13 8h23v10H13Z" fill="#ff8c7d" stroke="#493047" stroke-width="2"/><path d="M19 3h9v5h-9Z" fill="#fff4d9"/><path d="M17 12h4m4 0h4m4 0h1" stroke="#493047" stroke-width="3"/></svg>';boat.title='Decorative ferry, not live transit';
const ferry=new maplibregl.Marker({element:boat}).setLngLat([-73.977,40.721]).addTo(m);let frame=0;const animate=(t:number)=>{if(!document.hidden&&!reduced()){const p=(t%90000)/90000;ferry.setLngLat([-73.984+p*.019,40.709+p*.03]);}frame=requestAnimationFrame(animate)};if(!reduced())frame=requestAnimationFrame(animate);
return()=>{clearTimeout(timer);cancelAnimationFrame(frame);nameMarkers.forEach(n=>n.remove());ferry.remove();m.remove();map.current=null;setReady(false)};
},[attempt]);
useEffect(()=>{const m=map.current;if(!m||!ready)return;const update=()=>{
markers.current.forEach(p=>p.remove());markers.current=[];
const points=visible.flatMap(e=>e.resolvedLocations.filter(l=>l.coordinates).map(l=>({e,l})));const groups:{e:Entry;l:Location}[][]=[];
for(const p of points){const projected=m.project(p.l.coordinates!);const group=groups.find(g=>{const q=m.project(g[0].l.coordinates!);return Math.hypot(projected.x-q.x,projected.y-q.y)<43&&g[0].e.id!==selected&&p.e.id!==selected});if(group)group.push(p);else groups.push([p]);}
for(const group of groups){const {e,l}=group[0];const isSaved=saved.includes(l.saveId??e.id);const el=document.createElement('button');el.className='place-pin '+e.categories[0]+(e.id===selected?' selected':'')+(isSaved?' is-saved':'');el.dataset.entryId=e.id;el.dataset.locationId=l.id;
el.setAttribute('aria-label',group.length>1?`Explore cluster of ${group.length} locations`:`Open ${e.name}, ${l.branchLabel}`);
el.innerHTML=group.length>1?`<span class="cluster-count">${group.length}</span>`:renderToStaticMarkup(<Icon name={e.categories[0]} size={20}/>)+(isSaved?'<span class="pin-bookmark">▮</span>':'');
if(group.length===1){const name=document.createElement('span');name.className='pin-tooltip';name.textContent=e.name+(l.saveId?` · ${l.branchLabel}`:'');el.append(name);}
el.onclick=()=>{if(group.length>1){const bounds=new maplibregl.LngLatBounds();group.forEach(p=>bounds.extend(p.l.coordinates!));m.jumpTo({pitch:0,bearing:0,padding:{top:0,bottom:0,left:0,right:0}});m.fitBounds(bounds,{padding:padding(),maxZoom:16,duration:reduced()?0:650});}else callback.current(e.id,l.id)};
markers.current.push(new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(l.coordinates!).addTo(m));}
};update();m.on('moveend',update);return()=>{m.off('moveend',update);markers.current.forEach(p=>p.remove())};},[ready,visible,saved.join(','),selected]);
useEffect(()=>{const m=map.current;if(!m||!ready)return;guideMarkers.current.forEach(marker=>marker.remove());guideMarkers.current=[];
for(const e of visible){const guide=mapGuides[e.id];if(!guide)continue;const selectedStops=e.id===selected?guide.stops:undefined;
const points=selectedStops?.map((stop,index)=>({coordinates:stop.coordinates,label:stop.label,index}))??[{coordinates:guide.coordinates,label:e.name,index:-1}];
for(const point of points){const el=document.createElement('button');el.className='walk-pin '+e.categories[0]+(e.id===selected?' selected':'')+(saved.includes(e.id)?' is-saved':'')+(point.index>=0?' walk-stop-pin':'');el.dataset.entryId=e.id;if(point.index>=0)el.dataset.stopIndex=String(point.index);el.setAttribute('aria-label',point.index>=0?`Show ${point.label} on map`:`Open ${e.name}, ${guide.stops?'walk':e.categories.includes('walks')?'park':'area'} overview`);el.innerHTML=point.index>=0?`<span>${point.index+1}</span>`:renderToStaticMarkup(<Icon name={e.categories[0]} size={21}/>);if(saved.includes(e.id))el.innerHTML+='<span class="pin-bookmark">▮</span>';const label=document.createElement('span');label.className='pin-tooltip';label.textContent=point.index>=0?`${point.index+1} · ${point.label}`:e.name;el.append(label);el.onclick=()=>{if(point.index<0)callback.current(e.id);else m.easeTo({center:point.coordinates,zoom:16,padding:{top:0,bottom:0,left:0,right:0},offset:innerWidth<760?[0,-innerHeight*.16]:[drawer?185:0,55],duration:reduced()?0:650})};guideMarkers.current.push(new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(point.coordinates).addTo(m));}}
return()=>{guideMarkers.current.forEach(marker=>marker.remove());guideMarkers.current=[]};},[ready,visible,saved.join(','),selected,drawer]);
useEffect(()=>{const m=map.current;if(!m||!ready)return;const duration=reduced()?0:650;const pad=padding();const focusOffset:[number,number]=innerWidth<760?[0,-innerHeight*.16]:[drawer?185:0,55];
if(action.kind==='city')overview(m,duration);if(action.kind==='zoom')m.zoomTo(m.getZoom()+(action.delta??1),{duration});
if(action.kind==='stop'&&action.coordinates)m.easeTo({center:action.coordinates,zoom:16,padding:{top:0,bottom:0,left:0,right:0},offset:focusOffset,duration});
if(action.kind==='neighborhood'){const target=cameraTargets[action.id??'']??entries.flatMap(e=>e.resolvedLocations).find(l=>l.neighborhoodIds.includes(action.id??''))?.coordinates;if(target)m.easeTo({center:target,zoom:14.3,pitch:45,padding:{top:0,bottom:0,left:0,right:0},offset:focusOffset,duration});}
if(action.kind==='place'){const location=action.locations?.find(l=>l.coordinates);const e=entries.find(e=>e.id===action.id);const guide=mapGuides[action.id??''];if(guide?.stops){const bounds=new maplibregl.LngLatBounds();guide.stops.forEach(stop=>bounds.extend(stop.coordinates));m.jumpTo({pitch:0,bearing:0,padding:{top:0,bottom:0,left:0,right:0}});m.fitBounds(bounds,{padding:innerWidth<760?{top:285,bottom:drawer?innerHeight*.44+92:125,left:42,right:42}:{...pad,top:260},maxZoom:15.5,duration});}else{const target=location?.coordinates??guide?.coordinates??cameraTargets[e?.neighborhoodHints[0]??''];if(target)m.easeTo({center:target,zoom:location?15.5:13.7,pitch:45,padding:{top:0,bottom:0,left:0,right:0},offset:focusOffset,duration});}}
if(action.kind==='saved'){const points:[number,number][]=[...(action.locations??[]).flatMap(l=>l.coordinates?[l.coordinates]:[]),...(action.entryIds??[]).flatMap(guidePoints)];if(points.length){const bounds=new maplibregl.LngLatBounds();points.forEach(point=>bounds.extend(point));m.jumpTo({pitch:0,bearing:0,padding:{top:0,bottom:0,left:0,right:0}});m.fitBounds(bounds,{padding:innerWidth<760?{top:285,bottom:drawer?innerHeight*.48+95:125,left:45,right:45}:{...pad,top:280},maxZoom:15,duration});}}
},[action,ready,viewport]);
return <><div className="city-map" ref={container} aria-label="Interactive geographic map of New York"/>{!ready&&!error&&<div className="map-status">Unfolding New York…</div>}{error&&<div className="map-status map-error">The map is taking a little break. All places and saves still work.<button onClick={()=>{setReady(false);setAttempt(a=>a+1)}}>Retry map</button></div>}</>;
}
