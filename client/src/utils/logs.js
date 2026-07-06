import useAuth from "../auth/AuthProvider";

/**
 * Hook returning an `addLog(log_id, description)` writer.
 *
 * `log_id` is one of ALL_LOGS ("service_calls" | "employees" | "products" |
 * "customers" | "services"); `description` is a ready, translated string.
 * The acting employee is taken from the auth context. Failures are swallowed
 * so a logging problem never interrupts the user's action.
 *
 * Usage:
 *   const addLog = useAddLog();
 *   addLog("products", t("logs.productAdded", { name: created.name }));
 */
export function useAddLog() {
  const { user } = useAuth();

  return async (log_id, description) => {
    if (!user) return;
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_id, employee_id: user.id, description }),
      });
    } catch (e) {
      console.error("Failed to write log:", e);
    }
  };
}
