export const creatorStatuses = ['interested', 'contacted', 'building', 'published'] as const;
export type CreatorStatus = typeof creatorStatuses[number];
export type CreatorInput = {email:string; city:string; profile:string; hasList:'yes'|'not-yet'; consent:true};
export type CreatorRecord = CreatorInput & {id:string; createdAt:string; updatedAt:string; status:CreatorStatus; guideId:string; consentVersion:'creator-invite-v1'};
export const eventNames = ['guide_opened','place_opened','place_saved','category_used','creator_opened','creator_submitted'] as const;
export type GuideEvent = typeof eventNames[number];
export function validateCreator(value:unknown):CreatorInput {
  if (!value || typeof value !== 'object') throw new Error('Please fill in the form.');
  const v=value as Record<string,unknown>;
  const text=(key:string,max:number)=>{if(typeof v[key]!=='string'||(v[key] as string).length>max)throw new Error('Please check your '+key+'.');return (v[key] as string).trim()};
  const email=text('email',254).toLowerCase(), city=text('city',100), profile=text('profile',300);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Please enter a valid email address.');
  if(city.length<2 || /[\u0000-\u001f]/.test(city))throw new Error('Which city would you make a guide for?');
  if(profile){try{const url=new URL(profile);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw 0}catch{throw new Error('Please use a full profile link, starting with https://.')}}
  if(!['yes','not-yet'].includes(String(v.hasList)))throw new Error('Let me know if you already have recommendations.');
  if(v.consent!==true)throw new Error('Please confirm that I can email you about making a guide.');
  return {email,city,profile,hasList:v.hasList as CreatorInput['hasList'],consent:true};
}
// Spreadsheet-safe cells: user-controlled values must never become CSV formulas.
export function creatorsCsv(records:CreatorRecord[]):string {
  const cell=(value:string)=>'"'+(/^[\s]*[=+@\-]/.test(value)?"'"+value:value).replaceAll('"','""')+'"';
  return [['Email','City','Profile','Has recommendations','Status','Submitted (UTC)','Guide'],...records.map(r=>[r.email,r.city,r.profile,r.hasList,r.status,r.createdAt,r.guideId])].map(row=>row.map(cell).join(',')).join('\r\n');
}
