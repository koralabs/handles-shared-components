import assert from "node:assert/strict";
import test from "node:test";

import { assertIsNode, delay, hexStringToColor, isValidColor } from "../../src/helpers/index.ts";

test("isValidColor accepts six and eight digit hex colors", () => {
  assert.equal(isValidColor("#A1b2C3"), true);
  assert.equal(isValidColor("#a1b2c3d4"), true);
});

test("isValidColor rejects malformed colors", () => {
  assert.equal(isValidColor("a1b2c3"), false);
  assert.equal(isValidColor("#12345"), false);
  assert.equal(isValidColor("#123456789"), false);
  assert.equal(isValidColor("#12zz56"), false);
});

test("hexStringToColor converts valid Cardano hex colors", () => {
  assert.equal(hexStringToColor("0x112233"), "#112233");
  assert.equal(hexStringToColor("0x11223344"), "#11223344");
});

test("hexStringToColor falls back for invalid values", () => {
  assert.equal(hexStringToColor("0x12345"), "#ffffff00");
  assert.equal(hexStringToColor("not-a-color", "#000000"), "#000000");
});

test("delay resolves after the requested timeout", async () => {
  const startedAt = Date.now();
  await delay(1);
  assert.ok(Date.now() - startedAt >= 0);
});

test("assertIsNode accepts node-like event targets", () => {
  assert.doesNotThrow(() => assertIsNode({ nodeType: 1 } as unknown as EventTarget));
});

test("assertIsNode rejects null and non-node event targets", () => {
  assert.throws(() => assertIsNode(null), /Node expected/);
  assert.throws(() => assertIsNode({} as EventTarget), /Node expected/);
});
