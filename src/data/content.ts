import seed from '../../docs/content/guide-seed.json';
import locationData from './locations.json';
export type Location = { id:string; entryId:string; branchLabel:string; address:string; neighborhoodIds:string[]; coordinates:[number,number] | null; coordinateSource:string; addressSource:string; officialUrl:string; verifiedAt:string; status:string };
export type Entry = typeof seed.entries[number] & { resolvedLocations: Location[] };
export const locations = locationData as Location[];
export const entries:Entry[] = seed.entries.map(e=>({...e,resolvedLocations:locations.filter(l=>l.entryId===e.id)}));
export const categories = [{id:'all',label:'All spots'},...seed.categories.filter(c=>c.id!=='neighborhoods')];
export const neighborhoodLabel = (id:string) => id === 'lic' ? 'Long Island City · Queens' : id.split('-').map(w=>w==='soho'?'SoHo':w==='nolita'?'Nolita':w==='dumbo'?'DUMBO':w[0].toUpperCase()+w.slice(1)).join(' ');
export const neighborhoods = [...new Set([...entries.flatMap(e=>e.neighborhoodHints),...locations.flatMap(l=>l.neighborhoodIds),'lic'])].sort((a,b)=>neighborhoodLabel(a).localeCompare(neighborhoodLabel(b)));
// Approximate camera targets, not business coordinates or official boundaries.
export const cameraTargets:Record<string,[number,number]> = {'greenpoint':[-73.953,40.73],'williamsburg':[-73.958,40.714],'lic':[-73.949,40.746],'dumbo':[-73.989,40.703],'brooklyn-heights':[-73.996,40.696],'prospect-park':[-73.969,40.663],'upper-east-side':[-73.961,40.779],'upper-west-side':[-73.978,40.782],'central-park':[-73.968,40.779],'midtown':[-73.981,40.756],'west-village':[-74.003,40.734],'greenwich-village':[-73.999,40.731],'soho':[-74.001,40.724],'nolita':[-73.995,40.723],'east-village':[-73.984,40.727],'lower-east-side':[-73.988,40.718],'chinatown':[-73.998,40.715],'chelsea':[-74.002,40.746],'carroll-gardens':[-73.998,40.681],'lower-manhattan':[-74.009,40.709],'meatpacking-district':[-74.007,40.74],'manhattan-west-side':[-74.011,40.742],'theater-district':[-73.985,40.759]};
