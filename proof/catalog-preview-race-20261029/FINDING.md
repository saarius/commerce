# Catalog preview confirmation is not an atomic write guard

**Status: reproducible concurrency limitation and documentation correction;
no catalog mutation repair is implemented here.**

## Baseline and decision boundary

Investigated upstream main `04dcf5e1ef296cc9ca8d719a11fec731d6961660`, package
`0.6.0`, with Node `v24.22.0` and the unchanged dependency lockfile on Linux.
This contribution is independent of the two earlier fork-only CLI transport
repairs. Both the native and Registry entries call the same `catalogApi`;
this proof exercises that built handler, not an installed runtime.

The owning decision, `catalog-api-20261027`, is locked. It requires a private
catalog route with the panels' checks, and a server-side reread of the preview
before saving. The existing CLI spec **already acknowledges a race window**
between that reread and the write. This is not a claim that the server omitted
the approved reread or that a newly discovered security boundary is broken.

However, the reference article said an agent **never overwrites a change it
did not see**, and CLI help said Commerce saves **only while the product still
matches**. Those stronger statements are not established by the implementation.
This packet supplies executable counterexamples, corrects that overstatement,
and identifies the questions a stronger atomic guarantee would need to settle.
It does not reopen or lock a product decision, change write semantics, or
expand a release. Owner evaluation belongs with the existing decision record.

## Observed result

An authenticated editor/agent can submit a valid `expected` preview code, pass
its server-side check, then overwrite an edit another authorized writer made
after that check. The preview code is not bound to the revision used at commit.

| Injection point | Operation | Result on baseline |
| --- | --- | --- |
| After hash validation, before mutation's root read | prices | Newer `$99.00` replaced with stale request's `$14.00`. |
| Same | weight | Newer `99` oz replaced with `14` oz. |
| Same | feeds | Newer Google Merchant selection replaced with Meta selection. |
| Same | identifiers | Newer Brand replaced with stale Brand. |
| Same | sku | Newer SKU replaced with stale SKU. |
| Same | archive | A newer Archive undone by a stale Restore. |
| After hash validation, before mutation's media read | media | `newer-image` replaced with `stale-image`. |
| Competing commit immediately before original CAS | identifiers | Original CAS loses, then `editProduct` rereads and applies stale Brand. |
| Same (control) | prices | Refused with `COMMAND_CONFLICT`; winning price preserved. |
| Before the hash check (control) | prices | Refused with `COMMAND_CONFLICT`; winning price preserved. |

All seven post-validation writes succeeded; the eighth unsafe case rebased an
identifier edit after a failed CAS. This is a lost-update/confirmation issue,
not a claim that a single catalog aggregate was partially committed. It needs
authorized concurrent writers; no public or unauthenticated access is shown.

## Reproduce

From the repository root:

```sh
npm ci
npm run build
node --test proof/catalog-preview-race-20261029/counterexamples.mjs
```

**Expected baseline result: 10 cases, 2 pass, 8 fail, exit 1.** These are
counterexamples to the *stronger* guard assertion, deliberately outside the
normal `npm test` globs and without an autodiscovered `.test.mjs` filename.
Their failures are the evidence, not a passing product
verification or a repair. A resolved design can adopt/adapt them as regression
coverage. The regular unit suite remains green separately.

The fixture uses the real built `catalogApi` with the repository's synthetic
in-memory storage. Each case computes the actual SHA-256 preview code. A hook
runs a second real API call either before the mutation's second versioned read,
before its media read, or immediately before CAS. The competing call commits
fully before the first proceeds. There are no sleeps, probabilistic races,
fixture credentials, real customer records or provider calls.

Diagnostics record whether the request was refused and whether the winning
record was preserved. The tests require the competing write to commit and
assert the stronger desired refusal/preservation behavior. The selected hook
boundaries describe the pinned implementation: a repair that changes the read
protocol must adapt the hooks so the competitor still runs, rather than treating
an unreached injection point as proof of safety.

## Why it happens

1. [`catalogApi`](https://github.com/dinkuskit/commerce/blob/04dcf5e1ef296cc9ca8d719a11fec731d6961660/src/admin/catalog-api.ts#L37-L41)
   compares `expected` with a projected `get` answer, then dispatches a separate
   mutation. It does not carry the checked catalog revision into that mutation.
2. [`saveProductData`](https://github.com/dinkuskit/commerce/blob/04dcf5e1ef296cc9ca8d719a11fec731d6961660/src/features/catalog/product-state.ts#L60-L72)
   reads its own versioned root. It supports an `expectedRevision`, but the
   catalog API does not derive one from its preview validation. CAS therefore
   protects the mutation's snapshot, not necessarily the preview's snapshot.
3. [`editProduct`](https://github.com/dinkuskit/commerce/blob/04dcf5e1ef296cc9ca8d719a11fec731d6961660/src/features/catalog/product-edit.ts#L13-L26)
   intentionally retries up to four times. Binding only its first read would
   not prevent the post-CAS-retry case. Ordinary unguarded edits may rely on
   those retries; removing them globally is not an evaluated repair.
4. [`saveCatalogItemMedia`](https://github.com/dinkuskit/commerce/blob/04dcf5e1ef296cc9ca8d719a11fec731d6961660/src/features/catalog/media.ts#L135-L150)
   reads and writes a separate collection with `put`/`delete`, not CAS. A
   root-revision guard alone would not bind the media portion of `get`.

The two controls distinguish the preview gap/retry behavior from already-safe
CAS refusal and from the existing precheck, which does reject stale previews.

## Bounded repair questions for the owner

These are recommendations/questions, **not accepted implementation scope**:

- **First reconcile the promise.** If the accepted behavior remains a
  best-effort freshness precheck, keep that explicit in the reference/help.
  If an atomic whole-preview guarantee is required, record its precise scope
  with `catalog-api-20261027` before broadening persistence/protocol work.
- **For catalog-root CAS operations**, bind the validated root revision through
  to commit and refuse rather than rebase preview-bound edits. Prices already
  accept a catalog revision. Verify weight/feed operations, retrying
  identifier/SKU/archive edits, and variant parent/member cases too. Do not
  let a caller-supplied unrelated `productId` or legacy revision replace the
  validated target's revision. This would be a partial repair unless the other
  preview state is covered too.
- **For the whole `get` answer**, settle how media and legacy-backed values
  participate in one guarded write. Media has independent storage and writers;
  adding another reread or CAS on only the product root leaves a gap. Moving
  media into the existing aggregate or introducing a shared write protocol
  affects all writer paths, compatibility, recovery and migration. A new lock
  or a transaction facility cannot be assumed to exist in EmDash.
- **For multi-record operations**, qualify exactly what `expected` protects.
  Page-link records are not in the current `get` answer. Adding choices can
  create member records before the parent CAS; a conflict may leave durable
  side effects. Neither operation is proved safe by these cases, and this
  packet does not establish an additional bug in either.
- **Keep host limits real.** The baseline Registry backend is 131033 bytes,
  only 39 bytes below the 131072-byte limit. Any runtime repair needs a real
  bundle check, the default ten-subrequest budget, initialized legacy records,
  native/Registry proof, and uncertain-write/retry recovery tests. No budget
  exception, new service or persistence migration is authorized by this audit.

Until a stronger design is selected and proved, coordinate concurrent catalog
writers. Reading back can detect some unexpected values but is not an atomic
precondition and cannot restore an overwritten edit. Repeatedly rechecking a
preview does not close the final check-to-write gap.

## Verification and limits

- `npm test`: **709 pass, 0 fail** (708 baseline plus one CLI help regression).
- `npm run typecheck`: pass.
- `npm run audit:repo`: public repository and feature contracts clean.
- `./scripts/grilltrack --project . validate`: valid; ledger unchanged.
- `git diff --check`: clean.
- Explicit counterexample suite: **8 expected guard failures, 2 controls pass**.
- Registry backend remains 131033 bytes, SHA-256
  `29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`.

Docs: up to date. CLI help, CLI spec, the implementation note and the reference
article now distinguish a freshness precheck from an atomic guarantee. Runtime
catalog behavior is unchanged; the only source change there is a comment.

No deployed Registry/native site, browser, actual concurrent database clients,
payments, postage or production data were used. In-memory conditional writes
make the interleaving deterministic, but do not qualify all host storage
failure modes. No upstream issue/PR, merge, publication or deployment is part
of this contribution.
