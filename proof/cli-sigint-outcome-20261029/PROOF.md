# Truthful CLI interruption after a write starts

## Source and scope

- Upstream baseline: `04dcf5e1ef296cc9ca8d719a11fec731d6961660`.
- This repair is stacked on the previous response-body transport repair,
  `08483dade447e31b223969fd30eded51f48e81da`, not yet upstream. The original
  contribution branch is unchanged.
- Node `v24.22.0`, Linux x86_64, unchanged dependency lockfile.
- Routine repair of the process wrapper's existing before-send / unknown-after-
  send contract. No new product decision or GrillTrack state change.
- Implementation changes are in `cli/client.mjs` and `cli/spec.mjs` only.
  The shared kernel is unchanged relative to the parent contribution.

## Reproduction

A spawned `bin/dinkus-commerce.mjs` sent an authenticated synthetic
`orders complete --confirm 1 --json` request to a loopback HTTP server.
After the server received the complete change request, it sent SIGINT to
that child process, without returning a response.

The CLI exited **4** and printed **interrupted; nothing was sent**, even
though the server had received the order-completion request. Its JSON error
was `interrupted`. The shared kernel's `lifecycle.sending` flag was never
connected to Commerce's requests.

The first thirteen new tests ran against the unchanged parent: **11 failed,
2 passed**. Both safe preflight cases passed; mutation reporting, dispatch
tracking and prevention of dispatch on an already-aborted signal failed.

## Repair

`connect()` forwards the kernel's existing lifecycle object to the client.
For catalog and order changes, the client marks dispatch immediately before
calling fetch, after credential and destination checks and after checking
whether the signal is already aborted. It never infers a mutation from POST
alone: catalog get/list and orders show/list remain read-only. Native and
public GET reads do not mark a mutation either.

After dispatch starts, SIGINT now follows the existing kernel path: exit **3**
and **the outcome is unknown**. The marker is conservative: starting fetch is
not proof of server receipt or commit. No cancellation can undo a change that
already reached the store. No automatic retries were added.

## Verification

- `npm test`: **735 passed, 0 failed**, including the package build and sandbox
  validation (721 tests in the parent, plus 14 new tests).
- Ten real-process tests cover product create, a confirmed product edit,
  order completion and reopening, with no response or a partial response,
  plus product/order read-only preflights.
- The tests signal the actual executable only after the server receives the
  complete request; they assert the exit status, stderr, one JSON error,
  exactly one mutation request and no fixture credential in output.
- Client tests cover every current catalog operation and order action, GET
  reads, blocked credentials/destinations and already-cancelled mutations.
- `npm run typecheck`: passed.
- `npm run audit:repo`: public repository and feature contracts clean.
- `./scripts/grilltrack --project . validate`: valid; ledger unchanged.
- `git diff --check`: clean.
- Registry backend remains byte-identical: 131033 bytes, SHA-256
  `29e86beb6d40af0050ea8e2582113aa5dc65417d355c535ac765bab0ea1ecf68`.

Docs: up to date. The CLI spec and reference article distinguish Ctrl-C before
change dispatch from an unknown outcome after dispatch. Version and release
placeholders are preserved. A patch changeset accompanies this repair.

## Limits

Only synthetic loopback HTTP and CLI/client paths were exercised. No deployed
store, browser, payment, postage, Registry publication or production mutation
was involved. Server receipt is not proof of durable commit. Operators must
read back the product or order before resubmitting an interrupted change.

Real SIGINT subprocess tests run on POSIX; they explicitly skip on Windows,
where child-process SIGINT is not delivered to Node's handler. Windows behavior
is not qualified here. Client-level dispatch tests are platform independent.
