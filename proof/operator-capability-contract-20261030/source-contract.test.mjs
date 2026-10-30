// OFFLINE source-contract check only. NOT installed readiness/provider/payment proof.
// Real Commerce mint/authorization/projection; memory storage, fixed synthetic secret,
// no provider adapter or binding. Readiness is a fixture solely to exercise the client.
import test from 'node:test';import assert from 'node:assert/strict';
const {createGuestCheckout,READINESS_SCHEMA}=await import(process.env.CONSUMER_SOURCE??'./consumer/src/lib/guest-checkout.mjs');
import {prepareGuestCheckout,startGuestCheckout,statusGuestCheckout}from'../../dist/features/checkout/guest.js';
function scenario(){
 const records=new Map(),calls=[],results=[];
 const runtime={capabilities:{async compareAndSet(id,revision,value){assert.equal(revision,null);if(records.has(id))return{applied:false};records.set(id,structuredClone(value));return{applied:true};},async get(id){return structuredClone(records.get(id)??null);}},carts:{async getVersioned(){return null;}},host:{siteUrl:'https://contract.example.test',createCapabilityId:()=> 'contract-capability',createCartId:()=> 'contract-cart',createCapabilitySecret:()=> 'contract-secret',loadCheckoutContactRequirements:async()=>({requirePhoneNumber:false,shippingCountries:['US'],revision:null})}};
 const saved=new Map();const storage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
 const client=createGuestCheckout({pluginId:'r_fixture',storage,fetch:async(url,options)=>{calls.push({url,options});const route=url.split('/').at(-1);let result;
 if(route==='readiness')result={schema:READINESS_SCHEMA,status:'supported',mode:'test'};
 else if(route==='prepare')result=await prepareGuestCheckout(runtime,JSON.parse(options.body));
 else if(route==='status')result=await statusGuestCheckout(runtime,JSON.parse(options.body),options.headers);
 else if(route==='start')result=await startGuestCheckout(runtime,JSON.parse(options.body),options.headers);
 else throw Error('Unexpected fixture route');
 results.push({route,result});return new Response(JSON.stringify({success:true,data:result}),{headers:{'content-type':'application/json'}});
 }});return{client,calls,records,results,saved};
}
test('consumer accepts real Commerce nested capability presentation without flattening it',async()=>{const f=scenario();assert.deepEqual(await f.client.prepare(),{requirePhoneNumber:false});assert.equal(f.client.snapshot().phase,'prepared');assert.equal(f.records.size,1);const result=f.results.find(x=>x.route==='prepare').result;assert.equal(result.capability.header,'x-commerce-guest-capability');assert.equal(result.capability.retention,'json-body');assert.equal(result.capability.capability,'contract-capability.contract-secret');});
test('manual status passes only the nested token; real Commerce projects absent unconfigured cart',async()=>{const f=scenario();await f.client.prepare();const p=await f.client.check();assert.equal(p.state,'recoverable-failure');assert.equal(p.unavailable.code,'CHECKOUT_NOT_FOUND');assert.equal(p.attemptId,null);const call=f.calls.at(-1);assert.equal(call.options.headers['x-commerce-guest-capability'],'contract-capability.contract-secret');assert.equal(f.results.at(-1).result.ok,true);assert.ok(f.calls.every(c=>!c.url.includes('contract-secret')));});
test('real Commerce authorizes the client token, then refuses absent Payments without a provider fallback',async()=>{const f=scenario();await f.client.prepare();await assert.rejects(f.client.start([{catalogItemId:'contract-item',quantity:1}],{}));assert.equal(f.results.at(-1).result.error.code,'PAYMENTS_UNAVAILABLE');assert.equal(f.client.snapshot().phase,'unknown');assert.ok(JSON.parse([...f.saved.values()][0]).requested);assert.equal(f.calls.filter(c=>c.url.endsWith('/start')).length,1);});
