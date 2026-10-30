# Correction: independent consumer's prepare parser

**Own consumer bug, not a Commerce wire-contract change.** The frozen
[earlier WIP packet](../operator-test-checkout-20261030/PROOF.md) copied a client
that expected `data.capability` to be a string. Its23offline protocol tests used
that same incorrect fixture. Commerce's existing implementation contract and
actual public mint return a nested presentation object; the token is
`data.capability.capability`. Do not use the old client for successful preparation.
The old anonymous **unavailable** observations remain valid and are not rewritten.

## Reproduction and correction

The3source-contract tests use actual Commerce minting, capability authorization
and projection code, memory storage and a fixed synthetic secret. No provider
adapter, binding, stock fallback, installed readiness or network call is supplied.
A readiness fixture exists solely to reach the consumer's prepare branch; it is
NOT installed/provider readiness. All3 tests fail against the originalf7beadc
client at preparation; all3 pass with the corrected parser. The consumer now
checks presentation/header/retention/identity consistency, retains only the
nested token, and8additional malformed-presentation tests reject wrong shapes.

Own exact source commit **8cfaeb88e5369ed00472f9f58a465fd0fd914c04**. The two
consumer files here are byte-identical copies. `source-contract.test.mjs` adapts
only imports from the workspace test. Current source API is accepted main
**7740b4c14e614740c454ed67aeb6e8eaac49db6d**; the docs-only child
**4593a43d3510596ff1950046577dc1cb95d66353** rebuilds the same runtime API.

```sh
npm run build
node --test proof/operator-capability-contract-20261030/consumer/guest-checkout.test.mjs proof/operator-capability-contract-20261030/source-contract.test.mjs
# Counterexample: deliberately exits1, three failures; DO NOT call a pass:
CONSUMER_SOURCE=../operator-test-checkout-20261030/consumer/src/lib/guest-checkout.mjs node --test proof/operator-capability-contract-20261030/source-contract.test.mjs
```

Corrected consumer31 +source-contract3 +existing Registry selector8 =42offline
checks passed. Source-based status without Payments honestly returns
`recoverable-failure/CHECKOUT_NOT_FOUND`; start authorizes the nested token then
refuses absent Payments. This is NOT a paid/ready happy path.

## Focused upstream documentation contribution

[PR221](https://github.com/dinkuskit/commerce/pull/221) clarifies the existing
presentation in the release reference and tests its example against the public
mint export. It does not fix Commerce behavior. Exact4593: build,853tests/
110suites, typecheck, repo/feature audits, ledger and whitespace passed. Registry
backend130676bytes/SHA256
`a630ca239b3573cd5943cb430fb8e26702c946ba6d7c38438fcc86ac01c98f92`, unchanged.
Maintainer edits independently verified enabled08:17. No upstream merge/release.

## Deployment limitations

Corrected own app built and natural production restoration succeeded08:11.
First new browser gate FAILED08:14:05 at30s network-idle navigation; it had loaded
HTML and JS and issued a real readiness GET but had no readiness response before
the deadline. Cause unproved; do not relabel it or simply increase timeouts.
An ordinary public read later returned real200/unavailable in508ms08:20. The
later warm-browser run ALSO FAILED08:21:29 at30s network-idle navigation. Thus
there is NO new2/2browser qualification for8cfaeb8. These failed checks are not
attributed to the parser fix or to a Commerce defect without further evidence.

Commerce beta.3 and Payments beta.1 remain installed; a fresh terminal2page
scan of both exact package pairs08:15 still selected these versions and checked
advertised identities. No installed-store prepare/start/capability/card/order,
processor onboarding, platform diagnostic or charge was performed. Public
mutations and `/checkout` remain denied; processor mode remains unestablished.
