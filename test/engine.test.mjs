import assert from "node:assert/strict";
import { test } from "node:test";
import { filterRows, paginate, sortRows } from "../js/engine.js";

const sample = [
  { lot: "LOT-1", part: "WAFER-A", inspector: "qa.lead", status: "COMPLETED", result: "PASS", updated: "2026-11-10" },
  { lot: "LOT-2", part: "WAFER-B", inspector: "qa.night", status: "IN_PROGRESS", result: "PENDING", updated: "2026-11-12" },
  { lot: "LOT-3", part: "WAFER-A", inspector: "qa.lead", status: "COMPLETED", result: "FAIL", updated: "2026-11-11" },
];

test("filterRows matches query, status, and result", () => {
  assert.equal(filterRows(sample, { query: "WAFER-A" }).length, 2);
  assert.equal(filterRows(sample, { status: "COMPLETED" }).length, 2);
  assert.equal(filterRows(sample, { result: "FAIL" }).length, 1);
  assert.equal(filterRows(sample, { status: "COMPLETED", result: "PASS" }).length, 1);
});

test("sortRows orders by key and direction", () => {
  const asc = sortRows(sample, "lot", "asc");
  assert.equal(asc[0].lot, "LOT-1");
  const desc = sortRows(sample, "updated", "desc");
  assert.equal(desc[0].lot, "LOT-2");
});

test("paginate clamps page and reports window", () => {
  const page = paginate(sample, 99, 2);
  assert.equal(page.page, 2);
  assert.equal(page.totalPages, 2);
  assert.equal(page.rows.length, 1);
  assert.equal(page.from, 3);
  assert.equal(page.to, 3);

  const empty = paginate([], 1, 10);
  assert.equal(empty.from, 0);
  assert.equal(empty.to, 0);
});
