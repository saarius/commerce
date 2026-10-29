// Diagnostic only: actual public route output, NOT a low-stock success or full CMS installation.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {build} from 'esbuild';
import {runtimeFixture,SITE} from '../../tests/features/checkout/registry-runtime.mjs';
assert.equal(process.version,'v24.22.0');
assert.equal(process.argv.length,4,'usage: node probe.mjs <extracted-official-0.6.0-directory> <fresh-output-directory>');
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const source='19b25b2878803f85db94c6c4853df1d7d1e4f448';
const released='7b9923d8dfd3bc83513efe5ac80cff0bd6656e12';
const proposed='efec42c4e2a73b29d5d434529c575c1efed2ff35';
const official=resolve(process.argv[2]);
const output=resolve(process.argv[3]);
// A proof-only child is allowed; changed application/fixture/dependency code is not.
execFileSync('git',['-C',root,'diff','--exit-code',source,'--','src','scripts','tests','package.json','package-lock.json','emdash-plugin.jsonc']);
// Released/main mapper and its direct formatter are byte-identical. This is not
// whole-library identity: an unrelated empty JSON-LD validation block was removed.
execFileSync('git',['-C',root,'diff','--exit-code',released,source,'--','src/features/feeds/builder.ts','src/features/structured-data/index.ts','src/features/structured-data/price.ts']);
execFileSync('git',['-C',root,'diff','--exit-code',source,proposed,'--','src/features/structured-data','src/features/feeds/types.ts']);
await mkdir(output,{recursive:false});
const mappers={};const identities={};
for(const [name,commit] of [['main',source],['proposed',proposed]]) {
 const code=execFileSync('git',['-C',root,'show',commit+':src/features/feeds/builder.ts'],{encoding:'utf8'});
 const outfile=output+'/'+name+'-mapper.mjs';
 await build({stdin:{contents:code,loader:'ts',resolveDir:root+'/src/features/feeds',sourcefile:'builder.ts'},bundle:true,platform:'node',format:'esm',outfile});
 mappers[name]=await import(pathToFileURL(outfile));
 identities[name]={commit,sourceSha256:createHash('sha256').update(code).digest('hex')};
}
const cases=[];
for(const [label,directory,expectedBytes,expectedHash] of [
 ['official-registry-0.6.0',official,131050,'f292f09c1c360f828a0c96614fd69342327b23374150088c6c151ff1b61ed471'],
 ['source-main-19b25b2',root+'/.tmp/registry-bundle/extracted',131044,'dd8e6018be154d4f65002d46340dee47fe521f85f029cee2f1571deaf46c38f9']]) {
 const manifestBytes=await readFile(directory+'/manifest.json');
 const manifest=JSON.parse(manifestBytes);
 if(label==='official-registry-0.6.0') assert.equal(createHash('sha256').update(manifestBytes).digest('hex'),'59a56e2b73af91f3521250a0a22767fa879d51ef2a9dc88cc00eea8666a2c228');
 const backend=await readFile(directory+'/backend.js','utf8');
 const identity={label,version:manifest.version,bytes:Buffer.byteLength(backend),sha256:createHash('sha256').update(backend).digest('hex')};
 assert.equal(identity.version,'0.6.0');assert.equal(identity.bytes,expectedBytes);assert.equal(identity.sha256,expectedHash);
 const state=await runtimeFixture({artifactManifest:manifest,backendSource:backend,owner:manifest.id,grants:false,seed:false,config:null,storeKey:null,databasePath:output+'/'+label+'.sqlite',transportFetch:()=>{throw Error('unexpected outbound request');}});
 let server;
 try {
  assert.deepEqual(state.manifest,manifest,'published capabilities/hosts/identity must not be rewritten');
  let base;
  const ui={surface:'content-editor-panel',locale:'en',direction:'ltr',extensionId:'product',entry:{collection:'products',id:'page-feed-proof',locale:null,version:1}};
  const call=(route,input,method='POST',query='')=>state.plugin.invokeRoute(route,input,{url:SITE+'/_emdash/api/plugins/'+manifest.id+'/'+route+query,method,user:{id:'synthetic-owner',role:50},...(route==='product-panel'?{ui}:{} )});
  server=createServer(async(req,res)=>{
   try {
    const url=new URL(req.url,base);let value;
    const chunks=[];for await(const part of req)chunks.push(part);
    const input=chunks.length?JSON.parse(Buffer.concat(chunks).toString()):{};
    if(url.pathname==='/panel') value=await call('product-panel',input);
    else if(url.pathname==='/sale') value=await call('catalog-items/set-on-sale',input);
    else if(url.pathname==='/catalog') value=await call('catalog/public',{},'GET');
    else if(url.pathname==='/item') value=await call('catalog/public/item',{},'GET','?itemId='+encodeURIComponent(url.searchParams.get('id')));
    else if(url.pathname==='/google.xml'||url.pathname==='/meta.csv') {
     const r=await fetch(base+'/item?id='+encodeURIComponent(url.searchParams.get('id')),{signal:AbortSignal.timeout(15000)});assert.equal(r.status,200);const product=await r.json();
     const facts=product?[{product,eligibility:product.feedChannels??[],content:{title:product.name,canonicalUrl:base+'/products/'+encodeURIComponent(product.id)}}]:[];
     const mapper=mappers[url.searchParams.get('mapper')];assert.ok(mapper);
     const google=url.pathname==='/google.xml';
     const text=google?mapper.buildGoogleMerchantFeed(facts):mapper.buildMetaCatalogFeed(facts);
     res.writeHead(200,{'content-type':google?'application/xml':'text/csv'});res.end(text);return;
    } else {res.writeHead(404);res.end();return;}
    res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(value));
   } catch(error) {res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:error.code??'ERROR',message:error.message}));}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
  const post=async(path,input)=>{const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(15000)});assert.equal(r.status,200,await r.clone().text());return r.json();};
  const created=await post('/panel',{type:'form_submit',action_id:'sell',values:{sku:'FEED-PROOF'},draft:{fields:{title:'Synthetic Feed Proof Mug'}}});
  assert.equal(created.toast.type,'success');
  const rows=(await state.collections.catalog_items.query()).items.filter(x=>x.data.recordKind==='catalog-item');assert.equal(rows.length,1);const id=rows[0].id;
  await post('/sale',{catalogItemId:id,entryId:'page-feed-proof',onSale:true});
  const save=(extra={})=>post('/panel',{type:'form_submit',action_id:'save:'+id,values:{regular:'7.50',sale:'',stockStatus:'in-stock','feed:google-merchant':true,'feed:meta-catalog':true,...extra}});
  async function inspect(scenario,itemId,expectedStatus,expectedFeed,refusal) {
   const response=await fetch(base+'/item?id='+encodeURIComponent(itemId),{signal:AbortSignal.timeout(15000)});assert.equal(response.status,200);const product=await response.json();
   assert.ok(product);assert.equal(product.availability.status,expectedStatus);
   const list=await(await fetch(base+'/catalog',{signal:AbortSignal.timeout(15000)})).json();assert.ok(list.products.some(p=>p.id===itemId&&p.availability.status===expectedStatus));
   const feeds={};
   for(const mapper of ['main','proposed']) {
    const google=await(await fetch(base+'/google.xml?id='+encodeURIComponent(itemId)+'&mapper='+mapper,{signal:AbortSignal.timeout(15000)})).text();
    const meta=await(await fetch(base+'/meta.csv?id='+encodeURIComponent(itemId)+'&mapper='+mapper,{signal:AbortSignal.timeout(15000)})).text();
    const g=google.match(/<g:availability>([^<]+)<\/g:availability>/)?.[1];
    const m=meta.split('\n')[1]?.split(',')[4]?.replaceAll('"','');
    assert.equal(g,expectedFeed[0]);assert.equal(m,expectedFeed[1]);
    feeds[mapper]={google:g,meta:m};
   }
   const row={artifact:label,scenario,publicStatus:product.availability.status,sellable:product.availability.sellable,listable:product.availability.listable,feeds,...(refusal?{refusal}:{})};cases.push(row);console.log(JSON.stringify(row));
  }
  for(const [inputStatus,status,feed] of [['in-stock','in-stock',['in stock','in stock']],['out-of-stock','out-of-stock',['out of stock','out of stock']],['on-backorder','available-on-backorder',['backorder','available for order']]]) {
   assert.equal((await save({stockStatus:inputStatus})).toast.type,'success');await inspect('manual-'+status,id,status,feed);
  }
  assert.equal((await save()).toast.type,'success');
  const low=await save({stockStatus:'low-stock'});assert.equal(low.toast.type,'error');
  await inspect('manual-low-stock-refused',id,'in-stock',['in stock','in stock'],low.toast.message??low.toast.text??'error');
  const tracked=await save({manageStock:true});assert.equal(tracked.toast.type,'error');
  await inspect('manage-stock-refused',id,'in-stock',['in stock','in stock'],tracked.toast.message??tracked.toast.text??'error');
  // Explicit legacy-row diagnostic ONLY, not an Inventory binding or supported creation path.
  // Never inject a public low-stock value or stock quantity. The shipped backend computes its answer.
  const legacy='legacy-managed-probe';
  await state.collections.catalog_items.put(legacy,{recordKind:'catalog-item',itemId:legacy,commandId:'legacy-probe',sku:'LEGACY-PROBE',skuKey:'LEGACY-PROBE',fulfillment:'physical',creationIntent:{manageStock:true},kind:'simple-product',name:'Synthetic Legacy Managed Mug',state:'draft',stockManagement:{mode:'managed',status:'active',inventorySkuId:'synthetic-unbound-sku'},createdAt:new Date().toISOString()});
  await state.collections.catalog_prices.put(legacy,{recordKind:'catalog-price',recordId:legacy,catalogItemId:legacy,regular:{currency:'USD',minor:'750'}});
  await state.collections.catalog_manual_availability.put(legacy,{recordKind:'catalog-manual-availability',recordId:legacy,catalogItemId:legacy,status:'in-stock'});
  await state.collections.product_feed_eligibility.put(legacy,{recordKind:'product-feed-eligibility',recordId:legacy,catalogItemId:legacy,channels:['google-merchant','meta-catalog']});
  await inspect('legacy-managed-diagnostic-not-active-inventory',legacy,'availability-unavailable',['out of stock','out of stock']);
  assert.equal(state.counts.transport,0);console.log(JSON.stringify({identity,outbound:state.counts.transport}));
  identities[label]=identity;
 } finally {if(server?.listening)await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await state.close();}
}
assert.equal(cases.length,12);assert.ok(cases.every(c=>c.publicStatus!=='low-stock'));
await writeFile(output+'/summary.json',JSON.stringify({checkedAt:new Date().toISOString(),source,probeSha256:createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'),identities,cases,scope:'Real TCP gateway -> pinned SDK WorkerdSandboxRunner/SQLite -> actual public handlers -> HTTP feed response. Synthetic host identity/content and data; not a complete CMS Registry installation. No legitimate public low-stock state reached; this does NOT satisfy the requested positive proof.'},null,2)+'\n');
console.log('diagnostic_checks_exit=0 cases=12 legitimate_public_low_stock=0 positive_proof_gate=NOT_SATISFIED');
