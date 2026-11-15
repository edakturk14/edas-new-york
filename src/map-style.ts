import type {StyleSpecification,ExpressionSpecification} from 'maplibre-gl';
// The illustrated view is locked to one angle so sprites drawn in a 2:1
// projection line up with Greenpoint's (roughly north-south) street grid.
export const MAP_PITCH=52;
export const MAP_BEARING=38;
const z=(...stops:number[]):ExpressionSpecification=>['interpolate',['linear'],['zoom'],...stops] as ExpressionSpecification;
const major=['motorway','trunk','primary'],mid=['secondary','tertiary'],minor=['minor','service'];
const roads=(classes:string[])=>['all',['in',['get','class'],['literal',classes]],['!=',['get','brunnel'],'tunnel']] as ExpressionSpecification;
export const cityStyle:StyleSpecification={version:8,light:{anchor:'viewport',color:'#fff6ee',intensity:.22},glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',sources:{overview:{type:'geojson',data:'/data/nyc-overview.geojson',maxzoom:13},nyc:{type:'vector',url:'https://tiles.openfreemap.org/planet',attribution:'<a href="https://openfreemap.org/">OpenFreeMap</a> · OpenMapTiles © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}},layers:[
{id:'paper',type:'background',paint:{'background-color':'#fbefd2'}},
{id:'residential',type:'fill',source:'nyc','source-layer':'landuse',paint:{'fill-color':'#f8e6bf','fill-opacity':z(10,.25,15,.55)}},
{id:'parks',type:'fill',source:'nyc','source-layer':'park',paint:{'fill-color':'#bcd79e'}},
{id:'green',type:'fill',source:'nyc','source-layer':'landcover',filter:['in','class','wood','grass'],paint:{'fill-color':'#d0e4ab','fill-opacity':.85}},
{id:'water',type:'fill',source:'nyc','source-layer':'water',paint:{'fill-color':'#acd6ef'}},
{id:'water-foam',type:'line',source:'nyc','source-layer':'water',paint:{'line-color':'#e3f2fa','line-width':z(10,1.5,15,7),'line-blur':z(10,1,15,5),'line-opacity':.85}},
{id:'water-outline',type:'line',source:'nyc','source-layer':'water',paint:{'line-color':'#8dc2e3','line-width':z(10,.6,16,1.4),'line-opacity':.7}},
{id:'roads-minor',type:'line',source:'nyc','source-layer':'transportation',minzoom:13.4,filter:roads(minor),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff8ea','line-width':z(13.4,.3,16,3,18,9),'line-opacity':z(13.4,0,14.6,.85)}},
{id:'paths',type:'line',source:'nyc','source-layer':'transportation',minzoom:15,filter:roads(['path','track']),paint:{'line-color':'#e7c7cc','line-width':1,'line-dasharray':[2,2]}},
{id:'roads-mid',type:'line',source:'nyc','source-layer':'transportation',minzoom:11.5,filter:roads(mid),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fffaf0','line-width':z(11.5,.3,14,1.6,16,5,18,12),'line-opacity':z(11.5,.35,13.5,1)}},
{id:'roads-major-case',type:'line',source:'nyc','source-layer':'transportation',filter:roads(major),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#efc6cf','line-width':z(10,.9,13,2.6,16,9,18,19)}},
{id:'roads-major',type:'line',source:'nyc','source-layer':'transportation',filter:roads(major),layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fffbf3','line-width':z(10,.4,13,1.4,16,6.4,18,15)}},
{id:'bridges-case',type:'line',source:'nyc','source-layer':'transportation',filter:['all',['==',['get','brunnel'],'bridge'],['!',['in',['get','class'],['literal',['rail','transit','ferry','path']]]]],layout:{'line-cap':'round'},paint:{'line-color':'#c99ac0','line-width':z(10,1.4,13,3.4,16,11)}},
{id:'bridges',type:'line',source:'nyc','source-layer':'transportation',filter:['all',['==',['get','brunnel'],'bridge'],['!',['in',['get','class'],['literal',['rail','transit','ferry','path']]]]],layout:{'line-cap':'round'},paint:{'line-color':'#fff2f4','line-width':z(10,.5,13,1.6,16,7)}},
// Overview: flat pastel footprints and only taller landmarks extruded, so the city reads as a soft map rather than a dense model.
{id:'overview-footprints',type:'fill',source:'overview',maxzoom:14,paint:{'fill-color':['interpolate',['linear'],['get','height'],0,'#f3cfc6',25,'#f4d6b4',60,'#ddd0ef'],'fill-opacity':z(11,.35,13.5,.7)}},
{id:'overview-buildings',type:'fill-extrusion',source:'overview',maxzoom:14,filter:['>=',['get','height'],90],paint:{'fill-extrusion-color':['interpolate',['linear'],['get','height'],60,'#efc3cb',120,'#d9c9ee',250,'#c8bfe6'],'fill-extrusion-height':['*',.85,['get','height']],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':.82}},
{id:'buildings-flat',type:'fill',source:'nyc','source-layer':'building',minzoom:14,paint:{'fill-color':['interpolate',['linear'],['coalesce',['get','render_height'],8],0,'#f4cdc8',14,'#f6d9b8',30,'#e3d5f0'],'fill-opacity':z(14,.7,16,.9),'fill-outline-color':'#e6bfc3'}},
{id:'buildings',type:'fill-extrusion',source:'nyc','source-layer':'building',minzoom:14,filter:['>=',['coalesce',['get','render_height'],0],40],paint:{'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],40],40,'#f1cdd2',120,'#dccdf0',250,'#cbc1e8'],'fill-extrusion-height':['coalesce',['get','render_height'],40],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':.78}},
{id:'road-names',type:'symbol',source:'nyc','source-layer':'transportation_name',minzoom:15.4,filter:['in',['get','class'],['literal',[...major,...mid,'minor']]],layout:{'symbol-placement':'line','text-field':['coalesce',['get','name_en'],['get','name']],'text-font':['Noto Sans Regular'],'text-size':z(15.4,10,18,13),'text-letter-spacing':.04},paint:{'text-color':'#7b5677','text-halo-color':'#fff8ea','text-halo-width':2}}
]};
