# Single-host browser diagnostics without narrowing canonical gates

## Scope and source

- Parent: upstream `04dcf5e1ef296cc9ca8d719a11fec731d6961660`.
- Source/test/docs commit: `ae7b8d9baf1b5ffc5b9786bc50cdffb39f5009f0`.
- Branch: `saarius/single-host-browser-proof`, independent of the ten earlier
  published contributions and their frozen review index.
- Node `24.22.0`, Linux x64; locked EmDash `1.2.0`, Astro `7.1.3`,
  Playwright `1.61.1`, installed Chromium headless shell `149.0.7827.55`.
- Verification-tool enhancement only. No application source, provider,
  permission, route, persistence, lockfile, ledger or release change.

The main `playwright.config.mjs` normally starts three Astro web servers even
when Playwright's `--project` selects only one project's tests. Earlier
constrained-host work made that expensive; this contribution does not repeat
an OOM run to demonstrate the existing configuration. It adds explicit,
opt-in single-host diagnostics while preserving the ordinary default.

## Behavior

`COMMERCE_BROWSER_PROOF_PROFILE` selects exactly one matching project and
webServer from the existing ordered pairs:

| Value | Projects / Astro hosts | Preserved lane |
| --- | ---: | --- |
| unset or empty | 3 / 3 | Entire original configuration |
| `sandbox` | 1 / 1 | Local sandbox/workerd fixture |
| `native` | 1 / 1 | Native populated/guest fixture |
| `native-variant` | 1 / 1 | Existing synthetic native variant fixture and flags |
| Any other nonempty value | error | Before creating artifact directories |

The selected configuration is otherwise identical: test matching, base URL,
port offsets, database mapping, viewport, 180-second test timeout, one worker,
120-second server timeout and `reuseExistingServer: false`. No assertion or
retry setting is changed. Empty/unset keeps every original project and host.
The config regression matrix compares each complete selected project/server
object against its corresponding default entry, including the variant flags
and three distinct database paths.

**A reduced diagnostic must not silently pass a canonical aggregate.**
`bin/verify-commerce storefront`, `core` and `full` reject a nonempty override
with exit `64` before any child gate. Use direct Playwright for diagnostics,
and unset the variable for canonical coverage. Quick/checks do not run the
main browser suite; packaged uses its separate config and is not narrowed.
Other Playwright configs, including merchant settings, are unchanged.

The wrapper tests use a harmless mock `npm` to record the existing full-mode
command plan and prove refusal invokes no child gates. A passing **mock plan**
is not a claim that an actual full gate ran successfully.

## Regression and collection checks

`tests/workflows/browser-profiles.test.mjs` is included in normal unit globs.

| New capability/control tests | Pass | Fail | Skipped |
| --- | ---: | ---: | ---: |
| Unmodified upstream configuration/wrapper | 4 | 13 | 0 |
| Repaired configuration/wrapper | 17 | 0 | 0 |

Counts include parent subtests. These are expectations for the new opt-in
capability, **not thirteen separate upstream product defects**. Positive
baseline controls establish unchanged default/empty configuration and the
existing command plan. POSIX wrapper/mock tests explicitly skip on Windows;
this proof's Linux runs have no skips.

The tests cover all three selected lanes, default/empty behavior, typo/case/
prototype-like invalid names, no artifact creation on invalid input, canonical
refusal before any mocked npm call, unchanged default full command order,
quick behavior and unsupported-mode exit `64`.

Actual Playwright `--list` on each selected profile collected only that project:

| Profile | Listed tests / files | Executed by this collection check? |
| --- | ---: | --- |
| sandbox | 5 / 3 | No |
| native | 3 / 2 | No |
| native-variant | 2 / 1 | No |

A conflicting `COMMERCE_BROWSER_PROOF_PROFILE=native` with
`--project=sandbox --list` exits `1` for an unknown project. Collection is not
browser execution or variant-workflow qualification.

## Actual selected browser proof

Without changing the existing test, ran the complete
`tests/sandbox/guest-checkout.spec.mjs` case once per selected lane, sequentially:

| Profile | Fresh run ID | Result | Wall time |
| --- | --- | --- | ---: |
| sandbox | `single-host-sandbox-20261029-02` | 1/1 passed, no retries | 30.3s |
| native | `single-host-native-20261029-02` | 1/1 passed, no retries | 34.7s |

Each starts its single selected host with a fresh, isolated SQLite database.
The existing case exercises same-origin preparation, cross-origin denial,
capability/cart counts, unavailable Payments refusal, no cookie on failed
start, tampered-cart rejection and guessed-capability denial. It opens the
local front page in Chromium and cleans its synthetic product rows.

These are **local guest-route and front-page fixtures**, not successful paid
checkout, a mounted-clerk UI journey, external Registry installation, real
Payments/Inventory, native-variant browser execution, mobile or deployment
proof. No test assertion was weakened or skipped and no retry was added.

The first combined verification command completed both browser cases but
systemd expanded a braced loop variable before Bash ran, causing one shared
artifact run name and an overwritten per-lane log. Those initial collections
are **not** the per-lane evidence above. Both cases were rerun at the unchanged
source commit with the distinct `-02` IDs and separate logs, using a script
file to avoid pre-execution expansion. No old capture was attributed to a new
run. Raw logs, databases, session state, capabilities, traces and screenshots
remain outside committed proof.

## Source-head verification

All build, unit, integration and browser phases ran sequentially. Native
SQLite/workerd dependencies were initialized. The lock is unchanged, including
DOMPurify `3.4.16`; this contribution does not remediate existing dependency
advisories or establish host security.

| Gate | Result at the source commit above |
| --- | --- |
| Focused workflow configuration/wrapper tests | 17/17, no skips |
| `npm test` including build and unit/workflow suite | 725/725, no skips |
| `npm run test:integration` including build | 106/106, no skips |
| Typecheck, repository/feature contract audits, ledger and diff checks | Pass |
| Existing selected sandbox guest browser case | 1/1, no retries |
| Existing selected native guest browser case | 1/1, no retries |
| Per-profile collection and conflicting-project refusal | Pass, as scoped above |

Source orchestration and the corrected browser collection both completed
successfully under bounded independent workloads: 1550 MiB RAM limit, up to
2 GiB swap, 1408 MiB Node heap, explicit runtime limits. No forced test exit,
controller change or new permanent service was needed.

The official packaged backend `.tmp/registry-bundle/extracted/backend.js`
remains upstream-identical: **131033 bytes**, **39 bytes headroom** below
131072, SHA-256
`29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`.
No runtime bundle budget is consumed by this test-tool change.

A proof-only commit follows the source commit. Subsequent final-head focused
checks are recorded in the handoff; the complete suites/browser results above
are specifically bound to the identified source head. No unmocked
`verify-commerce storefront`, `core`, `full`, default three-host browser run,
packaged consumer or merchant-settings aggregate pass is claimed here.

## Reproduce

After locked installation, native initialization and Chromium prerequisites,
run builds/tests **sequentially**:

```sh
npm test
npm run test:integration
npm run typecheck
npm run audit:repo
./scripts/grilltrack --project . validate
node --test tests/workflows/browser-profiles.test.mjs

mkdir -p .tmp/astro-config
export ASTRO_TELEMETRY_DISABLED=1
export XDG_CONFIG_HOME="$PWD/.tmp/astro-config"
for profile in sandbox native; do
  COMMERCE_BROWSER_PROOF_PROFILE="$profile" \
    COMMERCE_PROOF_RUN="diagnostic-$profile-$(date +%s)" \
    npx playwright test tests/sandbox/guest-checkout.spec.mjs --project="$profile"
done
```

Use a sufficiently provisioned host or bounded independent workloads on a
small server. Supplying the loop through a script file avoids systemd
`ExecStart` interpolation if using `systemd-run`.

**Docs:** README and verification skill updated. **Product article: not
applicable**; no product behavior or setup step it describes changed. No
package release changeset, merge, upstream issue/PR, publication, real-provider
operation, deployment or production mutation. This does not alter the older
frozen ten-entry review index or qualify a combination of contribution branches.
