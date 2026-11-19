import type {Map as GLMap, LayerSpecification} from 'maplibre-gl';

// Original, code-generated pigment. Periodic noise keeps the repeating pattern
// seamless; no raster basemap, extra requests, animation, or screen-space blur.
const SIZE=256;
const smooth=(t:number)=>t*t*(3-2*t);
function noise(x:number,y:number,period:number){
  const hash=(a:number,b:number)=>{
    let n=Math.imul((a+period)%period+1,374761393)^Math.imul((b+period)%period+1,668265263);
    n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
  };
  const ix=Math.floor(x),iy=Math.floor(y),sx=smooth(x-ix),sy=smooth(y-iy);
  const a=hash(ix,iy)*(1-sx)+hash(ix+1,iy)*sx;
  const b=hash(ix,iy+1)*(1-sx)+hash(ix+1,iy+1)*sx;
  return a*(1-sy)+b*sy;
}
export function watercolorPattern(tint:readonly [number,number,number]){
  const data=new Uint8Array(SIZE*SIZE*4);
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    const u=x/(SIZE-1),v=y/(SIZE-1);
    const bloom=noise(u*4,v*4,4)*.55+noise(u*13,v*13,13)*.3+noise(u*61,v*61,61)*.15;
    const grain=noise(u*127,v*127,127);
    const i=(y*SIZE+x)*4;
    data[i]=tint[0];data[i+1]=tint[1];data[i+2]=tint[2];
    data[i+3]=Math.round(5+Math.pow(bloom,2)*56+grain*12);
  }
  return {width:SIZE,height:SIZE,data};
}
export const watercolorLayers:{layer:LayerSpecification;before:string}[]=[
  {before:'residential',layer:{id:'paper-pigment',type:'background',paint:{'background-pattern':'watercolor-paper','background-opacity':.5}}},
  {before:'green',layer:{id:'park-pigment',type:'fill',source:'nyc','source-layer':'park',paint:{'fill-pattern':'watercolor-sage','fill-opacity':.72}}},
  {before:'water',layer:{id:'green-pigment',type:'fill',source:'nyc','source-layer':'landcover',filter:['in','class','wood','grass'],paint:{'fill-pattern':'watercolor-sage','fill-opacity':.5}}},
  {before:'water-foam',layer:{id:'water-pigment',type:'fill',source:'nyc','source-layer':'water',paint:{'fill-pattern':'watercolor-blue','fill-opacity':.7}}},
];
export function addWatercolor(m:GLMap){
  const pigments={paper:[141,113,91],sage:[77,111,83],blue:[69,114,137]} as const;
  for(const [name,tint] of Object.entries(pigments)){
    const id=`watercolor-${name}`;
    if(!m.hasImage(id))m.addImage(id,watercolorPattern(tint),{pixelRatio:2});
  }
  for(const {layer,before} of watercolorLayers)if(!m.getLayer(layer.id))m.addLayer(layer,before);
}
