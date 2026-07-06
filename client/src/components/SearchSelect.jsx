import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lightweight searchable select (combobox).
 *
 * Props:
 *  - options: [{ id, name }]
 *  - value: selected id (single) OR array of ids (when multiple)
 *  - onChange: (id) => void (single) OR (ids[]) => void (when multiple)
 *  - multiple: allow selecting several options (default false)
 *  - placeholder: text shown when nothing selected
 *  - searchPlaceholder: text in the search box
 */
export default function SearchSelect({
  options = [],
  value = "",
  onChange,
  name = "",
  multiple = false,
  placeholder = "",
  searchPlaceholder = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // normalise the current selection into a set of string ids (works for both modes)
  const selectedIds = useMemo(() => {
    if (multiple) return new Set((Array.isArray(value) ? value : []).map(String));
    return new Set(value != null && value !== "" ? [String(value)] : []);
  }, [multiple, value]);

  // options that are currently selected, in options order (for chips / labels)
  const selectedOptions = useMemo(
    () => options.filter((o) => selectedIds.has(String(o.id))),
    [options, selectedIds]
  );
  const selected = selectedOptions[0]; // single-mode convenience

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.name).toLowerCase().includes(q));
  }, [options, query]);

  // toggle one option in multiple mode; emit the new id array in options order
  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(String(id))) next.delete(String(id));
    else next.add(String(id));
    onChange?.(options.filter((o) => next.has(String(o.id))).map((o) => o.id));
  };

  const pick = (id) => {
    if (multiple) {
      toggle(id);
      // keep the panel open + query intact so several can be chosen
    } else {
      onChange?.(id);
      setOpen(false);
      setQuery("");
    }
  };

  const selectAll = () => onChange?.(options.map((o) => o.id));
  const clearAll = () => onChange?.([]);

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="form-select text-start elipsis"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
      >
        {multiple
          ? (selectedOptions.length
              ? selectedOptions.map((o) => o.name).join(", ")
              : <span className="text-muted">{placeholder}</span>)
          : (selected ? selected.name : <span className="text-muted">{placeholder}</span>)}
      </button>

      {open && !disabled && (
        <div
          className="border rounded bg-white shadow-sm position-absolute w-100 mt-1"
          style={{ zIndex: 1056, maxHeight: 200, overflowY: "auto" }}
        >
          <div className="p-2 border-bottom">
            {multiple && selectedOptions.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-2">
                {selectedOptions.map((o) => (
                  <span key={o.id} className="badge text-bg-secondary d-inline-flex align-items-center gap-1">
                    {o.name}
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      style={{ fontSize: "0.5rem" }}
                      aria-label="remove"
                      onClick={() => toggle(o.id)}
                    />
                  </span>
                ))}
              </div>
            )}
            <input
              autoFocus
              className="form-control form-control-sm"
              placeholder={searchPlaceholder}
              name={name}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {multiple && (
              <div className="d-flex justify-content-between mt-2">
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={selectAll}>
                  {"✓"} All
                </button>
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none text-secondary" onClick={clearAll}>
                  {"✕"} Clear
                </button>
              </div>
            )}
          </div>
          <ul className="list-unstyled mb-0">
            {filtered.map((o) => {
              const isSelected = selectedIds.has(String(o.id));
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    className={
                      "btn btn-link text-decoration-none d-flex w-100 text-start px-3 py-1 align-items-center gap-2 " +
                      (isSelected ? "fw-bold text-primary" : "text-dark")
                    }
                    onClick={() => pick(o.id)}
                  >
                    {multiple && (
                      <span style={{ width: "1rem", display: "inline-block" }}>
                        {isSelected ? "✓" : ""}
                      </span>
                    )}
                    {o.name}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-muted px-3 py-2">—</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
