# Variant editor: asserted phone-sized save and durable readback

## Scope and identities

This is a **browser-test coverage improvement**, not a product repair. Both
original cases already passed at the parent; phone editing was not asserted.

- Parent: single-host browser tooling
  `071eab6690136300b2ae0efffae8c2efc9b9aa69`.
- Corrected test source: `73d88c4a376c49cbda87f2289e49419a7d682910`.
- Branch: `saarius/variant-phone-browser-proof`.
- Application code/lock remain the upstream `04dcf5e1` baseline. This branch
  stacks only on the test tooling, not any earlier product repair.
- Node `24.22.0`, Linux x64, EmDash `1.2.0`, Astro `7.1.3`, Playwright `1.61.1`,
  Chromium headless shell `149.0.7827.55`, unchanged DOMPurify `3.4.16` lock.
  These pins are reproducibility, not dependency/host security clearance.

Only `tests/sandbox/variant-checkout.spec.mjs` changes before this proof:

1. Rename the merchant test to match its actual scope: choices and independent
   prices, not a bulk-price form the current product panel does not have.
2. After the desktop journey, open the Commerce panel at a 390×844 viewport.
3. Verify the third variant's `28.00` price, enter `29`, and press its Save.
4. Assert canonical stored minor units are `2900`.
5. Reload/reopen the editor, assert displayed `29.00`, scroll it into view and
   capture the mounted phone-sized panel.
6. In the native synthetic lane, refresh the earlier paid checkout and assert
   API order, persisted order and payment totals remain `2800`.

All original assertions, 180-second case timeout, worker/retry settings and
cleanup remain. There is no mutation retry, arbitrary sleep, package/runtime,
route, permission, persistence schema, ledger or release change.

## Baseline and a real failed draft

The existing two cases passed **unchanged** at parent `071eab6`:

| Profile | Fresh run | Result |
| --- | --- | --- |
| native-variant | `native-variant-baseline-20261029-01` | 2/2, no retries, 2.2m |
| sandbox | `variant-sandbox-baseline-20261029-01` | 2/2, no retries, 2.1m |

This was not a failing application baseline. Reviewing its phone screenshot
showed why more coverage was useful: merely resizing left the Commerce panel
collapsed, with no phone edit assertion. The [baseline capture](baseline/native-phone.png)
is bound to that older head/run in `manifest.json`, not attributed to the new
source. It does not establish that the old product's phone controls were broken.

An initial stronger test at `38f5d2681ae98e4c5e85759f0fa703c4fcb1fbe2`
failed in native: **1 passed / 1 failed**, aggregate exit 1. The phone Save
**did persist `2900`**, but immediate control readback found no element. The
snapshot showed the whole host Settings sheet closed; it did not show wrong
saved data. Sandbox did not run in that failed aggregate. Its earlier unit,
integration and other gate successes are not counted as aggregate success.

The pinned host's `MobileSidebarPortalGuard` describes mobile sheet closure
when focus leaves its DOM; its exceptions cover selected controls. The
observed sheet closure after this panel action is a remaining **host/UI
limitation**, not something this Commerce fork silently patches or proves
fixed. No exact causal trace or upstream SDK repair is claimed.

The corrected test deliberately reloads and reopens **after** storage readback,
then keeps the displayed-value assertion. This is durable readback, **not** a
claim that Save keeps the phone sheet open. It never resubmits the price write.
The failed attempt and distinct corrected captures are retained separately.

## Corrected browser results

At the corrected source `73d88c4`, every case in the edited spec passed in both
matching profiles, with no skips or retries:

| Profile | Fresh corrected run | Result | Wall |
| --- | --- | --- | --- |
| native-variant | `variant-phone-native-variant-20261029-02` | 2/2 | 2.1m |
| sandbox | `variant-phone-sandbox-20261029-02` | 2/2 | 1.9m |

The native merchant case took 1.5m and sandbox 1.2m, within the unchanged 180s
case limit. The complete corrected orchestration exited 0; no failed draft
capture is substituted for these distinct runs.

Both profiles are local, disposable, fresh SQLite hosts; each run's two cases
share its one initialized database. The sandbox profile runs the compiled
Registry-style plugin in local workerd. The native-variant profile registers
the native code plugin and supplies an explicit in-memory synthetic Payments
facade. Neither is an external Registry installation or a real processor.

The existing assertions also cover:

- Grouped concrete members, disabled out-of-stock choice, authoritative prices.
- Mounted CMS product panel, adding choices, physical/digital fulfillment,
  independently saving prices, adding a second option and a third member.
- Stale-form refusal when a database edit occurs **before** submission, keeping
  clerk input; a reload reads the winner. This is not post-validation atomicity.
  The separately published catalog race finding remains applicable; no race
  counterexamples are rerun or repaired here.
- Native-only: forged totals, missing email/required phone, delivery eligibility
  and U.S. region refusals without cart creation; synthetic pending→paid;
  frozen price, option/value labels and fulfillment after catalog changes;
  contact-snapshot readback and email/phone absent from public/payment JSON.
- Added phone-sized action: one `28→29` catalog save and persisted/UI readback
  in each profile; native already-paid total stays `28`.

Sandbox does not execute the test's native-only synthetic checkout branches.
These are desktop Chromium contexts resized to 390×844, **not** touch input,
mobile device emulation, Safari/Firefox or an independent whole phone journey.
The shopper screenshots remain viewport captures, not asserted mobile checkout
interaction. No general responsive/mobile usability qualification is implied.

## Sanitized captures and integrity

`manifest.json` records exact source/baseline heads, test-source digests, real
run IDs, scoped outcomes and each allowlisted PNG's byte count, dimensions and
SHA-256. It is a review index, not signed runner attestation or independent
verification. Digests establish file identity, not correctness/approval.

Only five manually reviewed, unchanged **admin** PNGs are copied: one baseline
phone capture and desktop/phone captures from each corrected run. All show
synthetic proof products and the SDK's local Dev Admin. Random entity IDs are
fixture identities, not credentials. No screenshot of checkout JSON/contact,
request/response JSON, capability, cookie, storage state, HAR, trace, SQLite,
auth material or raw browser log is committed.

- [Native desktop](native/desktop.png) / [native phone readback](native/phone.png)
- [Sandbox desktop](sandbox/desktop.png) / [sandbox phone readback](sandbox/phone.png)

Desktop captures precede the additional phone edit (price 28); phone captures
follow save/reload/readback (price 29). These are different points in the same
journey, not contradictory measurements or equivalent presentation snapshots.

## Gates, bundle and limits

Corrected source `73d88c4` reran all gates after the draft failure:

| Gate | Result at source `73d88c4` |
| --- | --- |
| `npm test`, including build and unit/workflow tests | 725/725, no skips |
| `npm run test:integration`, including build | 106/106, no skips |
| Typecheck, repository/feature audits | Pass |
| GrillTrack ledger, diff, clean-worktree assertions | Pass |
| Extracted backend bytes/hash and equality to sandbox plugin | Pass |
| Entire edited browser spec, native-variant | 2/2, no retries |
| Entire edited browser spec, sandbox | 2/2, no retries |

These are source-bound results, not a later proof-only commit's full-suite
rerun. The failed `38f5d26` aggregate is excluded from this table.

All builds, suites and browser profiles run sequentially with fresh run names,
under independent bounded workloads (1550 MiB RAM, up to 2 GiB swap, 1408 MiB
Node heap, explicit runtime limit). No controller changes or permanent service,
forced exit, assertion removal, sleep or mutation retry is used.

The official extracted Registry backend and `dist/sandbox/plugin.mjs` are
identical: **131033 bytes**, **39 bytes headroom** under 131072, SHA-256
`29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`.
This test change adds no runtime bundle bytes. A proof-only commit follows the
identified source; final-head focused/build/audit/digest checks are reported
separately in the handoff, not substituted for source-head browser evidence.

All projects matching the changed spec were exercised **separately**. This is
not an unmocked canonical storefront/core/full aggregate, default simultaneous
three-host run, other browser files, packaged consumer/settings gate, deployed
host, payment-provider, shipping-label, managed stock or v1 acceptance proof.
Earlier contributions/index remain immutable; no combined repair is tested.
Existing security findings and the independent catalog race are not cleared.

## Reproduce

Initialize locked/native dependencies and Chromium under Node 24.22.0. Run
builds and suites sequentially, not while browser hosts are active:

```sh
npm test
npm run test:integration
npm run typecheck
npm run audit:repo
./scripts/grilltrack --project . validate

mkdir -p .tmp/astro-config
export ASTRO_TELEMETRY_DISABLED=1
export XDG_CONFIG_HOME="$PWD/.tmp/astro-config"
for profile in native-variant sandbox; do
  COMMERCE_BROWSER_PROOF_PROFILE="$profile" \
    COMMERCE_PROOF_RUN="variant-phone-$profile-$(date +%s)" \
    npx playwright test tests/sandbox/variant-checkout.spec.mjs --project="$profile"
done
```

Use sufficient resources or bounded independent workloads. Supply a script
file to systemd-run rather than an inline ExecStart containing `${variables}`.
Single-host diagnostics must not be labelled full canonical verification;
canonical aggregate wrappers reject this override.

**Docs: not applicable** to the product article: tests/proof only, no product
behavior or setup change. No release changeset, merge, upstream issue/PR,
publication, deployment, real-provider or production operation.
