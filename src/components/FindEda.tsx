import {useEffect,useRef,useState} from 'react';
const storageKey='edas-new-york:find-eda:v1';
// Separate from Saved: finding Eda never marks a place as saved or visited.
export function readEdaFound(){try{return JSON.parse(localStorage.getItem(storageKey)??'null')?.found===true}catch{return false}}
export function saveEdaFound(){try{localStorage.setItem(storageKey,JSON.stringify({version:1,found:true,foundAt:new Date().toISOString()}))}catch{/* the game still works for this visit */}}
export function FindEda({drawer,found,celebrate,onExplore,onReveal}:{drawer:boolean;found:boolean;celebrate:boolean;onExplore:()=>void;onReveal:()=>void}){
  const [open,setOpen]=useState(false);const toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(celebrate)setOpen(false)},[celebrate]);
  return <>
    <div className={'pilot-controls'+(drawer?' with-drawer':'')}>

      <button ref={toggle} className={'pilot-chip game-chip'+(found?' is-found':'')} aria-expanded={open} aria-controls="find-eda-card" onClick={()=>setOpen(o=>!o)}><span className="pixel" aria-hidden="true">{found?'♥':'?'}</span>{found?'Eda found':'Find Eda'}</button>
    </div>
    {open&&<section id="find-eda-card" className="find-eda-card" aria-label="Find Eda, an optional little game" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false);toggle.current?.focus()}}}>
      <div className="find-eda-top"><span className="pixel-eyebrow">OPTIONAL LITTLE GAME</span><button className="icon-close" aria-label="Close Find Eda" onClick={()=>{setOpen(false);toggle.current?.focus()}}>×</button></div>
      <h3>{found?'You found Eda!':'Find Eda in Greenpoint'}</h3>
      {found?<p>She’s still by the water whenever you want to say hi. This is just for fun and doesn’t change your Saved places.</p>:<p><strong>Clue:</strong> In a raspberry beret, she’s watching the ferries from the little green park where Greenpoint meets the river.</p>}
      {!found&&<div className="find-eda-actions"><button className="button" onClick={onExplore}>Go to Greenpoint</button><button className="text-button" onClick={()=>{onReveal();setOpen(false)}}>Reveal her spot</button></div>}
    </section>}
    {celebrate&&<div className="eda-celebration" role="status"><span aria-hidden="true" className="burst">♥ ✿ ♥</span>You found Eda!</div>}
  </>;
}
