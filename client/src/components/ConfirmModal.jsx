import React from "react";
import Modal from "./Modal"; // <- your existing Modal (open/onClose/title/children)

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Please confirm this action.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",              // "primary" | "danger" | "success" | etc.
  disableBackdropClose = false,     // if you want to force a choice via buttons
  hideCancel = false,               // alert mode: only show the confirm/OK button
}) {
  const handleBackdropClose = disableBackdropClose ? undefined : onClose;

  return (
    <Modal open={open} onClose={handleBackdropClose} title={title}>
      <div className="mb-3">
        {typeof message === "string" ? <p className="m-0">{message}</p> : message}
      </div>

      <div className="d-flex justify-content-end gap-2">
        {!hideCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            {cancelText}
          </button>
        )}
        <button
          type="button"
          autoFocus
          className={`btn btn-${variant}`}
          onClick={() => {
            onConfirm?.();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

