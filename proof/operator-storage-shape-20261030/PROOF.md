# Own recovery-storage parser correction

**Own client bug, not a Commerce contract/security bug or upstream PR.** These
inputs were deliberately synthetic; no malformed production recovery record or
customer incident is asserted. No provider setup, account/grant change, real
capability mint/start, card, charge, paid order or shipping action was attempted.

## Counterexample

Previous own source `b59cfe9c616373f53a8940987c88c0dbdf479586`:

- `if (stored)` treated an existing empty-string entry as no retained recovery,
  permitting replacement preparation rather than failing closed.
- `capabilityPattern.test(record.capability)` coerced arrays/numbers to strings.
  Single/nested arrays containing a token passed; a browser `Headers` object
  likewise converts such a header value to the token. The client could therefore
  issue status from a malformed record despite promising to block corrupt recovery.

`source-contract.test.mjs` uses real Commerce mint/authorization/status handlers,
**memory CAS and a fixed synthetic secret**. There is no Payments port, binding,
provider network or installed readiness override. A fixture `supported/test`
readiness is solely to reach prepare if this consumer permits it. Real browser
HeaderInit conversion is modeled with `new Headers(options.headers)`, not an
invented flattened Commerce response. A valid token's successful authorization
is expected server behavior, NOT an authentication bypass.

Before: **3controls pass /6cases fail /exit1**. The empty-entry case actually
mints a second synthetic native capability; array cases actually authorize
native status. Numeric cases dispatch but cannot authorize a nonexistent token.
After: **9/9 pass**. Missing key, both valid retained requested flags and native
status remain positive controls. No replacement mint/request/record rewrite is
permitted for the six malformed cases. This fixture never starts a checkout.

## Fix and source binding

Own branch `own-store/recovery-storage-shape`, commit
**`307ee1fde1f9356f0f3918f39480b0278d56bac9`**, parentb59. Only `null` means missing
storage; other values must be JSON with an actual string token and boolean flag.
Malformed records remain untouched and `blocked`, without a retained credential.
The UI now explains invalid/unreadable recovery rather than offering an unusable
status instruction. No clearing/reset/migration, contact persistence, implicit
retry, pricing, redirect or provider fallback is added. Every valid retained
record remains status-only, including `requested:false`.

The three consumer copies are byte-identical to that own commit. The earlier
frozen recovery packet's module is byte-identical to b59's prior module; its
source hash is bound in the manifest. Commerce runtime/dependency/ledger source
is unchanged from main7740. This checkpoint contains only own source/test/proof
copies and the review-index append; it is NOT a complete deployable storefront.

**84own checks** passed before the own Astro build:38protocol +8selector
+3nested-capability source +8recovery source +18image +9new storage source.
The stopped-service backup/dist rollback were retained privately; bounded build
and natural production/Caddy restoration succeeded12:42. Both installed official
backend byte hashes stay unchanged. No new core-unit/canonical release/security
qualification is claimed from these own checks.

## Installed-browser evidence — failures are NOT passes

Official installed packages are Commerce0.7.0-beta.3 /Payments0.5.0-beta.1,
confirmed by terminal stable/beta scanning before these UI checks12:38.

- **Before12:39**: actual200/versioned unavailable readiness, synthetic browser-only
  array record, native fieldset/descendant controls disabled but **Check status
  enabled**. The desired-blocking assertion FAILS/exit1, as expected.0guestPOST,
  pageerrors or overflow. No real retained token was inserted or status clicked.
  `before-browser.json` and `before-array.png` bind that narrow counterexample.
- **After12:43**: original driver FAILS30s waiting for unavailable UI. It did not
  complete its actual-response assertions. No successful post-deploy UI gate.
- **Diagnostic12:46–47**: same browser flags, waits, timeout and assertions,
  with failure-only network/DOM metadata capture added, ALSO FAILS30s.
  `after-failed-browser.json` shows request then requestfailed, NO response event.
  Its passive snapshot shows the new warning and native fieldset, Begin and
  Check all disabled. That is NOT completed descendant/response/overflow proof
  and must NOT be relabeled a successful browser gate. No readiness spoofing,
  synthetic status call, timeout inflation, permission grant or protocol change.

These failures resemble earlier unexplained transport failures; no cause or
cold-start guarantee is established. No further blind browser retry was made.
Node HTTP observations or offline tests do not substitute for the failed browser
response gate. Existing frozen packets retain their exact earlier scopes.

## Reproduce offline

```sh
npm run build
node --test \
  proof/operator-storage-shape-20261030/consumer/guest-checkout.test.mjs \
  proof/operator-storage-shape-20261030/source-contract.test.mjs
# 47passes:38protocol +9source. No provider/installed payment qualification.

CONSUMER_SOURCE=../operator-recovery-only-20261030/consumer/src/lib/guest-checkout.mjs \
  node --test proof/operator-storage-shape-20261030/source-contract.test.mjs
# Expected exit1:3controls pass,6fail. Never report this as a passing run.
```

The actual legitimate merchant-country prerequisite remains unchanged; see
[222](https://github.com/dinkuskit/commerce/issues/222). This parser correction
neither connects a processor nor establishes real-server-capability recovery,
canonical Orders TEST markers, payment readiness or release qualification.
