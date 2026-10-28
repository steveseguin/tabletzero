import test from 'node:test';import assert from 'node:assert/strict';import api from '../intake/src/worker.mjs';
const base='https://api.tabletzero.org',env={DB:{prepare(){throw Error('unexpected DB call')}}};
test('honest health',async()=>{const r=await api.fetch(new Request(base+'/v1/health'),{});assert.equal((await r.json()).state,'unconfigured')});
test('disabled intake',async()=>{const r=await api.fetch(new Request(base+'/v1/submissions',{method:'POST'}),{});assert.equal(r.status,503)});
test('admin unauthorized',async()=>{const r=await api.fetch(new Request(base+'/v1/admin/submissions'),env);assert.equal(r.status,401)});
test('JSON required',async()=>{const r=await api.fetch(new Request(base+'/v1/submissions',{method:'POST',headers:{'content-type':'text/plain'},body:'hello'}),env);assert.equal(r.status,415)});
test('explicit consent required',async()=>{const r=await api.fetch(new Request(base+'/v1/submissions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind:'book',title:'A title',body:'a'.repeat(80),author:'human',authorship:'human',consent:false})}),env);assert.equal(r.status,422)});
test('CORS origin enforced',async()=>{const r=await api.fetch(new Request(base+'/v1/submissions',{method:'OPTIONS',headers:{origin:'https://thirdparty.example'}}),env);assert.equal(r.status,403)});
