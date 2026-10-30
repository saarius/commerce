// OFFLINE own-client recovery parsing only. Real Commerce mint/status, memory CAS,
// no installed readiness override/provider/binding/network/order/payment. The
// supported TEST readiness fixture exists solely to reach prepare if permitted.
import test from'node:test';import assert from'node:assert/strict';
import{prepareGuestCheckout,statusGuestCheckout}from'../../dist/features/checkout/guest.js';
const{createGuestCheckout,READINESS_SCHEMA}=await import(new URL(process.env.CONSUMER_SOURCE??'./consumer/src/lib/guest-checkout.mjs',import.meta.url));
const pluginId='r_fixture',key='saarius.guest-checkout.v1.'+pluginId;
async function scenario(stored){
 const records=new Map(),calls=[];let sequence=0;
 const runtime={capabilities:{async compareAndSet(id,revision,value){assert.equal(revision,null);if(records.has(id))return{applied:false};records.set(id,structuredClone(value));return{applied:true};},async get(id){return structuredClone(records.get(id)??null);}},carts:{async getVersioned(){return null;}},host:{siteUrl:'https://storage.example.test',createCapabilityId:()=> 'storage-cap-'+(++sequence),createCartId:()=> 'storage-cart-'+sequence,createCapabilitySecret:()=> 'synthetic-secret',loadCheckoutContactRequirements:async()=>({requirePhoneNumber:false,shippingCountries:['US'],revision:null})}};
 const initial=await prepareGuestCheckout(runtime,{});assert.equal(initial.ok,true);
 const token=initial.capability.capability,value=stored(token),saved=new Map(value===null?[]:[[key,value]]);
 const storage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
 const client=createGuestCheckout({pluginId,storage,fetch:async(url,options)=>{const route=url.split('/').at(-1);calls.push({route});let result;
 if(route==='readiness')result={schema:READINESS_SCHEMA,status:'supported',mode:'test'};
 else if(route==='prepare')result=await prepareGuestCheckout(runtime,JSON.parse(options.body));
 else if(route==='status')result=await statusGuestCheckout(runtime,JSON.parse(options.body),new Headers(options.headers)); // actual browser HeaderInit string conversion, NOT an invented flattened token
 else throw Error('Unexpected fixture route; starts are forbidden');
 calls.at(-1).ok=result.ok;return Response.json({success:true,data:result});
 }});return{client,calls,records,saved,value};
}
for(const requested of[false,true])test('control: valid retained string remains status-only '+requested,async()=>{const f=await scenario(token=>JSON.stringify({capability:token,requested}));assert.equal(f.client.snapshot().phase,'unknown');await assert.rejects(f.client.prepare());const p=await f.client.check();assert.equal(p.state,'recoverable-failure');assert.equal(p.unavailable.code,'CHECKOUT_NOT_FOUND');assert.deepEqual(f.calls,[{route:'status',ok:true}]);assert.equal(f.records.size,1);});
test('control: genuinely absent storage permits one fresh native capability',async()=>{const f=await scenario(()=>null);assert.equal(f.client.snapshot().phase,'empty');await f.client.prepare();assert.equal(f.client.snapshot().phase,'prepared');assert.deepEqual(f.calls.map(c=>c.route),['readiness','prepare']);assert.equal(f.records.size,2);});
const malformed=[['empty existing entry',()=> ''],['array token unrequested',token=>JSON.stringify({capability:[token],requested:false})],['array token requested',token=>JSON.stringify({capability:[token],requested:true})],['nested array token',token=>JSON.stringify({capability:[[token]],requested:false})],['numeric token unrequested',()=>JSON.stringify({capability:123.456,requested:false})],['numeric token requested',()=>JSON.stringify({capability:123.456,requested:true})]];
for(const[name,stored]of malformed)test('malformed recovery must stay blocked without any native request: '+name,async()=>{const f=await scenario(stored);await f.client.prepare().catch(()=>{});await f.client.check().catch(()=>{});assert.equal(f.calls.length,0,JSON.stringify({calls:f.calls,nativeCapabilities:f.records.size}));assert.equal(f.client.snapshot().phase,'blocked');assert.equal(f.records.size,1,'no replacement capability minted');assert.equal(f.saved.get(key),f.value,'do not silently discard/rewrite uncertain recovery data');});
