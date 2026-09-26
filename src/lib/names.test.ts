import test from "node:test";
import assert from "node:assert/strict";
import { displayName } from "./names.ts";

test("Korean names read family name first with no space", () => {
  assert.equal(displayName("민수", "김"), "김민수");
});

test("English names keep first-last order", () => {
  assert.equal(displayName("Grace", "Park"), "Grace Park");
});

test("mixed scripts fall back to first-last order", () => {
  assert.equal(displayName("Grace", "박"), "Grace 박");
});
