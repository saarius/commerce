import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateManifest, verifyReview } from "./verify.mjs";

const A = "1".repeat(40), B = "2".repeat(40), C = "3".repeat(40);
const proof = Buffer.from("# Synthetic proof\n");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
function manifest() {
  return {
    schema: "dinkuskit.commerce.contribution-review/v1",
    fork: "https://github.com/saarius/commerce.git",
    baseline: { branch: "review/upstream-fixture", head: A },
    registryFileLimitBytes: 131072, contributionCount: 1,
    contributions: [{
      id: "fixture", kind: "repair", branch: "saarius/fixture", base: A, head: B,
      proofPath: "proof/fixture/PROOF.md", proofSha256: digest(proof), reportedBackendBytes: 131033,
    }],
  };
}
function fakeGit(snapshot, calls = [], advertised) {
  return (args) => {
    calls.push(args);
    if (args[0] === "show") return proof;
    if (args[0] === "ls-remote") return advertised ?? Buffer.from([
      `${snapshot.baseline.head}\trefs/heads/${snapshot.baseline.branch}`,
      ...snapshot.contributions.map((entry) => `${entry.head}\trefs/heads/${entry.branch}`),
    ].join("\n") + "\n");
    return Buffer.alloc(0);
  };
}

test("local checks use only read-only Git operations and label unverified product evidence", () => {
  const snapshot = manifest(), calls = [];
  const report = verifyReview(snapshot, { git: fakeGit(snapshot, calls) });
  assert.equal(report.remoteRefsChecked, false);
  assert.deepEqual(report.checks, ["commit-objects", "ancestry", "proof-sha256"]);
  assert.deepEqual(report.notChecked, ["builds", "test-results", "bundle-bytes", "installed-hosts"]);
  assert.equal(report.contributions[0].reportedHeadroomBytes, 39);
  assert.ok(calls.every(([command]) => ["cat-file", "merge-base", "show"].includes(command)));
});

test("explicit remote checking compares every frozen ref without fetching", () => {
  const snapshot = manifest(), calls = [];
  const report = verifyReview(snapshot, { remote: true, git: fakeGit(snapshot, calls) });
  assert.equal(report.remoteRefsChecked, true);
  const remote = calls.filter(([command]) => command === "ls-remote");
  assert.deepEqual(remote, [["ls-remote", "--heads", snapshot.fork,
    "refs/heads/review/upstream-fixture", "refs/heads/saarius/fixture"]]);
  assert.ok(calls.every(([command]) => ["cat-file", "merge-base", "show", "ls-remote"].includes(command)));
});

test("invalid snapshot metadata fails before invoking Git", async (t) => {
  for (const [label, mutate] of [
    ["count", (m) => { m.contributionCount = 2; }],
    ["fork", (m) => { m.fork = "https://example.test/not-the-fork.git"; }],
    ["cap relaxation", (m) => { m.registryFileLimitBytes++; }],
    ["empty", (m) => { m.contributions = []; m.contributionCount = 0; }],
    ["branch option", (m) => { m.contributions[0].branch = "--upload-pack=bad"; }],
    ["bad commit", (m) => { m.contributions[0].head = "HEAD"; }],
    ["traversal", (m) => { m.contributions[0].proofPath = "proof/../PROOF.md"; }],
    ["empty path component", (m) => { m.contributions[0].proofPath = "proof//PROOF.md"; }],
    ["digest", (m) => { m.contributions[0].proofSha256 = "not-a-digest"; }],
    ["kind", (m) => { m.contributions[0].kind = "deployed"; }],
    ["over cap", (m) => { m.contributions[0].reportedBackendBytes = 131073; }],
    ["noninteger bytes", (m) => { m.contributions[0].reportedBackendBytes = 1.5; }],
    ["unknown dependency", (m) => { m.contributions[0].base = C; }],
    ["self cycle", (m) => { m.contributions[0].base = B; }],
    ["duplicate id", (m) => { m.contributions.push({ ...m.contributions[0] }); m.contributionCount++; }],
    ["duplicate branch", (m) => { m.contributions.push({ ...m.contributions[0], id: "second", head: C }); m.contributionCount++; }],
    ["duplicate head", (m) => { m.contributions.push({ ...m.contributions[0], id: "second", branch: "saarius/second" }); m.contributionCount++; }],
  ]) {
    await t.test(label, () => {
      const snapshot = manifest(), calls = [];
      mutate(snapshot);
      assert.throws(() => verifyReview(snapshot, { git: fakeGit(snapshot, calls) }));
      assert.equal(calls.length, 0);
    });
  }
});

test("valid stacks resolve to the recorded root, while dependency cycles fail", () => {
  const snapshot = manifest();
  snapshot.contributions.push({ ...snapshot.contributions[0], id: "second", branch: "saarius/second", base: B, head: C });
  snapshot.contributionCount = 2;
  validateManifest(snapshot);
  assert.equal(verifyReview(snapshot, { git: fakeGit(snapshot) }).contributions.length, 2);
  snapshot.contributions[0].base = C;
  assert.throws(() => validateManifest(snapshot), /dependency cycle/);
});

test("changed proof content is not accepted", () => {
  const snapshot = manifest();
  const normal = fakeGit(snapshot);
  assert.throws(() => verifyReview(snapshot, { git: (args) => args[0] === "show" ? Buffer.from("changed") : normal(args) }), /proof digest mismatch/);
});

test("Git failures are failures, and raw diagnostics are not reprinted", () => {
  const snapshot = manifest();
  const normal = fakeGit(snapshot);
  let caught;
  try {
    verifyReview(snapshot, { git: (args) => {
      if (args[0] === "merge-base") throw new Error("synthetic-private-diagnostic");
      return normal(args);
    } });
  } catch (error) { caught = error; }
  assert.match(caught.message, /fixture ancestry/);
  assert.equal(caught.message.includes("synthetic-private-diagnostic"), false);
});

test("missing, moved, duplicated and malformed remote refs are rejected", async (t) => {
  const snapshot = manifest();
  const baseline = `${A}\trefs/heads/review/upstream-fixture\n`;
  for (const [label, advertised, error] of [
    ["missing", baseline, /published ref missing/],
    ["moved", baseline + `${C}\trefs/heads/saarius/fixture\n`, /published ref moved/],
    ["duplicate", baseline + baseline, /duplicate remote ref/],
    ["malformed", baseline + `bad\trefs/heads/saarius/fixture\n`, /unexpected remote ref/],
    ["unexpected", baseline + `${B}\trefs/heads/saarius/other\n`, /unexpected remote ref/],
  ]) {
    await t.test(label, () => {
      assert.throws(() => verifyReview(snapshot, { remote: true, git: fakeGit(snapshot, [], Buffer.from(advertised)) }), error);
    });
  }
});

function realRepository(t) {
  const directory = mkdtempSync(join(tmpdir(), "commerce-review-git-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const hooks = join(directory, "empty-hooks");
  mkdirSync(hooks);
  const git = (args) => execFileSync("git", ["-c", "user.name=Public Fixture", "-c", "user.email=fixture@example.test",
    "-c", "commit.gpgsign=false", "-c", `core.hooksPath=${hooks}`, ...args], { cwd: directory, stdio: ["ignore", "pipe", "pipe"] });
  git(["init", "--quiet"]);
  const proofPath = join(directory, "proof", "fixture", "PROOF.md");
  mkdirSync(join(directory, "proof", "fixture"), { recursive: true });
  writeFileSync(proofPath, "baseline\n");
  git(["add", "."]); git(["commit", "-qm", "synthetic baseline"]);
  const baseline = String(git(["rev-parse", "HEAD"])).trim();
  writeFileSync(proofPath, proof);
  git(["add", "."]); git(["commit", "-qm", "synthetic contribution"]);
  const head = String(git(["rev-parse", "HEAD"])).trim();
  const snapshot = manifest();
  snapshot.baseline.head = baseline;
  Object.assign(snapshot.contributions[0], { base: baseline, head });
  return { git, directory, snapshot };
}

test("real local Git commit/proof checks leave HEAD, index and worktree unchanged", (t) => {
  const { git, directory, snapshot } = realRepository(t);
  const before = { head: git(["rev-parse", "HEAD"]), index: readFileSync(join(directory, ".git", "index")), proof: readFileSync(join(directory, "proof", "fixture", "PROOF.md")) };
  const report = verifyReview(snapshot, { git });
  assert.equal(report.contributions.length, 1);
  assert.deepEqual(git(["rev-parse", "HEAD"]), before.head);
  assert.deepEqual(readFileSync(join(directory, ".git", "index")), before.index);
  assert.deepEqual(readFileSync(join(directory, "proof", "fixture", "PROOF.md")), before.proof);
  assert.equal(String(git(["status", "--porcelain"])), "");
});

test("real local Git refuses an unrelated commit with a matching proof", (t) => {
  const { git, snapshot } = realRepository(t);
  const tree = String(git(["rev-parse", "HEAD^{tree}"])).trim();
  snapshot.contributions[0].head = String(git(["commit-tree", tree, "-m", "synthetic unrelated root"])).trim();
  assert.throws(() => verifyReview(snapshot, { git }), /fixture ancestry/);
});

test("real local Git rejects a blob presented as a contribution commit", (t) => {
  const { git, snapshot } = realRepository(t);
  snapshot.contributions[0].head = String(git(["rev-parse", "HEAD:proof/fixture/PROOF.md"])).trim();
  assert.throws(() => verifyReview(snapshot, { git }), /fixture commit/);
});

test("the published manifest and README agree on all immutable links", () => {
  const snapshot = JSON.parse(readFileSync(new URL("./manifest.json", import.meta.url), "utf8"));
  const readme = readFileSync(new URL("./README.md", import.meta.url), "utf8");
  validateManifest(snapshot);
  assert.equal(snapshot.contributions.length, 10);
  const repository = snapshot.fork.replace(/\.git$/, "");
  for (const entry of snapshot.contributions) {
    assert.ok(readme.includes(`${repository}/compare/${entry.base}...${entry.head}`), `${entry.id} comparison missing`);
    assert.ok(readme.includes(`${repository}/blob/${entry.head}/${entry.proofPath}`), `${entry.id} proof missing`);
  }
});

test("CLI help needs no Git, unknown options exit 2 and Git failures exit 1", () => {
  const executable = fileURLToPath(new URL("./verify.mjs", import.meta.url));
  const options = { env: { ...process.env, PATH: "" }, stdio: ["ignore", "pipe", "pipe"] };
  assert.match(String(execFileSync(process.execPath, [executable, "--help"], options)), /Never runs product tests/);
  assert.throws(() => execFileSync(process.execPath, [executable, "--unknown"], options), (error) => error.status === 2);
  assert.throws(() => execFileSync(process.execPath, [executable], options), (error) => {
    assert.equal(error.status, 1);
    assert.equal(String(error.stdout), "");
    assert.match(String(error.stderr), /Git identity check failed: baseline commit/);
    assert.equal(String(error.stderr).includes("ENOENT"), false, "raw spawn diagnostics are not output");
    return true;
  });
});
