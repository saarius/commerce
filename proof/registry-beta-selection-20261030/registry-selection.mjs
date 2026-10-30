import assert from 'node:assert/strict';
import { compareVersions } from '@emdash-cms/registry-client/env';
import { pathToFileURL } from 'node:url';

export const PUBLISHER='did:plc:ekk4pjmkh3k3ql2kfoex3qt4';
export const STABLE_PACKAGE='dinkus-commerce';
export const BETA_PACKAGE='dinkus-commerce-beta';
export function selectCommerce(records) {
  const latest=(name)=>records.filter(r=>r.value.package===name).toSorted((a,b)=>compareVersions(b.value.version,a.value.version))[0];
  const beta=latest(BETA_PACKAGE),stable=latest(STABLE_PACKAGE);
  assert.ok(beta||stable,'No official Commerce release found');
  return {selected:beta??stable,beta:beta??null,stable:stable??null};
}
export async function scanCommerce(fetcher=fetch) {
  const records=[],seen=new Set();let cursor,pages=0,scannedRecords=0;
  do {
    assert.ok(++pages<=20,'Registry scan exceeded bounded page limit');
    const url=new URL('https://rhizopogon.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords');
    url.search=new URLSearchParams({repo:PUBLISHER,collection:'com.emdashcms.experimental.package.release',limit:'100',reverse:'true',...(cursor?{cursor}:{})});
    const res=await fetcher(url,{signal:AbortSignal.timeout(20000)});assert.equal(res.status,200);
    const body=await res.json();assert.ok(Array.isArray(body.records));scannedRecords+=body.records.length;
    records.push(...body.records.filter(r=>[STABLE_PACKAGE,BETA_PACKAGE].includes(r.value.package)));
    cursor=body.cursor;if(cursor){assert.ok(!seen.has(cursor),'Repeated Registry cursor');seen.add(cursor);}
  } while(cursor);
  const picked=selectCommerce(records),r=picked.selected;
  const url=new URL('https://registry.emdashcms.com/xrpc/com.emdashcms.experimental.aggregator.getLatestRelease');
  url.search=new URLSearchParams({did:PUBLISHER,package:r.value.package});
  const res=await fetcher(url,{signal:AbortSignal.timeout(20000)});assert.equal(res.status,200);
  const advertised=await res.json();
  assert.equal(advertised.cid,r.cid);assert.equal(advertised.uri,r.uri);assert.equal(advertised.version,r.value.version);assert.equal(advertised.package,r.value.package);
  return {checkedAt:new Date().toISOString(),publisher:PUBLISHER,pages,scannedRecords,terminal:true,rule:'Latest official separate beta package when present; stable only when no beta package release exists. Discovery is not installation or moderation/provenance certification.',selected:{package:r.value.package,version:r.value.version,cid:r.cid,uri:r.uri},latestStable:picked.stable?.value.version??null,latestBeta:picked.beta?.value.version??null,versions:records.map(r=>({package:r.value.package,version:r.value.version,cid:r.cid}))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await scanCommerce(),null,2));
