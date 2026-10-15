import {marked} from 'marked';
import DOMPurify from 'dompurify';
export const months=['August','September','October','November','December'];
export const initialTopics=[{id:'banking',name:'Banking & finance',color:'sage'},{id:'economy',name:'Economy & business',color:'sand'},{id:'schemes',name:'Government schemes',color:'blue'},{id:'appointments',name:'Appointments',color:'clay'},{id:'reports',name:'Reports & indices',color:'lavender'},{id:'awards',name:'Awards & honours',color:'sand'},{id:'sports',name:'Sports',color:'sage'},{id:'science',name:'Science & technology',color:'blue'},{id:'international',name:'International affairs',color:'lavender'},{id:'days',name:'Important days',color:'clay'},{id:'other',name:'Other current affairs',color:'sage'}];
export const uid=()=>crypto.randomUUID();
export const now=()=>new Date().toISOString();
export const day=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export const weekLabel=id=>['','Week 1 · 1–7','Week 2 · 8–14','Week 3 · 15–21','Week 4 · 22–28','Week 5 · 29–month end'][Number(id)]||'Unfiled';
export const initialFolders=()=>months.flatMap((m,i)=>[{id:'m'+i,name:m+' 2026',parent:null,month:i},...Array.from({length:5},(_,j)=>({id:`m${i}w${j+1}`,name:weekLabel(j+1),parent:'m'+i,month:i}))]);
export function initialState(){return {version:1,notes:[],topics:initialTopics,folders:initialFolders(),reviews:[],settings:{theme:'paper',goal:10,lastBackup:null},created:now()}}
let dbPromise;
function db(){return dbPromise||(dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('calico-ca',1);req.onupgradeneeded=()=>req.result.createObjectStore('workspace');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)}))}
export async function load(){const database=await db();return new Promise((resolve,reject)=>{const req=database.transaction('workspace').objectStore('workspace').get('data');req.onsuccess=()=>resolve(req.result||initialState());req.onerror=()=>reject(req.error)})}
export async function persist(state){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('workspace','readwrite');tx.objectStore('workspace').put(state,'data');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
export function markdown(text){return DOMPurify.sanitize(marked.parse(text||'',{gfm:true,breaks:true}),{FORBID_TAGS:['img','iframe','style','script','form','input'],FORBID_ATTR:['style']})}
export function plain(text){return (text||'').replace(/[#*_`>\[\]]/g,'').replace(/\s+/g,' ').trim()}
export function dateLabel(date){if(!date)return 'Not scheduled';return new Date(date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:undefined})}
export function due(note){return !note.deleted&&(!note.nextReview||new Date(note.nextReview)<=new Date())}
export function descendants(folders,id){const found=[id];for(let i=0;i<found.length;i++)found.push(...folders.filter(f=>f.parent===found[i]).map(f=>f.id));return found}
export function pathLabel(folders,id){const parts=[];let f=folders.find(f=>f.id===id);const seen=new Set();while(f&&!seen.has(f.id)){seen.add(f.id);parts.unshift(f.name);f=folders.find(p=>p.id===f.parent)}return parts.join(' / ')||'Inbox'}
export function exportFile(name,data,type='application/json'){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
export function noteMarkdown(n,state){return `# ${n.title}\n\nTopic: ${state.topics.find(t=>t.id===n.topic)?.name||'Unsorted'}\nFolder: ${pathLabel(state.folders,n.folder)}\nPriority: ${n.priority}\nSource: ${n.source||'Not added'}${n.page?' · p. '+n.page:''}\nEvent date: ${n.eventDate||'Not added'}\nTags: ${(n.tags||[]).join(', ')}\n\n${n.body}\n\n${n.question?'## Recall question\n\n'+n.question+'\n\n':''}${n.answer?'## Quick answer\n\n'+n.answer+'\n\n':''}${n.figures.length?`## Figures\n\n${n.figures.map(f=>`![${f.caption||'Attached figure'}](${f.data})`).join('\n\n')}`:''}`}
export function validateImport(raw){
 const fail=message=>{throw Error(message)};
 if(!raw||raw.format!=='calico-ca-backup'||raw.version!==1||!raw.state)fail('Not a Calico CA backup.');
 const s=structuredClone(raw.state),str=v=>typeof v==='string',validDate=v=>str(v)&&Number.isFinite(Date.parse(v));
 if(!Array.isArray(s.notes)||!Array.isArray(s.topics)||!Array.isArray(s.folders)||s.notes.length>15000||s.folders.length>2000||s.topics.length>500||s.topics.length<1)fail('Invalid backup structure or too many items.');
 const ids=new Set(),t=new Set(),noteIds=new Set();
 for(const f of s.folders){if(!f||!str(f.id)||!f.id||!str(f.name)||!f.name.trim()||ids.has(f.id)||!(f.parent==null||str(f.parent)))fail('Invalid folders.');ids.add(f.id);f.parent=f.parent||null;}
 const map=new Map(s.folders.map(f=>[f.id,f]));
 for(const f of s.folders){let p=f;const seen=new Set();while(p?.parent){if(seen.has(p.id)||seen.size>50)fail('Folder cycle or excessive nesting detected.');seen.add(p.id);p=map.get(p.parent);if(!p)fail('Missing parent folder.');}}
 for(const topic of s.topics){if(!topic||!str(topic.id)||!topic.id||!str(topic.name)||!topic.name.trim()||t.has(topic.id))fail('Invalid topics.');t.add(topic.id);if(!['sage','sand','blue','clay','lavender'].includes(topic.color))topic.color='sage';}
 for(const n of s.notes){
  if(!n||!str(n.id)||!n.id||noteIds.has(n.id)||!str(n.title)||!str(n.body)||!Array.isArray(n.figures)||n.figures.length>12||!Array.isArray(n.tags)||n.tags.some(x=>!str(x)))fail('Invalid notes.');noteIds.add(n.id);
  for(const key of ['question','answer','source','page','eventDate']){if(n[key]==null)n[key]='';if(!str(n[key]))fail('Invalid note text.');}
  const figures=new Set();for(const f of n.figures){if(!f||!str(f.id)||figures.has(f.id)||!str(f.data)||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(f.data)||f.data.length>12*1024*1024)fail('Invalid image format.');figures.add(f.id);if(f.caption==null)f.caption='';if(f.name==null)f.name='figure.png';if(!str(f.caption)||!str(f.name))fail('Invalid figure metadata.');}
  if(n.folder&&!ids.has(n.folder))n.folder=null;n.folder=n.folder||null;
  if(!t.has(n.topic))n.topic=s.topics[0]?.id||'';
  n.status=['new','learning','confident'].includes(n.status)?n.status:'new';n.priority=['normal','high'].includes(n.priority)?n.priority:'normal';
  n.created=validDate(n.created)?n.created:now();n.updated=validDate(n.updated)?n.updated:n.created;
  n.nextReview=validDate(n.nextReview)?n.nextReview:null;n.deleted=validDate(n.deleted)?n.deleted:null;
  n.reviewCount=Number.isSafeInteger(n.reviewCount)&&n.reviewCount>=0?n.reviewCount:0;n.starred=n.starred===true;n.sample=n.sample===true;n.tags=[...new Set(n.tags)].slice(0,15);
 }
 const reviews=Array.isArray(s.reviews)?s.reviews.filter(r=>r&&str(r.id)&&str(r.noteId)&&['again','good','easy'].includes(r.grade)&&validDate(r.at)&&str(r.day)).slice(0,20000):[];
 return {version:1,notes:s.notes,topics:s.topics,folders:s.folders,reviews,created:validDate(s.created)?s.created:now(),settings:{theme:s.settings?.theme==='night'?'night':'paper',goal:Math.round(Math.max(1,Math.min(50,Number(s.settings?.goal)||10))),lastBackup:validDate(s.settings?.lastBackup)?s.settings.lastBackup:null}};
}
export async function imageData(file){if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw Error('Use a PNG, JPG, WebP, or GIF image.');if(file.size>8*1024*1024)throw Error('Please use an image smaller than 8 MB.');return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve({id:uid(),data:r.result,caption:'',name:file.name||'Pasted figure'});r.onerror=()=>reject(Error('Could not read that image.'));r.readAsDataURL(file)})}
