# Independent consumer: retained capability is recovery-only

**Own client bug, not a Commerce behavior regression.** Commerce deliberately
supports a fresh explicit retry after authoritative terminal release. This
independent consumer promises NOT to provide that retry UI. Its earlier
[8cfa snapshot](../operator-capability-contract-20261030/consumer/src/lib/guest-checkout.mjs)
incorrectly reopened submission from a cached `requested:false` record, and did
not lock submission when a manual status check discovered an existing attempt.
The frozen earlier packets are preserved as counterexamples, not rewritten.

## Reproduction and fix

A pre-start session-storage record can be copied into another tab before the
original tab starts. It therefore cannot prove that its capability is unused.
The8 offline source tests use **real Commerce guest handlers, public projections,
a disposable SQLite database and the repository's explicitly synthetic payment
port**. The copy can observe `released-retry`, then the old client dispatches
another start: native Commerce legitimately creates a second **synthetic**
session. This demonstrates the consumer's unintended retry, not a real provider
operation or a Commerce orchestration defect. Same-page observations of pending,
released and paid attempts also failed to lock the old client.

- Before: **2 control passes /6 failures /exit1**. The copied-tab case observes
  two synthetic sessions where the safety assertion requires one.
- After: **8/8 pass**. Newly prepared in-memory clients still start once; a
  no-attempt status in that same instance does not invent a previous dispatch.
- All valid retained records now reopen as status-only, even if `requested` is
  false. This is deliberately conservative: reloading even an unused prepared
  capability does NOT resume its form in this first version.
- Observing a non-null attempt locks the original instance before attempting to
  persist the marker. Storage failure cannot reopen submission, including after
  reload. Manual status remains available; no automatic retry/reset is added.
- No contact details are persisted, no provider fallback or prices are supplied
  by the client, and explicit TEST readiness remains required before prepare
  and first start. The nested-capability correction remains intact.

Own source **9f42d63df5d96a9f69886340dbe4e52c73e049e1**, direct child of8cfa.
The three consumer source/test copies are byte-identical. Test adaptations only
change import paths. The older concurrency fixture restored a prepared record;
that now correctly blocks. It was changed to exercise concurrency on a freshly
prepared SAME instance, still asserting one actual start dispatch. The initial
41/42 regression result is retained locally, not relabeled as a pass.

```sh
npm run build
node --test proof/operator-recovery-only-20261030/consumer/guest-checkout.test.mjs \
  proof/operator-recovery-only-20261030/recovery-source.test.mjs \
  proof/operator-recovery-only-20261030/capability-source.test.mjs
# Expected exit1, 6 failures and 2 controls. Do NOT report this as a pass:
CONSUMER_SOURCE=../operator-capability-contract-20261030/consumer/src/lib/guest-checkout.mjs \
  node --test proof/operator-recovery-only-20261030/recovery-source.test.mjs
```

The three-file command is43 offline tests. With the existing8 Registry-selector
tests, the own-client suite is **51/51**. This is NOT installed checkout success,
a provider-paid TEST order, a canonical release gate or independent security
verification. In particular, synthetic `paid` inputs certify no real payment.

## Build/deployment scope

The bounded sequential workflow rebuilt Commerce on exact **a3e87b721669cf6f0c5e8573b44e824b94a5404b**
(runtime source unchanged from accepted main **7740b4c14e614740c454ed67aeb6e8eaac49db6d**),
passed **852 core tests**, typecheck, repository/feature audits, ledger and
whitespace checks, then51own tests and the own Astro build. No full storefront/
core/full canonical gate is claimed. PR221's additional documentation test is
not in this checkout, hence852 rather than its853. The workflow stopped naturally,
restored the original uninstrumented production service and Caddy successfully;
private rollback/build backups are retained and must never be restored blindly.

Installed packages remain official Registry **Commerce0.7.0-beta.3** and
**Payments0.5.0-beta.1**, reselected through terminal stable/beta pagination before
testing. No Registry update, grant, processor setup, card, charge or installed
prepare/start was performed for this review. Published backend hashes remain
`a630ca239b3573cd5943cb430fb8e26702c946ba6d7c38438fcc86ac01c98f92` and
`e3aed0a9dfaa06429f664a482d79ed797321efb9fb214ff4a25527ba10df4686`.

## Actual unavailable UI versus offline fixtures

Before deployment, the actual installed unavailable UI with a **synthetic,
browser-only pre-start record** left the form enabled. `before-browser.json`
and `before-unrequested.png` record that failing assertion. No capability was
minted on the server and no guest POST was sent; the token-shaped browser test
record was not a provider/binding/readiness injection.

After deployment, the first10:31 and later10:33 browser runs BOTH FAILED their
unchanged30s unavailable-copy wait. A separate normal public GET returned
200/unavailable in179ms10:32; that is not browser qualification. A passive8s
observation10:34 subsequently saw actual200/unavailable, disabled fieldset,
enabled manual status and no page errors. No cause of the earlier stalls is
established. No browser permission, transport flag, timeout or assertion was
changed. See the appended final browser disposition below; earlier failures
remain failures irrespective of any later result.

### Later unchanged-driver result —10:35UTC

The exact same driver then passed on uninstrumented production at10:35:34:
**2 recovery-only cases** (`requested:false/true` synthetic browser records),
actual200/unavailable, fieldset AND all controls disabled, begin disabled,
manual status enabled, zero guestPOSTs/pageerrors/overflow. Safe after JSON and
phone-sized captures are included. The existing empty-tab driver also passed
**2 private viewports**, zero guestPOSTs/capabilities/errors/overflow, followed
by18public boundary probes,2public HTTPS catalog/basket/readiness cases and3
public private-checkout denials. Captures manually reviewed with this packet.
This is later/warm qualification, NOT a cold-start deadline or an explanation
for the two failures. No mode/provider/payment/full-release claim follows.

This packet is fork-only review evidence, not an upstream behavior PR. PR221
and supported-TEST-setup question222 are separate, still maintainer-owned.
