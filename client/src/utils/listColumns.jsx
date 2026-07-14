import { useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { STATUS_BADGE, CALL_STATUSES, CALL_TYPES, CALL_PRIORITIES } from "./constants.js";
import { formatDateTime } from "./date.js";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
/**
 * Columns for a list of individual service calls,
 * matching the serviceCalls list layout.
 *
 * Uses the I18nProvider (useI18n) for labels/translations.
 */
export function useServiceCallColumns(props) {
  const { t } = useI18n();
  const newTabLink = props?.newTabLink;

  const navigate = useNavigate();

  return useMemo(
    () => [
      { key: "id", label: t("servicecall.id"),hide:true},
      { key: "customer_id", label: '', width: 1,hide:true },
      { key: "token", label: t("servicecall.token"), width: 1 , filter: true,
        render: (r) => (
          <Link className="btn btn-sm btn-link p-0 text-decoration-none"  to={`/customers/${r.customer_id}/calls/${r.id}`} target="_new" rel="noopener noreferrer">
        {r.token}
        </Link>
          // <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/customers/${customerId}/calls/${r.id}`)}>
          //   {r.token}
          // </button>
        ),
      },
      { key: "customer_name", label: t("servicecall.customer"), width: 2 ,truncate:true, filter: true, render: (r) => (
        <Link className="btn btn-sm btn-link p-0 text-decoration-none"  to={`/customers/${r.customer_id}`} target="_new" rel="noopener noreferrer">
        {r.customer_name}
        </Link>
        )
      },
      { 
        key: "created_at", 
        label: t("servicecall.openedAt"), 
        width: 2 ,render:(r)=>formatDateTime(r.created_at),
        filter: { type: "date"}
      },
      { key: "description", label: t("servicecall.description"), truncate: true,width:2, filter: true },
      {
        key: "status",
        label: t("servicecall.status"),
        width: 1,
        filter: { type: "select", options: CALL_STATUSES.map((s) => ({ value: s, label: t(`callStatus.${s}`) })) },
        render: (r) => (
          <span className={`badge ${STATUS_BADGE[r.status] || "text-bg-secondary"}`}>
            {t(`callStatus.${r.status}`)}
          </span>
        ),
      },
      {
        key: "type",
        label: t("servicecall.type"),
        width: 1,
        filter: { type: "select", options: CALL_TYPES.map((v) => ({ value: v, label: t(`callType.${v}`) })) },
        render: (r) => <span>{t(`callType.${r.type}`)}</span>,
      },
      {
        key: "priority",
        label: t("servicecall.priority"),
        width: 1,
        filter: { type: "select", options: CALL_PRIORITIES.map((v) => ({ value: v, label: t(`callPriority.${v}`) })) },
        render: (r) => <span>{t(`callPriority.${r.priority}`)}</span>,
      },
      { key: "technician_name", label: t("servicecall.technician"), width: 2, filter: true },
    ],
    [t]
  );
}
