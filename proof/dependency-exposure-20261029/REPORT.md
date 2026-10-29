# Critical dependency exposure: bounded triage and DOMPurify lock update

## Baseline and scope

Reviewed 2026-10-29 against Commerce parent `04dcf5e1ef296cc9ca8d719a11fec731d6961660` (`0.6.0`), Node 24.22.0, Linux x64. This branch is independent of the earlier CLI, catalog-preview, payment-admission and feed repairs.

`npm audit` initially reported **26 affected packages**, including two critical package findings: Astro 7.1.3 and DOMPurify 3.4.16. This review investigates those two paths only, not every advisory in the dependency tree. No production store was inspected or changed.

The only dependency change is the `node_modules/dompurify` lock entry, **3.4.16 → 3.4.17**, including its public registry URL and integrity. An isolated `npm update dompurify --package-lock-only --ignore-scripts` experiment changed only that entry. The final diff preserves every direct dependency, override policy, EmDash/SDK pin and EmDash package integrity; `package.json` is unchanged. The update fits EmDash admin's existing `^3.3.2` range.

## Findings by runtime lane

| Lane | Observed boundary | Assessment |
| --- | --- | --- |
| Commerce Registry backend | 131033-byte sandbox artifact; no dependency change in its compiled bytes | Byte-identical to parent. This is not proof that its surrounding CMS host is safe. |
| Native and Registry **host admin** | EmDash 1.2.0 → `@emdash-cms/admin` 1.2.0 → external DOMPurify | Updating this checkout locks 3.4.17 for its development host. Independently installed hosts need their own dependency update and checks. |
| Node host image processing | Astro 7.1.3's Sharp service resolves **Sharp 0.35.4**, loaded libheif **1.23.2** | The actual resolved Sharp meets the minimum identified by the Astro AVIF advisory. Astro's component-range audit flag remains; this is not a complete Astro clearance. |
| SDK/Wrangler tooling | Miniflare copies resolve **Sharp 0.35.2**, loaded libheif **1.23.0** | Distinct from Astro's resolved copy. Older tooling remains flagged; no exploitability conclusion or tooling upgrade is included. |

[snapshot.json](snapshot.json) records the exact resolved paths, versions, platform, lock hash, EmDash integrity, inspected admin-asset hash and backend hash. Regenerate it with the read-only `snapshot.mjs` script; it emits no environment or credentials. Do not apply these local binary observations to a differently installed platform, global-libvips build, consumer lockfile or production deployment.

### Astro AVIF advisory

[GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) describes malicious AVIF input reaching libheif through Sharp. Its stated remediation is Astro 7.2.8 requiring Sharp 0.35.4. The pinned Astro version remains in the affected component range, but this checkout's actual Astro importer already resolves Sharp 0.35.4. No malicious media was processed and no RCE test was attempted.

The installed `emdash/dist/astro/image-endpoint.mjs` reads media bytes from storage and invokes the configured image service's `transform`; other image sources delegate to Astro's generic endpoint. `astro/dist/assets/services/sharp.js` dynamically loads Sharp. This makes **source image decoding** relevant: a Commerce transform URL asking for WebP output is not, by itself, protection against a malicious AVIF source.

The default observed SDK Miniflare runner constructs workers without an Images binding, but that observation does not establish safety for all tooling configurations. Referenced underlying libheif advisory API lookups were unavailable (404); no missing version details are inferred. Other Astro and tooling findings remain outside this bounded remediation.

### DOMPurify advisories and current admin use

The public advisories identify non-default application configurations:

- [GHSA-cg2g-xh64-v4q7](https://github.com/advisories/GHSA-cg2g-xh64-v4q7): `SAFE_FOR_TEMPLATES`, a DOM-returning/in-place mode, attached shadow-root input, then downstream template evaluation.
- [GHSA-mrv2-3pqr-j5jr](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr): in-place sanitization with hooks that detach other nodes.
- [GHSA-c6gr-qvv4-5v3f](https://github.com/advisories/GHSA-c6gr-qvv4-5v3f): XHTML parser mode plus explicitly allowed SMIL tags/attributes.

The inspected EmDash admin asset imports DOMPurify and has one `DOMPurify.sanitize(html, SANITIZE_CONFIG)` call in `renderMarkdown`. That call receives an HTML **string**; its configuration is a markdown tag/attribute allowlist, not the modes/hooks above. It also follows a restricted Markdown renderer. Those advisory preconditions were **not observed in that call**. The patch is dependency hardening, **not a demonstrated EmDash XSS exploit** or proof that every host call site was reviewed.

GitHub's advisory metadata identifies 3.4.17 as the first patched version. Some advisory narrative still says “not fixed”; the package metadata and executable before/after checks are therefore recorded explicitly rather than relying on that stale sentence.

## Browser regression evidence

`dompurify-regression.mjs` resolves DOMPurify from the actual EmDash admin importer and loads that package's browser UMD asset in Chromium 149.0.7827.55 (Playwright browser v1228). These are isolated upstream-library tests, **not** the mounted EmDash UI. They adapt the public advisory cases using only benign data:

- a split `${6*7}` expression is inspected, never evaluated;
- detached-node handler attributes use `void 0` and no image source;
- the sanitized SMIL string is parsed for inspection, never inserted/activated;
- self-detachment and ordinary string/allowlist sanitization are controls;
- page network requests are aborted; no customer data, production account or external service is used.

| Installed dependency | Pass | Fail | Exit |
| --- | ---: | ---: | ---: |
| Baseline 3.4.16 | 2 | 4 | 1 |
| Updated 3.4.17 | 6 | 0 | 0 |

Run explicitly (browser proof is deliberately outside the normal browser-free unit globs):

```sh
npx playwright install --with-deps chromium
node --test proof/dependency-exposure-20261029/dompurify-regression.mjs
node proof/dependency-exposure-20261029/snapshot.mjs
```

The test is expected to fail on the baseline vulnerable package under those intentionally non-default configurations. It passes with the updated lock. No browser UI layout, mobile rendering or deployed host exploit is claimed.

## Audit results and the dev-only trap

After the update, `npm audit` reports **25 affected packages: 1 low, 6 moderate, 17 high, 1 critical**. DOMPurify is no longer flagged; Astro is still the critical package. These are package counts, not counts of independent exploitable application vulnerabilities.

Both before and after, `npm audit --omit=dev` reports zero in **this repository**, because the host/tool packages are development dependencies here. Commerce also declares an EmDash peer. The dev-omitted result must not be advertised as production-host safety evidence. Audit an actual host's dependency tree and configuration; changing Commerce's development lock does not rewrite a host lockfile or upgrade an installed Registry site's CMS. No consumer-host audit or production inventory is claimed here.

Do not run a blanket `npm audit fix --force`: the reported suggestions include incompatible EmDash/SDK downgrades. A scoped Astro/tooling update should retain the platform contract and rerun compatibility proof, rather than silently replacing the existing source/peer pins.

## Verification and limits

On the final dependency/source tree:

- `npm test`: **708/708 pass**, no skips.
- `node --test tests/integration/*.test.mjs`: **106/106 pass**, no skips.
- Explicit Chromium regression proof: **6/6 pass**.
- Typecheck, public repository/feature audits, GrillTrack validation and diff checks pass.
- Registry backend: **131033 bytes**, **39-byte headroom**, SHA-256 `29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`, unchanged from parent.

The initial install was OOM-killed on the small test server, so that attempt supplied no post-update evidence. Recovery used a bounded independent install with scripts disabled, followed by explicit `npm rebuild better-sqlite3 workerd --foreground-scripts --ignore-scripts=false`. Without workerd postinstall, its JS launcher left a child process/pipe alive after a passing test; early full runs consequently timed out. After rebuild, the isolated eight-case contact suite and both full suites completed normally. No `--test-force-exit` was used to hide cleanup. These environment failures are not passing test evidence or attributed to the DOMPurify patch.

**Docs: up to date.** The reference now explains host dependency-audit responsibility; a patch changeset accurately scopes this to the development-host lock. No application runtime source, route, capability, storage, ledger, controller, deployment or production change is included. This is not a declaration that the remaining dependency tree is secure.
