# Own installed-beta product media integration

This is **host integration evidence, not a Commerce bug fix or upstream PR**.
Commerce's existing media contract and documented host mapping worked. Official
installed Registry packages remain Commerce0.7.0-beta.3 /Payments0.5.0-beta.1;
terminal stable/beta discovery was checked again before this exercise. No
Registry install/update, processor setup, grant, charge or checkout was attempted.

## Actual supported flow

1. Generated an original **synthetic notebook illustration**, not a product
   photograph, using the included standard-library Python source. PNG900×600,
   4795bytes, SHA256 `b6834e74507418d107e08ebd9f4c7797abe04a5d09cff2308ba01a631746ce30`.
2. One authenticated SDK Media Library upload returned ready, correct MIME,
   dimensions, alt and caption. No file/metadata/database row was injected.
3. One actual mounted **Product image & gallery** → **Choose image** →
   **Use workshop-notebook-illustration.png** action selected it. Actual beta
   public projection returned the media ID, canonical alt and dimensions;
   authoritative price stayed USD1200. No price/stock/publication change.
4. The host resolves only referenced public images using the documented
   `handleMediaGet(await getDb(), id)` and `getPublicMediaUrl(storageKey)` APIs.
   Anonymous middleware does not expose the full authenticated media handler
   set on locals; no fabricated plugin UI claims or secret lookup was used.
5. Own read-only proxy permits GET/HEAD for **only this reviewed synthetic PNG's
   exact public-file URL**, not a media prefix. Admin/library/preview/arbitrary
   transform routes and mutations remain denied. Production proxy configuration
   and raw Media Library/admin DTOs are deliberately NOT published here.

The first bootstrap using Playwright APIRequest returned404 BEFORE any assignment
marker or write. It did not use the browser's loopback DNS mapping. The corrected
flow used actual own-origin browser fetch/navigation; the own-site credential
never left that origin. The failed script remains preserved privately.

## Own source / validation / failures retained

Own source **b59cfe9c616373f53a8940987c88c0dbdf479586** adds the host mapper,
18offline tests, original image generator and SSR presentation. The four consumer
copies here are byte-identical; no production configuration is copied.

An intermediate staged source67d assumed a full anonymous locals media handler;
source inspection corrected that before deployment. The first built39ac then
failed public SSR because the own Astro config has no top-level `site`, and the
caller dereferenced `Astro.site.href`. Its catalog-unavailable HTML is retained
privately. The source now uses `Astro.site?.href ?? Astro.url.origin`. The fixed
build and real anonymous image rendering were verified, not inferred from mocked
mapper tests. These are OWN host integration mistakes, not Commerce defects.

- **69own offline tests** passed, including18new mapping cases and the existing
  checkout/recovery/selector source checks. Unknown media/errors yield a decorative
  fallback; admin URLs, external origins, credentials and query/hash URLs reject.
- Fixed own Astro build and natural production/Caddy restoration succeeded.
  Installed backend hashes remain `a630ca239b3573cd5943cb430fb8e26702c946ba6d7c38438fcc86ac01c98f92`
  and `e3aed0a9dfaa06429f664a482d79ed797321efb9fb214ff4a25527ba10df4686`.
- Actual public HTTPS **desktop1440×1000 and phone390×844** both decode the real
  PNG900×600, show canonical alt/price and have no pageerrors/horizontal overflow.
  The driver verified public, non-loopback ingress, PNG content hash and GET/HEAD.
- **7negative cases**: POST/PUT/DELETE of that exact file, media library, another
  file, admin preview and arbitrary `/_image` transform all404. Existing18public
  boundary probes also pass. No broad media/image endpoint was opened.
- A foreground old basket-driver attempt was terminated by a25s TOOL deadline,
  before its normal test deadline: it is NOT a pass or a naturally completed test.
  Its independent systemd rerun ALSO FAILED naturally at the unchanged30s
  response wait11:23. Thus there is NO new basket/readiness browser pass in this
  packet. No timeout/assertion or browser security relaxation was made. Earlier
  checkout transport failures are not explained by this image work.

Reproduce offline mapping tests after normal checkout prerequisites:
```sh
node --test proof/store-media-preview-20261030/consumer/catalog-image.test.mjs
python3 proof/store-media-preview-20261030/consumer/tools/notebook-illustration.py /tmp/own-notebook.png
sha256sum /tmp/own-notebook.png
```

This source snapshot is not a complete deployable store: runtime configuration,
credentials and SDK-owned data are excluded. No new Commerce core/build/canonical
release/security/device/provider-payment gate is claimed. The preview remains
read-only; legitimate TEST setup prerequisites are tracked separately in222.
