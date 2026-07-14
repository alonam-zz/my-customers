import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lightweight searchable select (combobox).
 *
 * Props:
 *  - options: [{ id, name }] or, for grouping, [{ id, name, children: [{ id, name }] }]
 *  - value: selected id (single) / array of selected ids (multiple)
 *  - onChange: (id) => void
 *  - placeholder: text shown when nothing selected
 *  - searchPlaceholder: text in the search box
 *  - multiple: allow selecting several options; only in this mode do groups let
 *    a parent toggle all of its children at once.
 */
export default function Select({
  options = [],
  value = "",
  onChange,
  name = "",
  placeholder = "",
  disabled = false,
  multiple = false,
  required = true
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

  // is this a group (has children) or a plain leaf option?
  const isGroup = (o) => Array.isArray(o.children) && o.children.length > 0;

  // flatten to the real (leaf) options — the only ones that become values
  const leafOptions = useMemo(
    () => options.flatMap((o) => (isGroup(o) ? o.children : [o])),
    [options]
  );

  // every node (group parents + leaves) — used only to resolve the display label
  const allNodes = useMemo(
    () => options.flatMap((o) => (isGroup(o) ? [o, ...o.children] : [o])),
    [options]
  );

  const selectedIds = useMemo(() => {
    if (multiple) return new Set((Array.isArray(value) ? value : []).map(String));
    return new Set(value != null && value !== "" ? [String(value)] : []);
  }, [multiple, value]);

  const selected = allNodes.find((o) => String(o.id) === String(value));

  // emit the new id array (leaf order) from a Set of selected ids
  const emit = (nextSet) =>
    onChange?.(leafOptions.filter((o) => nextSet.has(String(o.id))).map((o) => o.id));

  const onSelect = (val) => {
    if (multiple) {
      toggle(val);
      // keep the panel open + query intact so several can be chosen
    } else {
      setSelectedValue(val);
      // notify the parent — mimic a native input event shape so handleChange({ name, value }) works
      onChange?.({ target: { name: name, value: val, type: "select" } });
      setOpen(false);
    }
  };

  // toggle one leaf option in multiple mode; emit the new id array
  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(String(id))) next.delete(String(id));
    else next.add(String(id));
    emit(next);
  };

  // how many of a group's children are currently selected
  const groupState = (group) => {
    const ids = group.children.map((c) => String(c.id));
    const count = ids.filter((id) => selectedIds.has(id)).length;
    return { all: count === ids.length && ids.length > 0, some: count > 0, ids };
  };

  // toggle a whole group: select all children if not all selected, else clear them
  const toggleGroup = (group) => {
    const { all, ids } = groupState(group);
    const next = new Set(selectedIds);
    if (all) ids.forEach((id) => next.delete(id));
    else ids.forEach((id) => next.add(id));
    emit(next);
  };

  const mark = (checked) => (
    <span style={{ width: "1rem", display: "inline-block" }}>{checked}</span>
  );

  const renderLeaf = (o, indented = false) => {
    const isSelected = selectedIds.has(String(o.id));
    return (
      <li key={o.id}>
        <button
          type="button"
          className={
            "btn btn-link text-decoration-none d-block w-100 text-start py-1 " +
            (indented ? "ps-5 pe-3 " : "px-3 ") +
            (multiple
              ? (isSelected ? "fw-bold text-primary" : "text-dark")
              : (String(o.id) === String(value) ? "fw-bold text-primary" : "text-dark"))
          }
          onClick={() => onSelect(o.id)}
        >
          {multiple && mark(isSelected ? "✓" : "")}
          {o.name}
        </button>
      </li>
    );
  };

  const renderGroup = (g) => {
    const { all, some } = groupState(g);
    return (
      <li key={g.id}>
        {/* parent row: in multiple mode it toggles all children */}
        <button
          type="button"
          className={
            "btn btn-link text-decoration-none d-block w-100 text-start px-3 py-1 fw-bold " +
            (multiple && some ? "text-primary" : "text-dark")
          }
          onClick={() => (multiple ? toggleGroup(g) : null)}
          style={multiple ? undefined : { cursor: "default" }}
        >
          {multiple && mark(all ? "✓" : some ? "–" : "")}
          {g.name}
        </button>
        {/* children */}
        <ul className="list-unstyled mb-0">
          {g.children.map((c) => renderLeaf(c, true))}
        </ul>
      </li>
    );
  };

  // the current value as seen by native form validation (any leaf selected)
  const requiredValue = multiple
    ? (Array.isArray(value) && value.length ? "1" : "")
    : (value != null && value !== "" ? String(value) : "");

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

      {/* Hidden mirror input so `required` participates in native form validation.
          Not display:none (that would exclude it from validation) — instead it
          overlays the trigger transparently and ignores pointer events. */}
      {required && !disabled && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          required
          name={name}
          value={requiredValue}
          onChange={() => {}}
          style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }}
        />
      )}

      {open && !disabled && (
        <div
          className="border rounded bg-white shadow-sm position-absolute w-100 mt-1"
          style={{ zIndex: 1056, maxHeight: 160, overflowY: "auto" }}
        >
          <ul className="list-unstyled mb-0">
            {options.map((o) => (isGroup(o) ? renderGroup(o) : renderLeaf(o)))}
            {options.length === 0 && (
              <li className="text-muted px-3 py-2">—</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
