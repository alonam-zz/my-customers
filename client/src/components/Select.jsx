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
export default function Select({
  options = [],
  value = "",
  onChange,
  name = "",
  placeholder = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
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

  const onSelect  = (val) =>{
    setSelectedValue(val)
    // notify the parent — mimic a native input event shape so handleChange({ name, value }) works
    onChange?.({ target: { name, value: val, type: "select" } })
    setOpen(false);
  }


  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="form-select text-start"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
      >
        {selected ? selected.name : <span className="text-muted">{value}</span>}
      </button>

      {open && !disabled && (
        <div
          className="border rounded bg-white shadow-sm position-absolute w-100 mt-1"
          style={{ zIndex: 1056, maxHeight: 160, overflowY: "auto" }}
        >
          <ul className="list-unstyled mb-0">
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className={
                    "btn btn-link text-decoration-none d-block w-100 text-start px-3 py-1 " +
                    (String(o.id) === String(value) ? "fw-bold text-primary" : "text-dark")
                  }
                  onClick={() => {
                    onSelect(o.id)
                  }}
                >
                  {o.name}
                </button>
              </li>
            ))}
            {options.length === 0 && (
              <li className="text-muted px-3 py-2">—</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
