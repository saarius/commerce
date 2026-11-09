# Backroad Bum merchant profile

This is a merchant-only TEST sandbox build, based on Commerce v0.8.0. It is not a generic self-hosting product, a DinkusKit.com Connect grant, or a Registry publication. Generic source and its four-host allowlist stay unchanged.

`node ops/backroadbum/build.mjs` stages tracked source, overlays the two merchant adapters, fixes the pass destination to Backroad Bum and grants only that exact host. It runs the source typecheck, library build, official plugin validation and Registry size check; the store stages the resulting artifact at its content hash before mounting it through EmDash's sandbox runner. Shared dependency symlinks retain the existing audited auth transform by resolving its exact package path.

The operator provisions `connection` through EmDash's authenticated encrypted-settings API. Commerce Settings can then fetch scoped TEST configuration from the merchant service. No store key or signing key is bundled, browser supplied, logged or placed in ordinary KV; Commerce still owns checkout, totals, orders and receipts, while Payments owns provider verification. The storefront has a separate default-closed rollout gate.

After building, run `node --test ops/backroadbum/check.test.mjs`. These are merchant-profile checks, not proof of a paid order, upstream release qualification or generic self-hosting support. Changes to the base pin, issuer, host, service scope or live mode require a deliberate new profile and new proof.
