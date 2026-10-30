// OFFLINE only: actual Commerce guest route handlers/storage + SYNTHETIC payment port.
// No installed-plugin readiness override, provider connection, network, charge or release gate.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {initializeGuestCheckoutDatabase,openGuestCollections,seedGuestCatalog,syntheticCheckoutHost,injectedPluginRoutes,invokeGuest} from '../../tests/features/checkout/guest-dispatch.mjs';
const {createGuestCheckout,READINESS_SCHEMA}=await import(new URL(process.env.CONSUMER_SOURCE??'./consumer/src/lib/guest-checkout.mjs',import.meta.url));
const pluginId='r_fixture';
const lines=[{catalogItemId:'hat',quantity:1}];
const contact={email:'recovery-fixture@example.test',billing:{name:'Synthetic Fixture',line1:'1 Example Road',city:'Testville',region:'CA',postalCode:'00000',country:'US'}};
function tab(entries=new Map()) {return {entries,getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};}
async function scenario(t){
 const dir=mkdtempSync(join(tmpdir(),'own-consumer-recovery-')),path=join(dir,'offline.sqlite');
 initializeGuestCheckoutDatabase(path);const opened=openGuestCollections(path);
 t.after(async()=>{await opened.db.destroy();rmSync(dir,{recursive:true,force:true});});
 await seedGuestCatalog(opened.storage);const synth=syntheticCheckoutHost({managed:false}),plugin=injectedPluginRoutes(synth.host),calls=[];
 let token;
 function client(saved=tab()){
  return {saved,client:createGuestCheckout({pluginId,storage:saved,fetch:async(url,options)=>{
   const name=url.split('/').at(-1);calls.push(name);
   // Explicit fixture, NOT an installed readiness claim.
   const result=name==='readiness'?{schema:READINESS_SCHEMA,status:'supported',mode:'test'}:await invokeGuest(plugin.routes['checkout/guest/'+name],opened.storage,JSON.parse(options.body),{capability:options.headers['x-commerce-guest-capability']});
   if(name==='prepare')token=result.capability.capability;
   return new Response(JSON.stringify({success:true,data:result}),{headers:{'content-type':'application/json'}});
  }})};
 }
 async function externalStart(){return invokeGuest(plugin.routes['checkout/guest/start'],opened.storage,{lines,contact},{capability:token});}
 return {client,synth,calls,externalStart};
}
test('control: newly prepared in-memory client still starts exactly once through native handlers',async t=>{
 const f=await scenario(t),a=f.client();await a.client.prepare();assert.equal(a.client.snapshot().phase,'prepared');const p=await a.client.start(lines,contact);assert.equal(p.state,'pending');assert.ok(p.attemptId);assert.equal(f.synth.counts().paymentCreates,1);await assert.rejects(a.client.start(lines,contact));assert.equal(f.calls.filter(n=>n==='start').length,1);
});
test('retained unrequested capability is recovery-only after reload, even when native status has no attempt',async t=>{
 const f=await scenario(t),a=f.client();await a.client.prepare();const b=f.client(a.saved);const p=await b.client.check();assert.equal(p.state,'pending');assert.equal(p.attemptId,null);
 await assert.rejects(b.client.start(lines,contact),/Do not submit again/);assert.equal(f.calls.filter(n=>n==='start').length,0);assert.equal(b.client.snapshot().phase,'unknown');
});
test('copied pre-start tab cannot silently create a second native attempt after release',async t=>{
 const f=await scenario(t),a=f.client();await a.client.prepare();const copy=tab(new Map(a.saved.entries));await a.client.start(lines,contact);f.synth.setPayment('expired-unpaid');const b=f.client(copy),released=await b.client.check();assert.equal(released.state,'released-retry');assert.ok(released.attemptId);assert.equal(f.synth.counts().paymentCreates,1);f.synth.setPayment('open');
 // Capture rejection without skipping the native side-effect assertion on the old client.
 let rejected=false;try{await b.client.start(lines,contact);}catch{rejected=true;}
 assert.equal(f.synth.counts().paymentCreates,1,'No second synthetic provider session may be created');assert.equal(f.calls.filter(n=>n==='start').length,1);assert.equal(rejected,true);
});
for(const [outcome,state] of [['open','pending'],['expired-unpaid','released-retry'],['paid','paid']])test('same-page observation of native '+state+' attempt prevents any subsequent start dispatch',async t=>{
 const f=await scenario(t),a=f.client();await a.client.prepare();const native=await f.externalStart();assert.ok(native.checkout.attemptId);f.synth.setPayment(outcome);const p=await a.client.check();assert.equal(p.state,state);assert.ok(p.attemptId);f.synth.setPayment('open');
 let rejected=false;try{await a.client.start(lines,contact);}catch{rejected=true;}
 assert.equal(f.calls.filter(n=>n==='start').length,0,'Observed attempts must lock this consumer before HTTP dispatch');assert.equal(rejected,true);assert.equal(a.client.snapshot().phase,'unknown');
 const c=f.client(a.saved);assert.equal(c.client.snapshot().phase,'unknown');
});
test('failed retention while observing attempt still locks current instance and reload',async t=>{
 const f=await scenario(t),a=f.client();await a.client.prepare();await f.externalStart();a.saved.setItem=()=>{throw Error('fixture storage quota');};
 await assert.rejects(a.client.check(),/quota/);await assert.rejects(a.client.start(lines,contact));assert.equal(a.client.snapshot().phase,'unknown');assert.equal(f.calls.filter(n=>n==='start').length,0);
 const b=f.client(a.saved);assert.equal(b.client.snapshot().phase,'unknown');await assert.rejects(b.client.start(lines,contact));
});
test('control: no-attempt observation in same freshly prepared instance does not invent a dispatched start',async t=>{
 const f=await scenario(t),a=f.client();await a.client.prepare();assert.equal((await a.client.check()).attemptId,null);assert.equal(a.client.snapshot().phase,'prepared');await a.client.start(lines,contact);assert.equal(f.synth.counts().paymentCreates,1);
});
