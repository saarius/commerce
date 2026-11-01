# Commerce removes its native entry

Covers `commerce-remove-native-entry-20261101`. Ronald, 1 Nov 2026:
"Commerce: remove the native entry, keeping the library exports". It follows
`commerce-one-build-registry-20261031` (one build, the Registry build,
everywhere), #243 (native-only routes dropped) and #249 (policy records
removed). The Template Store's local dev, CI and playground install the
Registry build (dinkuskit/template-store#195).

## What changed

- **Package root.** `src/index.ts` is re-exports only. `createPlugin`, its
  default export and `dinkusCommerce` are gone, with the native routes,
  storage declarations, native Block Kit route adapters and the native
  `CommercePluginOptions` / `CommerceLocalDevelopmentOptions` types.
- **Library exports kept.** Comparing `Object.keys(await import("dist/index.js"))`
  before and after: 375 to 372 names, the only removals `createPlugin`,
  `default` and `dinkusCommerce`. Every `./features/*` subpath is unchanged.
- **Template Store imports.** Every name dinkuskit/template-store `main`
  (`ba51adb`) imports from `@dinkuskit/commerce` and its subpaths (110
  names, root, `features/checkout`, `customers`, `orders`, `feeds`,
  `structured-data`) type-checks against this build's `dist/` with
  `tsc --strict`, except `createPlugin` and `dinkusCommerce`, which only its
  `tests/unit/checkout-dependency-handoff.test.ts` imports (one case that
  demonstrates the native descriptor). That case goes when the Template Store
  repins Commerce. Its `@dinkuskit/commerce/admin` and
  `features/store-policies` aliases already point at files main no longer has.
- **Tests.** Native declaration checks now read the Registry descriptor and
  plugin; library route-factory tests compose host options through a test
  helper (`mountGuestRoutes`) instead of `createPlugin`; the native and
  native-variant browser lanes, `tests/native-site` and
  `tests/sandbox/native-populated.spec.mjs` are removed; `guest-checkout` and
  `variant-checkout` specs keep their Registry paths. The native host's
  synthetic-Payments paid variant checkout in the browser goes with it; the
  same flow stays covered at library level (checkout unit and integration
  tests).
- **Settings and route auth.** `npm run test:settings` and
  `tests/route-auth.test.mjs` run the Registry build only; the route manifest
  drops its `native` section.
- **Consumer smoke.** `scripts/check-native-consumer.mjs` /
  `test:consumer:native` become `scripts/check-package-consumer.mjs` /
  `test:consumer:package`: pack, install in an outside project with only
  `emdash`, `react` and `react-dom`, resolve and load every declared export,
  run the CLI, and assert the root has no plugin entry. No Astro host.
- **Docs.** Reference article (new "Package for host apps" section; routes
  intro), README (Install type, Status, catalog, sandbox, CLI, diagnostics),
  FEATURE_MAP, CLI-SPEC, both skills, route-auth manifest, shopper-accounts
  contract; historical implementation notes that describe the native entry
  carry a removal note. Changeset `remove-native-entry.md` (minor, breaking
  for anyone mounting `createPlugin`).

## Size

| `backend.js` | bytes | under the 131,072-byte cap | SHA-256 |
| --- | ---: | ---: | --- |
| `main` `6daabe3` | 129,152 | 1,920 | `e1c0bee1…` |
| this change | 129,152 | 1,920 | `e1c0bee1…` |

The Registry backend is byte-identical: it is built from `src/plugin.ts`,
which never imported the package root.

## Proof (1 Nov 2026, Node 24.22.0, tree of `687de90`)

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 843 of 843 |
| `npm run test:integration` | 111 of 111 |
| `npm run audit:repo` | `public_repository_contract=clean`, `feature_contract=clean` |
| `bin/verify-commerce storefront` | 6 passed (one Registry lane) |
| `bin/verify-commerce packaged` | 3 passed, plus `npm_package_consumer=pass declared-exports library-root cli-help` |
| `npm run test:settings` | 1 passed (Registry) |

Route errors in the browser logs are the specs' expected refusals. Local
fixtures only; no publication, deployment or live payment.
