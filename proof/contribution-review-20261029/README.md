# Commerce contributions: owner review index

**Submission update: 2026-10-29. Four active PRs; unused-helper repair deferred. No combined release.**

- [#205 — low-stock feed availability](https://github.com/dinkuskit/commerce/pull/205)
- [#207 — payment binding readiness](https://github.com/dinkuskit/commerce/pull/207)
- [#209 — invalid requested CLI profiles](https://github.com/dinkuskit/commerce/pull/209)
- [#210 — CLI response-body transport](https://github.com/dinkuskit/commerce/pull/210)
- [#206 — NaN host feed pagination: closed/deferred, unmerged](https://github.com/dinkuskit/commerce/pull/206). Maintainer accepts correctness/testing but there is no active caller. Leave closed unless a real caller makes it relevant; keep helper-specific developer documentation out of the shop-owner reference.

See **[SUBMISSIONS.md](SUBMISSIONS.md)** for fresh exact-head validation,
pre-submission duplicate checks, dependencies, remaining findings, later browser
contributions and release/installed-host limits. PR state and feedback may
advance after this snapshot; no approval or merge is implied.

The first submission snapshot at [52b378b](https://github.com/saarius/commerce/blob/52b378bf453b7d8e96df04b8a6d8d761cee69526/proof/contribution-review-20261029/README.md) is also retained unchanged. CLI submission aliases permit review updates without moving the original contribution refs; #210 adds a documentation-only child to the original runtime/test head.

The original ten-entry snapshot is preserved at immutable
[`f12ec8b`](https://github.com/saarius/commerce/blob/f12ec8b8a747c00e0926251d39d246e2f217e9e2/proof/contribution-review-20261029/README.md).
This successor copies its manifest and verifier unchanged, adds submission
status and retains every published contribution head and proof. The older
snapshot's no-PR status is historical, not the current submission disposition.

All comparisons below use immutable commit IDs. Upstream source base is
`04dcf5e1ef296cc9ca8d719a11fec731d6961660` (package manifest `0.6.0`), preserved
at `review/upstream-04dcf5e`. It was still current main at these submissions.
Fork `main` was not the comparison base: it initially lagged by 105 commits.
Source-package versions do not establish a published Registry beta's contents.

**This review-index branch contains upstream application code, not a roll-up
of the repairs.** It adds only this proof directory; no application, lockfile,
release, ledger, permission, deployment or maintainer-store change.

## Suggested review order

- **Owner decision needed:** #3 supplies deterministic counterexamples to a
  stronger catalog preview guarantee. Its documentation correction is
  reviewable, but **no runtime atomicity repair** is included. Stronger
  persistence/protocol work needs evaluation with the existing decision.
- **Dispatch and data-integrity repairs:** #1/#2 distinguish uncertain writes,
  #10 rejects invalid profile selection before dispatch, #4 closes a malformed
  binding-admission gap, and #9 prevents new unreadable legacy profile seeds.
- **Other bounded repairs/hardening:** #5 repairs host feed serialization; #6
  updates one development dependency; #7 corrects existing settings guidance
  and a mounted-form test readiness condition. #8 is **deferred**, not an
  active merge candidate without a caller.

This is an evaluation order, not merge authority or a claim of deployed
severity. Every reproduction uses public-safe synthetic data. No affected
production store was established.

## Exact comparisons, proof and recorded budgets

Backend sizes are **previously recorded per-branch results**, not a fresh
combined build. The SDK per-file cap is **131072 bytes**. The baseline backend
is **131033 bytes / 39 headroom**, SHA-256
`29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`.
The [manifest](manifest.json) contains full heads, base relationships, branch
names and SHA-256 digests of the cited proof files.

| # | Contribution | Immutable comparison / evidence | Required base | Backend bytes / headroom |
| --- | --- | --- | --- | ---: |
| 1 | CLI response-body transport | [diff](https://github.com/saarius/commerce/compare/04dcf5e1ef296cc9ca8d719a11fec731d6961660...08483dade447e31b223969fd30eded51f48e81da) · [proof](https://github.com/saarius/commerce/blob/08483dade447e31b223969fd30eded51f48e81da/proof/cli-response-body-errors-20261029/PROOF.md) | upstream base | 131033 / 39 |
| 2 | CLI SIGINT outcome | [diff](https://github.com/saarius/commerce/compare/08483dade447e31b223969fd30eded51f48e81da...31666da5fe9d288bbcf27cd21d31c78353fedaa6) · [proof](https://github.com/saarius/commerce/blob/31666da5fe9d288bbcf27cd21d31c78353fedaa6/proof/cli-sigint-outcome-20261029/PROOF.md) | #1 | 131033 / 39 |
| 3 | Catalog preview concurrency **audit only** | [diff](https://github.com/saarius/commerce/compare/04dcf5e1ef296cc9ca8d719a11fec731d6961660...04e9448a4014071b36cecb597b9d579d22cee97b) · [finding](https://github.com/saarius/commerce/blob/04e9448a4014071b36cecb597b9d579d22cee97b/proof/catalog-preview-race-20261029/FINDING.md) | upstream base | 131033 / 39 |
| 4 | Payment binding readiness | [diff](https://github.com/saarius/commerce/compare/04dcf5e1ef296cc9ca8d719a11fec731d6961660...1d20f263221fff0d578d7704119921df76ae8d1d) · [proof](https://github.com/saarius/commerce/blob/1d20f263221fff0d578d7704119921df76ae8d1d/proof/payment-binding-readiness-20261029/PROOF.md) | upstream base | 131044 / 28 |
| 5 | Low-stock feed availability | [diff](https://github.com/saarius/commerce/compare/04dcf5e1ef296cc9ca8d719a11fec731d6961660...efec42c4e2a73b29d5d434529c575c1efed2ff35) · [proof](https://github.com/saarius/commerce/blob/efec42c4e2a73b29d5d434529c575c1efed2ff35/proof/feed-low-stock-availability-20261029/PROOF.md) | upstream base | 131033 / 39 |
| 6 | Development DOMPurify hardening | [diff](https://github.com/saarius/commerce/compare/04dcf5e1ef296cc9ca8d719a11fec731d6961660...6ceb330902264d146a954b6ab7fb376ac7cebb55) · [report](https://github.com/saarius/commerce/blob/6ceb330902264d146a954b6ab7fb376ac7cebb55/proof/dependency-exposure-20261029/REPORT.md) | upstream base | 131033 / 39 |
| 7 | Settings guidance and form readiness | [diff](https://github.com/saarius/commerce/compare/6ceb330902264d146a954b6ab7fb376ac7cebb55...9b0284dffa76461be17fbb29c218bf2ce920fa9c) · [proof](https://github.com/saarius/commerce/blob/9b0284dffa76461be17fbb29c218bf2ce920fa9c/proof/settings-country-guidance-20261029/PROOF.md) | #6 | 130996 / 76 |
| 8 | NaN host feed pagination | [diff](https://github.com/saarius/commerce/compare/04dcf5e1ef296cc9ca8d719a11fec731d6961660...fce969aa1ca301e7e0bc612b4258e6513011faa0) · [proof](https://github.com/saarius/commerce/blob/fce969aa1ca301e7e0bc612b4258e6513011faa0/proof/feed-pagination-nan-20261029/PROOF.md) | upstream base | 131033 / 39 |
| 9 | Legacy-order shopper-profile seeding | [diff](https://github.com/saarius/commerce/compare/9b0284dffa76461be17fbb29c218bf2ce920fa9c...9801909abf7a671bc00ffd6a774cf37453dc86de) · [proof](https://github.com/saarius/commerce/blob/9801909abf7a671bc00ffd6a774cf37453dc86de/proof/shopper-legacy-contact-20261029/PROOF.md) | #7 (includes #6) | 131039 / 33 |
| 10 | Requested CLI profile selection | [diff](https://github.com/saarius/commerce/compare/04dcf5e1ef296cc9ca8d719a11fec731d6961660...440c73f1e6023cdd6c909add231f255a13210cdf) · [proof](https://github.com/saarius/commerce/blob/440c73f1e6023cdd6c909add231f255a13210cdf/proof/cli-profile-selection-20261029/PROOF.md) | upstream base | 131033 / 39 |

The two stacks are `#1 → #2` and `#6 → #7 → #9`. All other entries are
independent of those stacks. #9's tested settings parent supplies necessary
headroom; an earlier standalone prototype exceeded the cap. Do not assume its
published repair fits directly on upstream, or that combining these branches
preserves byte budgets, dependency closure or test results. **No combined tree
has been qualified by this index.**

## What the evidence establishes

Counts below summarize original branch-specific passing suites, not a new run
of all ten suites. Five submitted-repair revalidations are recorded separately
in [SUBMISSIONS.md](SUBMISSIONS.md). Consult each immutable proof for its source/final-head
scope, commands, failures, controls and limits. A dash means no full integration
result is claimed by that proof, not zero tests or a passing skipped suite.

| # | Recorded unit / integration counts | Principal observation and qualification |
| --- | --- | --- |
| 1 | 721 / — | Fetch and body consumption share transport handling. Body timeout/disconnection no longer escapes as raw `internal_error`; no retries. A failed response does not prove a write failed. |
| 2 | 735 / — | Actual loopback receipt followed by SIGINT reports unknown outcome, not “nothing was sent.” Dispatch marking is conservative; receipt is not durable-commit proof. Subprocess coverage is POSIX, not Windows. |
| 3 | 709 / — | Separate explicit counterexamples produce **8 expected failures / 2 controls passing / exit 1**. They are evidence against the stronger atomic claim, not passing repair regressions. Normal tests remain green separately. |
| 4 | 756 / 110 | Malformed explicit readiness flags do not reach session creation, including compiled-workerd cases. Omitted flags/true and historical lookup remain supported. No forged shopper binding or real charge is demonstrated. |
| 5 | 715 / 106 | The real availability resolver with a synthetic low-stock provider feeds correct Google/Meta serialization; JSON-LD remains LimitedAvailability. Not live Inventory or channel ingestion certification. |
| 6 | 708 / 106 | DOMPurify 3.4.16 → 3.4.17, one lock entry. Explicit isolated Chromium-library cases improve 2/6 → 6/6 under advisory-specific configurations; not demonstrated EmDash XSS. |
| 7 | 711 / 106 | Full suites at source `1169336`; selected final local sandbox/workerd and native settings cases each pass 1/1, no retries. At evidence-only final head, 27 focused checks/audits rerun, **not full suites again**. |
| 8 | 726 / 106 | NaN size previously repeated an empty page/cursor; now RangeError, preserving defaults, clamps and numeric-cursor behavior. Host helper only, not deployed HTTP DoS. |
| 9 | 723 / 108 | Synthetic legacy contact could seed a profile that immediately became UNAVAILABLE; independent field normalization prevents new invalid seeds. Actual compiled-workerd/SDK SQLite cases included. Existing damaged customer records still fail closed. |
| 10 | 750 / 106 | Invalid requested profiles previously sent authenticated creation requests and kept synthetic Drafts at the base loopback site; now no dispatch. Valid empty aliases/precedence remain supported; no repair of earlier wrong-site records. |

Typecheck, repository/feature contract audits, ledger and diff checks are
recorded by the individual proofs. Repository contract audits are **not npm
vulnerability audits**. Failed/cancelled build, installation, browser and wrapper
attempts are not passing evidence. In particular, #10 discloses an initial
post-gate artifact-reporting path error and a corrected artifact check; its
exact final head subsequently passed all gates in a corrected bounded run.

### Security, browser and host boundaries

- #6 changes this checkout's development lock, **not independently locked
  consumer hosts**. The last recorded security audit still had 25 affected
  packages after that update (26 on the upstream lock), including critical
  Astro. Those are historical package counts, not a live audit or demonstrated
  application exploit count. `npm audit --omit=dev` is not host clearance.
- The inspected EmDash Markdown sanitizer did not use the DOMPurify advisory
  modes/hooks. Astro's actual Sharp importer resolved a newer native library
  than separate SDK tooling; neither observation clears all hosts/platforms.
- #7's project called `registry` is a **local sandbox-site/workerd fixture**,
  not installation from the external Registry. Its selected desktop settings
  cases are not a complete storefront journey, mobile, real-provider or
  deployed-host qualification.
- #4/#9's compiled runtime, SDK/SQLite and synthetic email sinks improve local
  integration coverage but do not establish production/provider behavior.
- The shared CLI kernel changes require maintainer synchronization across
  companion repositories; only this authorized Commerce fork was changed.

## Decisions and work not silently authorized

1. Stronger catalog preview atomicity belongs with `catalog-api-20261027` and
   needs a precise multi-record/media/retry protocol and budget evaluation.
2. Repair/migration of already-damaged shopper records needs owner review.
   #9 deliberately preserves fail-closed behavior for those records.
3. Previously wrong-site CLI writes are not discovered or cleaned up by #10.
4. Broader Astro/tooling remediation needs a compatible scoped update and host
   proof; do not use bulk audit-fix downgrades or weaken the bundle cap.
5. No merge, package publication, release, production mutation or deployment
   is authorized by this snapshot. Scope/decision locks remain unchanged.

## Check the frozen identities

Node 24.22.0 and Git are sufficient; **npm install is not needed** for these
identity checks. From a checkout with the listed commit objects:

```sh
node --test proof/contribution-review-20261029/verify.test.mjs
node proof/contribution-review-20261029/verify.mjs
# Explicit opt-in network read; does not fetch or change local refs:
node proof/contribution-review-20261029/verify.mjs --remote
```

`verify.mjs` checks manifest shape, stack ancestry, commit objects, and each
proof's SHA-256 over its raw Git blob. `--remote` additionally requires the
listed public fork refs, including the base snapshot, to still match the
recorded commits. A moved or deleted ref fails; no snapshot is silently
updated. Current upstream main may legitimately advance; the frozen base is
not a promise that it remains the latest tip.

If a fresh/shallow checkout lacks objects, fetch them **explicitly before**
verification (this preparation updates remote-tracking refs, not local branches):

```sh
git fetch https://github.com/saarius/commerce.git \
  'refs/heads/saarius/*:refs/remotes/saarius-review/*'
```

The verifier itself never fetches, checks out, builds, runs product tests,
merges, installs, writes refs or modifies a worktree. It has no arbitrary URL,
shell-command or deployment option. Raw Git failure diagnostics are suppressed;
only check labels are reported. Its output explicitly lists builds, test
results, bundle bytes and installed hosts as **not checked**. Reported byte
counts are metadata with arithmetic headroom, not artifact measurements.
Proof digests establish identity, not correctness, signatures, authorship or
approval. Only the listed refs are checked; this is not automatic discovery of
every branch on the fork.

The verifier's own tests include negative metadata/proof/ref controls and real
synthetic Git repositories, including HEAD/index/worktree preservation. They
are explicit proof-tool tests, outside normal product test globs. **Docs: not
applicable** to the product article: this handoff changes no product behavior
or setup step and is not a package release changeset.

### Index-specific verification

On Node **24.22.0**, Linux x64, the index-tool checks passed **34/34**, no
skips. Local commit/ancestry/proof-digest checks passed for all ten entries;
an explicit remote check matched all **11 refs** (ten contributions plus the
base snapshot). Typecheck, repository/feature contract audits, GrillTrack
validation and diff checks passed. Negative controls include actual unrelated
Git commits and missing Git, not only successful mocked calls.

These original index-specific results concern review tooling and frozen
identities. That original index cycle did **not** rerun the ten product suites.
The submission cycles separately reran five proposed repair heads (including
now-deferred #206);
see [SUBMISSIONS.md](SUBMISSIONS.md) rather than attributing fresh results to
all ten entries. The unchanged verifier still checks only the original
manifest, not PR state or additional browser contributions. No combined
artifact, installed-release, host-security or Windows qualification is claimed.
