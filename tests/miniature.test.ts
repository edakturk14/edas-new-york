import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {validateStyleMin} from '@maplibre/maplibre-gl-style-spec';
import {cityStyle, MINIATURE_CENTER} from '../src/map-style';

test('the map style validates, including the geographic exclusion and extrusion layers',()=>{
  assert.deepEqual(validateStyleMin(cityStyle),[]);
});

test('the checked-in miniature has valid closed surfaces, finite heights and a bounded transfer size',()=>{
  const raw=readFileSync('public/data/greenpoint-miniature.geojson');
  const scene=JSON.parse(raw.toString());
  const meta=JSON.parse(readFileSync('src/map-art/miniature-bounds.json','utf8'));
  assert.equal(scene.features.length,meta.featureCount);
  assert(gzipSync(raw).byteLength<750_000,'Keep the static miniature below 750 kB gzip');
  const [west,south,east,north]=meta.bounds;
  assert(MINIATURE_CENTER[0]>west&&MINIATURE_CENTER[0]<east&&MINIATURE_CENTER[1]>south&&MINIATURE_CENTER[1]<north);
  for(const f of scene.features){
    assert.equal(f.geometry.type,'Polygon');
    const ring=f.geometry.coordinates[0];
    assert(ring.length>=4);
    assert.deepEqual(ring[0],ring.at(-1));
    for(const [lng,lat] of ring){
      assert(Number.isFinite(lng)&&Number.isFinite(lat));
      // A building or road at the extract edge may cross the boundary slightly.
      assert(lng>west-.005&&lng<east+.005&&lat>south-.005&&lat<north+.005);
    }
    const {base,height,color}=f.properties;
    assert(Number.isFinite(base)&&Number.isFinite(height)&&height>=base&&height<60);
    assert.match(color,/^#[0-9a-f]{6}$/i);
  }
});
