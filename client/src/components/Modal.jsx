import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/* ---------- Reusable Modal (backdrop + portal) ---------- */
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    // lock scroll while modal open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      aria-label={title || "Dialog"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1050,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,.5)",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3 shadow p-3"
        style={{ width: "min(720px, 95vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-start justify-content-between mb-2">
          <h5 className="m-0">{title}</h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;