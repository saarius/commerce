// Read-only identity checks for the frozen review snapshot, not a product verifier.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FORK = "https://github.com/saarius/commerce.git";
const COMMIT = /^[0-9a-f]{40}$/;
const DIGEST = /^[0-9a-f]{64}$/;
const KINDS = new Set(["repair", "audit-only", "development-dependency-hardening"]);
const root = fileURLToPath(new URL("../../", import.meta.url));
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const matches = (pattern, value) => typeof value === "string" && pattern.test(value);

export function validateManifest(manifest) {
  assert.ok(record(manifest), "manifest must be an object");
  assert.equal(manifest.schema, "dinkuskit.commerce.contribution-review/v1", "unsupported schema");
  assert.equal(manifest.fork, FORK, "only the public Commerce fork is in scope");
  assert.equal(manifest.registryFileLimitBytes, 131072, "Registry limit must not be relaxed");
  assert.ok(record(manifest.baseline) && matches(COMMIT, manifest.baseline.head), "invalid baseline commit");
  assert.ok(matches(/^review\/[a-z0-9-]+$/, manifest.baseline.branch), "invalid baseline branch");
  assert.ok(Array.isArray(manifest.contributions) && manifest.contributions.length > 0, "missing contributions");
  assert.equal(manifest.contributionCount, manifest.contributions.length, "contribution count mismatch");
  const ids = new Set(), branches = new Set(), heads = new Map();
  for (const entry of manifest.contributions) {
    assert.ok(record(entry), "contribution must be an object");
    assert.ok(matches(/^[a-z][a-z0-9-]*$/, entry.id), "invalid contribution id");
    assert.ok(!ids.has(entry.id), "duplicate contribution id");
    assert.ok(KINDS.has(entry.kind), "invalid contribution kind");
    assert.ok(matches(/^saarius\/[a-z0-9-]+$/, entry.branch), "invalid contribution branch");
    assert.ok(!branches.has(entry.branch), "duplicate contribution branch");
    assert.ok(matches(COMMIT, entry.base) && matches(COMMIT, entry.head), "invalid contribution commit");
    assert.ok(entry.head !== manifest.baseline.head && !heads.has(entry.head), "duplicate/baseline contribution head");
    assert.ok(matches(/^proof\/[A-Za-z0-9_./-]+\.md$/, entry.proofPath) &&
      entry.proofPath.split("/").every((part) => part && part !== "." && part !== ".."), "invalid proof path");
    assert.ok(matches(DIGEST, entry.proofSha256), "invalid proof digest");
    assert.ok(Number.isSafeInteger(entry.reportedBackendBytes) && entry.reportedBackendBytes > 0 &&
      entry.reportedBackendBytes <= manifest.registryFileLimitBytes, "reported backend exceeds limit or is invalid");
    ids.add(entry.id); branches.add(entry.branch); heads.set(entry.head, entry);
  }
  for (const entry of manifest.contributions) {
    const seen = new Set();
    let head = entry.head;
    while (head !== manifest.baseline.head) {
      assert.ok(heads.has(head), "dependency base is not in the frozen snapshot");
      assert.ok(!seen.has(head), "dependency cycle");
      seen.add(head);
      head = heads.get(head).base;
    }
  }
}

function gitRead(args) {
  // No shell, checkout, fetch, build, mutation or deployment. ls-remote is opt-in.
  return execFileSync("git", args, { cwd: root, timeout: 30_000, maxBuffer: 2 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
}

export function verifyReview(manifest, { git = gitRead, remote = false } = {}) {
  validateManifest(manifest);
  const read = (args, label) => {
    try { return git(args); }
    catch { throw new Error(`Git identity check failed: ${label}. Check local objects/access; raw Git diagnostics are not echoed.`); }
  };
  read(["cat-file", "-e", `${manifest.baseline.head}^{commit}`], "baseline commit");
  const contributions = [];
  for (const entry of manifest.contributions) {
    read(["cat-file", "-e", `${entry.head}^{commit}`], `${entry.id} commit`);
    read(["merge-base", "--is-ancestor", entry.base, entry.head], `${entry.id} ancestry`);
    const proof = read(["show", `${entry.head}:${entry.proofPath}`], `${entry.id} proof`);
    assert.equal(createHash("sha256").update(proof).digest("hex"), entry.proofSha256, `${entry.id}: proof digest mismatch`);
    contributions.push({
      id: entry.id, head: entry.head, base: entry.base,
      reportedBackendBytes: entry.reportedBackendBytes,
      reportedHeadroomBytes: manifest.registryFileLimitBytes - entry.reportedBackendBytes,
    });
  }
  if (remote) {
    const expected = new Map([
      [`refs/heads/${manifest.baseline.branch}`, manifest.baseline.head],
      ...manifest.contributions.map((entry) => [`refs/heads/${entry.branch}`, entry.head]),
    ]);
    const advertised = String(read(["ls-remote", "--heads", FORK, ...expected.keys()], "published fork refs")).trim();
    const actual = new Map();
    for (const line of advertised ? advertised.split("\n") : []) {
      const [head, ref, extra] = line.split("\t");
      assert.ok(COMMIT.test(head) && expected.has(ref) && extra === undefined, "unexpected remote ref advertisement");
      assert.ok(!actual.has(ref), "duplicate remote ref advertisement");
      actual.set(ref, head);
    }
    for (const [ref, head] of expected) {
      assert.ok(actual.has(ref), `published ref missing: ${ref}`);
      assert.equal(actual.get(ref), head, `published ref moved: ${ref}`);
    }
  }
  return {
    schema: manifest.schema,
    checks: ["commit-objects", "ancestry", "proof-sha256", ...(remote ? ["published-refs"] : [])],
    notChecked: ["builds", "test-results", "bundle-bytes", "installed-hosts"],
    remoteRefsChecked: remote,
    contributions,
  };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 1 && argv[0] === "--help") {
    console.log("Usage: node proof/contribution-review-20261029/verify.mjs [--remote]\nChecks frozen commit/proof identities locally; --remote also reads public fork refs. Never runs product tests or builds.");
    return;
  }
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== "--remote")) {
    console.error("Usage: node proof/contribution-review-20261029/verify.mjs [--remote]");
    process.exitCode = 2;
    return;
  }
  try {
    const manifest = JSON.parse(readFileSync(new URL("./manifest.json", import.meta.url), "utf8"));
    console.log(JSON.stringify(verifyReview(manifest, { remote: argv[0] === "--remote" }), null, 2));
  } catch (error) {
    console.error(`Review identity check failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
