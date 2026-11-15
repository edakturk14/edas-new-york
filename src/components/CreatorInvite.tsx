import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Icon} from '../Icon';
import {guideConfig} from '../data/guide-config';
import {trackGuideEvent} from '../guide-events';
import './creators.css';
export function CreatorInvite({onClose}:{onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [availability,setAvailability]=useState<'loading'|'open'|'closed'>('loading');
  const [busy,setBusy]=useState(false),[success,setSuccess]=useState(false),[error,setError]=useState('');
  const closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{
    const opener=document.activeElement as HTMLElement, node=dialog.current!;
    node.showModal();
    const controller=new AbortController();
    fetch('/api/creator-interest',{signal:controller.signal}).then(async r=>{const data=await r.json();setAvailability(r.ok&&data.accepting?'open':'closed')}).catch(()=>{if(!controller.signal.aborted)setAvailability('closed')});
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeRef.current()}};
    addEventListener('keydown',key,true);
    return()=>{controller.abort();removeEventListener('keydown',key,true);node.close();opener?.focus()};
  },[]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy||availability!=='open')return;
    const data=new FormData(event.currentTarget);setBusy(true);setError('');
    try{
      const response=await fetch('/api/creator-interest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:data.get('email'),city:data.get('city'),profile:data.get('profile'),hasList:data.get('hasList'),consent:data.get('consent')==='on',website:data.get('website')}),signal:AbortSignal.timeout(15000)});
      const result=await response.json();
      if(!response.ok||result.ok!==true)throw new Error(result.error||'I couldn’t save that. Please try again.');
      setSuccess(true);
    }catch(e){setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'That took too long. Please try again. Your details are still here.')}
    finally{setBusy(false)}
  }
  return <dialog ref={dialog} className="creator-dialog" aria-labelledby="creator-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose()}}}>
    <button className="icon-button creator-close" aria-label="Close creator invitation" onClick={onClose}><Icon name="close"/></button>
    <div className="creator-postcard" aria-hidden="true"><span className="postcard-stamp"><Icon name="map" size={23}/></span><span className="postcard-route">✿ <i/> <Icon name="all" size={19}/></span><span>A CITY WORTH SHARING</span></div>
    {success?<section className="creator-success" role="status"><span className="eyebrow">A NEW CITY ON THE HORIZON</span><h2 id="creator-title">You’re on the list.</h2><p>I’ll email you when I’m ready to invite a few creators. No need to have it all figured out yet.</p><button className="button creator-primary" onClick={onClose}>Back to {guideConfig.city}<Icon name="arrow" size={16}/></button></section>:<>
    <span className="eyebrow">{guideConfig.creatorInvite.eyebrow}</span><h2 id="creator-title">Your city.<br/>Your favorite spots.</h2><p className="creator-intro">{guideConfig.creatorInvite.description}</p>
    <p className="creator-stage"><span/>An early idea. A few creators to start.</p>
    {availability==='loading'?<p role="status">Opening the little address book…</p>:availability==='closed'?<div className="creator-unavailable" role="status"><strong>The list isn’t open just yet.</strong><p>Please check back soon. You can still explore and save places without an account.</p><button className="button" onClick={onClose}>Back to the map</button></div>:<form onSubmit={submit} className="creator-form">
      <label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com"/></label>
      <label>Which city would you make a guide for?<input name="city" required minLength={2} maxLength={100} placeholder="Paris, Istanbul, your little corner…"/></label>
      <label>Your Instagram, Substack, or website <span className="creator-optional">optional</span><input name="profile" type="url" maxLength={300} placeholder="https://"/></label>
      <fieldset><legend>Already have a list of recommendations?</legend><div className="creator-options"><label><input type="radio" name="hasList" value="yes" required/><span>Yes, a little address book</span></label><label><input type="radio" name="hasList" value="not-yet" required/><span>Not yet, just an idea</span></label></div></fieldset>
      <div className="creator-honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <label className="creator-consent"><input type="checkbox" name="consent" required/><span>{guideConfig.creator} can email me about making a guide.</span></label>
      <p className="creator-privacy">Your details stay private and are used to follow up about creator guides. This is an interest list, not an account or a finished map builder.</p>
      {error&&<p className="creator-error" role="alert">{error}</p>}
      <button className="button creator-primary" disabled={busy} type="submit">{busy?'Saving your spot…':'I’d love to make one'}{!busy&&<Icon name="arrow" size={17}/>}</button>
    </form>}
    </>}
  </dialog>;
}
export function CreatorInviteButton({onClick}:{onClick:()=>void}){return <button className="creator-trigger" onClick={()=>{trackGuideEvent('creator_opened');onClick()}}><Icon name="spark" size={15}/><span>Make a guide like this</span><Icon name="arrow" size={13}/></button>}
