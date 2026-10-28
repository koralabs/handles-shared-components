import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..", "..");

// The deploy workflow publishes lib/ as the npm package root. The build must
// produce that whole package in lib/ and leave the source manifest untouched
// (an in-place rewrite of package.json was once committed, which moved the
// build output out of lib/ and broke every publish).
test("npm run build emits a publishable package in lib/ without rewriting package.json", { timeout: 300_000 }, () => {
  const sourceBefore = readFileSync(join(root, "package.json"), "utf8");
  rmSync(join(root, "lib"), { recursive: true, force: true });

  execFileSync("npm", ["run", "build"], { cwd: root, stdio: "pipe" });

  assert.equal(readFileSync(join(root, "package.json"), "utf8"), sourceBefore);
  const source = JSON.parse(sourceBefore);
  const manifest = JSON.parse(readFileSync(join(root, "lib", "package.json"), "utf8"));
  assert.equal(manifest.name, source.name);
  assert.equal(manifest.version, source.version);
  assert.deepEqual(manifest.files, ["*"]);
  for (const entry of [manifest.main, manifest.module, manifest.types]) {
    assert.ok(existsSync(join(root, "lib", entry)), `lib/${entry} missing`);
  }
  assert.match(readFileSync(join(root, "lib", manifest.types), "utf8"), /interface ButtonProps/);
});
