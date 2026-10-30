# Registry beta selection correction and own installed-store checkpoint

2026-10-30. Public-safe synthetic evidence; not a release or readiness certificate.

## Erratum — I selected the wrong channel in earlier installed-plugin controls

The earlier authoritative-record scan filtered only `dinkus-commerce`, then looked for hyphens in its versions. This misses the separate **`dinkus-commerce-beta`** package that `scripts/beta-release.mjs` deliberately publishes. Therefore **“no beta available” was false**. Official0.7.0-beta.2 was indexed2026-10-28T14:03:59.870Z, already before those tests. The recorded0.6.0 checksums/HTTP/UI results remain **stable-release controls**, not latest-beta qualification. Exact proposed-source/local-native/local-sandbox results retain their named scopes; they do not become released behavior. [Public correction on211](https://github.com/dinkuskit/commerce/pull/211#issuecomment-6512784886) also covers the205 selection statement, without reopening205 or manufacturing low-stock relevance.

Historical frozen branches/reports are not silently rewritten. This erratum supersedes ALL their absence-of-beta/latest-selection claims, including the older contribution-index snapshots. Older full-installation disclaimers still accurately describe those explicit-mount tests, not today's actual installation.

## Corrected selection

`registry-selection.mjs` is a small diagnostic, not a production Registry client. It scans BOTH exact package names through terminal pagination, sorts with the pinned SDK's semver comparator, prefers the latest beta package, and falls back to stable ONLY if that beta package has no releases. A selected URI/CID/version/package must match the official aggregator latest metadata; disagreement fails rather than changing the executable under test. Public publisher PDS endpoint is pinned to the endpoint observed here; it may need refresh if the publisher moves. Discovery is not moderation/signature/withdrawal approval; the real installer performs those gates.

- Live [selection.json](selection.json): **01:33:53.745UTC**,2pages/47publisher records/18Commerce versions, terminal. Latest stable0.6.0, selected **dinkus-commerce-beta@0.7.0-beta.2**.
- [Eight regression tests](registry-selection.test.mjs):8/8 pass, zero skipped. Separate beta naming even against a higher stable semver; numeric beta ordering; stable-only fallback; unrelated beta exclusion; empty failure; later-page beta; repeated cursor; metadata CID mismatch.
- Targeted negative mutant replacing the scan's BOTH-package filter with the old stable-only filter: **7pass/1fail/exit1**, expected. This models the old error; it is not a claim that all new tests were run against the unchanged historical script.

From the Commerce checkout:

```sh
node --test proof/registry-beta-selection-20261030/registry-selection.test.mjs
node proof/registry-beta-selection-20261030/registry-selection.mjs
```

A new live scan is new evidence; it does not retroactively update selection.json or qualify an arbitrary binary.

## Actual SDK installation, separate from local source builds

On an OWN fresh loopback Astro/EmDash1.2.0 site with SQLite/local storage/workerd, **no configured native Commerce entry and no build-time sandbox descriptor**:

1. Selected official beta as above; resolved official release metadata anonymously.
2. Used the development-only setup/auth endpoints on loopback to create the synthetic local admin/session. Never exposed that host publicly or sent its cookies to Registry/upstream.
3. Verified the signed package through real authenticated `POST /_emdash/api/admin/plugins/registry/verify`,200. Reviewed its declared capabilities, network hosts and public routes.
4. Submitted real `registry/install` with returned profile/release CIDs and explicit legacy capability-array/MCP/public-route consents,201. This is **not** a descriptor mount, injected payment/inventory binding, preloaded plugin row or mock fetch.
5. SDK returned runtime **r_fjzjvld3ssb4j63o**, version0.7.0-beta.2, `provenance:verified`, policy `requireProvenance:true`. [Safe installation summary](installation.json) records exact identities; that is the SDK's verification result, NOT independent cryptographic/security audit certification.
6. On-disk installed backend **131033bytes**,39headroom under131072, SHA256 **29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68**, identical to frozen04dcf5e1ef296cc9ca8d719a11fec731d6961660/v0.7.0-beta.2. It is NOT current-main a630…/130676 or proposed220 code. Same package-version strings alone do not prove this identity.

Beta source record: `at://did:plc:ekk4pjmkh3k3ql2kfoex3qt4/com.emdashcms.experimental.package.release/dinkus-commerce-beta:0.7.0-beta.2`, CID `bafyreicsp4rzodzyetcsy2w22z425tqudphnqchsiqdefdivdqqbfmxfnm`. Public build reference names tagv0.7.0-beta.2; local git resolves that tag to04dcf5e… separately. Registry installation verified the artifact; a tag by itself is not provenance.

## Store status — useful progress, NOT working purchase checkout

Created a synthetic Workshop notebook via the installed beta's actual merchant panels. This OLD beta still proposes the page's `commerce_item_id` patch and requires the CMS field/link to be saved. Following that supported old workflow, persisted12.00 via Commerce form, reloaded12.00, published the CMS page through its confirmation dialog, and explicitly set the product on sale as the same authorized operator. Public installed catalog returns one unmanaged in-stock/listable/sellable item, USD1200. No raw-row insertion, fabricated quantity or provider injection.

A tiny independent storefront consumes only that public HTTP catalog: SSR product card, browser identity/quantity basket and estimates, and readiness read. Desktop1440×1100 and phone-sized390×844 Chromium/mouse checks **2/2 passed01:34:43**: add2=>$24/remove1=>$12/readiness unavailable/clear=>empty+disabled, no horizontal overflow. [Desktop](desktop.png) and [phone](phone.png) are unchanged manually reviewed synthetic captures, bound by manifest.json. Phone full-page capture height differs from viewport by design. They depict this OWN demo, not the project's template/device/provider/full journey. UI Source hash is recorded for traceability, not a public-source/build attestation.

**Checkout is unavailable**, correctly reported by the real installed readiness route. No DinkusKit connection/checkout configuration or actual Payments/Ship provider has been provisioned. No purchase/start request, charge, order or shipment was made. The store still needs legitimate owner Connect/provider setup, an actual purchase flow, and automatic host publish/unpublish synchronization (this first product was explicitly published/set-on-sale manually). These are disclosed setup/integration gaps, not new Commerce defects. The existing208/211 repairs are accepted SOURCE, not released just because the beta is installed. No new product-fix PR manufactured from expected prerequisites or known already-accepted work.

The service runs independently under resource bounds on loopback with a private persistent synthetic DB. It is deliberately NOT a public production deployment: development bypass must never be reachable through saarius.com/reverse proxy. It may be paused while heavyweight qualification runs, then resumed. Own-server hosting is authorized; upstream plugin publication/merge/deployment and maintainer-store access are not performed.

## Failed setup attempts retained, not hidden as passes

- Initially installed0.6.0 as a stable control using the flawed selector. Archived that independent DB before a FRESH beta install, no downgrade/combined writers.
- Initial installer attempts refused missing record consent, then structured-access instead of the SDK's required legacy capability array. Confirmed plugin list still empty before correcting explicit consent. Not mutation retry after unknown outcome; final201 recorded separately.
- Wrong local CLI/bin paths and symlinked-dependency Vite serving allow-list were own harness errors. Corrected exact dependency real-path allowance. A Vite config hot restart retained a closed module runner: full local service restart, not an upstream Commerce repair.
- First price attempts lacked the beta's saved CMS field link; responses said “Linked. Save to keep it.”, NOT “Product saved”; readback found no price. After explicit CMS link Save, a too-strict URL predicate timed out despite completed PUT; inspected saved draft and did NOT resend that write. Final price Save returned Product saved/reloaded12.00. First Publish click opened confirmation, not publication; followed the dialog before verifying published state. Those failed diagnostic attempts are not counted as passing journeys.208 removes this old field-link workflow in SOURCE; no duplicate PR.

No cookies/tokens/capabilities/raw DB/logs/request-response/traces/real merchant figures/customer/tenant/provider data published. No real devices/touch/Safari, external mail, payment settlement, physical fulfillment, canonical full gate, whole-release/combined-branch/security/performance qualification. DOMPurify lock unchanged; repository audit is not vulnerability clearance.
