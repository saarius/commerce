# Truthful CLI SIGINT after change dispatch — current-base revalidation

## Source and dependency

The original contribution `31666da5fe9d288bbcf27cd21d31c78353fedaa6`
and its proof remain frozen. This preparation selects its client/spec/test
repair onto transport revision `41eedb5130c95a170c7aec480c34b13519c62018`,
which contains upstream main `d61d2d23825befe023333adcdc41683fcf50a6e0`
(the maintainer's209 merge). Tested source is
`702f6697265c0fe4a9da847e2d0e716a626f0ccd`.

**Transport210 is a dependency**, not an inferred accepted release: its catch
boundary is needed to classify cancellation during body consumption. The
original parent relationship was not silently discarded. An upstream submission
must include the accepted current main before review; this proof records the
explicit source identities rather than assuming a branch name is permanent.

The client/spec/test files are byte-identical to original316. Documentation is
adapted to the current article/spec, keeping the accepted profile paragraph and
the transport timeout paragraph. The shared kernel is unchanged from41; no
companion CLI synchronization, new policy, dependency or storage change.

## Reproduction and observed behavior

Fourteen regression cases were freshly run on a rebuilt unchanged transport
parent41, before adding the lifecycle repair: **3 passed/11 failed**, exit1,
zero skips. The actual executable received SIGINT only after a real loopback
server received its complete authenticated synthetic change request. It
reported **“interrupted; nothing was sent”** and exited4 despite that receipt.
This is a concrete dispatch-reporting defect; no durable save is inferred.

Eight real-process cases exercise product creation, a confirmed price edit,
order completion and reopening, with no response or a server-sent partial JSON
response. Two other subprocess cases interrupt a read-only product/order
preflight and preserve exit4. Server-sent partial bytes are not a claim that the
client had consumed them before SIGINT; request-level body cancellation is also
covered separately by transport210's actual-fetch regression cases.

The repaired client forwards the existing lifecycle, marks only catalog/order
**changes**, checks pre-aborted signals after credential/destination admission,
and marks immediately before invoking fetch. POST alone is not the classifier:
catalog get/list and orders show/list remain read-only. Native/public GETs do
not mark a change. Blocked or pre-cancelled calls neither mark nor invoke fetch.

After dispatch starts, the existing actual process handler reports **unknown
outcome/exit3**, not “nothing was sent.” Tests assert one JSON error document,
`interrupted`, exactly one change request, and no synthetic token in output.
This is conservative: starting fetch does not prove receipt or durable commit,
and SIGINT cannot undo a change already applied. **No automatic retry.** Read
back the product/order before resubmitting.

## Validation

- Focused repaired module: **14/14**, zero failures/skips.
- Source702: **825/825** unit/workflow and **110/110** integration,
  no failures/skips; build/typecheck/repository audit/ledger/diff/clean passed
  at20:22:32UTC2026-10-29.
- Three additional independent focused repetitions:14/14 each, zero failures,
  skips or forced exits. These are fresh unit fixtures, not mutation retries
  against a persistent store.
- Client/spec/test equality to frozen316 checked. The repair uses the existing
  transport supplied by runCli and does not change its request validation.
- Backend source702:131044bytes/28headroom, extracted/dist equal, SHA256
  `dd8e6018be154d4f65002d46340dee47fe521f85f029cee2f1571deaf46c38f9`.
  This CLI repair does not change the plugin backend or qualify arbitrary merges.
- Node24.22.0/Linuxx64, unchanged lock/DOMPurify3.4.16. The ten subprocess signal
  cases explicitly skip Windows; no Windows signal qualification is claimed.

Exact final-head refresh, if different from source702, is stated separately in
the PR/current index. Older recorded counts are not relabelled as new-head runs.
This document and its added evidence are not signed runner attestation.

## Scope limits

Real native HTTP and actual CLI subprocesses, synthetic requests/tokens only.
The server records receipt; it does not establish a real order or durable store
mutation. No Registry installation, browser, payment, provider, external channel,
production or maintainer-store operation, release publication or deployment.
Docs: up to date, with a patch changeset. Existing shipping/Inventory policy,
shared kernel, permission/destination checks and product confirmation protocol
are unchanged. No product decision or GrillTrack ledger edit was required.
