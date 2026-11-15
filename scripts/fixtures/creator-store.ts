// Development/test fixture only. Never imported by a deployed API route.
import {createHash} from 'node:crypto';
import type {CreatorStore} from '../../server/creator-store';
import type {CreatorRecord} from '../../shared/creators';
export function memoryCreatorStore():CreatorStore {
  const rows=new Map<string,CreatorRecord>(),metrics:Record<string,number>={},buckets=new Map<string,{count:number;expires:number}>();
  return {
    async limit(key,max,seconds){const old=buckets.get(key);const row=old&&old.expires>Date.now()?old:{count:0,expires:Date.now()+seconds*1000};row.count++;buckets.set(key,row);return row.count<=max},
    async add(input){const id=createHash('sha256').update(input.email).digest('hex');if(rows.has(id))return false;const now=new Date().toISOString();rows.set(id,{...input,id,createdAt:now,updatedAt:now,status:'interested',guideId:'edas-new-york',consentVersion:'creator-invite-v1'});return true},
    async page(offset){const all=[...rows.values()].reverse();return {records:all.slice(offset,offset+25),total:all.length,next:offset+25<all.length?offset+25:null}},
    async status(id,status){const row=rows.get(id);if(!row)return false;rows.set(id,{...row,status});return true},
    async remove(id){rows.delete(id)},
    async event(name){metrics[name]=(metrics[name]||0)+1},
    async metrics(){return {...metrics}},
  };
}
