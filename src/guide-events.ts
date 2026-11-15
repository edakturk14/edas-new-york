import type {GuideEvent} from '../shared/creators';
let opened=false;
export function trackGuideEvent(event:GuideEvent){
  if(navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  if(event==='guide_opened'){if(opened)return;opened=true}
  // No cookies, identifiers, search text, location, profile or email in event payloads.
  void fetch('/api/guide-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event}),keepalive:true}).catch(()=>{});
}
