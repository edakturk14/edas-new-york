import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import {entries,locations} from '../src/data/content';
import {defaultLocation} from '../src/lib';
import {photos,photoFor} from '../src/PlacePhoto';
test('verified photo assets have provenance; unresolved places keep an honest fallback',()=>{const unresolved=entries.filter(e=>!photoFor(e.id,defaultLocation(e)?.id)).map(e=>e.id);assert(unresolved.every(id=>['chez-ma-tante','fish-cheeks','raouls'].includes(id)),`unexpected missing photos: ${unresolved}`);for(const [id,photo] of Object.entries(photos)){assert(entries.some(e=>e.id===id)||locations.some(l=>l.id===id),`known entry or branch ${id}`);assert.match(photo.src,/^\/images\/places\/[^/]+\.(jpg|jpeg|png|webp)$/);assert(photo.alt.length>12);assert(photo.credit);assert.match(photo.sourceUrl,/^https:\/\//);const asset=new URL('../public'+photo.src,import.meta.url);assert(existsSync(asset),`local photo exists: ${id}`);assert(statSync(asset).size>1000);}});
test('Bakeri branch fallback is brand-neutral rather than another branch frontage',()=>{const e=entries.find(e=>e.id==='bakeri')!;for(const l of e.resolvedLocations)assert(photoFor(e.id,l.id));if(photos.bakeri)assert.doesNotMatch(photos.bakeri.alt,/Freeman Street|Wythe Avenue|Greenpoint branch|Williamsburg branch/i);});
