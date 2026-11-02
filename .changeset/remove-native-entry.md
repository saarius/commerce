---
"@dinkuskit/commerce": minor
---

**Breaking for sites that mounted the native entry.** The package root is now a library only (GrillTrack `commerce-remove-native-entry-20261101`): `createPlugin`, its default export and the `dinkusCommerce` native descriptor are removed, with the native routes, storage declarations and admin wiring they carried. Install Commerce as the Registry (sandboxed) build instead, from the Registry or from `@dinkuskit/commerce/sandbox` with `@dinkuskit/commerce/descriptor`; native camelCase storage is not migrated. Every library export host apps import stays: the catalog, checkout, customers, orders, feeds, structured-data, store-settings, storefront-availability, inventory-provider, inventory-setup and fixed-bundles functions and types at the package root, `CATALOG_API_ROUTE`, and every `./features/*` subpath. The route manifest (`@dinkuskit/commerce/route-manifest`) drops its `native` section. The Registry backend is unchanged (129,152 bytes).
