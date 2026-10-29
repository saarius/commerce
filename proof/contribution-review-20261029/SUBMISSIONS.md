# Upstream submissions and disposition

## Review snapshot: 2026-10-29, maintainer edits and d61 refresh

Upstream `main` remained `04dcf5e1ef296cc9ca8d719a11fec731d6961660` at both
CLI submissions. Current source/open PRs were checked again, including pending
page-link PR [#208](https://github.com/dinkuskit/commerce/pull/208): it changes
catalog/page ownership and CLI spec/help, not the kernel's profile selection
or response-body error boundary. Neither CLI repair duplicates that work.

Main is now `75a79e7237b854096bca18919e8d0e491b01371b`: the maintainer
merged209 at19:50:01UTC (d61), then docs-only212 (a085), then211 at20:29:32UTC.
207 was already merged. This coordination branch merged that accepted latest
main while retaining its earlier commit. The validated210/211 source heads below
contain d61, not the later main wrappers. Open210 permits maintainer edits for
any further required refresh.
The earlier413e883/36561cb/56c snapshots and all original contribution refs
remain unchanged. **Allow edits by maintainers is enabled and GET-verified on
both then-open PRs (210/211), and will be ensured when opening future PRs.
211's closed-PR edit flag is not an open-PR requirement.**

**210 remains open;207/209/211 are maintainer-merged;205/206 deferred.**
Maintainer accepted205's public-route constraint report and closed it at19:18UTC.
Revisit when supported Inventory/public low-stock returns, not through a bypass.
[Disposition](https://github.com/dinkuskit/commerce/pull/205#issuecomment-6506135430)
was acknowledged once; original efec and new a769 evidence remain preserved.
This is a status snapshot, not approval, merge authority or a combined release.
Live PR links remain authoritative as discussion and checks advance.
The [frozen ten-entry index](https://github.com/saarius/commerce/blob/f12ec8b8a747c00e0926251d39d246e2f217e9e2/proof/contribution-review-20261029/README.md)
and [first submission snapshot](https://github.com/saarius/commerce/blob/52b378bf453b7d8e96df04b8a6d8d761cee69526/proof/contribution-review-20261029/README.md)
are retained unchanged. Original branches/proofs, browser contributions,
frozen upstream base and fork main have not moved.

## Maintainer feedback accepted: #206

The maintainer closed [#206](https://github.com/dinkuskit/commerce/pull/206#issuecomment-6502938391)
unmerged at16:52:40UTC. The fix is correct and tested, but nothing currently
calls `pageProductFeedRows`; template feeds do not use it and NaN cannot arrive
as a JSON number. A helper-specific developer section is also not appropriate
for the shop-owner reference.

**Deferred, not silently reopened or resubmitted.** Preserve the branch and
red/green evidence. Reconsider only when an actual caller makes the behavior
relevant, and keep developer-only helper detail out of the shop-owner article.
The previous snapshot's open status was accurate then, not current disposition.

## Original ten contributions

Original identities, proof digests and stack relationships are unchanged in
[manifest.json](manifest.json) and the [original-results table](README.md).
Pending work is not newly certified, rejected or assumed fixed upstream.

| # | Contribution | Disposition / PR | Dependencies and limits |
| --- | --- | --- | --- |
| 1 | CLI response-body transport | [Open PR #210](https://github.com/dinkuskit/commerce/pull/210) | Alias `saarius/pr-cli-response-body-errors`, merge-head `41eedb5130c95a170c7aec480c34b13519c62018`, now includes main d61 per maintainer request. Both CLI article paragraphs retained after the expected conflict. Prior b78 docs-only child and original084 preserved. CLI transport implementation/tests unchanged; no global SIGINT repair. Shared-kernel synchronization remains maintainer work. |
| 2 | CLI SIGINT outcome | [Fresh preparation88289bd](https://github.com/saarius/commerce/blob/88289bd6d0076cd13dd929fec3bd2e0f88384684/proof/cli-sigint-current-20261029/PROOF.md); not submitted upstream | Original316 preserved. Source702 on transport41 reproduced3pass/11fail before repair;825/110 repaired plus14/14 focused/stability. Dependency210 must be accepted/current main handled before focused submission. No dispatch/durable-commit equivalence or automatic retry. |
| 3 | Catalog preview race finding | Audit retained; not submitted | Evidence/docs correction, **not runtime repair**. Rerun intentionally failing counterexamples separately against current source before submission. Stronger atomicity needs owner evaluation; #204 was already in the original baseline, not a new fix. |
| 4 | Payment binding readiness | [Maintainer-merged #207](https://github.com/dinkuskit/commerce/pull/207),17:49:29UTC | Maintainer supplied real-TCP evidence and obtained fresh review. Included in main19b, not yet inferred published. +11 source backend bytes /28 headroom; no real charge/provider qualification. |
| 5 | Low-stock feed availability | [Closed/deferred #205](https://github.com/dinkuskit/commerce/pull/205), unmerged | Maintainer accepts constraint report: no supported public low-stock input in v1. Correct serializer guard/proof retained; revisit with supported Inventory/public projection, not fixtures or admission bypass. |
| 6 | Development DOMPurify lock hardening | Pending fresh dependency/browser evidence | Development lock only; not independently locked installed hosts or clearance of Astro findings. Historical audit counts are not current security/exploit results. |
| 7 | Settings country guidance/form readiness | [Maintainer-merged #211](https://github.com/dinkuskit/commerce/pull/211),20:29:32UTC; source `fd5107490518d8701614c4188e4ff65d9ed5a66f` | Main d61 refresh, exact801/110 plus fresh SDK/native form1/1 each. No #6/DOMPurify dependency. Original9b and its chosen stack preserved. Published-before/proposed-after mounted UI; exact759/110 gates, no policy change. |
| 8 | NaN host feed pagination | [Closed/deferred #206](https://github.com/dinkuskit/commerce/pull/206), unmerged | Correct/tested but no active caller. No automatic reopening; no HTTP DoS or opaque-cursor redesign claim. See maintainer disposition above. |
| 9 | Legacy-contact shopper-profile seed | Pending fresh base/headroom handling | Original #6→#7→#9 stack needed settings headroom; remeasure current-main budget before choosing a new base. Do not blindly cherry-pick. Existing corrupt profiles are not migrated. |
| 10 | Invalid requested CLI profiles | [Maintainer-merged #209](https://github.com/dinkuskit/commerce/pull/209),19:50UTC | Clean review at3fa27c, included in main d61. Original440 and alias3fa preserved. Prevents invalid future dispatch, not discovery/cleanup of earlier wrong-site writes or installed-release qualification. |

CLI aliases permit review commits without moving frozen original refs. #210's
CLI transport implementation/tests equal original08483da; its documentation no longer promises
that *all* whole-command SIGINT outcomes use exit3. The separate lifecycle/
dispatch defect remains outside that PR. Unknown outcome is not failed mutation.

Unsubmitted branches have not received fresh full-suite, installed-release or
security qualification in these submission cycles. When main changes, prepare
focused new submissions and revalidate applicability rather than silently
rebasing frozen snapshots or treating isolated patches as a release roll-up.

## Latest d61 refresh and maintainer-edit setting

Before211's later merge, the maintainer requested main d61 in210/211 after209 merged. Both aliases received
**two-parent merge commits, not rebases**, retaining their earlier head as first
parent. The expected210 article conflict keeps BOTH profile and timeout
paragraphs;211 merged cleanly. No other open contribution was pulled in.
Updated PR descriptions/replies distinguish old and new qualification:
[210 refresh](https://github.com/dinkuskit/commerce/pull/210#issuecomment-6507298071),
[211 refresh](https://github.com/dinkuskit/commerce/pull/211#issuecomment-6507299359).

| PR | Exact new head | Unit/workflow | Integration | Backend/headroom | Completed UTC |
|---|---|---:|---:|---:|---|
|210|`41eedb5130c95a170c7aec480c34b13519c62018`|811/811|110/110|131044/28|20:12:55|
|211|`fd5107490518d8701614c4188e4ff65d9ed5a66f`|801/801|110/110|131007/65|20:08:08|

Fresh sequential build/unit/build/integration/typecheck/repo-audit/ledger,
diff/clean/extracted-backend equality gates passed; zero failures/skips.211 also
reran real mounted source settings journeys: local SDK sandbox1/1 (64.704s),
native1/1 (58.425s), fresh run IDs/databases, zero retries. Its old committed
media remains bound to source237/a239; current rendered settings source/backend
bytes are unchanged. This is not a new official Registry installation, provider,
physical checkout or release qualification. No dependency lock changes.

**Review scope:**209's clean review was followed by its maintainer merge.
210's earlier clean review binds a9, not new41; the owner requested fresh
reviews for210/211 at20:15, then merged211 at20:29.210 is still open at this
snapshot. No clearance is inferred from dispatch/progress.
Maintainer edits were enabled with PATCH and independently GET-verified; no
broader credential/repository permission changes. Shared editable aliases may
advance through maintainer work: inspect remote history before writing and
never overwrite it. Original contribution refs remain frozen.

[Fresh SIGINT preparation](https://github.com/saarius/commerce/blob/88289bd6d0076cd13dd929fec3bd2e0f88384684/proof/cli-sigint-current-20261029/PROOF.md)
selects frozen316's client/spec/test repair onto transport41 (which contains
d61). Fresh parent41+regressions:3pass/11fail expectedexit1. Source702:825/825
unit/workflow +110/110 integration, no skips/failures, all gates and three14/14
focused repetitions passed20:22:32. Exact proof-only child882:825/110 plus gates
passed 20:29:22. Client/spec/test files are identical to original316;
shared kernel unchanged relative41, no retry or new stored-data/permission rule.
Real POSIX CLI/native HTTP establishes request receipt and false before-send
reporting, **not durable order commit or deployed store qualification**. Windows
signal cases explicitly skip there, not on this Linux run.

**Not an upstream PR yet:** transport210's body-inclusive abort classification
is a real dependency. Preserve this branch/evidence, include the accepted latest
main and revalidate applicable source before submitting; do not hide the open
transport delta inside another main-target PR. This is not another accepted main
change, installed release or combined release. No unsupported low-stock work
was reopened.

## Historical211 submission and first CLI main refresh

Maintainer requested **merge commits, not rebases**, onto main19b before
reviewing209/210 ([209 request](https://github.com/dinkuskit/commerce/pull/209#issuecomment-6506240471),
[210 request](https://github.com/dinkuskit/commerce/pull/210#issuecomment-6506241177)).
Both submission aliases now contain that parent through two-parent merges;
original frozen refs and earlier commit objects remain unchanged. No unrelated
open PR was merged. If the CLI reference-article paragraphs later conflict as
main accepts these independently, keep both; no other open patch was pulled in
merely to pre-resolve that future conflict.

| PR | Exact new head | Unit/workflow | Integration | Backend/headroom | Completed UTC |
|---|---|---:|---:|---:|---|
|211|`a239ed87bc8a85437981c54a07be13efbffd8f27`|759/759|110/110|131007/65|19:26:19|
|209|`3fa27c18a38ac2569085464d77efd67729193285`|798/798|110/110|131044/28|19:30:54|
|210|`a9afaeb41a72e90672248a60cd1f65358d734efc`|769/769|110/110|131044/28|19:35:37|

Fresh sequential build/unit/build/integration/typecheck/repo-audit/ledger,
diff/clean/artifact-equality/size/hash gates passed with no skips/failures or
forced exits. These are three separate proposed artifacts, not a release roll-up
or fresh GitHub review approval. Main19b includes the maintainer-merged207.

[211 proof/captures/reproducer](https://github.com/saarius/commerce/blob/a239ed87bc8a85437981c54a07be13efbffd8f27/proof/settings-country-guidance-current-20261029/PROOF.md):
source237 source gates759/110 plus actual mounted settings journey1/1 on each
proposed native and local SDK sandbox, no retries. A separate published0.6
baseline mount, selected after fresh official Registry/PDS queries found no
beta, passed the same journey expecting the old sentence. Descriptor directly
preserves official manifest grants/routes/backend; **not full Registry installer**.
Actual UI captures show old/new guidance and persisted synthetic lists. Source237
browser scope is separate from finala239 proof-only-child full gates. No second
browser run on that child. No policy, provider or dependency/lock change; the
historical9b's DOMPurify parent is absent from this focused variant.

The three source/backend counts above differ because only211 changes the shared
settings string; it saves37bytes against current19b. SDK cap remains131072.
No installed-beta, real-provider/physical-checkout, device or full release-journey
qualification is inferred from these form diagnostics or source suites.

## Additional test/tooling contributions

These postdate the frozen ten-entry manifest and are outside its verifier:

| Contribution | Evidence | Disposition |
| --- | --- | --- |
| Opt-in single-host diagnostics | [071eab6 proof](https://github.com/saarius/commerce/blob/071eab6690136300b2ae0efffae8c2efc9b9aa69/proof/single-host-browser-20261029/PROOF.md) | Pending duplicate check/revalidation/submission. Empty/unset preserves all three hosts; canonical aggregate wrappers refuse reduced diagnostics. |
| Variant phone-sized save/readback | [281c669 proof](https://github.com/saarius/commerce/blob/281c6692471867a71666aab8eba3416212a6715d/proof/variant-phone-browser-20261029/PROOF.md) | Pending; original stack uses071eab6. Coordinate with #208's changes to page/product setup and browser fixtures instead of restoring retired setup. Prior narrow-viewport save/readback remains source-bound, not a touch/device journey; host sheet closure remains disclosed. |

## Initial proposed-source validation (first two batches, historical)

All runs:2026-10-29, Node24.22.0/Linux x64, original locks. Build/unit,
build/integration and subsequent gates ran **sequentially**, one branch at a
time in bounded independent workloads. No local browser, installed-release,
security audit, canonical full gate, external provider or maintainer-store
journey was run in these two submission cycles.

| PR | Exact validated head | Unit/workflow | Integration | Backend / headroom | Completed UTC |
| --- | --- | ---: | ---: | ---: | --- |
| [#205](https://github.com/dinkuskit/commerce/pull/205) | `efec42c4e2a73b29d5d434529c575c1efed2ff35` |715/715|106/106|131033 /39|16:22:28|
| [#206](https://github.com/dinkuskit/commerce/pull/206), now deferred | `fce969aa1ca301e7e0bc612b4258e6513011faa0` |726/726|106/106|131033 /39|16:27:11|
| [#207](https://github.com/dinkuskit/commerce/pull/207) | `1d20f263221fff0d578d7704119921df76ae8d1d` |756/756|110/110|131044 /28|16:31:52|
| [#209](https://github.com/dinkuskit/commerce/pull/209) | `440c73f1e6023cdd6c909add231f255a13210cdf` |750/750|106/106|131033 /39|17:08:10|
| [#210](https://github.com/dinkuskit/commerce/pull/210) | `b78d134f58c9dc0af5d506505aeaddafa73e186e` |721/721|106/106|131033 /39|17:21:26|

All zero skips/failures. Each head passed typecheck, repository/feature audits,
ledger, diff/clean checks and exact extracted-backend bytes/SHA-256/equality to
`dist/sandbox/plugin.mjs`. Cap131072. All except readiness are upstream-identical
`29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`;
readiness is `dd8e6018be154d4f65002d46340dee47fe521f85f029cee2f1571deaf46c38f9`.
No forced exit/retry, concurrent builds, historical-log relabeling or combined
artifact/additive-budget promise. The earlier08483da revalidation also passed,
but #210 reran *all* gates on its later documentation child; its result is not
inferred from identical runtime. Original red/green observations remain separate.

The submitted code patches have patch changesets and relevant docs (**Docs: up to
date**). #206's original documentation is retained as historical evidence, not
endorsed for future submission: remove helper-only detail from the shop-owner
article if an actual caller later justifies reopening.

## Upstream CI versus local validation

At the17:00UTC feedback check, #205/#207 each had successful actual Repository
contract jobs: plan, checks, storefront, packaged, merchant-settings and
public-contract, plus changeset and ClawSweeper dispatch. This is more than
relay-only status, but **not review approval, installed Registry beta, real
provider, v1 or production qualification**. Consult live PRs for later results.
The maintainer requested ClawSweeper review on #205/#207 at17:01UTC; at the
17:24UTC follow-up there were no review findings yet. A review request is not
approval. No product-CI or review result for newly opened #209/#210 is inferred
from those earlier PRs or dispatch success. No automatic merge is requested.

The index checks itself separately. Its unchanged verifier covers **only the
frozen ten-entry manifest/eleven refs**, not PR state, current CI, measured
bytes, extra browser contributions or runtime test truth. Live PR identities
are checked separately. Digest/ref identity is not a signed runner attestation.

## Late review update: 17:34UTC

ClawSweeper's [completed #205 review](https://github.com/dinkuskit/commerce/pull/205#issuecomment-6503744764)
identified **no introduced correctness defect**, but blocks merge on real
behavior proof. Requested evidence: a redacted actual host run showing public
catalog low-stock data producing in-stock Google and Meta feed rows; external
channel ingestion is unnecessary. Automated synthetic catalog/provider fixtures
and green CI are not that evidence. This gate remains **open**, not adjudicated
away or claimed satisfied by existing results.

[Acknowledged](https://github.com/dinkuskit/commerce/pull/205#issuecomment-6503905964)
and prioritized follow-up on our own synthetic host. First inspect supported
runtime/provider paths and official Registry beta availability (otherwise
stable); distinguish published plugin behavior from the proposed host builder.
Do not forge public low-stock data or relabel fixture output as real setup.
If the supported release/runtime cannot legitimately produce that state,
report the limitation and clarify proof scope rather than manufacture evidence.
No maintainer store or external channel account is needed. Update the PR with
proof before asking for another review; no duplicate review request made now.

#207's review started at17:30–17:31UTC; progress receipts are not clearance.
#209/#210 still have only dispatch status in the closeout snapshot. Review
comments, not just GitHub's formal `reviews` array, must be monitored.
The earlier17:24 no-findings snapshot above is historical, not current #205
readiness. No real-host feed run or installed-release qualification is claimed
by this status update.

## Historical follow-up:205 public-route constraint and207 disposition

**Later disposition:** the maintainer accepted this report and closed205;
see the current status above. Initial scope question below is dated history.

[207](https://github.com/dinkuskit/commerce/pull/207) was merged **by the
maintainer**, not this contributor. The maintainer added
[compiled workerd/real-TCP evidence](https://github.com/dinkuskit/commerce/pull/207#issuecomment-6504047846),
obtained a revised review accepting that evidence, and merged at17:49:29UTC.
Attribute that new proof to its author; it is separate from our previous
unit/runtime suites. It still does not establish deployed Payments/real charges.

For205, [new report/probe/captures](https://github.com/saarius/commerce/blob/a7691582a88fa06584d5f9dbe77581d3df1cc3bf/proof/feed-host-constraint-20261029/README.md)
and [follow-up comment](https://github.com/dinkuskit/commerce/pull/205#issuecomment-6505169857)
document why a positive example was not manufactured:

- Official Registry approved-listing plus complete publisher scan found eight
  stable versions and no beta as of18:09:58UTC. Selected stable0.6.0; downloaded
  package size/multihash matched observed metadata.
- Actual official0.6.0 backend (131050bytes/hash`f292f09c…`) and source19b
  (131044bytes/hash`dd8e6018…`) ran separately behind a TCP route harness using
  real SDK workerd/SQLite repositories. No manifest/host/capability rewrite,
  provider service or external transport call. **Not a full CMS installation.**
- Products were made/priced/put on sale through actual handlers. Public item/list
  output supplied both HTTP feeds without replacing availability. Three valid
  manual states work; manual low-stock and enabling tracking are refused. An
  explicitly labelled legacy-row diagnostic is unavailable, not a live binding.
- Both mapper versions give identical results for these reachable inputs.
  **Twelve constraint/compatibility checks pass, zero legitimate public low-stock
  states.205's positive proof remains unmet.** Current shared public projection
  supplies no provider execution; Registry deliberately refuses managed stock.
- Asked maintainer whether to defer until a supported public path exists or
  evaluate the one-case future-contract guard explicitly. No automatic closure,
  re-review/merge-clearance request, admission bypass or new provider feature.

Exact proof-only a769158 passed fresh **756/756 unit/workflow +110/110
integration**, zero skips/failures, build/type/audit/ledger/diff/clean/backend
identity gates and a fresh12-case rerun matching the captured observations,
completed18:33:10UTC. These gates concern main19b plus proof files, **not a
combined unmerged205/207 artifact**. Proposed host mapper is compiled separately
from immutable efec42c source; backend behavior is not patched. Initial failed
preflights/input-shape attempts remain disclosed and excluded. No source code,
lock, product article, decision ledger or package changeset was changed.

This new published-artifact execution is more than the earlier source-only
runs, but not an SDK installation/provenance-signature certification, real
Inventory measurement, native-host/browser/installed journey or external channel
qualification. The old17:24/17:34 review snapshots above are dated history.

## Installed-release and maintainer workflow boundary

Original submission gates are **proposed source** results. The205 follow-up
also executes a downloaded Registry artifact under the explicitly limited
harness above. Maintainers merge reviewed changes, cut a beta, install the
official Registry beta and run designated live journeys before stable promotion. No release/tag/publication, direct
upstream push, merge, deployment or maintainer-beta-store mutation was performed.

For installed-plugin work, first query the official Registry and use its latest
available beta, otherwise stable, on our own synthetic server. Tags/npm metadata
alone do not establish Registry availability. The new Registry queries above
observed no beta; no full installed-plugin or independent provenance-signature
qualification is claimed. A local
native/workerd fixture is not that release test, nor the maintainer's release
gate. No credentials or real tenant data belong in this handoff.

**Docs: not applicable** to the product article for the index itself: only
coordination evidence changes; no package changeset for the index.
