import { useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { STATUS_BADGE } from "./constants.js";

/**
 * Columns for a list of individual service calls,
 * matching the serviceCalls list layout.
 *
 * Uses the I18nProvider (useI18n) for labels/translations.
 */
export function useServiceCallColumns() {
  const { t } = useI18n();

  return useMemo(
    () => [
      { key: "id", label: t("servicecall.id"), width: 1 },
      { key: "opened_at", label: t("servicecall.openedAt"), width: 2 },
      { key: "description", label: t("servicecall.description"), truncate: true,width:2 },
      {
        key: "status",
        label: t("servicecall.status"),
        width: 1,
        render: (r) => (
          <span className={`badge ${STATUS_BADGE[r.status] || "text-bg-secondary"}`}>
            {t(`callStatus.${r.status}`)}
          </span>
        ),
      },
      {
        key: "type",
        label: t("servicecall.type"),
        width: 2,
        render: (r) => <span>{t(`callType.${r.type}`)}</span>,
      },
      {
        key: "priority",
        label: t("servicecall.priority"),
        width: 1,
        render: (r) => <span>{t(`callPriority.${r.priority}`)}</span>,
      },
      { key: "technician_name", label: t("servicecall.technician"), width: 2 },
    ],
    [t]
  );
}
