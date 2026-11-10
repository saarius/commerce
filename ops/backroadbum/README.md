# Backroad Bum merchant profile

Merchant-only TEST Registry sandbox build based on Commerce v0.8.0. This is not a generic self-hosting product, shared Connect grant, Registry publication or upstream proposal. Generic source and its four-host allowlist stay unchanged.

`node ops/backroadbum/build.mjs` stages tracked source, overlays merchant Connect/admin/Ship adapters and limits network access to `backroadbum.com`. Official typecheck, library/plugin builds and Registry-size checks run. The store checks/stages `backroadbum/merchant-test-v2` at its backend hash before mounting it through EmDash’s sandbox runner; dependency symlinks preserve the audited auth transform’s exact package path. No credential is bundled, browser supplied, logged or kept in ordinary KV.

The operator provisions the existing encrypted `connection`. Commerce Settings fetches scoped TEST checkout configuration from the merchant issuer; `installedCheckout` still rejects generic `ship` and coupons. Payments alone verifies providers; Commerce alone owns checkout prices, paid snapshots, orders and receipts. The merchant receipt’s TEST marker/current fulfillment/canonical short number remain local adaptations, respecting the upstream decision to omit mode from the shopper view.

## Single-order Ship adapter
The merchant admin shell delegates its existing Orders/background/agent-change sync hooks to `merchant-ship.ts`, not the generic historical scan. It reads `/api/commerce-ship` with a `commerce:settings` pass. Disabled/unselected admission makes no Orders lookup, Ship call or machine-pass trade. Production is initialized this way; public machine routes remain unexposed.

The issuer owns one durable configuration row in its existing private Payments database: generation, original freshness cutoff, revision, selected ID and enabled flag. This is grant configuration, not a competing order model. Selection is pinned for that generation; disable/re-enable retains the ID and cutoff. Missing/corrupt state, changed host generation or stale control commands fail closed. No native/HTTP selector or enable action is exposed. See the peer Payments runbook before activation.

When deliberately admitted, the sender reads exactly that canonical Orders ID, never calls its source query and never asks the receiver to reject a historical export. It requires explicit `paidOrder.mode: test`, a recorded provider payment/time at or after the original cutoff, a valid canonical paid copy, delivery address and no retired `shipPin` field. Legacy absent-mode, payment-free, malformed, foreign and historical selections dispatch nothing. Existing paid snapshots and shopper projection contracts are unchanged.

The generic sync runs behind this bounded collection and exact-host adapter. Only its selected ID may be written; current connection key/revision, checkout-setting revision and issuer admission fingerprint are independently reread before dispatch, CAS and ACK. Already-dispatched calls can drain. Outgoing machine calls map to exact `/api/ship/v1/...` paths and omit shopper email. No provider payment, receipt ID, attempt ID or order total is exported; line prices remain the canonical paid prices.

Only one exact practice event is accepted: matching order, integer version, USPS and TEST reference. Foreign/live/extra-field, future or stale events remain unacknowledged. Completion uses Orders’ normal versioned CAS; ACK requires the matching canonical completion, including after a lost ACK. Disable during storage I/O prevents the subsequent CAS; disable after an already-dispatched completion prevents ACK. Same-order re-enable recovers that event. An address change/reopen that no longer matches needs operator reconciliation, not a destructive ACK.

Only the eligible Processing order gets Open practice shipping, pointing to Ship’s protected native EmDash page with no pass or capability. Historical/unselected/disabled/completed orders get no link. Generic `/stores/...` destinations remain untouched outside this merchant build.

## Checks
```sh
node ops/backroadbum/build.mjs
node --test ops/backroadbum/check.test.mjs ops/backroadbum/ship.test.mjs
# Composite proof: actual merchant sandbox + scoped issuer + durable admission + real practice host.
# Peer dependencies/builds must exist; Ship cwd resolves workerd module paths.
# A separate network namespace avoids the SDK’s fixed port used by the live store.
cd ../ship
sudo unshare --net bash -c 'ip link set lo up; exec runuser -u agent -- /opt/node/bin/node --import ../payments/node_modules/tsx/dist/loader.mjs --test --test-force-exit ../commerce/ops/backroadbum/ship.integration.test.mjs'
```

The composite test uses disposable SQLite, ephemeral keys and seeded canonical paid-order fixtures, not Stripe or operator files. It verifies one selected intake, no historical intake, the native destination, a real practice label, disabled polling, re-enable, canonical completion/ACK and unchanged paid facts. Both runtimes/databases are explicitly closed; the test runner’s force-exit bounds remaining SDK handles. This is merchant composition proof, not full generic release qualification or a paid store shipment.

## Activation still required
Production’s sender is deployed but disabled/unselected; Ship’s separate admission remains disabled/unselected too. Before selecting: back up, verify one deliberately fresh provider-paid TEST canonical order, coordinate both pinned controls with current revisions, expose only the exact scoped machine paths and prove native label → canonical Commerce completion → guest receipt. Keep live keys/postage impossible and do not use historical orders, fixtures or the retired shared cohort. The one-label/no-replacement UI and stale-event retention are conservative merchant choices, reconsidered only with a verified recovery contract.
