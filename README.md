# table-engine

Client-side table engine with search, status/result filters, column sort, pagination, clear-filters, and shareable URL state.

## Status

Complete: table helpers, sample data, accessible demo page, styles, unit tests, and CI.

## Screenshot

![Table Engine demo](docs/demo.png)

## Run

```powershell
python -m http.server 5181
```

Then open http://localhost:5181

Filters, sort, page, and page size are written to the query string so a reload or shared link restores the same view.

Supported parameters: `q`, `status`, `result`, `sort`, `dir`, `page`, `size`.

## Module

```js
import { filterRows, sortRows, paginate, parseState, serializeState } from "./js/engine.js";

const filtered = filterRows(rows, { query: "WAFER", status: "COMPLETED", result: "PASS" });
const sorted = sortRows(filtered, "updated", "desc");
const page = paginate(sorted, 1, 10);
const state = parseState("?q=WAFER&page=2");
```

Default page size is `10` (`paginate(rows, page, pageSize)`).

```powershell
node --check .\js\engine.js
node --check .\js\app.js
node --test .\test\engine.test.mjs
```

## License

MIT
