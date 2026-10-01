/**
 * Pure table helpers: filter, sort, paginate.
 * UI wiring lands in a follow-up commit.
 */

export function compare(a, b, key) {
  return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function filterRows(rows, { query = "", status = "" } = {}) {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (status && row.status !== status) return false;
    if (!q) return true;
    return [row.lot, row.part, row.inspector, row.status, row.result]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export function sortRows(rows, sortKey = "updated", sortDir = "desc") {
  return rows.slice().sort((a, b) => {
    const result = compare(a, b, sortKey);
    return sortDir === "asc" ? result : -result;
  });
}

export function paginate(rows, page = 1, pageSize = 10) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    total: rows.length,
    rows: rows.slice(start, start + pageSize),
    from: rows.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, rows.length),
  };
}
