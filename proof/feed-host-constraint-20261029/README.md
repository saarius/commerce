# Low-stock feed proof: current public-route limitation

## Disposition

Follow-up to [PR205's real-host proof request](https://github.com/dinkuskit/commerce/pull/205#issuecomment-6503744764).
**This does not satisfy the requested positive low-stock proof or clear the
merge gate.** No introduced mapper defect was found by review, but the needed
public input could not legitimately be produced in the current mounted v1 path.
No Inventory feature, public projection override or admission bypass was added.

The original low-stock regression remains valid for a caller that supplies
canonical low-stock facts. That conditional helper contract is different from
an affected, currently supported public-catalog-to-feed store path. No affected
store or external channel ingestion is established here. The maintainer decides
whether to defer this future-facing guard or review it under that narrower scope.

## Exact versions and source

Registry discovery was checked on2026-10-29, not inferred from GitHub tags or
npm. The approved public listing returned eight stable Commerce releases,
latest0.6.0, without a continuation. A complete publisher release-record scan
(two pages,47 total records examined, only Commerce metadata retained) found
the same eight versions and **no beta**, completed18:09:58UTC. Thus current
stable0.6.0 was selected. See [registry-selection.json](registry-selection.json)
for endpoints, dates, package CID, checksum and exact environment.

The official Registry package was downloaded from its record-scoped approved
cache. Its51783-byte gzip matched the size and multihash in the observed release
metadata, using the pinned SDK verifier. Only `backend.js` and `manifest.json`
were extracted. This is **not full SDK Registry installation, independent
provenance-signature verification or deployed-store qualification**.

| Artifact | Identity | Bytes / headroom | SHA256 |
| --- | --- | ---: | --- |
| Downloaded Registry backend | Official0.6.0 |131050 /22|`f292f09c1c360f828a0c96614fd69342327b23374150088c6c151ff1b61ed471`|
| Fresh source backend | Main `19b25b2878803f85db94c6c4853df1d7d1e4f448` |131044 /28|`dd8e6018be154d4f65002d46340dee47fe521f85f029cee2f1571deaf46c38f9`|

Both manifests say0.6.0; **their artifacts differ**. A version string alone
must not be used as artifact identity. Main19b includes the readiness repair
merged by the maintainer in207, not by this contributor.

Host mapper comparison: before=`19b25b2`, proposed=`efec42c4e2a73b29d5d434529c575c1efed2ff35`.
The mapper and its direct money formatter match released source
`7b9923d8dfd3bc83513efe5ac80cff0bd6656e12`; the full structured-data library is
not claimed identical (an unrelated empty validation block was removed).
The two mapper bundles use the same unchanged source dependencies. The proposed
mapper is compiled separately from that immutable Git blob; no unmerged fix is
silently applied to either backend.

## Setup and honest scope

[probe.mjs](probe.mjs) starts a **loopback HTTP route harness**, not a complete
Astro/EmDash CMS installation:

1. Real TCP requests reach a Node HTTP gateway.
2. The gateway invokes the actual downloaded/source backend in EmDash1.2.0's
   `WorkerdSandboxRunner`0.9.3, pinned workerd1.20260826.1.
3. The real SDK repositories/bridge use separate on-disk SQLite files. Synthetic
   products are created, priced and put on sale through actual product-panel
   and sale handlers, rather than constructing public product DTOs.
4. Public list/item handlers return their own projection. Feed HTTP handlers
   fetch that item over TCP, retain its availability unchanged, and apply each
   host mapper with real saved feed opt-ins and synthetic host title/URL content.
5. The published manifest, plugin identity, allowed hosts and capabilities are
   preserved. No DNS rewrite, Inventory service, credential or outbound service
   is used; both runs observe zero external transport calls.

The gateway supplies synthetic host/editor/user context directly, as the
fixture does. It does **not** test CMS authentication, real page publication,
installation/update migrations, Inventory integration or external accounts.
All data/content is synthetic. Calling this an installed or production store,
or renaming its output as positive low-stock proof, would be incorrect.

The final case deliberately inserts a **legacy managed-row diagnostic**, with
an unbound synthetic SKU and stale manual in-stock record. This is not a
legitimate configured Inventory installation or five-unit stock measurement.
No quantity or public low-stock value is injected. Its purpose is only to check
the actual public handler's fail-closed answer without silent manual fallback.

## Observed HTTP results

The twelve checks are six cases on each backend. Captured structured results
and probe-source SHA256 are in [observations.json](observations.json). In every
case the main and proposed mappers produced the **same** HTTP feed values:

| Operation / diagnostic | Actual public status | Google | Meta |
| --- | --- | --- | --- |
| Manual In stock |`in-stock`|in stock|in stock|
| Manual Out of stock |`out-of-stock`|out of stock|out of stock|
| UI `on-backorder` |`available-on-backorder`|backorder|available for order|
| Submit manual `low-stock` |Refused; prior `in-stock` preserved|in stock|in stock|
| Submit `manageStock:true` |Refused; prior `in-stock` preserved|in stock|in stock|
| Explicit legacy managed-row diagnostic |`availability-unavailable`|out of stock|out of stock|

Both artifacts return these refusal messages:

```text
Choose In stock, Out of stock, or On backorder.
Manage stock is coming soon and cannot be turned on.
```

The run ends:

```text
diagnostic_checks_exit=0 cases=12 legitimate_public_low_stock=0 positive_proof_gate=NOT_SATISFIED
```

These are passing **constraint/compatibility diagnostics**, not twelve tests
showing that205 repairs a real host's low-stock feed. No actual public
`low-stock` value was observed, so no honest before/after difference can be
reported for that state in this setup.

## Why this is a current boundary, not a new feature repair

At pinned main19b:

- [`projectPublicCatalogProduct`](https://github.com/dinkuskit/commerce/blob/19b25b2878803f85db94c6c4853df1d7d1e4f448/src/features/catalog/public.ts)
  calls `resolveStorefrontAvailability(storage,input)` **without** provider
  execution. This is also the shared projector used by native public routes.
- [`resolveStorefrontAvailability`](https://github.com/dinkuskit/commerce/blob/19b25b2878803f85db94c6c4853df1d7d1e4f448/src/features/storefront-availability/resolve.ts)
  explicitly returns unavailable for managed products in the Registry build.
  Outside Registry, managed resolution without a provider still fails closed.
- Manual availability has only in-stock/out-of-stock/backorder. Native local
  stock admission is a trusted loopback development contract, not a mounted
  Registry Inventory integration or a provider wired into the public projector.
- [The v1 Inventory boundary](https://github.com/dinkuskit/commerce/blob/19b25b2878803f85db94c6c4853df1d7d1e4f448/docs/implementation/v1-inventory-unavailable.md)
  intentionally keeps mounted tracking unavailable and preserves future kernels.

The native point is source inspection, **not a native-host runtime run** in this
proof. A direct exported resolver plus injected provider can produce low-stock;
the original regression exercises that future contract. It does not establish
that the mounted public route currently supplies it. Do not expand Inventory,
add an alternate stock ledger, fabricate an input or reopen the lock just to
make a requested screenshot/transcript possible.

## Reproduction

Node24.22.0/Linux and the checkout's locked dependencies/native workerd are
required. Work in this proof branch/commit, whose application tree matches19b,
with the listed Git objects available. Rebuild before loading source artifacts:

```sh
npm run build
work=$(mktemp -d /tmp/commerce-feed-proof.XXXXXX)
mkdir "$work/official"
curl --fail --location --output "$work/official/package.tgz" \
  'https://cdn.em-da.sh/r/did:plc:ekk4pjmkh3k3ql2kfoex3qt4/com.emdashcms.experimental.package.release/dinkus-commerce:0.6.0/bafyreigfp6327jdw2sqotlojpz5a5tlzypyd6jpm4jtboeoa5tmc2pamuq/bafkreihprbxkbz6ovzfdukjsnb4zlkfvpd7pojr4qjkijxdhdso6vamnbq'
printf '%s  %s\n' \
  ef886ea0e7ceae4a3a2932687995a8b578fef7263c825484dc671c9dea818d0c \
  "$work/official/package.tgz" | sha256sum --check -
tar -xzf "$work/official/package.tgz" -C "$work/official" backend.js manifest.json
node proof/feed-host-constraint-20261029/probe.mjs "$work/official" "$work/result"
```

Output directory must be fresh. Do not commit its SQLite files, bundles or raw
state. The script checks backend bytes/hashes, unmodified manifests, application
identity and all outcomes; cleanup failures are not hidden and no force-exit or
retry is used. This is a **dated pinned reproduction**, not permission to call
0.6.0 the latest forever. Before new installed-plugin qualification refresh the
official Registry, prefer its latest available beta, otherwise stable, and
update scope/identities if they changed. No maintainer store is used.

## Attempts and limits

A first prototype stopped before runtime because it overclaimed whole-library
identity with released source; the unused empty validator-block difference was
then identified and the identity claim narrowed to the actual mapper/formatter.
A second prototype failed after two official-backend controls because it sent
public `available-on-backorder` as a UI input; the real radio value is
`on-backorder`. Both failed runs are retained locally and excluded from the
passing aggregate. The initial encoded-colon CDN path also returned400; the
SDK's raw record-scoped path succeeded and passed checksum validation. No
product assertion was weakened or runtime admission changed.

The portable on-disk probe then completed all twelve checks with fresh output.
No real Inventory/Payments, processor charge, external feed ingestion,
installed-release journey, browser, mobile, full-v1 or security qualification.
No product behavior change, release, merge or deployment is made by this proof.
**Docs: not applicable** to the shop-owner article; no package changeset.
