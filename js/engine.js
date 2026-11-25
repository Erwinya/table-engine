/**
 * Pure table helpers: filter, sort, paginate, URL state.
 */

const DEFAULT_STATE = {
  query: "",
  status: "",
  result: "",
  sortKey: "updated",
  sortDir: "desc",
  page: 1,
  pageSize: 10,
};

const SORT_KEYS = new Set(["lot", "part", "inspector", "status", "result", "updated"]);
const SORT_DIRS = new Set(["asc", "desc"]);

export function compare(a, b, key) {
  return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function filterRows(rows, { query = "", status = "", result = "" } = {}) {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (status && row.status !== status) return false;
    if (result && row.result !== result) return false;
    if (!q) return true;
    return [row.lot, row.part, row.inspector, row.status, row.result]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export function sortRows(rows, sortKey = "updated", sortDir = "desc") {
  return rows.slice().sort((a, b) => {
    const cmp = compare(a, b, sortKey);
    return sortDir === "asc" ? cmp : -cmp;
  });
}

export function paginate(rows, page = 1, pageSize = 10) {
  const safeSize = Math.max(1, Number(pageSize) || 10);
  const totalPages = Math.max(1, Math.ceil(rows.length / safeSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safeSize;
  return {
    page: safePage,
    totalPages,
    total: rows.length,
    rows: rows.slice(start, start + safeSize),
    from: rows.length === 0 ? 0 : start + 1,
    to: Math.min(start + safeSize, rows.length),
  };
}

export function normalizeState(input = {}) {
  const pageSizeRaw = Number(input.pageSize);
  const pageRaw = Number(input.page);
  return {
    query: typeof input.query === "string" ? input.query : DEFAULT_STATE.query,
    status: typeof input.status === "string" ? input.status : DEFAULT_STATE.status,
    result: typeof input.result === "string" ? input.result : DEFAULT_STATE.result,
    sortKey: SORT_KEYS.has(input.sortKey) ? input.sortKey : DEFAULT_STATE.sortKey,
    sortDir: SORT_DIRS.has(input.sortDir) ? input.sortDir : DEFAULT_STATE.sortDir,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : DEFAULT_STATE.page,
    pageSize:
      Number.isFinite(pageSizeRaw) && pageSizeRaw >= 1
        ? Math.min(100, Math.floor(pageSizeRaw))
        : DEFAULT_STATE.pageSize,
  };
}

export function parseState(search) {
  const params = new URLSearchParams(
    typeof search === "string" ? search.replace(/^\?/, "") : search || ""
  );
  return normalizeState({
    query: params.get("q") ?? "",
    status: params.get("status") ?? "",
    result: params.get("result") ?? "",
    sortKey: params.get("sort") ?? DEFAULT_STATE.sortKey,
    sortDir: params.get("dir") ?? DEFAULT_STATE.sortDir,
    page: params.get("page") ?? DEFAULT_STATE.page,
    pageSize: params.get("size") ?? DEFAULT_STATE.pageSize,
  });
}

export function serializeState(state) {
  const normalized = normalizeState(state);
  const params = new URLSearchParams();
  if (normalized.query) params.set("q", normalized.query);
  if (normalized.status) params.set("status", normalized.status);
  if (normalized.result) params.set("result", normalized.result);
  if (normalized.sortKey !== DEFAULT_STATE.sortKey) params.set("sort", normalized.sortKey);
  if (normalized.sortDir !== DEFAULT_STATE.sortDir) params.set("dir", normalized.sortDir);
  if (normalized.page !== DEFAULT_STATE.page) params.set("page", String(normalized.page));
  if (normalized.pageSize !== DEFAULT_STATE.pageSize) {
    params.set("size", String(normalized.pageSize));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}
