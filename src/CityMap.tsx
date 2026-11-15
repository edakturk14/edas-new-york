import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Map as GLMap} from 'maplibre-gl';
import {renderToStaticMarkup} from 'react-dom/server';
import {Icon} from './Icon';
import type {PeekTarget} from './components/PlacePeek';
import {cameraTargets,entries,type Entry,type Location} from './data/content';
import {mapGuides,guidePoints} from './data/map-guides';
import {cityStyle,MAP_BEARING,MAP_PITCH,MINIATURE_CENTER,MINIATURE_ZOOM} from './map-style';
import scene from './map-art/greenpoint-scene.json';
import miniature from './map-art/miniature-bounds.json';
import {loadSprites,sceneScale,sceneStops,ferrySvg,edaSvg,steamSvg,dogDomSvg} from './map-art/sprites';
import {FindEda,readEdaFound,saveEdaFound} from './components/FindEda';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre 6 ships an ESM worker. Let Vite emit its URL for dev and production.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
maplibregl.setWorkerUrl(workerUrl);
export type CameraAction={serial:number;kind:'home'|'city'|'place'|'neighborhood'|'saved'|'zoom'|'stop';id?:string;locations?:Location[];entryIds?:string[];coordinates?:[number,number];delta?:number};
const labels:[string,number,number,string][]=[['MANHATTAN',-73.987,40.756,'borough'],['BROOKLYN',-73.951,40.687,'borough'],['LONG ISLAND CITY',-73.946,40.751,''],['GREENPOINT',-73.944,40.733,''],['WILLIAMSBURG',-73.945,40.713,''],['DUMBO',-73.989,40.703,''],['PROSPECT PARK',-73.965,40.66,''],['CENTRAL PARK',-73.965,40.782,'']];
const fixedAngle={bearing:MAP_BEARING,pitch:MAP_PITCH};
const DETAIL_ZOOM=14.6;
const edaSpot=scene.eda as [number,number];
type SceneItem={kind:string;c:[number,number];o:number};
const sceneData:GeoJSON.FeatureCollection={type:'FeatureCollection',features:(scene.items as SceneItem[]).filter(i=>['walker-dog','coffee-walker','cyclist','picnic','pigeon-bagel'].includes(i.kind)).map(i=>({type:'Feature',properties:{kind:i.kind,o:i.o},geometry:{type:'Point',coordinates:i.c}}))};
function addScenery(m:GLMap){
  if(m.getSource('gp-scene'))return;
  m.addSource('gp-scene',{type:'geojson',data:sceneData});
  // Tiny character accents only. Architecture is genuine map geometry.
  m.addLayer({id:'gp-scene',type:'symbol',source:'gp-scene',minzoom:16,layout:{'icon-image':['get','kind'],'icon-size':['interpolate',['linear'],['zoom'],...sceneStops.flat()],'icon-anchor':'bottom','icon-allow-overlap':true,'icon-ignore-placement':true,'symbol-z-order':'viewport-y','icon-pitch-alignment':'viewport','icon-rotation-alignment':'viewport'},paint:{'icon-opacity':['interpolate',['linear'],['zoom'],16,0,16.3,['+',.45,['*',.55,['get','o']]]]}},'road-names');
}
export function CityMap({visible,saved,selected,onSelect,action,drawer,onInteract,onPreview}:{visible:Entry[];saved:string[];selected:string|null;onSelect:(id:string,locationId?:string)=>void;action:CameraAction;drawer:boolean;onInteract:()=>void;onPreview:(target:PeekTarget|null)=>void}){
const container=useRef<HTMLDivElement>(null);const map=useRef<GLMap|null>(null);const [ready,setReady]=useState(false);const [error,setError]=useState(false);const [attempt,setAttempt]=useState(0);const callback=useRef(onSelect);callback.current=onSelect;const interaction=useRef(onInteract);interaction.current=onInteract;const previewCallback=useRef(onPreview);previewCallback.current=onPreview;
function attachPreview(el:HTMLButtonElement,entryId:string,locationId?:string){const show=()=>{const r=el.getBoundingClientRect();previewCallback.current({entryId,locationId,anchor:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}})};el.onmouseenter=show;el.onfocus=show;el.onmouseleave=()=>previewCallback.current(null);el.onblur=()=>previewCallback.current(null);}
const [viewport,setViewport]=useState(0);useEffect(()=>{const resize=()=>setViewport(v=>v+1);addEventListener('resize',resize);return()=>removeEventListener('resize',resize)},[]);
const [edaFound,setEdaFound]=useState(readEdaFound);const [celebrate,setCelebrate]=useState(0);const [revealed,setRevealed]=useState(false);const avatar=useRef<HTMLButtonElement|null>(null);
const foundRef=useRef(edaFound);foundRef.current=edaFound;
const markers=useRef<maplibregl.Marker[]>([]);const guideMarkers=useRef<maplibregl.Marker[]>([]);const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function padding(open=drawer){const mobile=innerWidth<760;return {top:mobile?210:150,bottom:mobile?(open?innerHeight*.45:105):90,left:mobile?25:open?390:80,right:mobile?25:95};}
function overview(m:GLMap,duration=0){m.easeTo({center:innerWidth<760?[-73.966,40.728]:[-73.968,40.722],zoom:innerWidth<760?11.75:12.15,...fixedAngle,padding:{top:innerWidth<760?100:170,bottom:35,left:innerWidth<760?0:120,right:0},duration});}
function fit(m:GLMap,bounds:maplibregl.LngLatBounds,options:maplibregl.FitBoundsOptions){m.jumpTo({padding:{top:0,bottom:0,left:0,right:0}});m.fitBounds(bounds,{...options,...fixedAngle});}
const ease=(t:number)=>1-Math.pow(1-t,3);
function focus(center:[number,number],zoom:number){const m=map.current;if(!m)return;m.easeTo({center,zoom,...fixedAngle,padding:{top:0,bottom:0,left:0,right:0},offset:innerWidth<760?[0,-innerHeight*.06]:[drawer?185:0,40],duration:reduced()?0:1400,easing:ease});}
function exploreGreenpoint(duration=reduced()?0:750){const m=map.current;if(!m)return;m.easeTo({center:MINIATURE_CENTER,zoom:innerWidth<760?16.25:MINIATURE_ZOOM,...fixedAngle,padding:{top:0,bottom:0,left:0,right:0},offset:innerWidth<760?[0,20]:[drawer?150:0,70],duration,easing:ease});}
useEffect(()=>{if(!container.current)return;let m:GLMap;setError(false);try{m=new maplibregl.Map({container:container.current,style:cityStyle,center:MINIATURE_CENTER,zoom:innerWidth<760?16.25:MINIATURE_ZOOM,...fixedAngle,minPitch:MAP_PITCH,maxPitch:MAP_PITCH,dragRotate:false,pitchWithRotate:false,touchPitch:false,minZoom:10,maxZoom:18.5,attributionControl:{compact:true},canvasContextAttributes:{antialias:true}});map.current=m;}catch(error){console.error('Map initialization failed',error);setError(true);return;}
m.setVerticalFieldOfView(26);
m.on('dragstart',()=>interaction.current());m.on('zoomstart',e=>{if(e.originalEvent)interaction.current()});
m.touchZoomRotate.disableRotation();m.keyboard.disableRotation();
const el=container.current;const timer=setTimeout(()=>{if(!m.loaded())setError(true)},18000);
const zoomed=()=>{const z=m.getZoom();el.style.setProperty('--s',String(sceneScale(z)));el.style.setProperty('--fs',String(Math.min(1.25,Math.max(.55,sceneScale(z)))));if(z>=DETAIL_ZOOM)el.dataset.detail='';else delete el.dataset.detail;};zoomed();m.on('zoom',zoomed);
m.on('movestart',()=>{el.dataset.moving='';previewCallback.current(null)});m.on('moveend',()=>{delete el.dataset.moving;el.dataset.zoom=String(m.getZoom());el.dataset.center=m.getCenter().toArray().join(',');el.dataset.pitch=String(m.getPitch());el.dataset.bearing=String(m.getBearing());});
m.on('load',()=>{clearTimeout(timer);setReady(true);setError(false);loadSprites((id,img)=>{if(!m.hasImage(id))m.addImage(id,img,{pixelRatio:2})},new Set(sceneData.features.map(f=>String(f.properties?.kind)))).then(()=>{if(map.current===m)addScenery(m)});});
m.on('error',()=>{if(!m.isStyleLoaded())setError(true)});
const domMarker=(className:string,html:string,at:[number,number],anchor:maplibregl.PositionAnchor='bottom')=>{const node=document.createElement('div');node.className='scene-dom '+className;node.setAttribute('aria-hidden','true');node.innerHTML=html;return new maplibregl.Marker({element:node,anchor}).setLngLat(at).addTo(m)};
const nameMarkers=labels.map(([label,lng,lat,cls])=>{const node=document.createElement('div');node.className='map-label '+cls;node.textContent=label;return new maplibregl.Marker({element:node}).setLngLat([lng,lat]).addTo(m)});
const ferryPath=scene.ferry as [number,number][];const ferry=domMarker('ferry',ferrySvg,ferryPath[0],'center');ferry.getElement().title='Decorative ferry, not live transit';
const steam=(miniature.steamAnchors as [number,number][]).map((c,i)=>domMarker('steam',`<span style="animation-delay:${i*1.7}s">${steamSvg}</span><span style="animation-delay:${i*1.7+1.3}s">${steamSvg}</span>`,c,'center'));
const dog=scene.tailDog?[domMarker('scene-dog',dogDomSvg,scene.tailDog as [number,number])]:[];
const edaButton=document.createElement('button');edaButton.className='eda-avatar';edaButton.innerHTML=edaSvg;edaButton.setAttribute('aria-label','Hidden Eda character. Select to mark her found.');avatar.current=edaButton;
edaButton.onclick=()=>{if(!foundRef.current){saveEdaFound();setEdaFound(true)}setCelebrate(c=>c+1)};
const edaMarker=new maplibregl.Marker({element:edaButton,anchor:'bottom'}).setLngLat(edaSpot).addTo(m);
// One slow ferry; position updates are throttled and skipped for hidden tabs or reduced motion.
const lengths=ferryPath.slice(1).map((p,i)=>Math.hypot(p[0]-ferryPath[i][0],p[1]-ferryPath[i][1]));const total=lengths.reduce((a,b)=>a+b,0);
let frame=0,last=0;const animate=(t:number)=>{frame=requestAnimationFrame(animate);if(document.hidden||reduced()||t-last<80)return;last=t;const cycle=((t+30000)%120000)/120000,forward=cycle<.5,u=forward?cycle*2:2-cycle*2;let d=u*total,i=0;while(i<lengths.length-1&&d>lengths[i]){d-=lengths[i];i++}const k=lengths[i]?d/lengths[i]:0;const a=ferryPath[i],b=ferryPath[i+1];ferry.setLngLat([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]);ferry.getElement().classList.toggle('heading-back',!forward)};frame=requestAnimationFrame(animate);
const visibility=()=>{if(document.hidden)el.dataset.paused='';else delete el.dataset.paused};document.addEventListener('visibilitychange',visibility);
return()=>{clearTimeout(timer);cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);[...nameMarkers,ferry,...steam,...dog,edaMarker].forEach(n=>n.remove());avatar.current=null;m.remove();map.current=null;setReady(false)};
},[attempt]);
useEffect(()=>{const a=avatar.current;if(!a)return;a.classList.toggle('found',edaFound);a.classList.toggle('revealed',revealed&&!edaFound);a.setAttribute('aria-label',edaFound?'Eda, found. Select to celebrate again.':'Hidden Eda character. Select to mark her found.')},[edaFound,revealed,ready]);
useEffect(()=>{if(!celebrate)return;const t=setTimeout(()=>setCelebrate(0),2600);return()=>clearTimeout(t)},[celebrate]);
useEffect(()=>{const m=map.current;if(!m||!ready)return;const update=()=>{
markers.current.forEach(p=>p.remove());markers.current=[];
const points=visible.flatMap(e=>e.resolvedLocations.filter(l=>l.coordinates).map(l=>({e,l})));const groups:{e:Entry;l:Location}[][]=[];
for(const p of points){const projected=m.project(p.l.coordinates!);const group=groups.find(g=>{const q=m.project(g[0].l.coordinates!);return Math.hypot(projected.x-q.x,projected.y-q.y)<43&&g[0].e.id!==selected&&p.e.id!==selected});if(group)group.push(p);else groups.push([p]);}
for(const group of groups){const {e,l}=group[0];const isSaved=saved.includes(l.saveId??e.id);const el=document.createElement('button');el.className='place-pin '+(m.getZoom()>=16.3&&group.length===1?' has-label ':'')+e.categories[0]+(e.id===selected?' selected':'')+(isSaved?' is-saved':'');el.dataset.entryId=e.id;el.dataset.locationId=l.id;
el.setAttribute('aria-label',group.length>1?`Explore cluster of ${group.length} locations`:`Open ${e.name}, ${l.branchLabel}`);
el.innerHTML=group.length>1?`<span class="cluster-count">${group.length}</span>`:renderToStaticMarkup(<Icon name={e.categories[0]} size={20}/>)+(isSaved?'<span class="pin-bookmark">▮</span>':'');
if(group.length===1){attachPreview(el,e.id,l.id);const name=document.createElement('span');name.className='pin-tooltip';name.textContent=e.name+(l.saveId?` · ${l.branchLabel}`:'');el.append(name);}
el.onclick=()=>{if(group.length>1){const bounds=new maplibregl.LngLatBounds();group.forEach(p=>bounds.extend(p.l.coordinates!));fit(m,bounds,{padding:padding(),maxZoom:18,duration:reduced()?0:650});}else callback.current(e.id,l.id)};
markers.current.push(new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(l.coordinates!).addTo(m));}
};update();m.on('moveend',update);return()=>{m.off('moveend',update);markers.current.forEach(p=>p.remove())};},[ready,visible,saved.join(','),selected]);
useEffect(()=>{const m=map.current;if(!m||!ready)return;guideMarkers.current.forEach(marker=>marker.remove());guideMarkers.current=[];
for(const e of visible){const guide=mapGuides[e.id];if(!guide)continue;const selectedStops=e.id===selected?guide.stops:undefined;
const points=selectedStops?.map((stop,index)=>({coordinates:stop.coordinates,label:stop.label,index}))??[{coordinates:guide.coordinates,label:e.name,index:-1}];
for(const point of points){const el=document.createElement('button');el.className='walk-pin '+e.categories[0]+(e.id===selected?' selected':'')+(saved.includes(e.id)?' is-saved':'')+(point.index>=0?' walk-stop-pin':'');el.dataset.entryId=e.id;if(point.index<0)attachPreview(el,e.id);if(point.index>=0)el.dataset.stopIndex=String(point.index);el.setAttribute('aria-label',point.index>=0?`Show ${point.label} on map`:`Open ${e.name}, ${guide.stops?'walk':e.categories.includes('walks')?'park':'area'} overview`);el.innerHTML=point.index>=0?`<span>${point.index+1}</span>`:renderToStaticMarkup(<Icon name={e.categories[0]} size={21}/>);if(saved.includes(e.id))el.innerHTML+='<span class="pin-bookmark">▮</span>';const label=document.createElement('span');label.className='pin-tooltip';label.textContent=point.index>=0?`${point.index+1} · ${point.label}`:e.name;el.append(label);el.onclick=()=>{if(point.index<0)callback.current(e.id);else m.easeTo({center:point.coordinates,zoom:16,...fixedAngle,padding:{top:0,bottom:0,left:0,right:0},offset:innerWidth<760?[0,-innerHeight*.16]:[drawer?185:0,55],duration:reduced()?0:650})};guideMarkers.current.push(new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(point.coordinates).addTo(m));}}
return()=>{guideMarkers.current.forEach(marker=>marker.remove());guideMarkers.current=[]};},[ready,visible,saved.join(','),selected,drawer]);
useEffect(()=>{const m=map.current;if(!m||!ready)return;const duration=reduced()?0:650;const pad=padding();const focusOffset:[number,number]=innerWidth<760?[0,-innerHeight*.16]:[drawer?185:0,55];const zeroPad={top:0,bottom:0,left:0,right:0};
if(action.kind==='home')exploreGreenpoint(action.serial?duration:0);if(action.kind==='city')overview(m,duration);if(action.kind==='zoom')m.zoomTo(m.getZoom()+(action.delta??1),{duration});
if(action.kind==='stop'&&action.coordinates)m.easeTo({center:action.coordinates,zoom:16,...fixedAngle,padding:zeroPad,offset:focusOffset,duration});
if(action.kind==='neighborhood'){const target=cameraTargets[action.id??'']??entries.flatMap(e=>e.resolvedLocations).find(l=>l.neighborhoodIds.includes(action.id??''))?.coordinates;if(action.id==='greenpoint'){exploreGreenpoint();}else if(target)m.easeTo({center:target,zoom:14.3,...fixedAngle,padding:zeroPad,offset:focusOffset,duration});}
if(action.kind==='place'){const location=action.locations?.find(l=>l.coordinates);const e=entries.find(e=>e.id===action.id);const guide=mapGuides[action.id??''];if(guide?.stops){const bounds=new maplibregl.LngLatBounds();guide.stops.forEach(stop=>bounds.extend(stop.coordinates));fit(m,bounds,{padding:innerWidth<760?{top:285,bottom:drawer?innerHeight*.44+92:125,left:42,right:42}:{...pad,top:260},maxZoom:15.5,duration});}else{const target=location?.coordinates??guide?.coordinates??cameraTargets[e?.neighborhoodHints[0]??''];if(target)m.easeTo({center:target,zoom:location?(location.neighborhoodIds.includes('greenpoint')?Math.max(16.65,Math.min(m.getZoom(),17.4)):15.5):13.7,...fixedAngle,padding:zeroPad,offset:focusOffset,duration});}}
if(action.kind==='saved'){const points:[number,number][]=[...(action.locations??[]).flatMap(l=>l.coordinates?[l.coordinates]:[]),...(action.entryIds??[]).flatMap(guidePoints)];if(points.length){const bounds=new maplibregl.LngLatBounds();points.forEach(point=>bounds.extend(point));fit(m,bounds,{padding:innerWidth<760?{top:285,bottom:drawer?innerHeight*.48+95:125,left:45,right:45}:{...pad,top:280},maxZoom:15,duration});}}
},[action,ready,viewport]);
return <><div className="city-map" ref={container} aria-label="Interactive geographic map of New York"/>{!ready&&!error&&<div className="map-status">Unfolding New York…</div>}{error&&<div className="map-status map-error">The map is taking a little break. All places and saves still work.<button onClick={()=>{setReady(false);setAttempt(a=>a+1)}}>Retry map</button></div>}
{ready&&<FindEda drawer={drawer} found={edaFound} celebrate={celebrate>0} onExplore={()=>{interaction.current();exploreGreenpoint()}} onReveal={()=>{setRevealed(true);focus(edaSpot,17.3);setTimeout(()=>avatar.current?.focus({preventScroll:true}),reduced()?50:1500)}}/>}</>;
}
