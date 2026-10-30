# Upstream submissions — current disposition

Snapshot2026-10-30: upstream main **7740b4c14e614740c454ed67aeb6e8eaac49db6d**;
all seven accepted contributions were **maintainer merges**. No own upstream
PR is open. See [README](README.md) for the current table and mandatory Registry
selection erratum. This is a fork-only coordination checkpoint, not a PR or
merge/release instruction.

## Most recent:220 merged, owner update preserved

[#220 phone-sized variant price-save coverage](https://github.com/dinkuskit/commerce/pull/220)
was merged02:06:38UTC as7740b4c, head
**8160fbeb92af20eab0b3447823a7702fb5e8dfa8**. The final reviewer ready-for-
maintainer assessment was edited01:46:37 and named that head; review evidence
is not merge authority. Actual REST/fetch merge identity is independently
checked.

The maintainer had independently used GitHub Update branch while qualification
was running. The parallel local merge
**c4e5d415dea9770f2703478f2c59568006c549db** and owner8160 have exact parents
`d14f8678bbc366e92907a6b5862ce00d09c28141 fd74eaebc7b4e1053394519d88d51509c014e29b`
and tree **2c90c06e4bb37fa04b39eccdd248256aa01c7559**. LocalC4 passed exact
852/852unit/workflow +110/110integration +native-variant2/2 and sandbox2/2,
all gates01:46:52. **Not exact8160 execution**. LocalC4 was preserved separately;
no force push, owner merge replacement or unnecessary source change.

The earlier [source-bound report](https://github.com/saarius/commerce/blob/d14f8678bbc366e92907a6b5862ce00d09c28141/proof/variant-phone-current-20261030/PROOF.md)
keeps its original da008/d14 captures and scope. The green parent established a
coverage gap, not a new product failure. Phone save is28.00→29→canonical2900→
reload29.00, while an earlier native paid-order/payment stays2800. Phone-sized
desktop Chromium/mouse, not physical touch/device/Safari. Zero runtime bytes.

## Other accepted contributions

| PR | Maintainer merge | Final focused source qualification recorded previously |
|---|---|---|
| [207](https://github.com/dinkuskit/commerce/pull/207) | 19b25b2878803f85db94c6c4853df1d7d1e4f448 | 756/110; malformed payment readiness; maintainer supplied additional TCP proof |
| [209](https://github.com/dinkuskit/commerce/pull/209) | d61d2d23825befe023333adcdc41683fcf50a6e0 | 798/110 on3fa27c; invalid CLI profile refuses before HTTP |
| [210](https://github.com/dinkuskit/commerce/pull/210) | 00fb693a118822f921c831564bc44ca0aa2ffd72 | 814/110 on2e648bb; body consumption transport classification |
| [211](https://github.com/dinkuskit/commerce/pull/211) | 75a79e7237b854096bca18919e8d0e491b01371b | 801/110 +fresh SDK/native settings forms onfd51074 |
| [216](https://github.com/dinkuskit/commerce/pull/216) | de1481a413b91a2ba4677f3ae9b1e3f5085d776f | 835/110 +14focused on576e0d9; dispatched SIGINT outcome unknown |
| [218](https://github.com/dinkuskit/commerce/pull/218) | fd74eaebc7b4e1053394519d88d51509c014e29b | 852/110 +four actual browser cases on3bed871; actual empty changeset checker and CI green |

Counts are exact named-source historical results, NOT a fresh aggregate suite.
All complete failure/control/reproduction/byte-budget records remain in the
[previous immutable submissions packet](https://github.com/saarius/commerce/blob/7af72af667012fb67e98579e185aea49a9b8c2b2/proof/contribution-review-20261029/SUBMISSIONS.md).

## Deferred and retained findings

- [205](https://github.com/dinkuskit/commerce/pull/205): no legitimate supported
  public low-stock state. Existing synthetic guard/source proof retained;
  unsupported-state refusals are a boundary, not positive provider proof.
- [206](https://github.com/dinkuskit/commerce/pull/206): no actual NaN helper
  caller. Keep closed unless a real caller makes the change relevant.
- [217](https://github.com/dinkuskit/commerce/pull/217): historical producer and
  repair proof are real, but there is NO actual affected old store/data. Owner
  rejects53bytes of nonexistent compatibility for v1. Retain c49, do not create
  old data or optimize bytes to manufacture relevance.
- Catalog preview race audit: eight deterministic counterexamples/two controls
  contradict a stronger atomic guarantee. No runtime repair. A transaction/
  CAS/media/retry protocol requires its own owner-reviewed decision.
- DOMPurify: old isolated3.4.17 proposal is not current remediation or actual
  EmDash exploitation/host clearance. Repo lock stays3.4.16; historical audit
  counts are not a fresh security audit.

## Published-release and own-store evidence

The beta channel is **dinkus-commerce-beta**, not prerelease strings under the
stable package. Old0.6.0 absence-of-beta claims were wrong and are explicitly
withdrawn [publicly on211, also205](https://github.com/dinkuskit/commerce/pull/211#issuecomment-6512784886).
Frozen exact0.6 tests remain stable controls. [Corrected scanner/beta.2 report](../registry-beta-selection-20261030/PROOF.md).

Beta.3 was indexed02:16:55 after an02:11 beta.2 scan; detected03:00 and actually
updated through SDK Registry HTTP200 around03:04:56. Current
[beta.3 host/HTTPS preview report](../store-beta3-preview-20261030/PROOF.md)
records7host checks,18public boundary probes,2Chromium basket/readiness cases,
clean resource shutdown/restart and postchecks exact latest-release discovery.
Backend130676/396/a630ca23 matches accepted main7740. This is NOT a full release
gate, independent security/provenance certification or payment settlement.

The agent's synthetic https://saarius.com is a read-only preview; public
mutations/admin/dev paths are denied. Actual purchase checkout remains
unavailable pending legitimate merchant account/Connect/provider setup. No fake
binding/provider, Inventory fallback, charge/order/shipment or maintainer-store
operation. Accepted208/211 are now in beta.3; do not file duplicate fixes for
older beta.2 behavior. No new Commerce product bug is claimed by this report.

## Preservation and scope

All twelve original contribution refs, baseline04dcf5e, fork main79e19af and
prior index refs are preserved. The original manifest/verifier/test bytes remain
unchanged fromf12. The new index uses accepted7740 application code and adds
ONLY proof. It does not introduce deferred repairs, import companion history,
modify the ledger or authorize merges/releases. Own production configuration,
private credentials/raw logs/DBs/customer data are not included.
