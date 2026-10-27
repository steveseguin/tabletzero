// Tablet Zero optional intake API, Cloudflare Worker with D1 (NOT deployed by this PR).
// API is disabled until its database, secrets, and browser config are deployed.
const ORIGINS = new Set(["https://tabletzero.org", "https://www.tabletzero.org"]);
const FIELDS = ["title", "body", "author", "authorship", "model", "model_version", "prompt", "editing", "book_id"];
const kinds = new Set(["book", "objection", "response", "trial", "revision"]);
const authorships = new Set(["human", "human_ai", "ai_generated"]);
function json(value,status=200,origin="") {return new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...(ORIGINS.has(origin)?{"access-control-allow-origin":origin,"vary":"Origin"}:{})}})}
function clean(s,max){return typeof s==="string"?s.trim().slice(0,max):""}
async function tokenValid(token, secret, ip) {
 if(!secret||!token)return false;
 const body=new FormData();body.set("secret",secret);body.set("response",token);if(ip)body.set("remoteip",ip);
 const res=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body,signal:AbortSignal.timeout(7000)});
 if(!res.ok)return false;
 const result=await res.json();
 return result.success===true && (!result.hostname || ["tabletzero.org","www.tabletzero.org"].includes(result.hostname));
}
async function hashIp(ip,salt){const bytes=new TextEncoder().encode(salt+":"+(ip||"unknown")+":"+new Date().toISOString().slice(0,10));const hash=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function authorized(request,secret){const supplied=request.headers.get("authorization")||"";return Boolean(secret)&&supplied==="Bearer "+secret;}
export default {async fetch(request,env) {
 const url=new URL(request.url),origin=request.headers.get("origin")||"";
 if(request.method==="OPTIONS"){
 if(!ORIGINS.has(origin))return new Response(null,{status:403});
 return new Response(null,{status:204,headers:{"access-control-allow-origin":origin,"access-control-allow-methods":"POST, GET, OPTIONS","access-control-allow-headers":"content-type, authorization, x-tablet-agent-key","access-control-max-age":"600","vary":"Origin"}});
 }
 if(url.pathname==="/v1/health" && request.method==="GET") return json({service:"tabletzero-intake",state:env.DB?"online":"unconfigured",public_submission:!!(env.DB&&env.TURNSTILE_SECRET)},200,origin);
 if(!env.DB)return json({error:"not_configured"},503,origin);
 if(url.pathname==="/v1/admin/submissions" && request.method==="GET"){
 if(!authorized(request,env.ADMIN_KEY))return json({error:"unauthorized"},401,origin);
 const status=url.searchParams.get("status")==="approved"?"approved":"pending";
 const results=await env.DB.prepare("SELECT id,kind,title,body,author,authorship,model,model_version,prompt,editing,book_id,submitted_at,status FROM submissions WHERE status=? ORDER BY submitted_at DESC LIMIT 100").bind(status).all();
 return json({submissions:results.results},200,origin);
 }
 if(url.pathname.startsWith("/v1/admin/submissions/") && request.method==="PATCH"){
 if(!authorized(request,env.ADMIN_KEY))return json({error:"unauthorized"},401,origin);
 const id=url.pathname.split("/").pop();const payload=await request.json().catch(()=>({}));
 if(!["approved","rejected"].includes(payload.status))return json({error:"invalid_status"},400,origin);
 await env.DB.prepare("UPDATE submissions SET status=?,reviewed_at=datetime('now'),review_note=? WHERE id=? AND status='pending'").bind(payload.status,clean(payload.note,1000),id).run();
 return json({id,status:payload.status},200,origin);
 }
 if(url.pathname!=="/v1/submissions" || request.method!=="POST")return json({error:"not_found"},404,origin);
 // A browser must present a Turnstile token. Trusted automation uses a private agent key.
 if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json({error:"json_required"},415,origin);
 if(Number(request.headers.get("content-length")||0)>40000)return json({error:"too_large"},413,origin);
 let data;try{data=await request.json()}catch{return json({error:"bad_json"},400,origin)}
 if(!data || typeof data!=="object" || Array.isArray(data))return json({error:"bad_payload"},400,origin);
 const kind=clean(data.kind,20),authorship=clean(data.authorship,20);
 if(!kinds.has(kind)||!authorships.has(authorship)||data.consent!==true)return json({error:"invalid_metadata_or_consent"},422,origin);
 const vals=Object.fromEntries(FIELDS.map(k=>[k,clean(data[k],k==="body"?12000:k==="prompt"?9000:k==="editing"?3000:300)]));
 if(vals.title.length<5||vals.body.length<50||vals.author.length<2)return json({error:"missing_fields"},422,origin);
 if(authorship!=="human" && (!vals.model || !vals.prompt))return json({error:"ai_provenance_required"},422,origin);
 const agent=request.headers.get("x-tablet-agent-key")||"";
 const isAgent=Boolean(env.AGENT_KEY) && agent===env.AGENT_KEY;
 if(!isAgent){
 if(!ORIGINS.has(origin))return json({error:"origin_not_allowed"},403,origin);
 try{if(!await tokenValid(data.turnstile,env.TURNSTILE_SECRET,request.headers.get("CF-Connecting-IP")))return json({error:"verification_failed"},403,origin)}
 catch{return json({error:"verification_unavailable"},503,origin)}
 }
 if(!env.RATE_SALT)return json({error:"rate_limit_not_configured"},503,origin);
 const fp=await hashIp(request.headers.get("CF-Connecting-IP"),env.RATE_SALT);
 const recent=await env.DB.prepare("SELECT COUNT(*) AS n FROM submissions WHERE rate_fingerprint=? AND submitted_at > datetime('now','-1 day')").bind(fp).first();
 if(Number(recent?.n||0)>=5)return json({error:"rate_limited"},429,origin);
 const id=crypto.randomUUID();
 await env.DB.prepare("INSERT INTO submissions (id,kind,title,body,author,authorship,model,model_version,prompt,editing,book_id,rate_fingerprint,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'pending')").bind(id,kind,vals.title,vals.body,vals.author,authorship,vals.model,vals.model_version,vals.prompt,vals.editing,vals.book_id,fp).run();
 return json({id,status:"pending_review",message:"Saved privately for human moderation; not published."},202,origin);
 }};
