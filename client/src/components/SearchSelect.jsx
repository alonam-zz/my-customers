import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lightweight searchable select (combobox).
 *
 * Props:
 *  - options: [{ id, name }]
 *  - value: selected id
 *  - onChange: (id) => void
 *  - placeholder: text shown when nothing selected
 *  - searchPlaceholder: text in the search box
 */
export default function SearchSelect({
  options = [],
  value = "",
  onChange,
  name = "",
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

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.name).toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="form-select text-start"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
      >
        {selected ? selected.name : <span className="text-muted">{placeholder}</span>}
      </button>

      {open && !disabled && (
        <div
          className="border rounded bg-white shadow-sm position-absolute w-100 mt-1"
          style={{ zIndex: 1056, maxHeight: 160, overflowY: "auto" }}
        >
          <div className="p-2 border-bottom">
            <input
              autoFocus
              className="form-control form-control-sm"
              placeholder={searchPlaceholder}
              name={name}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="list-unstyled mb-0">
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className={
                    "btn btn-link text-decoration-none d-block w-100 text-start px-3 py-1 " +
                    (String(o.id) === String(value) ? "fw-bold text-primary" : "text-dark")
                  }
                  onClick={() => {
                    onChange?.(o.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {o.name}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-muted px-3 py-2">—</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
