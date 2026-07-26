// components/DataTable.jsx
import { useMemo, useState,useEffect } from "react";
import { getCookie, setCookie } from "../utils/cookies.js";
import { useI18n } from "../i18n/I18nProvider";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { he } from "date-fns/locale/he"; 
import { toISO } from "../utils/date.js";


export default function DataTable({
  columns,             // [{ key, label, width?, sortable?, render?(row), truncate? }]
  data,                // array of rows
  initialSort = null,  // { key, dir: 'asc' | 'desc' }
  pageSizeOptions = [5, 10, 20],
  showPagination = true,
  onClickItem = null,
  updateDataByPage = null,
  pageCount = null
}) {

  const { t,locale } = useI18n();

  const [sort, setSort] = useState(
    initialSort || (columns[0] ? { key: columns[0].key, dir: "asc" } : null)
  );

   // Get initial page size from cookie or use default
  const [pageSize, setPageSize] = useState(() => {
    const savedPageSize = getCookie('pageSize');
    const initialPageSize = savedPageSize ? parseInt(savedPageSize) : pageSizeOptions[0];
    
    // // Only set cookie if we're using a default value (no saved cookie)
    // if (!savedPageSize) {
    //   setCookie('pageSize', initialPageSize);
    // }
    return initialPageSize;
  });

  useEffect(()=>{
    setCookie('pageSize', pageSize);
  },[pageSize])


  const [page, setPage] = useState(1);

  // Column filters: `filterInputs` updates on every keystroke; `filter` is the
  // debounced value that actually triggers a server fetch.
  const [filterInputs, setFilterInputs] = useState({});
  const [filter, setFilter] = useState({});

  useEffect(() => {
    const id = setTimeout(() => { setFilter(filterInputs); setPage(1); }, 400);
    return () => clearTimeout(id);
  }, [filterInputs]);

  const onFilterChange = (key, value) => {
    setFilterInputs((f) => {
      const next = { ...f };
      if (value === "" || value == null) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const getByPath = (obj, path) =>
    String(path).split(".").reduce((o, k) => o?.[k], obj);
  const isIsoDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v);

  const sorted = useMemo(() => {
    if (!sort?.key) return data;
    const col = columns.find((c) => c.key === sort.key);
    const accessor =
      col?.sortAccessor ||
      col?.accessor ||
      ((row) => getByPath(row, col.key));
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    const arr = [...data].sort((a, b) => {
      let va = accessor(a);
      let vb = accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (isIsoDate(va) && isIsoDate(vb)) return new Date(va) - new Date(vb);
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      if (typeof va === "boolean" && typeof vb === "boolean")
        return va === vb ? 0 : va ? -1 : 1;
      return collator.compare(String(va), String(vb));
    });
    return sort.dir === "asc" ? arr : arr.reverse();
  }, [data, sort, columns]);

  // When the parent supplies pageCount, the server already returned just this
  // page, so render `sorted` as-is and trust the server's page count.
  // Otherwise paginate the full data set locally.
  const serverPaginated = pageCount != null;
  const totalPages = serverPaginated
    ? Math.max(1, Number(pageCount) || 1)
    : Math.max(1, Math.ceil(sorted.length / pageSize));

  // Server-paginated lists are also server-sorted, so render `data` as returned.
  // Local lists still sort/slice on the client.
  const pageData = useMemo(
    () =>
      serverPaginated
        ? data
        : sorted.slice((page - 1) * pageSize, page * pageSize),
    [data, sorted, page, pageSize, serverPaginated]
  );

  useEffect(()=>{
    async function updateDataTable(){
         if (updateDataByPage) await updateDataByPage(pageSize,page,sort?.key,sort?.dir,filter);
    }
    updateDataTable();

  },[page,pageSize,sort,filter])

  // A filterable column declares `filter: true` (text) or
  // `filter: { type: "select", options: [{value,label}] }`.
  const hasFilters = columns.some((c) => c.filter && !c.hide);
  function renderFilterControl(col) {
    if (!col.filter) return null;
    const cfg = col.filter === true ? { type: "text" } : col.filter;
    const value = filterInputs[col.key] ?? "";
    if (cfg.type === "select") {
      return (
        <select
          className="form-select form-select-sm"
          value={value}
          onChange={(e) => onFilterChange(col.key, e.target.value)}
        >
          <option value="">{t("common.all")}</option>
          {cfg.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    }
    if (cfg.type === "date") {
      return (
         <DatePicker
          type="date"
          className="form-control"
          value={value}
          selected={value? new Date(value) : null}
           onChange={(date) => {onFilterChange(col.key, toISO(date))}}
          dateFormat="dd/MM/yyyy hh"
          locale={locale=="he"?he:''}
        />
      )
    }
    return (
      <input
        className="form-control form-control-sm"
        value={value}
        placeholder={t("common.search")}
        onChange={(e) => onFilterChange(col.key, e.target.value)}
      />
    );
  }

  function toggleSort(key) {
    setPage(1);
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  const visibleColumns = columns.filter((col) => !col?.hide);    

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle">
        <thead className="text-sm-start">
          <tr>
            {visibleColumns.map((col) => (
              <th
                key={col.key}
                style={{
                  width: col.width ? `${(col.width / 12) * 100}%` : undefined,
                }}
              >
                {col.sortable === false ? (
                  col.label
                ) : (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}{" "}
                    {sort?.key === col.key ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                  </button>
                )}
              </th>
            ))}
          </tr>
          {hasFilters && (
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key} className="fw-normal">
                  {renderFilterControl(col)}
                </th>
              ))}
            </tr>
          )}
        </thead>

        <tbody className="text-start">
          {pageData.map((row, i) => ( 
            <tr
              key={row.id ?? i}
              onClick={onClickItem ? () => onClickItem(row) : undefined}
              style={onClickItem ? { cursor: "pointer" } : undefined}
            >
              {visibleColumns.map((col) => {
                const content =
                  typeof col.render === "function"
                    ? col.render(row)
                    : getByPath(row, col.key);
                return (
                  <td
                    key={col.key}
                    className={col.truncate ? "text-truncate" : ""}
                    title={typeof content === "string" ? content : undefined}
                    style={col.truncate ? { maxWidth: 220 } : undefined}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
          {pageData.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <em>No results</em>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      {showPagination && (
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">{t("common.rowPerPage")}:</span>
          <select
            className="form-select form-select-sm w-auto"
            value={pageSize}
            onChange={(e) => {
              let pageSize = Number(e.target.value);
              setPageSize(pageSize);
              setPage(1);
            }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        

        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(1)}>
                «
              </button>
            </li>
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("common.prev")}
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                {page} / {totalPages}
              </span>
            </li>
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t("common.next")}
              </button>
            </li>
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(totalPages)}>
                »
              </button>
            </li>
          </ul>
        </nav>
      </div>
      )}
    </div>
  );
}
