# Upstream submissions and disposition

## Current review snapshot

2026-10-29. Upstream `main` was fetched and checked as
`04dcf5e1ef296cc9ca8d719a11fec731d6961660` before revalidation. The open-PR list
was initially empty. The latest 60 PR records were reviewed, including merged
catalog/CAS work #183, #201 and #204, which is already in that source baseline.
Those catalog changes are not a duplicate of the feed/readiness repairs below.
Before each submission, remote main and the open-PR list were checked again.

Three small, independent contributions were revalidated without changing their
published heads. The other entries remain preserved for separate revalidation
and review rather than being submitted as an unqualified combined change.

This is a **submission/status snapshot**, not maintainer approval, a release
or a claim that a PR remains open forever. The PR links are authoritative for
current discussion, checks and merge state. No automatic merge is requested.
The earlier [frozen index](https://github.com/saarius/commerce/blob/f12ec8b8a747c00e0926251d39d246e2f217e9e2/proof/contribution-review-20261029/README.md)
remains unchanged; this is a separate successor branch, not rewritten evidence.

## Original ten contributions

All identities, proof digests and original stack relationships remain in
[manifest.json](manifest.json) and the [original-results table](README.md).
"Pending" is not a finding that the existing patch is wrong or fixed upstream;
it means no new PR or fresh revalidation is represented by this batch.

| # | Contribution | Disposition / PR | Dependencies and limits |
| --- | --- | --- | --- |
| 1 | CLI response-body transport | Pending exact-head revalidation/submission | Independent. Shared kernel synchronization remains maintainer work; no automatic write retry. |
| 2 | CLI SIGINT outcome | Pending revalidation and parent review | Published stack depends on #1. Keep dispatch uncertainty distinct from durable commit; do not send an unfocused parent-plus-child PR as if standalone. |
| 3 | Catalog preview race finding | Audit retained; not submitted in this batch | Evidence/docs correction, **not runtime repair**. Rerun intentionally failing counterexamples separately before submission; stronger atomicity needs owner evaluation of the existing decision. #204 was already in the original baseline, not a newly landed fix to this finding. |
| 4 | Payment binding readiness | [Open PR #207](https://github.com/dinkuskit/commerce/pull/207) | Independent; +11 backend bytes, 28 headroom. Malformed trusted-service response handling, not demonstrated shopper forgery/charge. |
| 5 | Low-stock feed availability | [Open PR #205](https://github.com/dinkuskit/commerce/pull/205) | Independent host serializer; no managed-stock addition to Registry or channel-ingestion certification. |
| 6 | Development DOMPurify lock hardening | Pending fresh dependency/browser evidence and submission | Development lock only; does not update independently locked installed hosts or clear remaining Astro findings. Historical audit counts are not current exploit/security results. |
| 7 | Settings country guidance/form readiness | Pending revalidation and stack handling | Published branch includes #6. Source/guidance fix does not establish a new country policy; preserve original evidence if preparing a main-based submission branch. |
| 8 | NaN host feed pagination | [Open PR #206](https://github.com/dinkuskit/commerce/pull/206) | Independent; does not include #5. Pure programmatic helper, not demonstrated HTTP DoS or a public-catalog cursor redesign. |
| 9 | Legacy-contact shopper-profile seed | Pending revalidation and required headroom/base handling | Published stack is #6→#7→#9. Settings parent supplies required bundle headroom; do not blindly cherry-pick standalone. Existing corrupt profiles are not migrated. |
| 10 | Invalid requested CLI profiles | Pending exact-head revalidation/submission | Independent, priority follow-up. Prevents new invalid dispatch, not discovery/cleanup of earlier wrong-site writes. |

Pending branches have **not** received a new full-suite, installed-release or
security certification in this submission batch. Existing original proof
remains available at its exact recorded source/final heads. When main advances,
prepare/revalidate focused submission branches as needed while retaining every
original branch and proof; do not silently rebase a frozen snapshot.

## Additional test/tooling contributions

These postdate the ten-entry manifest and are deliberately not silently folded
into its count or verifier scope:

| Contribution | Identity / evidence | Disposition |
| --- | --- | --- |
| Opt-in single-host diagnostics | [071eab6 proof](https://github.com/saarius/commerce/blob/071eab6690136300b2ae0efffae8c2efc9b9aa69/proof/single-host-browser-20261029/PROOF.md) | Pending duplicate check/revalidation/submission. Empty/unset preserves the main three-host default; canonical aggregate wrappers reject reduced diagnostics. |
| Variant phone-sized save/readback | [281c669 proof](https://github.com/saarius/commerce/blob/281c6692471867a71666aab8eba3416212a6715d/proof/variant-phone-browser-20261029/PROOF.md) | Pending submission, published stack uses 071eab6. Prior local native/sandbox runs include actual narrow-viewport price save and durable readback, not a whole touch/device journey. Host sheet closure remains a disclosed UX limitation. |

## Fresh source validation for submitted repairs

New runs on 2026-10-29, Node 24.22.0/Linux x64, original lockfiles and exact
proposed heads. Build/unit, build/integration and subsequent gates ran
**sequentially**, one branch at a time, under bounded independent workloads.
No browser suite, installed release, security audit, canonical full gate,
external provider or maintainer-store journey ran in this batch.

| PR | Exact head | Unit/workflow | Integration | Backend / headroom | Completed UTC |
| --- | --- | ---: | ---: | ---: | --- |
| [#205](https://github.com/dinkuskit/commerce/pull/205) | `efec42c4e2a73b29d5d434529c575c1efed2ff35` | 715/715 | 106/106 | 131033 /39 | 16:22:28 |
| [#206](https://github.com/dinkuskit/commerce/pull/206) | `fce969aa1ca301e7e0bc612b4258e6513011faa0` | 726/726 | 106/106 | 131033 /39 | 16:27:11 |
| [#207](https://github.com/dinkuskit/commerce/pull/207) | `1d20f263221fff0d578d7704119921df76ae8d1d` | 756/756 | 110/110 | 131044 /28 | 16:31:52 |

All listed suites have no skips/failures. Typecheck, repository/feature audits,
ledger validation, diff and clean-worktree checks passed for each head. Each
fresh official extracted backend was checked for exact bytes/SHA-256 and
byte equality to `dist/sandbox/plugin.mjs`. Backend cap is 131072 bytes; the
first two remain upstream-identical
`29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`;
readiness is
`dd8e6018be154d4f65002d46340dee47fe521f85f029cee2f1571deaf46c38f9`.
There is **no combined artifact** or additive-budget promise.

Revalidation reused the immutable proposed heads, not renamed historical logs.
Original before/after reproductions remain qualified in each linked proof.
PR bodies include reproduction commands, source identities, controls, docs and
explicit limitations. All three have patch changesets and updated relevant
implementation and website-reference documentation (**Docs: up to date**).

The successor index checks itself separately: its unchanged identity verifier
still checks **only the frozen ten-entry manifest and eleven refs**, not new
PR metadata, current CI, measured bytes or product test truth. PR/base/head
identities were checked separately against GitHub's public PR API. Dispatch or
relay check success is not a review approval or a product-CI pass. No such
approval is claimed by this index.

## Installed-release and maintainer workflow boundary

This batch validates **proposed source**, not a published beta/stable plugin.
The maintainer merges reviewed changes, cuts the beta, installs official
Registry betas and runs the designated live journeys before considering stable
promotion. No release/tag/publication, direct upstream push, merge, deployment
or mutation of the maintainer's beta store was performed here.

For future installed-plugin work, query the official Registry and use its
latest available beta, otherwise the stable release, on our own synthetic
server. GitHub tags or npm metadata alone do not establish Registry availability.
No beta was installed or Registry provenance/availability certified in this batch.
A local native/workerd fixture is not that release test, and a pass on a separate
store is not the maintainer's release gate. No credentials or real tenant data
belong in this public handoff.

**Docs: not applicable** to the product article for the index/status update
itself; only coordination evidence changes. No package changeset for the index.
