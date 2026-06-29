import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ConfirmModal from "./ConfirmModal.jsx"; // <- default import

const ConfirmCtx = createContext(null);

export default function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    options: {},
    resolve: null,
  });

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  // alert: same modal, single button (no cancel). Resolves when dismissed.
  const alert = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, options: { ...options, _alert: true }, resolve });
    });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => {
      s.resolve?.(false);
      return { open: false, options: {}, resolve: null };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((s) => {
      s.resolve?.(true);
      return { open: false, options: {}, resolve: null };
    });
  }, []);

  const value = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  const isAlert = !!state.options?._alert;
  const {
    title = "Are you sure?",
    message = "Please confirm this action.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
    disableBackdropClose = false,
  } = state.options || {};

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      <ConfirmModal
        open={state.open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={variant}
        disableBackdropClose={disableBackdropClose}
        hideCancel={isAlert}
      />
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx.confirm;
}

export function useAlert() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useAlert must be used within <ConfirmProvider>");
  return ctx.alert;
}