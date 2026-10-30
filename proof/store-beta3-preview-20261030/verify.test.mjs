// Offline consistency checks ONLY. Not replayed host/browser/release tests.
import test from'node:test';import assert from'node:assert/strict';
import{readFileSync,readdirSync}from'node:fs';import{createHash}from'node:crypto';
const root=new URL('./',import.meta.url),read=n=>JSON.parse(readFileSync(new URL(n,root)));
const install=read('installation.json'),selection=read('selection.json'),checks=read('checks.json'),manifest=read('manifest.json');
const cid='bafyreiheg7fka3jeiqhq4stkqk53drywwnqajzikdm6t2gjznzkcafpvae';
test('actual update summary binds exact released artifact and SDK policy',()=>{
 assert.equal(install.status,200);assert.equal(install.oldVersion,'0.7.0-beta.2');assert.equal(install.newVersion,'0.7.0-beta.3');
 assert.equal(install.verification.releaseCid,cid);assert.equal(install.verification.provenance,'verified');assert.equal(install.verification.requireProvenance,true);assert.equal(install.capabilityChanges.added,0);
 assert.deepEqual(install.backend,{bytes:130676,sha256:'a630ca239b3573cd5943cb430fb8e26702c946ba6d7c38438fcc86ac01c98f92',limit:131072});assert.equal(131072-install.backend.bytes,396);assert.equal(install.sourceReference.commit,'7740b4c14e614740c454ed67aeb6e8eaac49db6d');
});
test('postchecks selection scans beta channel through terminal page and agrees exact CID',()=>{
 assert.equal(selection.terminal,true);assert.ok(selection.pages>=1);assert.equal(selection.selected.package,'dinkus-commerce-beta');assert.equal(selection.selected.version,install.newVersion);assert.equal(selection.selected.cid,cid);assert.equal(selection.selected.uri,install.releaseUri);assert.ok(selection.checkedAt>checks.host.checkedAt);assert.ok(selection.versions.some(v=>v.package==='dinkus-commerce'));
});
test('host summary preserves seven real transition assertions and matching host protocol',()=>{
 assert.equal(checks.host.passed,7);assert.equal(checks.host.checks.length,7);assert.equal(new Set(checks.host.checks).size,7);assert.equal(checks.host.installedVersion,install.newVersion);assert.equal(checks.host.templateCommit,manifest.templateCommit);assert.equal(manifest.templateCommit,'314dad31ea0654d992991a428b555a51e2bf8522');assert.ok(checks.host.checks.some(s=>s.includes('refused422')));assert.ok(checks.host.checks.some(s=>s.includes('restore remains off sale')));
});
test('targeted public boundary summary has18 assertions, direct runtime auth is separate',()=>{
 assert.equal(checks.boundary.passed,18);assert.equal(checks.boundary.results.length,18);assert.equal(checks.boundary.results.filter(r=>r.status===200).length,3);assert.ok(checks.boundary.results.filter(r=>r.method==='POST').every(r=>r.status===404));assert.deepEqual(checks.security.statuses,[403,403,401]);assert.equal(checks.lifecycle.naturalStopResult,'success');assert.equal(checks.lifecycle.exitStatus,0);
});
test('browser summary is two viewport cases, not a purchase',()=>{
 assert.equal(checks.browser.passed,2);assert.deepEqual(checks.browser.viewports.map(v=>[v.width,v.height]),[[1440,1100],[390,844]]);assert.equal(checks.browser.checks.length,5);assert.ok(checks.unproved.includes('actual purchase/payment/order/shipment'));assert.ok(checks.unproved.includes('independent security/provenance certification'));
});
test('both manually reviewed PNGs match bytes, hashes and dimensions',()=>{
 assert.equal(manifest.media.length,2);for(const m of manifest.media){const b=readFileSync(new URL(m.path,root));assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.length,m.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),m.sha256);assert.equal(b.readUInt32BE(16),m.width);assert.equal(b.readUInt32BE(20),m.height);assert.ok(m.manuallyReviewedAt>checks.host.checkedAt);}assert.deepEqual(manifest.media.map(m=>m.width),[1440,390]);
});
test('source hashes are only traceability and packet has exact safe whitelist',()=>{
 assert.match(manifest.scope,/not source\/build attestation/);assert.equal(manifest.sources.length,7);for(const s of manifest.sources)assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.deepEqual(readdirSync(root).sort(),['PROOF.md','checks.json','desktop.png','installation.json','manifest.json','phone.png','selection.json','verify.test.mjs'].sort());
});
test('public report discloses negative attempts and no certification',()=>{
 const p=readFileSync(new URL('PROOF.md',root),'utf8');for(const word of['checkout is','unavailable','FAILED','90s','not a stable public shutdown API','independent','beta.2 controls'])assert.ok(p.includes(word),word);for(const n of['installation.json','checks.json','manifest.json','selection.json'])assert.doesNotMatch(readFileSync(new URL(n,root),'utf8'),/(?:github_pat_|ghp_|dk_store_)[A-Za-z0-9_-]{20,}/);
});
