# Merchant country guidance and mounted-form browser proof

## Scope and review base

Source/test repair: `11693367844de707d34a6bf450baa7f876e04f87`.
This contribution is **stacked on** the development-host DOMPurify update
`6ceb330902264d146a954b6ab7fb376ac7cebb55`, not directly on upstream
`04dcf5e1ef296cc9ca8d719a11fec731d6961660`. Compare against the DOMPurify branch
to review only this contribution. Its package manifest and lockfile are unchanged.

There is one runtime change: the merchant settings context string now says:

> Checkout checks physical shipping destinations; selling/customer countries are not enforced.

It previously said checkout did not enforce country eligibility at all. That
was accurate for the initial `merchant-country-settings-001` slice, but the later
verified `commerce-delivery-address-001` decision requires a physical delivery
country to belong to the store's shipping destinations. The current
`src/features/checkout-contact/index.ts` enforces that condition, including
refusing physical checkout when no destinations are enabled. The selling/customer
list is not used for that check. Neither decision is reopened here.

The implementation notes also still described a phone-only getter and no
checkout integration. They now document its existing `shippingCountries` result
and distinguish physical from digital-only checkout. The website reference
explains the same boundary. **No checkout policy, country support, persistence,
authorization, Connect flow, provider interaction, or snapshot behavior changes.**

## Reproduction before repair

With the new context regression on the parent build:

```sh
node --test tests/features/store-settings/store-settings.test.mjs
```

Result: **13 pass / 3 fail, no skips**. Both new subtests (unconfigured and
configured settings) failed because the rendered context still claimed no
country enforcement. The third failure is their parent test, not another
independent counterexample. Existing shipping/delivery tests independently
exercise the country check; this repair does not introduce it.

The first adequately provisioned browser run of the original settings fixture
also failed after the phone-only save and reload:

```text
Locator: Store country (ISO alpha-2 code)
Expected: ""
Timeout: 5000ms
Error: element(s) not found
Page snapshot: Loading EmDash...
```

This is **not an observed wrong persisted value**. Document load completed
before the EmDash app and Block Kit form mounted. The initial load already had
a 60-second readiness window, but subsequent reloads immediately used default
5-second value assertions. `reloadSettings()` now waits, bounded to the same
60 seconds, for the actual country control to be visible before the original
value assertions run. It uses no sleep, `networkidle`, retries of mutations, or
suppressed assertions. The overall test timeout remains 180 seconds. All four
reloads use the helper.

The synchronization-only intermediate case passed in both lanes before the
context change was added. The final case additionally asserts the corrected
context in the mounted page.

## Verification

Environment: Node **24.22.0**, Linux x64, locked EmDash **1.2.0**, Astro **7.1.3**,
Playwright **1.61.1**, Chromium headless shell **149.0.7827.55** (v1228).

| Check | Result |
| --- | --- |
| Focused settings and checkout-contact unit files | **32/32 pass**, no skips |
| Local sandbox/workerd settings case (project named `registry`) | **1/1 pass**, no retries, 1.7m wall |
| Local native settings case | **1/1 pass**, no retries, 1.6m wall |
| Complete unit/workflow suite | **711/711 pass**, no skips |
| SQLite/D1 integration suite | **106/106 pass**, no skips |
| Typecheck, repository/feature audits, ledger validation, diff check | **Pass** |

The browser cases cover phone-only save before country setup; first-country
normalization/defaults; independently edited selling/shipping lists; changing
the store country without replacing those lists; saved phone toggles; stale
revision refusal with the original form token retained; invalid `ZZ` input;
anonymous write rejection; and persisted readback after reload. All these
assertions remain present. Screenshots show synthetic `EmDash Dev Site` /
`Dev Admin` content, not a customer or connected business.

### Bundle

The only source edit shortens a string. The compiled Registry backend falls
from **131033 to 130996 bytes** (−37), leaving **76 bytes** below the 131072-byte
limit. No storage declaration, route, or permission changes.

```text
baseline SHA-256: 29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68
repaired SHA-256: 914488cf78f9f5a16d415fce130af768f9f3acb526e86bdc4f52353770784cbe
```

## Reproduce the selected browser cases

After installing the locked dependencies and Chromium/OS prerequisites:

```sh
npm run build
export ASTRO_TELEMETRY_DISABLED=1
export XDG_CONFIG_HOME="$PWD/.tmp/astro-config"
mkdir -p "$XDG_CONFIG_HOME"
export NODE_OPTIONS=--max-old-space-size=1408

# Separate fresh runs, one host at a time. Do not overlap builds or suites.
for profile in registry native; do
  COMMERCE_SETTINGS_PROOF_PROFILE="$profile" \
  COMMERCE_SETTINGS_PROOF_RUN="guidance-${profile}-$(date +%s)" \
    npx playwright test --config=tests/merchant-settings.playwright.config.mjs \
      --project="$profile"
done

npm test
npm run test:integration
npm run typecheck
npm run audit:repo
./scripts/grilltrack --project . validate
git diff --check
```

These are selected direct Playwright runs, **not a claim that the complete
`verify-commerce full`, default three-host browser config, or `npm run
test:settings` aggregate runner passed**. The existing settings profile variable
selects a single web server; the matching `--project` selects its tests.

### Resource failures are not proof

Earlier attempts never completed: one hit a local Astro telemetry-config
permission error; another was kernel OOM-killed; isolated host heaps of 512 and
768 MiB still exhausted V8. None are counted as passed tests. On this 2 GiB
server, the successful workloads used an independent, time-bounded systemd
service with a 1550 MiB RAM cap, up to 2 GiB swap, and a 1408 MiB Node heap.
Additional local swap was provisioned before the successful runs. This isolates
the browser workload from the execution agent without changing its controller.
A sufficiently provisioned development host need not reproduce this server's
specific systemd or swap setup.

## Evidence and limits

- `registry/` and `native/`: allowlisted unconfigured, saved, and invalid-input
  screenshots, reporter outcomes, and build digests collected by
  `scripts/settings-evidence.mjs`.
- `baseline-reload/`: allowlisted screenshots and the **failed** reporter
  outcome from the original reload assertion. Collection-time build digests
  were intentionally omitted: the build had been replaced by the time these
  older screenshots were collected. They must not be misattributed to that run.
- No databases, cookies, storage state, HAR, traces, raw logs, credentials,
  customer data, or payment data are included.

The project named `registry` uses the local sandbox-site descriptor, compiled
workerd backend, host authorization and SQLite-backed SDK storage. It is **not
an installation from the external EmDash Registry**, a deployed-host test, or
proof of the stable Registry ID/attestation path. The native lane is also a
local development fixture. There were no real processor, shipping, stock,
Connect, publication, deployment or release operations. Desktop settings proof
is not mobile, whole-storefront, real-provider, or full v1 qualification.
Remaining dependency advisories documented by the parent contribution are not
cleared by this work.
