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
  multiple = false
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


  const selectedIds = useMemo(() => {
    if (multiple) return new Set((Array.isArray(value) ? value : []).map(String));
    return new Set(value != null && value !== "" ? [String(value)] : []);
  }, [multiple, value]);

  // options that are currently selected, in options order (for chips / labels)
  const selectedOptions = useMemo(
    () => options.filter((o) => selectedIds.has(String(o.id))),
    [options, selectedIds]
  );

  const selected = options.find((o) => String(o.id) === String(value));

  const onSelect  = (val) =>{
    if (multiple) {
      toggle(val);
      // keep the panel open + query intact so several can be chosen
    } 
    else{
      setSelectedValue(val)
      // notify the parent — mimic a native input event shape so handleChange({ name, value }) works
      onChange?.({ target: { name:name, value: val, type: "select" } })
      setOpen(false);
    }
  }

  // toggle one option in multiple mode; emit the new id array in options order
  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(String(id))) next.delete(String(id));
    else next.add(String(id));
    onChange?.(options.filter((o) => next.has(String(o.id))).map((o) => o.id));
  };


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
          <ul className="list-unstyled mb-0">
            {options.map((o) => {
              const isSelected = selectedIds.has(String(o.id));
              return (
              <li key={o.id}>
                <button
                  type="button"
                  className={
                    "btn btn-link text-decoration-none d-block w-100 text-start px-3 py-1 " +
                    (multiple?
                      (isSelected ? "fw-bold text-primary" : "text-dark")
                      :
                      (String(o.id) === String(value) ? "fw-bold text-primary" : "text-dark")
                    )

                  }
                  onClick={() => {
                    onSelect(o.id)
                  }}
                >
                  {multiple && (
                      <span style={{ width: "1rem", display: "inline-block" }}>
                        {isSelected ? "✓" : ""}
                      </span>
                    )}
                  {o.name}
                </button>
              </li>
            )}
            )}
            {options.length === 0 && (
              <li className="text-muted px-3 py-2">—</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
