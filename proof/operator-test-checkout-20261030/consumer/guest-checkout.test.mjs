// OFFLINE consumer protocol tests. Fixtures are NOT a configured provider,
// installed-plugin proof, account approval, card payment or release gate.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGuestCheckout, isTestReadiness, stripeTestRedirect, READINESS_SCHEMA } from './src/lib/guest-checkout.mjs';
const pluginId = 'r_fjzjvld3ssb4j63o';
const ready = { schema: READINESS_SCHEMA, status: 'supported', mode: 'test' };
const prepared = { ok:true, capability:'fixture.secret', contactRequirements:{requirePhoneNumber:false} };
const projection = { ok:true, checkout:{schema:'dinkuskit.commerce.guest-checkout-projection/v1',state:'pending',attemptId:null,lines:[],total:null,redirectUrl:null,order:null,retryAfter:null,unavailable:null} };
const storage = () => { const entries = new Map(); return { getItem:key=>entries.get(key)??null, setItem:(key,value)=>entries.set(key,value), entries }; };
function fixture(values, saved=storage()) {
  const calls=[];
  const client=createGuestCheckout({ pluginId,storage:saved,fetch:async(url,options)=>{ calls.push({url,options});const next=values.shift();if(next instanceof Error)throw next;return {ok:true,json:async()=>({success:true,data:next})}; } });
  return {client,calls,saved};
}
const lines=[{catalogItemId:'fixture-notebook',quantity:1,price:'0',paid:true}],contact={email:'guest@example.test'};
for(const value of [null,{}, {status:'supported',mode:'test'}, {...ready,mode:'live'}, {...ready,mode:undefined}, {...ready,status:'unavailable'}, {...ready,schema:'future/v2'}])test('refuse non-explicit TEST readiness '+JSON.stringify(value),()=>assert.equal(isTestReadiness(value),false));
test('accept exact TEST readiness',()=>assert.equal(isTestReadiness(ready),true));
test('only allow HTTPS Stripe TEST checkout session URLs',()=>{
 assert.equal(stripeTestRedirect('https://checkout.stripe.com/c/pay/cs_test_fixture'), 'https://checkout.stripe.com/c/pay/cs_test_fixture');
 for(const url of ['https://checkout.stripe.com/c/pay/cs_live_fixture','http://checkout.stripe.com/c/pay/cs_test_fixture','https://checkout.stripe.com.evil.test/c/pay/cs_test_fixture','https://user:secret@checkout.stripe.com/c/pay/cs_test_fixture','https://checkout.stripe.com:8443/c/pay/cs_test_fixture','javascript:alert(1)',null])assert.equal(stripeTestRedirect(url),null);
});
test('require recovery storage before any request',()=>assert.throws(()=>createGuestCheckout({pluginId}),/storage/));
test('unavailable prepare makes ONE GET and no mutation',async()=>{const f=fixture([{...ready,status:'unavailable'}]);assert.equal(await f.client.prepare(),false);assert.equal(f.calls.length,1);assert.equal(f.calls[0].options.method,'GET');assert.equal(f.client.snapshot().phase,'empty');});
test('live prepare never mints a capability',async()=>{const f=fixture([{...ready,mode:'live'}]);assert.equal(await f.client.prepare(),false);assert.equal(f.calls.length,1);assert.equal(f.saved.entries.size,0);});
test('start is unavailable before capability preparation',async()=>{const f=fixture([]);await assert.rejects(f.client.start(lines,contact),/Do not submit again/);assert.equal(f.calls.length,0);});
test('canonical request contains item IDs/quantities, not client amounts; no credentials/capability in URLs',async()=>{
 const f=fixture([ready,prepared,ready,projection]);await f.client.prepare();await f.client.start(lines,contact);
 const sent=f.calls.at(-1);assert.deepEqual(JSON.parse(sent.options.body),{lines:[{catalogItemId:'fixture-notebook',quantity:1}],contact});assert.equal(sent.options.headers['x-commerce-guest-capability'],'fixture.secret');
 assert.ok(f.calls.every(c=>!c.url.includes('fixture.secret')&&!c.options.headers.Authorization));assert.ok(f.calls.filter(c=>c.options.method==='GET').every(c=>!c.options.headers['x-commerce-guest-capability']));
 assert.ok([...f.saved.entries.values()].every(x=>!x.includes(contact.email)));assert.equal(f.client.snapshot().phase,'unknown');
});
test('fresh live readiness blocks start despite prior TEST preparation',async()=>{const f=fixture([ready,prepared,{...ready,mode:'live'}]);await f.client.prepare();assert.equal(await f.client.start(lines,contact),false);assert.equal(f.calls.length,3);assert.equal(f.client.snapshot().phase,'prepared');});
test('lost start result persists uncertain outcome before dispatch; never resend',async()=>{const f=fixture([ready,prepared,ready,new Error('lost response')]);await f.client.prepare();await assert.rejects(f.client.start(lines,contact));assert.ok(JSON.parse([...f.saved.entries.values()][0]).requested);await assert.rejects(f.client.start(lines,contact));assert.equal(f.calls.length,4);});
test('reload retains uncertain capability and permits status, NOT another start',async()=>{const first=fixture([ready,prepared,ready,new Error('lost')]);await first.client.prepare();await assert.rejects(first.client.start(lines,contact));const second=fixture([projection],first.saved);assert.equal(second.client.snapshot().phase,'unknown');await assert.rejects(second.client.start(lines,contact));await second.client.check();assert.equal(second.calls.length,1);assert.ok(second.calls[0].url.endsWith('/status'));assert.deepEqual(JSON.parse(second.calls[0].options.body),{});});
test('storage error prevents start fetch, not a reason to silently lose recovery',async()=>{const f=fixture([ready,prepared,ready]);await f.client.prepare();f.saved.setItem=()=>{throw new Error('quota');};await assert.rejects(f.client.start(lines,contact),/quota/);assert.equal(f.calls.length,3);});
test('malformed preparation blocks repeated mutation',async()=>{const f=fixture([ready,{...prepared,capability:null}]);await assert.rejects(f.client.prepare());await assert.rejects(f.client.prepare());assert.equal(f.calls.length,2);assert.equal(f.client.snapshot().phase,'blocked');});
test('unknown projection remains uncertain rather than inventing paid/order state',async()=>{const f=fixture([ready,prepared,ready,{ok:true,checkout:{schema:'unknown',state:'paid'}}]);await f.client.prepare();await assert.rejects(f.client.start(lines,contact));assert.equal(f.client.snapshot().phase,'unknown');assert.equal(f.client.snapshot().checkout,null);});
test('status transport failure keeps capability and cannot start a new payment',async()=>{const f=fixture([ready,prepared,ready,projection,new Error('offline')]);await f.client.prepare();await f.client.start(lines,contact);await assert.rejects(f.client.check());assert.equal(f.saved.entries.size,1);await assert.rejects(f.client.start(lines,contact));});
test('corrupt tab recovery blocks preparation instead of discarding uncertain state',async()=>{const saved=storage();saved.setItem('saarius.guest-checkout.v1.'+pluginId,'not JSON');const f=fixture([],saved);await assert.rejects(f.client.prepare());assert.equal(f.calls.length,0);assert.equal(f.client.snapshot().phase,'blocked');});
test('concurrent start is rejected while one readiness request is in flight',async()=>{
 let release;const wait=new Promise(r=>release=r);const f=fixture([ready,prepared]);await f.client.prepare();let calls=0;const saved=f.saved;const c=createGuestCheckout({pluginId,storage:saved,fetch:async()=>{calls++;await wait;return{ok:true,json:async()=>({success:true,data:ready})};}});const first=c.start(lines,contact);await assert.rejects(c.start(lines,contact),/in progress/);release();await assert.rejects(first);assert.equal(calls,2); // one GET and one attempted start; no competing dispatch
});
