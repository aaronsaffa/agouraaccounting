import { onRequest } from '../functions/api/contact.js';
import { onRequestGet } from '../functions/api/config.js';
const env = { RESEND_API_KEY:'test-only', CONTACT_TO:'owner@example.com', CONTACT_FROM:'site@example.com', TURNSTILE_SITE_KEY:'test-site', TURNSTILE_SECRET_KEY:'test-secret', TURNSTILE_HOSTNAMES:'agouraaccounting.com' };
const valid = { email:'visitor@example.com',name:'Visitor',message:'Inquiry',page:'/',kind:'contact',token:'test-token' };
function assert(value,message='Assertion failed') { if (!value) throw new Error(message); }
async function run(payload=valid, options={}) {
  const request = new Request('https://agouraaccounting.com/api/contact', {method:options.method || 'POST',headers:{Origin:options.origin || 'https://agouraaccounting.com','Content-Type':'application/json'},...(options.method==='GET'?{}:{body:JSON.stringify(payload)})});
  return onRequest({request,env:options.env || env});
}
Deno.test('configuration only exposes public site key; incomplete setup disabled', async () => {
  assert(!(await onRequestGet({env:{}}).json()).enabled);
  const configured=await onRequestGet({env}).json();assert(configured.enabled);assert(!JSON.stringify(configured).includes('test-secret'));
});
Deno.test('reject invalid input, unsupported method, cross-origin, missing configuration without sending', async () => {
  const original=globalThis.fetch;globalThis.fetch=()=>{throw new Error('Unexpected outbound request');};
  try {
    for (const [data,options,status] of [[valid,{env:{}},503],[valid,{method:'GET'},405],[valid,{origin:'https://other.example'},403],[{...valid,email:'invalid'},{},400],[{...valid,website:'spam'},{},400],[{...valid,message:'x'.repeat(5001)},{},400],[{...valid,kind:'messaging'},{},400],[{...valid,token:''},{},400],[{...valid,token:'x'.repeat(2049)},{},400],[null,{},400]]) {
      const response=await run(data,options);assert(response.status===status,`Expected ${status}, got ${response.status}`);assert(!(await response.json()).accepted);
    }
  } finally { globalThis.fetch=original; }
});
Deno.test('captcha rejection prevents email; provider errors never become success',async()=>{
  const original=globalThis.fetch;
  try {
    for (const captcha of [{success:false},{success:false,'error-codes':['timeout-or-duplicate']},{success:true,action:'other',hostname:'agouraaccounting.com'},{success:true,action:'contact',hostname:'attacker.example'}]) {
      let calls=0;globalThis.fetch=async()=>{calls++;return Response.json(captcha);};
      const response=await run();assert(response.status===403);assert(calls===1);
    }
    for (const outcome of ['reject','missing-id','malformed','throw','accept']) {
      let calls=0;
      globalThis.fetch=async(url,init)=>{
        calls++;
        if (url.includes('siteverify')) { assert(url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify'); assert(init.body.get('secret') === env.TURNSTILE_SECRET_KEY); return Response.json({success:true,action:'contact',hostname:'agouraaccounting.com'}); }
        const email=JSON.parse(init.body);assert(email.to[0]===env.CONTACT_TO);assert(email.reply_to===valid.email);assert(email.text.includes(valid.message));
        if(outcome==='throw') throw new Error('Network failure');
        if(outcome==='reject') return Response.json({error:'rejected'},{status:401});
        if(outcome==='missing-id') return Response.json({});
        if(outcome==='malformed') return new Response('not json');
        return Response.json({id:'accepted-email-id'});
      };
      const response=await run();assert(calls===2);const result=await response.json();assert(result.accepted===(outcome==='accept'));assert(response.status===(outcome==='accept'?200:502));
    }
  } finally {globalThis.fetch=original;}
});
Deno.test('Turnstile transport failures fail closed; messaging uses its own action', async () => {
  const original = globalThis.fetch;
  try {
    for (const outcome of ['http', 'malformed', 'network', 'missing-action', 'missing-hostname', 'nonboolean']) {
      let calls = 0;
      globalThis.fetch = async () => {
        calls++;
        if (outcome === 'network') throw new Error('Timeout');
        if (outcome === 'http') return new Response('', {status:503});
        if (outcome === 'malformed') return new Response('invalid');
        return Response.json({success:outcome === 'nonboolean' ? 'true' : true,
          ...(outcome === 'missing-action' ? {} : {action:'contact'}),
          ...(outcome === 'missing-hostname' ? {} : {hostname:'agouraaccounting.com'})});
      };
      const response = await run();
      assert(response.status === (['http','malformed','network'].includes(outcome) ? 502 : 403));
      assert(calls === 1, 'Email must not be sent');
    }
    let calls = 0;
    globalThis.fetch = async url => {
      calls++;
      return Response.json(url.includes('siteverify') ? {success:true,action:'messaging',hostname:'agouraaccounting.com'} : {id:'accepted'});
    };
    assert((await run({...valid,kind:'messaging',phone:'555-0100'})).status === 200);
    assert(calls === 2);
  } finally {globalThis.fetch = original;}
});
