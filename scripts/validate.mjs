import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),all=[],bad=[],read=p=>fs.readFileSync(path.join(root,p),'utf8');
function walk(d=''){for(const e of fs.readdirSync(path.join(root,d),{withFileTypes:true})){if(['.git','node_modules','test-results'].includes(e.name))continue;const f=path.posix.join(d,e.name);e.isDirectory()?walk(f):all.push(f)}}walk();
const files=new Set(all),pages=all.filter(x=>x.endsWith('.html')),ids={};
for(const p of pages)ids[p]=new Set([...read(p).matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
function check(ok,message){if(!ok)bad.push(message)}
for(const p of all.filter(p=>p.endsWith('.json'))){try{JSON.parse(read(p))}catch(error){bad.push(p+': invalid JSON: '+error.message)}}
for(const p of pages){const s=read(p);
for(const [,json] of s.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){try{JSON.parse(json)}catch(error){bad.push(p+': invalid JSON-LD: '+error.message)}}
for(const [str,why] of [['<!doctype html>','doctype'],['lang="en"','lang'],['name="viewport"','viewport'],['rel="canonical"','canonical'],['property="og:image"','social preview'],['class="skip"','keyboard skip']])check(s.includes(str),p+': missing '+why);
for(const [,id] of s.matchAll(/\bfor="([^"]+)"/g))check(ids[p].has(id),p+': label target '+id);
for(const [,rel] of s.matchAll(/\b(?:href|src)="([^"]+)"/g)){if(/^(?:https?:|mailto:|data:|\/\/)/i.test(rel))continue;const [loc,frag]=rel.split('#');let dest=loc?path.posix.normalize(loc.startsWith('/')?'.'+loc:path.posix.join(path.posix.dirname(p),loc)):p;if(loc&&!path.posix.extname(dest))dest=path.posix.join(dest,'index.html');check(files.has(dest),p+': broken link '+rel+' => '+dest);if(frag&&ids[dest])check(ids[dest].has(frag),p+': missing anchor '+rel)}
}
for(const p of ['LICENSE','CONTENT-LICENSE.md','GOVERNANCE.md','CONTRIBUTING.md','assets/social-preview.png','intake/src/worker.mjs','robots.txt','sitemap.xml'])check(files.has(p),'Missing '+p);
const idx=JSON.parse(read('assembly/runs/index.json'));check(Array.isArray(idx.runs)&&idx.runs.length===0,'Unverified Assembly runs may not be invented');
for(let n=1;n<=3;n++){const id='book-'+String(n).padStart(3,'0'),m=JSON.parse(read('books/'+id+'.meta.json'));check(m.id===id&&m.model_endorsement===false,'bad Book provenance '+id);check(read('doubt/'+id+'.md').includes('editorial seed'),'missing editorial objection disclaimer '+id)}
const library=JSON.parse(read('library.json')),bookIds=new Set(),sitemap=read('sitemap.xml');
for(const book of library.books){
check(!bookIds.has(book.id),'duplicate Library id '+book.id);bookIds.add(book.id);
for(const key of ['source','metadata','objections'])check(files.has(book[key]),book.id+': missing '+key+' '+book[key]);
const page='library/'+book.id+'/index.html';check(files.has(page),book.id+': missing Library page');
check(book.url==='https://tabletzero.org/library/'+book.id+'/',book.id+': incorrect canonical URL');
check(sitemap.includes('<loc>'+book.url+'</loc>'),book.id+': missing sitemap entry');
if(files.has(book.metadata)){const m=JSON.parse(read(book.metadata));check(m.id===book.id&&m.title===book.title&&m.kind===book.kind&&m.original_source===book.source,book.id+': Library and metadata disagree');check(m.model_endorsement===false&&m.consciousness_assertion===false,book.id+': invalid provenance assertions')}
}
const png=fs.readFileSync(path.join(root,'assets/social-preview.png'));check(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'not a PNG');check(png.readUInt32BE(16)===1200&&png.readUInt32BE(20)===630,'bad share image size');
check(read('assets/intake-config.js').includes('apiBase: ""'),'GitHub-free direct intake must remain disabled before explicit configuration');
if(bad.length){console.error('FAILED:',bad.length,bad.join('\n'));process.exitCode=1}else console.log('PASS: static links, metadata, provenance, image and intake state across '+pages.length+' pages');
