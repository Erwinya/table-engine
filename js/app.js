import { filterRows, paginate, sortRows } from "./engine.js";

const state = {
  rows: [],
  query: "",
  status: "",
  sortKey: "updated",
  sortDir: "desc",
  page: 1,
  pageSize: 10,
};

const tbody = document.getElementById("tbody");
const pageInfo = document.getElementById("page-info");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  const filtered = filterRows(state.rows, { query: state.query, status: state.status });
  const sorted = sortRows(filtered, state.sortKey, state.sortDir);
  const page = paginate(sorted, state.page, state.pageSize);
  state.page = page.page;

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

  pageInfo.textContent = `Showing ${page.from}–${page.to} of ${page.total}`;
  prevBtn.disabled = page.page <= 1;
  nextBtn.disabled = page.page >= page.totalPages;
  document.querySelectorAll("th button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.sort === state.sortKey);
  });
}

document.getElementById("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  state.page = 1;
  render();
});
document.getElementById("status-filter").addEventListener("change", (e) => {
  state.status = e.target.value;
  state.page = 1;
  render();
});
document.getElementById("page-size").addEventListener("change", (e) => {
  state.pageSize = Number(e.target.value);
  state.page = 1;
  render();
});
document.querySelectorAll("th button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.sort;
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

const data = await fetch("./data/inspections.json").then((r) => {
  if (!r.ok) throw new Error("Failed to load data");
  return r.json();
});
state.rows = data;
render();
