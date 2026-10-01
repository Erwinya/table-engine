# table-engine

Client-side table engine with search, status filter, column sort, and pagination.

## Status

Pure table helpers (`js/engine.js`) and sample inspection data are in place. Demo page and styles will land in follow-up commits.

## Module

```js
import { filterRows, sortRows, paginate } from "./js/engine.js";

const filtered = filterRows(rows, { query: "WAFER", status: "COMPLETED" });
const sorted = sortRows(filtered, "updated", "desc");
const page = paginate(sorted, 1, 10);
```

## Planned run

```powershell
python -m http.server 5181
```

Then open http://localhost:5181

## License

MIT
