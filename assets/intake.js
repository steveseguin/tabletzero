(function(){'use strict';
const form=document.getElementById('intake-form'),state=document.getElementById('intake-state'),message=document.getElementById('intake-message'),submit=document.getElementById('send-intake'),ai=document.getElementById('ai-details'),auth=document.getElementById('intake-authorship');
const config=window.TABLETZERO_INTAKE||{},base=typeof config.apiBase==='string'?config.apiBase.trim().replace(/\/$/,''):'',siteKey=config.turnstileSiteKey||'';
let turnstileId=null,token='';
function sync(){const needs=auth.value!=='human';ai.hidden=!needs;for(const name of ['model','prompt'])form.elements[name].required=needs;}
auth.addEventListener('change',sync);sync();
function values(){const data=Object.fromEntries(new FormData(form).entries());delete data['cf-turnstile-response'];return {kind:data.kind,title:data.title.trim(),author:data.author.trim(),authorship:data.authorship,model:data.model||'',model_version:data.model_version||'',prompt:data.prompt||'',editing:data.editing||'',book_id:data.book_id||'',body:data.body.trim(),consent:!!form.elements.consent.checked};}
document.getElementById('export-json').addEventListener('click',function(){if(!form.reportValidity())return;const payload=values();payload.exported_at=new Date().toISOString();payload.note='Locally downloaded. Not submitted or reviewed.';const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tabletzero-contribution.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message.textContent='Draft downloaded locally. No data sent to Tablet Zero.';});
const ready=/^https:\/\/[a-z0-9.-]+$/i.test(base)&&!!siteKey;
if(!ready){state.textContent='Direct submission is not yet enabled. You can prepare and download a JSON draft here, or use the GitHub-based contribution process.';submit.disabled=true;return;}
state.textContent='Direct intake is configured. Human review is required before publication.';
const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;
script.onload=function(){const node=document.getElementById('turnstile-container');node.hidden=false;turnstileId=window.turnstile.render(node,{sitekey:siteKey,callback:t=>{token=t;submit.disabled=false;},'expired-callback':()=>{token='';submit.disabled=true;},'error-callback':()=>{token='';submit.disabled=true;}});};
script.onerror=()=>{state.textContent='Unable to load verification. Export a draft instead.';};
document.head.appendChild(script);
form.addEventListener('submit',async function(event){event.preventDefault();if(!form.reportValidity()||!token)return;submit.disabled=true;message.textContent='Sending for moderation…';
try{const response=await fetch(base+'/v1/submissions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...values(),turnstile:token})});const result=await response.json();if(!response.ok)throw Error(result.error||'Submission could not be accepted');message.textContent='Accepted for private moderation. Receipt: '+result.id+'. Save this number. Your contribution is not published.';form.reset();sync();}
catch(error){message.textContent='Submission failed: '+error.message+'. Your draft remains here; export it before leaving.';}
finally{token='';if(turnstileId!==null&&window.turnstile)window.turnstile.reset(turnstileId);}
});
})();
