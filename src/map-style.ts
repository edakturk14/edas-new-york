import type {StyleSpecification,ExpressionSpecification} from 'maplibre-gl';
// One camera and depth buffer keep the miniature aligned with the geographic map.
export const MAP_PITCH=55;
export const MAP_BEARING=38;
const z=(...stops:number[]):ExpressionSpecification=>['interpolate',['linear'],['zoom'],...stops] as ExpressionSpecification;
export const MINIATURE_CENTER:[number,number]=[-73.9565,40.7318];
export const MINIATURE_ZOOM=17.35;
const pilot={type:'Polygon' as const,coordinates:[[[-73.9617,40.7271],[-73.9508,40.7271],[-73.9508,40.7353],[-73.9617,40.7353],[-73.9617,40.7271]]]};
const outsidePilot=['!', ['within',pilot]] as ExpressionSpecification;
const washedColor:ExpressionSpecification=['interpolate',['linear'],.28,0,['to-color',['get','color']],1,['to-color','#f7f0e2']];
const major=['motorway','trunk','primary'],mid=['secondary','tertiary'],minor=['minor','service'];
const roads=(classes:string[])=>['all',['in',['get','class'],['literal',classes]],['!=',['get','brunnel'],'tunnel']] as ExpressionSpecification;
export const cityStyle:StyleSpecification={version:8,light:{anchor:'map',color:'#fff5e4',intensity:.23,position:[1.5,210,42]},glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',sources:{miniature:{type:'geojson',data:'/data/greenpoint-miniature.geojson',maxzoom:18,tolerance:0},overview:{type:'geojson',data:'/data/nyc-overview.geojson',maxzoom:13},nyc:{type:'vector',url:'https://tiles.openfreemap.org/planet',attribution:'<a href="https://openfreemap.org/">OpenFreeMap</a> · OpenMapTiles © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}},layers:[
{id:'paper',type:'background',paint:{'background-color':'#f7f0e2'}},
{id:'residential',type:'fill',source:'nyc','source-layer':'landuse',paint:{'fill-color':'#ede1ce','fill-opacity':z(10,.25,15,.55)}},
{id:'park-bleed',type:'line',source:'nyc','source-layer':'park',paint:{'line-color':'#9db394','line-width':z(10,2,16,6),'line-blur':3,'line-opacity':.25}},
{id:'parks',type:'fill',source:'nyc','source-layer':'park',paint:{'fill-color':'#b8c9aa'}},
{id:'green',type:'fill',source:'nyc','source-layer':'landcover',filter:['in','class','wood','grass'],paint:{'fill-color':'#c7d3b7','fill-opacity':.85}},
{id:'water',type:'fill',source:'nyc','source-layer':'water',paint:{'fill-color':'#b8d4dc'}},
{id:'water-foam',type:'line',source:'nyc','source-layer':'water',paint:{'line-color':'#eef3e9','line-width':z(10,1.5,15,7),'line-blur':z(10,1,15,5),'line-opacity':.65}},
{id:'water-outline',type:'line',source:'nyc','source-layer':'water',paint:{'line-color':'#89abb6','line-width':z(10,.6,16,1.4),'line-opacity':.38,'line-blur':1.3}},
{id:'roads-minor',type:'line',source:'nyc','source-layer':'transportation',minzoom:13.4,filter:roads(minor),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff8ea','line-width':z(13.4,.3,16,3,18,9),'line-opacity':z(13.4,0,14.6,.85)}},
{id:'paths',type:'line',source:'nyc','source-layer':'transportation',minzoom:15,filter:roads(['path','track']),paint:{'line-color':'#e7c7cc','line-width':1,'line-dasharray':[2,2]}},
{id:'roads-mid',type:'line',source:'nyc','source-layer':'transportation',minzoom:11.5,filter:roads(mid),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fffaf0','line-width':z(11.5,.3,14,1.6,16,5,18,12),'line-opacity':z(11.5,.35,13.5,1)}},
{id:'roads-major-case',type:'line',source:'nyc','source-layer':'transportation',filter:roads(major),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#d7bfc0','line-blur':1.2,'line-width':z(10,.9,13,2.6,16,9,18,19)}},
{id:'roads-major',type:'line',source:'nyc','source-layer':'transportation',filter:roads(major),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fffbf3','line-width':z(10,.4,13,1.4,16,6.4,18,15)}},
{id:'bridges-case',type:'line',source:'nyc','source-layer':'transportation',filter:['all',['==',['get','brunnel'],'bridge'],['!',['in',['get','class'],['literal',['rail','transit','ferry','path']]]]],layout:{'line-cap':'round'},paint:{'line-color':'#b39bab','line-width':z(10,1.4,13,3.4,16,11)}},
{id:'bridges',type:'line',source:'nyc','source-layer':'transportation',filter:['all',['==',['get','brunnel'],'bridge'],['!',['in',['get','class'],['literal',['rail','transit','ferry','path']]]]],layout:{'line-cap':'round'},paint:{'line-color':'#fff2f4','line-width':z(10,.5,13,1.6,16,7)}},
// Overview: flat pastel footprints and only taller landmarks extruded, so the city reads as a soft map rather than a dense model.
{id:'overview-footprints',type:'fill',source:'overview',maxzoom:14,paint:{'fill-color':['interpolate',['linear'],['get','height'],0,'#dfc7c0',25,'#e4d3ba',60,'#d4cbdc'],'fill-opacity':z(11,.35,13.5,.7)}},
{id:'overview-buildings',type:'fill-extrusion',source:'overview',maxzoom:14,filter:['>=',['get','height'],90],paint:{'fill-extrusion-color':['interpolate',['linear'],['get','height'],60,'#d9bdc1',120,'#c9c1d4',250,'#b9b6c8'],'fill-extrusion-height':['*',.85,['get','height']],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':.82}},
{id:'buildings-flat',type:'fill',filter:outsidePilot,source:'nyc','source-layer':'building',minzoom:14,paint:{'fill-color':['interpolate',['linear'],['coalesce',['get','render_height'],8],0,'#dfc8c0',14,'#e6d5be',30,'#d6ccdb'],'fill-opacity':z(14,.7,16,.9),'fill-outline-color':'#d2bdb7'}},
{id:'buildings',type:'fill-extrusion',source:'nyc','source-layer':'building',minzoom:14,filter:['all',outsidePilot,['>=',['coalesce',['get','render_height'],0],40]],paint:{'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],40],40,'#dec6ca',120,'#cec5da',250,'#bcb6cd'],'fill-extrusion-height':['coalesce',['get','render_height'],40],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':.78}},
// Every surface shares the map projection and depth buffer. No separate camera.
{id:'miniature-shadows',type:'fill',source:'miniature',minzoom:14,filter:['==',['get','kind'],'shadow'],paint:{'fill-color':'#847583','fill-opacity':.09}},
{id:'miniature-ground',type:'fill-extrusion',source:'miniature',minzoom:14,filter:['in',['get','kind'],['literal',['ground','road-line']]],paint:{'fill-extrusion-color':washedColor,'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':false}},
{id:'miniature-architecture',type:'fill-extrusion',source:'miniature',minzoom:14,filter:['in',['get','kind'],['literal',['building','roof']]],paint:{'fill-extrusion-color':washedColor,'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':true}},
{id:'miniature-details',type:'fill-extrusion',source:'miniature',minzoom:16,filter:['in',['get','kind'],['literal',['window','detail']]],paint:{'fill-extrusion-color':washedColor,'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':false}},
{id:'road-names',type:'symbol',source:'nyc','source-layer':'transportation_name',minzoom:15.4,filter:['in',['get','class'],['literal',[...major,...mid,'minor']]],layout:{'symbol-placement':'line','text-field':['coalesce',['get','name_en'],['get','name']],'text-font':['Noto Sans Regular'],'text-size':z(15.4,10,18,13),'text-letter-spacing':.04},paint:{'text-color':'#7b5677','text-halo-color':'#fff8ea','text-halo-width':2}}
]};
