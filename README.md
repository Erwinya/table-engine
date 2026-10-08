# table-engine

Client-side table engine with search, status filter, column sort, and pagination.

## Status

Complete: table helpers, sample data, accessible demo page, styles, and CI.

## Run

```powershell
python -m http.server 5181
```

Then open http://localhost:5181

## Module

```js
import { filterRows, sortRows, paginate } from "./js/engine.js";

const filtered = filterRows(rows, { query: "WAFER", status: "COMPLETED" });
const sorted = sortRows(filtered, "updated", "desc");
const page = paginate(sorted, 1, 10);
```

## License

MIT
