# Actual official beta.3 upgrade and own read-only store preview

## Result and explicit limits

The agent's independent synthetic preview is **https://saarius.com**. Commerce
was actually upgraded through EmDash's Registry API from **0.7.0-beta.2 to
0.7.0-beta.3**, not mounted as a configured Commerce descriptor/native plugin.
The public preview is deliberately **read-only**. Catalog/basket/readiness and
host CMS synchronization work in the checks below, but **purchase checkout is
unavailable**: legitimate merchant account, Connect and provider setup remain
incomplete. No checkout-start, charge, order, shipment, fake binding/provider or
Inventory fallback was attempted. This is not the maintainer's beta store.

This targeted host report is NOT a complete working purchase store, canonical
release gate, provider/payment settlement, physical-device test, independent
cryptographic verification or security certification. SDK provenance status
is reported as the SDK's result, not promoted into those stronger claims.

## Exact official release and update

See [installation.json](installation.json) and [selection.json](selection.json).

- Package **dinkus-commerce-beta**, publisher
  `did:plc:ekk4pjmkh3k3ql2kfoex3qt4`, release **0.7.0-beta.3**.
- Release CID **bafyreiheg7fka3jeiqhq4stkqk53drywwnqajzikdm6t2gjznzkcafpvae**.
- Profile CID **bafyreibnnwpe5ahd6gumynkvatirpsix3tb2u3etiaf7m4vvzyqy6r3y2e**.
- Actual authenticated SDK Registry update HTTP200 around03:04:56UTC; SDK
  `provenance:"verified"`, policy `requireProvenance:true`. No added
  capabilities; one capability removed. No escalation consent was bypassed.
- Installed backend **130676bytes**, SDK per-file cap131072, **396headroom**;
  SHA256 **a630ca239b3573cd5943cb430fb8e26702c946ba6d7c38438fcc86ac01c98f92**.
  These bytes match the accepted main backend. Main and official beta.3 tag
  point to **7740b4c14e614740c454ed67aeb6e8eaac49db6d**.
- Final own production build completed03:07:05. Versions are in
  [manifest.json](manifest.json); Node24.22.0, EmDash1.2.0, Astro7.1.3,
  Node adapter11.0.2, sandbox-workerd0.9.3.

The channel-aware scan at02:11 selected beta.2. Beta.3 was indexed
**02:16:55.178UTC**, found at03:00, then actually installed. All intervening
beta.2 experiments remain exactly beta.2 controls, NOT latest-beta evidence.
After the beta.3 checks, the full both-package terminal-page scan at
**03:09:29.555UTC** still selected this exact beta.3 CID. Discovery is separate
from actual installation and from independent certification.

## Host pairing and publication synchronization

Only the HOST content-policy bridge is configured natively. Its three public
Template Store source files are unmodified from
**314dad31ea0654d992991a428b555a51e2bf8522**: product-on-sale,
product-url-plugin and the imported seed identity map. Their full dependency
closure and MIT license were reviewed/retained on the own host; no companion
repository/history was imported into Commerce. This store has none of the
seed map's demonstration slugs/products. The map is not a catalog/stock source.

The own middleware supplies the actual runtime/current person, a fresh stored
user lookup, and the host pending-sales repository. Commerce remains the sole
price/sellability authority, with Inventory off and manual availability. The
store has one intentionally synthetic notebook atUSD1200; the basket only
keeps temporary product identity/quantity/estimates.

**Seven actual production API checks passed03:09:21** with an authorized own-
site operator and a separate anonymous client:

1. Anonymous CMS unpublish denied; public catalog unchanged.
2. CMS unpublish automatically removes the item from the public catalog.
3. CMS publish automatically puts it on sale.
4. A separate unlinked page's publish is refused422 without catalog change.
5. CMS trash automatically takes the item off sale.
6. Restore alone leaves it off sale.
7. Explicit republish restores the item and canonical1200 price.

The driver did NOT directly call the sale-state route or inject rows. Controls
were trashed and the original synthetic item republished. These are real CMS/
installed-plugin/HTTP operations, not a mock permission or provider binding.
Mutating setup/upgrade/synchronization drivers are NOT blindly retryable.

## Production boundary and browser checks

[checks.json](checks.json) records the bounded assertions.

- Production standalone runtime, not the development server; both actual
  backend development-bypass endpoints return403, anonymous admin401.
- Public TLS proxy permits only selected GET/HEAD preview assets/public reads;
  admin/auth/setup/development-file/image-transform paths and public mutations
  are not exposed. **18 public probes passed**, including encoded traversal
  cases and spoofed loopback forwarded headers. This is a targeted allowlist
  check, not a penetration test or a general security-clearance claim.
- **2 actual anonymous HTTPS Chromium cases**, desktop1440×1100 and
  phone-sized390×844: catalog appears; add2→$24/remove1→$12; actual readiness
  response200/unavailable; clear→empty+disabled; no horizontal overflow.
- Corrected natural service stop0 after HTTP drain, SDK sandbox teardown and
  database closure, followed by a successful restart. The lifecycle adapter
  uses a pinned SDK1.2 internal singleton, not a stable public shutdown API or
  a guaranteed upgrade-compatible implementation.

The manually reviewed synthetic screenshots are
[desktop](desktop.png) and [phone](phone.png). Full-page image height may differ
from viewport height. Media hashes/dimensions and source hashes are in the
manifest. Source hashes are traceability only, not public-source/build
attestation or a claim tests ran on a later source commit. No raw DB, HTTP
responses/logs, cookies, credentials, operating configuration, customer data,
traces or HAR are published.

## Failures and qualifications not erased

- The current Template host initially mismatched beta.2: its entryId lookup
  protocol was accepted source208 but not released there. The unlinked-page
  control unexpectedly published200. A compatible older public host pin
  79298ffb passed the beta.2 controls; after the actual beta.3 update, the current
  host protocol was restored and the same refusal/synchronization checks passed.
  This was a pairing boundary, NOT a new current-main Commerce defect.
- Initial production build failed because published CodeMirror language6.13.0
  imports undeclared streamparser. Installed JS was byte-equal to its official
  npm tarball. The OWN independent consumer adds streamparser6.0.0; Commerce's
  lock/dependency tree was not changed. This consumer workaround does not
  remediate the broader historical Astro/security findings.
- Default standalone shutdown and the first custom attempt FAILED after90s;
  the first custom attempt incorrectly called shutdown on the SDK facade.
  Those are not passing cleanup evidence. Only the corrected singleton bridge
  subsequently achieved natural0, including the beta.3 run.
- No full default-three-host/browser/canonical storefront/core/full gate was
  run here. Historical exact-source suites and local phoneC4 results are
  separate evidence, not newly executed on this report's proof-only index.

## Reproduction outline and read-only evidence check

On an independently owned host, select the latest official separate beta
package (stable only if no beta), use the actual SDK Registry install/update
and its ordinary verification/consent policy, pair the matching public host
contract, create only synthetic content through supported APIs/panels, then
exercise the seven transitions and anonymous HTTPS checks above. Inspect state
before mutations; back up normally before an actual upgrade. This repository
does not include private operating configuration or credentials.

For this packet's offline summary/media consistency only:

```sh
node --test proof/store-beta3-preview-20261030/verify.test.mjs
```

Those tests are not replays of CMS mutations/browser journeys and not product
or release qualification. Earlier wrong stable-only selection claims remain
explicitly superseded by the [Registry erratum](../registry-beta-selection-20261030/PROOF.md),
not silently rewritten.205/206/217 remain closed/deferred. No new Commerce
source repair or upstream PR is claimed by this checkpoint.
