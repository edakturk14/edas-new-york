import {useLayoutEffect,useRef,useState} from 'react';
import {categories,neighborhoodLabel,type Entry,type Location} from '../data/content';
import {entryArea} from '../lib';
import {photoFor} from '../PlacePhoto';
import {Icon} from '../Icon';

export type PeekTarget={entryId:string;locationId?:string;anchor:{left:number;right:number;top:number;bottom:number}};

/** A lightweight preview: every word and photograph comes from the existing guide. */
export function PlacePeek({target,entry,location,onOpen,onKeep,onLeave}:{target:PeekTarget;entry:Entry;location?:Location;onOpen:()=>void;onKeep:()=>void;onLeave:()=>void}){
  const card=useRef<HTMLButtonElement>(null);
  const [position,setPosition]=useState({left:0,top:0});
  const [failed,setFailed]=useState(false);
  const photo=photoFor(entry.id,location?.id);
  useLayoutEffect(()=>{
    const rect=card.current?.getBoundingClientRect();if(!rect)return;
    const edge=16,headerBottom=document.querySelector('.hud')?.getBoundingClientRect().bottom??140;
    const right=target.anchor.right+12;
    const left=right+rect.width<innerWidth-edge?right:target.anchor.left-rect.width-12;
    setPosition({left:Math.max(edge,Math.min(left,innerWidth-rect.width-edge)),top:Math.max(headerBottom+12,Math.min(target.anchor.top-24,innerHeight-rect.height-96))});
  },[target,photo,failed]);
  const area=location?.neighborhoodIds.map(neighborhoodLabel).join(' · ')||entryArea(entry);
  return <button ref={card} className="place-peek" style={position} aria-label={`Open ${entry.name} details`} onClick={onOpen} onMouseEnter={onKeep} onMouseLeave={onLeave} onFocus={onKeep} onBlur={onLeave}>
    <div className={'peek-image '+entry.categories[0]}>
      {photo&&!failed?<img src={photo.src} alt={photo.alt} style={{objectPosition:photo.position}} onError={()=>setFailed(true)}/>:<><Icon name={entry.categories[0]} size={45}/><span>From Eda’s address book</span></>}
      {entry.isExplicitFavorite&&<span className="peek-favorite"><Icon name="spark" size={12}/> Eda’s favorite</span>}
    </div>
    {photo&&!failed&&<small className="peek-credit">{photo.credit}{photo.license?' · '+photo.license.split(' · ')[0]:''}</small>}
    <div className="peek-copy">
      <span className="peek-category">{entry.categories.map(id=>categories.find(c=>c.id===id)?.label).filter(Boolean).join(' · ')}</span>
      <strong className="peek-name">{entry.name}</strong>
      <span className="peek-area"><Icon name="all" size={12}/>{area}</span>
      {entry.shortLabel&&<span className="peek-short-label">{entry.shortLabel}</span>}
      {entry.edaNoteDisplay?<span className="peek-note"><small>EDA’S NOTE</small><span>“{entry.edaNoteDisplay}”</span></span>:entry.description?<span className="peek-description">{entry.description}</span>:null}
      {entry.visitStatus==='not-visited'&&<span className="status-badge">Eda hasn’t been yet</span>}
      <span className="peek-footer">See details & save <Icon name="arrow" size={15}/></span>
    </div>
  </button>;
}
