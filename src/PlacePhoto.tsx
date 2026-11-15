import {useEffect,useState} from 'react';
import venuePhotos from './data/place-photos.json';
import areaPhotos from './data/area-photos.json';
import {Icon} from './Icon';

export type Photo={src:string;alt:string;credit:string;sourceUrl:string;license?:string;position?:string};
export const photos:Record<string,Photo>={...areaPhotos,...venuePhotos};
export const thumbnailSrc=(src:string)=>src.replace('/images/places/','/images/places/thumbs/');
export const photoFor=(entryId:string,locationId?:string)=>locationId&&photos[locationId]||photos[entryId];

export function PlacePhoto({entryId,locationId,name,category,thumbnail=false}:{entryId:string;locationId?:string;name:string;category:string;thumbnail?:boolean}){
const photo=photoFor(entryId,locationId);const [failed,setFailed]=useState(false);
const licenseLabel=photo?.license?.split(' · ')[0];const cc=licenseLabel?.match(/^CC (BY(?:-SA)?) ([1-4]\.0)$/);const licenseUrl=photo?.license?.match(/https:\/\/\S+/)?.[0]??(cc?`https://creativecommons.org/licenses/${cc[1].toLowerCase()}/${cc[2]}/`:licenseLabel?.startsWith('CC0')?'https://creativecommons.org/publicdomain/zero/1.0/':undefined);
useEffect(()=>setFailed(false),[photo?.src]);
if(!photo||failed)return thumbnail?<Icon name={category} size={29}/>:<div className={'category-art detail-art '+category} data-photo-status={failed?'unavailable':'not-sourced'}><div className="art-orbit"/><Icon name={category} size={75}/><span className="art-caption">{failed?'PHOTO UNAVAILABLE':'A LITTLE '+(category==='cafes'?'TREAT':category==='walks'?'WANDER':'DISCOVERY')}</span><Icon name="spark" size={23}/></div>;
if(thumbnail)return <img className="place-thumbnail" src={thumbnailSrc(photo.src)} alt="" width="60" height="60" loading="lazy" decoding="async" style={{objectPosition:photo.position}} onError={()=>setFailed(true)}/>;
return <figure className="place-photo" aria-label={`Photo of ${name}`}><img src={photo.src} alt={photo.alt} width="640" height="360" decoding="async" style={{objectPosition:photo.position}} onError={()=>setFailed(true)}/><figcaption><a className="photo-credit" href={photo.sourceUrl} target="_blank" rel="noreferrer" title={`${photo.credit}${photo.license?' · '+photo.license:''}`}>{photo.credit} ↗</a>{licenseUrl?<a className="photo-license" href={licenseUrl} target="_blank" rel="noreferrer">{licenseLabel}</a>:licenseLabel&&<span className="photo-license" title={licenseLabel}>{licenseLabel}</span>}</figcaption></figure>;
}
