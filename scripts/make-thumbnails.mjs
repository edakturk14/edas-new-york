// Writes small list thumbnails next to the full place photos (macOS `sips`):
//   node scripts/make-thumbnails.mjs
// Thumbnails show at 60x60 CSS px; 180 px on the short side stays sharp on 3x phones.
import {execFileSync} from 'node:child_process';
import {mkdirSync,readdirSync} from 'node:fs';
const dir=new URL('../public/images/places/',import.meta.url).pathname;const out=dir+'thumbs/';mkdirSync(out,{recursive:true});
for(const file of readdirSync(dir).filter(f=>f.endsWith('.jpg'))){
 const size=execFileSync('sips',['-g','pixelWidth','-g','pixelHeight',dir+file],{encoding:'utf8'});const [w,h]=[...size.matchAll(/pixel\w+: (\d+)/g)].map(m=>Number(m[1]));
 execFileSync('sips',[w>h?'--resampleHeight':'--resampleWidth','180','-s','format','jpeg','-s','formatOptions','72',dir+file,'--out',out+file],{stdio:'ignore'});
}
console.log(readdirSync(out).length,'thumbnails');
