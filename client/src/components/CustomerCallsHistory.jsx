import React, { useMemo } from "react";
import DataTable from "./DataTable.jsx";
import { useI18n } from "../i18n/I18nProvider";

/**
 * History of all service calls for a customer.
 *
 * Props:
 *  - calls: [{ id, date, description, status }]
 *  - onOpenCall?: (call) => void   // navigate to that call
 */
export default function CustomerCallsHistory({ calls = [], onOpenCall }) {
  const { t, locale } = useI18n();

  const statusBadge = (status) => {
    const map = {
      new: "text-bg-secondary",
      open: "text-bg-primary",
      in_progress: "text-bg-info",
      waiting_customer: "text-bg-warning",
      resolved: "text-bg-success",
      closed: "text-bg-dark",
    };
    return (
      <span className={`badge ${map[status] || "text-bg-secondary"}`}>
        {t(`servicecall.status_${status}`)}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      { key: "id", label: t("servicecall.id"), width: 1 },
      { key: "date", label: t("servicecall.date"), width: 3 },
      { key: "description", label: t("servicecall.description"), truncate: true },
      {
        key: "status",
        label: t("servicecall.lineStatus"),
        width: 2,
        render: (row) => statusBadge(row.status),
      },
      {
        key: "_link",
        label: "",
        width: 2,
        sortable: false,
        render: (row) => (
          <button
            type="button"
            className="btn btn-sm btn-link p-0 text-decoration-none"
            onClick={() => onOpenCall?.(row)}
          >
            {t("servicecall.openCall")} #{row.id}
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale, onOpenCall]
  );

  return (
    <DataTable
      columns={columns}
      data={calls}
      initialSort={{ key: "date", dir: "desc" }}
      pageSizeOptions={[5, 10, 20]}
    />
  );
}
