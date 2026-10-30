# Independent operator TEST checkout consumer — bounded fail-closed proof

This is a **fork-only consumer example and review checkpoint**, not a Commerce
source fix, release, upstream PR, working purchase store or provider qualification.
The independent preview is https://saarius.com; its public interface stays read-only.
The experimental `/checkout` page is operator-local and returns404 publicly.

## Exact software and observations

- Accepted Commerce main/tagv0.7.0-beta.3: `7740b4c14e614740c454ed67aeb6e8eaac49db6d`.
- Actually installed official `dinkus-commerce-beta@0.7.0-beta.3`, backend130676bytes,
  SHA256 `a630ca239b3573cd5943cb430fb8e26702c946ba6d7c38438fcc86ac01c98f92`.
- Actually installed official `dinkus-payments-beta@0.5.0-beta.1`, backend42678bytes,
  SHA256 `e3aed0a9dfaa06429f664a482d79ed797321efb9fb214ff4a25527ba10df4686`.
  Latest both-channel Registry lookups06:17 still selected these betas, not stable
  releases0.6.0/0.4.0. SDK verification/provenance is not independent security certification.
- Own consumer source commit `f7beadc` (local repository, no remote). Four review
  copies below are byte-identical to that commit and are bound by `manifest.json`.
  Build succeeded05:52, before that content-identical commit. Offline tests and
  the real unavailable browser checks were subsequently executed on exactf7beadc.
- Real anonymous operator-local HTTPS Chromium checks **2/2 at06:22:36UTC**:
  1440×1100 and390×844, real SDK readiness200/exact versioned `unavailable` body;
  native disabled fieldset and every descendant control disabled; begin/check
  disabled, one explicit physical variant member, hidden payment link, no horizontal
  overflow/page errors, **zero guest POSTs and zero browser capabilities**.
  `browser-result.json` is a safe result summary, not raw SDK/network traffic.
  Both captures manually reviewed06:28. No authentication injection, provider
  fixture, binding/stock fallback, secret override, HAR or trace was used.
- **23 offline consumer protocol tests +8 existing Registry selector tests**
  passed06:22. The23 tests can be rerun independently here:

  ```sh
  node --test proof/operator-test-checkout-20261030/consumer/guest-checkout.test.mjs
  node --test proof/operator-test-checkout-20261030/verify.test.mjs
  ```

The page source copies are review material, not a standalone deployment: own
`store-config.json`, Astro configuration, dependencies, credentials and proxy
configuration are intentionally not included. They are not Commerce package
exports or a general digital/simple-product storefront. The page lists explicit
physical variant MEMBER IDs, never treats the display parent ID as a buyable SKU.

## Consumer behavior and limits

`consumer/src/lib/guest-checkout.mjs` checks the versioned readiness contract and
requires literal mode `test` before BOTH prepare and start. The backend remains
authoritative for contact admission, availability, prices, totals and payment
mode. Readiness is advisory; the authoritative start can still refuse it.
No client amount/provider/binding is submitted. Only canonical item IDs and
quantities, plus contact, enter the start request.

The capability stays in tab-scoped session storage, never a URL or log; contact
is not stored there. An uncertain start is marked BEFORE dispatch and cannot be
automatically repeated after timeout, body-read failure or reload. Manual status
uses the retained capability. There is no automatic retry/poll/reset or released
attempt retry UI. Navigation allows only HTTPS `checkout.stripe.com` TEST session
paths, not live sessions or arbitrary URLs. This does not independently certify
Stripe or erase server-side mode/race requirements.

**Prepare/start/status happy paths are offline fixtures only in this packet.**
No capability was minted, checkout submitted, processor connected, test card
entered, paid order recorded, charge made or shipment requested by these browser
checks. Do not promote fixture responses or these unavailable checks into a
provider-paid TEST purchase or canonical full release gate. Phone-size desktop
Chromium is not a physical/touch/Safari device test.

## Failures retained and corrected without weakening intent

Earlier browser drivers timed out waiting for readiness; their exact cause was
not established. Subsequent passive diagnostics observed the real endpoint.
Adding immediate promise rejection handling and private failure diagnostics
exposed the current assertion failure: Playwright control-level `isDisabled()`
on a FIELDSET did not test its native `disabled` property. The assertion now
checks the native property **and effective disabledness of every input/select/
button**, while retaining exact network/body, no-POST/no-capability and viewport
assertions. The observed run failed06:18:59; corrected run passed06:22:36. This
is a harness correction, not a demonstrated Commerce or Payments defect.
Earlier failures are not relabeled passes, nor is the historical timeout cause
claimed to be explained by the fieldset assertion.

## Remaining legitimate setup

Ordinary DinkusKit merchant signup and per-plugin owner Connect approval were
completed through supported flows. The last Payments UI check reported no
processor account connected; that grant is not Stripe readiness. Merchant
checkout is configured TEST, but the processor setup request has no requested-mode
field, so this alone is not proof of onboarding mode. The optional provider
identity action explicitly requires platform-operator approval; **it was not
invoked**, and no allowlist/credential expansion was sought. Business-country
requirements described by Payments remain prerequisites to handle legitimately,
not grounds to invent country/KYC information or claim an observed refusal.
No new core defect/merge request is claimed;205/206/217 remain deferred.

The [prior beta.3 report](../store-beta3-preview-20261030/PROOF.md) ends03:09 and
is not rewritten as these later account/provider/consumer observations. The
[contribution index](../contribution-review-20261029/README.md) preserves previous
proof and maintainer ownership of all seven accepted merges.
