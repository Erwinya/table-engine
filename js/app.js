import { filterRows, paginate, parseState, serializeState, sortRows } from "./engine.js";

const initial = parseState(window.location.search);
const state = {
  rows: [],
  ...initial,
};

const tbody = document.getElementById("tbody");
const pageInfo = document.getElementById("page-info");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("status-filter");
const resultFilter = document.getElementById("result-filter");
const pageSizeSelect = document.getElementById("page-size");
const clearBtn = document.getElementById("clear-filters");

searchInput.value = state.query;
statusFilter.value = state.status;
resultFilter.value = state.result;
pageSizeSelect.value = String(state.pageSize);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hasActiveFilters() {
  return Boolean(state.query || state.status || state.result);
}

function syncUrl() {
  const next = serializeState(state);
  const url = `${window.location.pathname}${next}`;
  window.history.replaceState(null, "", url);
}

function render() {
  const filtered = filterRows(state.rows, {
    query: state.query,
    status: state.status,
    result: state.result,
  });
  const sorted = sortRows(filtered, state.sortKey, state.sortDir);
  const page = paginate(sorted, state.page, state.pageSize);
  state.page = page.page;
  syncUrl();

  if (page.rows.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">${hasActiveFilters() ? "No rows match the current filters." : "No inspection rows loaded."}</td>
      </tr>`;
  } else {
    tbody.innerHTML = page.rows
      .map(
        (row) => `
    <tr>
      <td><code>${escapeHtml(row.lot)}</code></td>
      <td>${escapeHtml(row.part)}</td>
      <td>${escapeHtml(row.inspector)}</td>
      <td><span class="badge ${escapeHtml(row.status)}">${escapeHtml(row.status)}</span></td>
      <td><span class="badge ${escapeHtml(row.result)}">${escapeHtml(row.result)}</span></td>
      <td>${escapeHtml(row.updated)}</td>
    </tr>`
      )
      .join("");
  }

  pageInfo.textContent =
    page.total === 0
      ? "Showing 0 of 0"
      : `Showing ${page.from}–${page.to} of ${page.total}`;
  prevBtn.disabled = page.page <= 1 || page.total === 0;
  nextBtn.disabled = page.page >= page.totalPages || page.total === 0;
  clearBtn.disabled = !hasActiveFilters();

  document.querySelectorAll("th[data-sort]").forEach((th) => {
    const key = th.dataset.sort;
    const btn = th.querySelector("button");
    const active = key === state.sortKey;
    btn.classList.toggle("active", active);
    th.setAttribute("aria-sort", active ? (state.sortDir === "asc" ? "ascending" : "descending") : "none");
    const label = btn.dataset.label || btn.textContent.replace(/\s*[↑↓]$/, "");
    btn.dataset.label = label;
    btn.textContent = active ? `${label} ${state.sortDir === "asc" ? "↑" : "↓"}` : label;
  });
}

function clearFilters() {
  state.query = "";
  state.status = "";
  state.result = "";
  state.page = 1;
  searchInput.value = "";
  statusFilter.value = "";
  resultFilter.value = "";
  render();
}

function applyParsedState(parsed) {
  Object.assign(state, parsed);
  searchInput.value = state.query;
  statusFilter.value = state.status;
  resultFilter.value = state.result;
  pageSizeSelect.value = String(state.pageSize);
  render();
}

searchInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  state.page = 1;
  render();
});
statusFilter.addEventListener("change", (e) => {
  state.status = e.target.value;
  state.page = 1;
  render();
});
resultFilter.addEventListener("change", (e) => {
  state.result = e.target.value;
  state.page = 1;
  render();
});
pageSizeSelect.addEventListener("change", (e) => {
  state.pageSize = Number(e.target.value);
  state.page = 1;
  render();
});
clearBtn.addEventListener("click", clearFilters);
document.querySelectorAll("th[data-sort] button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.closest("th").dataset.sort;
    if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
    else {
      state.sortKey = key;
      state.sortDir = "asc";
    }
    render();
  });
});
prevBtn.addEventListener("click", () => {
  state.page -= 1;
  render();
});
nextBtn.addEventListener("click", () => {
  state.page += 1;
  render();
});
window.addEventListener("popstate", () => {
  applyParsedState(parseState(window.location.search));
});

try {
  const response = await fetch("./data/inspections.json");
  if (!response.ok) throw new Error("Failed to load data");
  state.rows = await response.json();
  render();
} catch (error) {
  pageInfo.textContent = "Failed to load inspection data.";
  tbody.innerHTML = `
    <tr class="empty-row">
      <td colspan="6">${escapeHtml(error.message || "Load error")}</td>
    </tr>`;
}
