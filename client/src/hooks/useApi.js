import { useCallback } from "react";
import { useAlert } from "../components/ConfirmProvider.jsx";
import { useI18n } from "../i18n/I18nProvider";

/**
 * Centralised create/update/delete caller.
 * On any failure (network error or non-2xx, e.g. 500) it raises a modal
 * error alert and returns { ok: false }. On success returns { ok: true, data }.
 *
 * Usage:
 *   const send = useApi();
 *   const { ok, data } = await send("/api/products", { method: "POST", body });
 *   if (ok) { ...refresh... }   // caller decides what to do / whether to close
 */
export default function useApi() {
  const alert = useAlert();
  const { t } = useI18n();

  return useCallback(async (url, { method = "GET", body } = {}) => {
    try {
      const res = await fetch(url, {
        method,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const text = await res.text();
      // body may not be JSON (e.g. a 404 HTML page) — don't let that throw
      let payload = null;
      try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }

      if (!res.ok) {
        // surface the controller's message so the caller can show/translate it
        // server error shapes: { error } (controllers) or { message } (auth)
        const message = payload?.error || payload?.message || null;
        await alert({
          title: t("common.errorTitle"),
          message: t("messages."+message) || t("common.errorMessage"),
          confirmText: t("common.ok"),
          variant: "danger",
        });
        return { ok: false, data: null, error: message, status: res.status };
      }

      return { ok: true, data: payload, error: null, status: res.status };
    } catch (e) {
      console.error("API error:", e);
      await alert({
        title: t("common.errorTitle"),
        message: t("common.errorMessage"),
        confirmText: t("common.ok"),
        variant: "danger",
      });
      return { ok: false, data: null, error: e.message, status: 0 };
    }
  }, [alert, t]);
}
