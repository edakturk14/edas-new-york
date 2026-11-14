import type {StyleSpecification} from 'maplibre-gl';
export const cityStyle:StyleSpecification={version:8,glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',sources:{overview:{type:'geojson',data:'/data/nyc-overview.geojson',maxzoom:13},nyc:{type:'vector',url:'https://tiles.openfreemap.org/planet',attribution:'<a href="https://openfreemap.org/">OpenFreeMap</a> · OpenMapTiles © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}},layers:[
{id:'paper',type:'background',paint:{'background-color':'#f1e3c9'}},
{id:'residential',type:'fill',source:'nyc','source-layer':'landuse',paint:{'fill-color':'#e8cfb1','fill-opacity':.5}},
{id:'parks',type:'fill',source:'nyc','source-layer':'park',paint:{'fill-color':'#99be74','fill-outline-color':'#7c9c65'}},
{id:'green',type:'fill',source:'nyc','source-layer':'landcover',filter:['in','class','wood','grass'],paint:{'fill-color':'#a8c985','fill-opacity':.75}},
{id:'water',type:'fill',source:'nyc','source-layer':'water',paint:{'fill-color':'#96cce4'}},
{id:'water-outline',type:'line',source:'nyc','source-layer':'water',paint:{'line-color':'#519dc9','line-width':2,'line-opacity':.6}},
{id:'roads-shadow',type:'line',source:'nyc','source-layer':'transportation',filter:['!in','class','rail','transit','ferry'],paint:{'line-color':'#b49a9f','line-width':['interpolate',['linear'],['zoom'],10,.3,13,1.2,17,8]}},
{id:'roads',type:'line',source:'nyc','source-layer':'transportation',filter:['!in','class','rail','transit','ferry'],paint:{'line-color':'#fff2d6','line-width':['interpolate',['linear'],['zoom'],10,.15,13,.65,17,5]}},
{id:'bridges',type:'line',source:'nyc','source-layer':'transportation',filter:['==','brunnel','bridge'],paint:{'line-color':'#c4a4bb','line-width':['interpolate',['linear'],['zoom'],10,.8,13,2,17,10]}},
{id:'overview-buildings',type:'fill-extrusion',source:'overview',maxzoom:14,paint:{'fill-extrusion-color':['interpolate',['linear'],['get','height'],0,'#dfbcb0',20,'#edcd9c',45,'#c2b4d4',100,'#aaaccb'],'fill-extrusion-height':['*',1.35,['get','height']],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1}},
{id:'buildings',type:'fill-extrusion',source:'nyc','source-layer':'building',minzoom:14,paint:{'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],8],0,'#e0b6a5',20,'#e6c78e',60,'#c5b3d5',150,'#acafcb'],'fill-extrusion-height':['coalesce',['get','render_height'],8],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':1}},
{id:'road-names',type:'symbol',source:'nyc','source-layer':'transportation_name',minzoom:15,layout:{'symbol-placement':'line','text-field':['coalesce',['get','name_en'],['get','name']],'text-font':['Noto Sans Regular'],'text-size':11},paint:{'text-color':'#715d73','text-halo-color':'#fff4d9','text-halo-width':2}}
]};
