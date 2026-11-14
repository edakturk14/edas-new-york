export type GuideStop={label:string;role:string;coordinates:[number,number];query:string};
export type MapGuide={coordinates:[number,number];caption:string;stops?:GuideStop[];directions?:{label:string;from:number;to:number}[];sources:{label:string;url:string}[]};
// Rounded overview anchors, not surveyed entrances or turn-by-turn route geometry.
// Named stops are checked against the linked park/operator information; broad areas
// retain deliberately approximate markers. No new recommendation records are added.
export const mapGuides:Partial<Record<string,MapGuide>>={
 'times-square':{coordinates:[-73.9855,40.758],caption:'Plaza area overview',sources:[{label:'Official area information',url:'https://www.timessquarenyc.org/explore/getting-around-and-parking'}]},
 'bryant-park':{coordinates:[-73.9836,40.7538],caption:'Park overview',sources:[{label:'Official park information',url:'https://bryantpark.org/the-park/hours-and-directions'}]},
 'central-park':{coordinates:[-73.968,40.779],caption:'Park overview',sources:[{label:'Official park map',url:'https://www.centralparknyc.org/maps'}]},
 'brooklyn-bridge-park-and-heights':{coordinates:[-73.998,40.697],caption:'Waterfront & neighborhood overview',sources:[{label:'Official park information',url:'https://brooklynbridgepark.org/'}]},
 'prospect-park':{coordinates:[-73.969,40.663],caption:'Park overview',sources:[{label:'Official park information',url:'https://www.prospectpark.org/'}]},
 'hudson-river-park':{coordinates:[-74.011,40.734],caption:'Waterfront overview',sources:[{label:'Official park map',url:'https://hudsonriverpark.org/'}]},
 'brooklyn-bridge-walk':{coordinates:[-73.9969,40.7061],caption:'Brooklyn → Manhattan',stops:[
  {role:'Start · Brooklyn',label:'Tillary Street & Brooklyn Bridge Boulevard',coordinates:[-73.9887,40.6951],query:'Brooklyn Bridge Pedestrian Walkway, Tillary Street and Adams Street, Brooklyn, NY'},
  {role:'Finish · Manhattan',label:'Centre Street & Park Row, by City Hall',coordinates:[-74.0045,40.7126],query:'Brooklyn Bridge Pedestrian Entrance, Centre Street and Park Row, Manhattan, NY'}
 ],directions:[{label:'Walking directions',from:0,to:1}],sources:[{label:'Pedestrian access guide',url:'https://triptins.com/brooklyn-bridge-pedestrian-entrance/'}]},
 'high-line':{coordinates:[-74.0058,40.747],caption:'High Line + Chelsea Market or West Village',stops:[
  {role:'Park access',label:'High Line · Gansevoort Street',coordinates:[-74.0082,40.7394],query:'High Line Gansevoort Street entrance, New York, NY'},
  {role:'Pair with',label:'Chelsea Market',coordinates:[-74.0059,40.7424],query:'Chelsea Market, New York, NY'},
  {role:'Or explore',label:'West Village',coordinates:[-74.003,40.734],query:'West Village, New York, NY'}
 ],directions:[{label:'Walk to Chelsea Market',from:0,to:1},{label:'Walk to the West Village',from:0,to:2}],sources:[{label:'Official High Line access map',url:'https://www.thehighline.org/visit/'},{label:'Chelsea Market information',url:'https://www.chelseamarket.com/'}]},
 'greenpoint-waterfront':{coordinates:[-73.9619,40.7297],caption:'Transmitter Park → Greenpoint Ferry',stops:[
  {role:'Start',label:'WNYC Transmitter Park',coordinates:[-73.9619,40.7297],query:'WNYC Transmitter Park, Brooklyn, NY'},
  {role:'Finish',label:'Greenpoint Ferry · 10 India Street',coordinates:[-73.9632,40.7315],query:'Greenpoint NYC Ferry Terminal, 10 India Street, Brooklyn, NY'}
 ],directions:[{label:'Walking directions',from:0,to:1}],sources:[{label:'Official park information',url:'https://www.nycgovparks.org/parks/transmitter-park'},{label:'NYC Ferry landing & service',url:'https://www.ferry.nyc/routes-and-schedules/east-river/'}]}
};
export function guidePoints(id:string):[number,number][]{const guide=mapGuides[id];return guide?(guide.stops?.map(s=>s.coordinates)??[guide.coordinates]):[];}
export function walkDirections(guide:MapGuide,direction=guide.directions?.[0]){if(!direction||!guide.stops)return undefined;const params=new URLSearchParams({api:'1',origin:guide.stops[direction.from].query,destination:guide.stops[direction.to].query,travelmode:'walking'});return 'https://www.google.com/maps/dir/?'+params;}
