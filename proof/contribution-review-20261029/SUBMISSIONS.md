# Upstream submissions and disposition

## Review snapshot: 2026-10-29, after207 merge and205 follow-up

Upstream `main` remained `04dcf5e1ef296cc9ca8d719a11fec731d6961660` at both
CLI submissions. Current source/open PRs were checked again, including pending
page-link PR [#208](https://github.com/dinkuskit/commerce/pull/208): it changes
catalog/page ownership and CLI spec/help, not the kernel's profile selection
or response-body error boundary. Neither CLI repair duplicates that work.

Current upstream is `19b25b2878803f85db94c6c4853df1d7d1e4f448` after the
maintainer merged207 at17:49:29UTC. This new coordination branch starts there;
the earlier56c snapshot and all original contribution refs remain unchanged.

**Three repairs remain open,207 is maintainer-merged,206 is deferred.**
205 still lacks positive low-stock proof; the new investigation below does not
claim clearance or turn that gate into a code-feature authorization.
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
| 1 | CLI response-body transport | [Open PR #210](https://github.com/dinkuskit/commerce/pull/210) | Independent alias `saarius/pr-cli-response-body-errors`, head `b78d134f58c9dc0af5d506505aeaddafa73e186e`. Child of original08483da changes only three docs/changelog lines to avoid claiming the separate global SIGINT fix. Runtime/tests unchanged. Shared kernel synchronization remains maintainer work. |
| 2 | CLI SIGINT outcome | Pending revalidation and transport-parent review | Original published stack depends on #1. Prepare a focused submission against the accepted parent/current main, accounting for #208's CLI changes. No dispatch/durable-commit equivalence or automatic retry. |
| 3 | Catalog preview race finding | Audit retained; not submitted | Evidence/docs correction, **not runtime repair**. Rerun intentionally failing counterexamples separately against current source before submission. Stronger atomicity needs owner evaluation; #204 was already in the original baseline, not a new fix. |
| 4 | Payment binding readiness | [Maintainer-merged #207](https://github.com/dinkuskit/commerce/pull/207),17:49:29UTC | Maintainer supplied real-TCP evidence and obtained fresh review. Included in main19b, not yet inferred published. +11 source backend bytes /28 headroom; no real charge/provider qualification. |
| 5 | Low-stock feed availability | [Open PR #205](https://github.com/dinkuskit/commerce/pull/205), **blocked on real-host proof** | Independent host serializer; no introduced correctness defect identified in review. Synthetic fixtures/green CI do not clear the external-contributor behavior-proof gate. No managed-stock addition to Registry or ingestion certification. |
| 6 | Development DOMPurify lock hardening | Pending fresh dependency/browser evidence | Development lock only; not independently locked installed hosts or clearance of Astro findings. Historical audit counts are not current security/exploit results. |
| 7 | Settings country guidance/form readiness | Pending revalidation and stack handling | Original branch includes #6. Guidance fix does not establish a new country policy. Preserve original evidence when preparing a main-based submission. |
| 8 | NaN host feed pagination | [Closed/deferred #206](https://github.com/dinkuskit/commerce/pull/206), unmerged | Correct/tested but no active caller. No automatic reopening; no HTTP DoS or opaque-cursor redesign claim. See maintainer disposition above. |
| 9 | Legacy-contact shopper-profile seed | Pending fresh base/headroom handling | Original #6→#7→#9 stack needed settings headroom; remeasure current-main budget before choosing a new base. Do not blindly cherry-pick. Existing corrupt profiles are not migrated. |
| 10 | Invalid requested CLI profiles | [Open PR #209](https://github.com/dinkuskit/commerce/pull/209) | Independent alias `saarius/pr-cli-profile-selection`, unchanged head440c73f. Prevents invalid future dispatch, not discovery/cleanup of earlier wrong-site writes. |

CLI aliases permit review commits without moving frozen original refs. #210's
runtime and tests equal original08483da; its documentation no longer promises
that *all* whole-command SIGINT outcomes use exit3. The separate lifecycle/
dispatch defect remains outside that PR. Unknown outcome is not failed mutation.

Unsubmitted branches have not received fresh full-suite, installed-release or
security qualification in these submission cycles. When main changes, prepare
focused new submissions and revalidate applicability rather than silently
rebasing frozen snapshots or treating isolated patches as a release roll-up.

## Additional test/tooling contributions

These postdate the frozen ten-entry manifest and are outside its verifier:

| Contribution | Evidence | Disposition |
| --- | --- | --- |
| Opt-in single-host diagnostics | [071eab6 proof](https://github.com/saarius/commerce/blob/071eab6690136300b2ae0efffae8c2efc9b9aa69/proof/single-host-browser-20261029/PROOF.md) | Pending duplicate check/revalidation/submission. Empty/unset preserves all three hosts; canonical aggregate wrappers refuse reduced diagnostics. |
| Variant phone-sized save/readback | [281c669 proof](https://github.com/saarius/commerce/blob/281c6692471867a71666aab8eba3416212a6715d/proof/variant-phone-browser-20261029/PROOF.md) | Pending; original stack uses071eab6. Coordinate with #208's changes to page/product setup and browser fixtures instead of restoring retired setup. Prior narrow-viewport save/readback remains source-bound, not a touch/device journey; host sheet closure remains disclosed. |

## Fresh proposed-source validation

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

The four active PRs have patch changesets and relevant docs (**Docs: up to
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

## Follow-up:205 public-route constraint and207 disposition

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
