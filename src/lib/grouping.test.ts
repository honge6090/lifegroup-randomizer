import test from "node:test";
import assert from "node:assert/strict";
import { partitionSizes, shuffle, assignGroups } from "./grouping.ts";

test("no members means no groups", () => {
  assert.deepEqual(partitionSizes(0), []);
  assert.deepEqual(partitionSizes(-3), []);
});

test("small turnouts stay in one group up to five", () => {
  assert.deepEqual(partitionSizes(1), [1]);
  assert.deepEqual(partitionSizes(2), [2]);
  assert.deepEqual(partitionSizes(3), [3]);
  assert.deepEqual(partitionSizes(4), [4]);
  assert.deepEqual(partitionSizes(5), [5]);
});

test("exact multiples of five split evenly", () => {
  assert.deepEqual(partitionSizes(10), [5, 5]);
  assert.deepEqual(partitionSizes(20), [5, 5, 5, 5]);
  assert.deepEqual(partitionSizes(50), Array(10).fill(5));
});

test("remainders spread out instead of leaving a tiny group", () => {
  assert.deepEqual(partitionSizes(13), [5, 4, 4]);
  assert.deepEqual(partitionSizes(17), [5, 4, 4, 4]);
  assert.deepEqual(partitionSizes(23), [5, 5, 5, 4, 4]);
  assert.deepEqual(partitionSizes(11), [4, 4, 3]);
  assert.deepEqual(partitionSizes(21), [5, 4, 4, 4, 4]);
});

test("never builds a group larger than five", () => {
  for (let n = 1; n <= 400; n++) {
    const sizes = partitionSizes(n);
    assert.ok(
      sizes.every((s) => s <= 5),
      `n=${n} produced an oversized group: ${sizes.join(",")}`,
    );
  }
});

test("group sizes always add back up to the member count", () => {
  for (let n = 1; n <= 400; n++) {
    const total = partitionSizes(n).reduce((a, b) => a + b, 0);
    assert.equal(total, n, `n=${n} lost or invented people`);
  }
});

test("sizes never differ by more than one, so no group is stranded", () => {
  for (let n = 1; n <= 400; n++) {
    const sizes = partitionSizes(n);
    assert.ok(
      Math.max(...sizes) - Math.min(...sizes) <= 1,
      `n=${n} is lopsided: ${sizes.join(",")}`,
    );
  }
});

test("nobody is ever left in a group alone once there are four or more", () => {
  for (let n = 4; n <= 400; n++) {
    const sizes = partitionSizes(n);
    assert.ok(
      Math.min(...sizes) >= 3,
      `n=${n} stranded someone: ${sizes.join(",")}`,
    );
  }
});

test("shuffle keeps every member exactly once", () => {
  const names = Array.from({ length: 50 }, (_, i) => `p${i}`);
  const out = shuffle(names);
  assert.equal(out.length, names.length);
  assert.deepEqual([...out].sort(), [...names].sort());
});

test("shuffle does not mutate the input", () => {
  const names = ["a", "b", "c", "d", "e"];
  const copy = [...names];
  shuffle(names);
  assert.deepEqual(names, copy);
});

test("shuffle actually reorders things", () => {
  const names = Array.from({ length: 100 }, (_, i) => `p${i}`);
  const identical = Array.from({ length: 20 }, () =>
    shuffle(names).every((v, i) => v === names[i]),
  );
  assert.ok(
    identical.some((same) => !same),
    "20 shuffles all returned the original order",
  );
});

test("assignGroups numbers groups from 1 and places everyone once", () => {
  const members = Array.from({ length: 13 }, (_, i) => ({ id: `id-${i}` }));
  const assigned = assignGroups(members);

  assert.equal(assigned.length, 13);
  assert.deepEqual(
    [...new Set(assigned.map((a) => a.group_number))].sort((x, y) => x - y),
    [1, 2, 3],
  );
  assert.deepEqual(
    assigned.map((a) => a.id).sort(),
    members.map((m) => m.id).sort(),
  );

  const counts = new Map<number, number>();
  for (const a of assigned) {
    counts.set(a.group_number, (counts.get(a.group_number) ?? 0) + 1);
  }
  assert.deepEqual([...counts.values()].sort((x, y) => y - x), [5, 4, 4]);
});

test("assignGroups handles an empty roster", () => {
  assert.deepEqual(assignGroups([]), []);
});
