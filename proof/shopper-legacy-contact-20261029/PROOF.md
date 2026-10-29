# Prevent unreadable shopper-profile seeds from legacy order contact

## Review base and scope

Final source/test commit: `a1ea2473bb0042edfefe68f01aaadc70b9f0f291`.
This contribution is **stacked on** settings-guidance commit
`9b0284dffa76461be17fbb29c218bf2ce920fa9c`, which itself includes the scoped
DOMPurify update `6ceb330902264d146a954b6ab7fb376ac7cebb55`.
Compare against the settings-guidance branch, not stale fork main, to review
only this repair. No manifest or lockfile changes are added here.

The existing verified `shopper-accounts-v1-20261020` decision requires a validated
saved delivery address and normalized phone. It already links kept orders by
verified email without rewriting their paid snapshots. This repair implements
that boundary for historical contact data; no product decision is reopened.

## Reproduced failure

Orders intentionally supports previously kept contact objects that the modern
paid-order receiver would reject. Its shopper projection previously passed
through blank string phones and malformed delivery values. The existing
account seeder could then persist a customer record that its own subsequent
validation rejected:

1. Keep a legacy order with the shopper's email and, for example, a blank phone
   or an incomplete delivery address.
2. Complete ordinary email-code sign-in. It succeeds and saves the seed.
3. Read the saved profile on the very next authenticated request.
4. The response is `ok: false`, error code **`UNAVAILABLE`**. The newly seeded
   record cannot pass `isValidCustomerRecord`.

This is a conditional legacy-data correctness problem, **not demonstrated
shopper forgery, account takeover or authentication bypass**. The modern
receiver rejects every malformed/noncanonical paid snapshot used by the new
tests. They are inserted directly only to model the explicitly supported
previously-kept-copy path. No affected production store was established.

### Before/after evidence

On a freshly rebuilt settings-guidance parent:

| Test selection | Before | Repaired |
| --- | --- | --- |
| Entire shopper-accounts unit file | **10 pass / 8 fail** (18 tests) | **18/18 pass** |
| Entire shopper-account workerd integration module | **2 pass / 2 fail** | **4/4 pass** |

No skips in these runs. Of the eight unit failures, five demonstrate the
next-read `UNAVAILABLE` failure; three demonstrate absent normalization of
control/oversized phones or otherwise usable noncanonical contact. Existing
cases and new nontext-phone, corrected-delivery, historical-email-formatting
and already-damaged-customer controls pass on the original implementation.

The two new integration cases independently reproduce blank-phone and malformed-
delivery seeding through the actual compiled backend, workerd, stable Registry
runtime namespace, SDK `PluginStorageRepository` and SQLite. Both originally
succeed at sign-in and fail their next profile read. No alternate storage
implementation or mocked profile result is used in those cases.

## Repair

`projectShopperOrder` now runs phone and effective delivery through the existing
shared contact normalizers **independently**. Absent/invalid fields project as
`null`; usable fields are normalized before they can become defaults. Thus a
bad address does not suppress a good phone, or vice versa. Phone checking uses
the same placeholder-email technique as account profile editing, so historical
email formatting cannot suppress a usable phone. Verified-email linking and
session admission remain unchanged.

The existing seeder can skip a null field and use an older usable field. The
owner's corrected delivery still wins over the frozen checkout copy. Saved or
explicitly cleared customer fields remain authoritative; every new case
exercises durable clearing. Tests compare the **entire original order record**
after the account operations: paid snapshot, correction and order revision are
unchanged.

This uses structural historical address normalization, **not new-checkout
eligibility**. Optional or unrestricted historical US regions remain accepted;
current shipping-country settings are not retroactively applied. No OTP,
origin/session/role check, storage schema, order status or provider behavior
changes. This does not verify phone ownership or introduce a stricter phone
number-format policy.

### Deliberate limit: existing damaged customer records

Already malformed **customer** records still fail closed. A dedicated control
corrupts a synthetic saved record, then verifies both GET and a clearing POST
remain `UNAVAILABLE` and do not silently rewrite it. This repair prevents new
invalid seeds from legacy **orders**; it is not a migration or automatic repair
of profiles already poisoned by the old behavior. Such repair needs an explicit
owner-reviewed data-recovery scope.

## Verification

Environment: Node **24.22.0**, Linux x64; pinned EmDash **1.2.0** and initialized
native SQLite/workerd dependencies. Installed DOMPurify **3.4.17** matches the
stacked parent's lock. Remaining dependency findings are not cleared here.

| Check | Result |
| --- | --- |
| Customer and Orders feature suites | **63/63 pass**, no skips |
| Shopper account compiled-workerd module | **4/4 pass**, no skips |
| Complete unit/workflow suite | **723/723 pass**, no skips |
| Complete SQLite/D1 integration suite | **108/108 pass**, no skips |
| Typecheck, repository/feature audits, ledger validation, diff check | **Pass** |

Commands, run sequentially:

```sh
npm run build
node --test tests/features/customers/shopper-accounts.test.mjs tests/features/orders/*.test.mjs
node --test tests/integration/shopper-accounts-runtime-cases.mjs
npm test
npm run test:integration
npm run typecheck
npm run audit:repo
./scripts/grilltrack --project . validate
git diff --check
```

To repeat the baseline, copy the current regression files into a separate
checkout of parent `9b0284d`, install its locked dependencies, and rebuild before
running the two test selections. Do not test the parent against repaired `dist`.

## Registry byte budget and parent requirement

| Build | Bytes | Headroom below 131072 | SHA-256 |
| --- | ---: | ---: | --- |
| Settings-guidance parent | 130996 | 76 | `914488cf78f9f5a16d415fce130af768f9f3acb526e86bdc4f52353770784cbe` |
| Repaired stacked build | **131039** | **33** | `1dc0187e682211541ed6426190068e843da502817307e3f4a17dcbcb9a8275d8` |

The final change adds **43 backend bytes** over its tested parent. An earlier
independent upstream-based prototype exceeded the SDK cap (131079 bytes), and
that build was correctly rejected, not counted as passing proof. The published
settings-guidance repair frees 37 bytes while correcting an unrelated stale
message; stacking on that reviewed parent avoids weakening either validation
or the cap. **Do not assume this repair fits standalone upstream's 39-byte
headroom, or combine other contribution branches without rebuilding.** There
is no bundle-limit, storage declaration or route change.

An intermediate prototype also coupled phone validation to legacy email syntax.
The added email-formatting control caught that regression before publication;
the final implementation validates phone independently, as account edits do.
Interrupted checks and over-budget prototype builds are not final proof.

## Qualification limits

All data is synthetic. Workerd email is captured by a local sink, not delivered
by SMTP. The Registry-named runtime is a local compiled-backend fixture, not an
external Registry installation, production upgrade or deployed storefront. No
browser UI, real customer data, payment, stock, shipping, Connect, release,
merge, deployment or production mutation is involved. No raw logs, tokens,
databases, traces, cookies or credentials are included in this proof.
