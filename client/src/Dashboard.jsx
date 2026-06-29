import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import DataTable from "./components/DataTable.jsx";
import { useI18n } from "./i18n/I18nProvider";

const STATUS_BADGE = {
  new: "text-bg-secondary",
  open: "text-bg-primary",
  in_progress: "text-bg-info",
  waiting_customer: "text-bg-warning",
  resolved: "text-bg-success",
  closed: "text-bg-dark",
};

/* ---------- mock data (replace with /api/dashboard fetch) ---------- */
const MOCK_SUMMARY = {
  opened: 37,
  newToday: 8,
  late: 5,
  waitingCustomer: 6,
  waitingTechnician: 4,
  closedToday: 12,
};

const MOCK_HIGH_PRIORITY = [
  { id: 1042, customer: "מזרני סביון", description: "מזגן לא מקרר", status: "in_progress", opened_at: "2026-06-18", responsible: "דנה לוי" },
  { id: 1039, customer: "יוסי חשמל", description: "קצר בלוח החשמל", status: "open", opened_at: "2026-06-20", responsible: "רון שגב" },
  { id: 1031, customer: "אופנועי ניסים", description: "תקלה במצלמות אבטחה", status: "waiting_technician", opened_at: "2026-06-17", responsible: null },
];

const MOCK_PER_USER = [
  { user: "דנה לוי", open: 12, late: 2, closedToday: 5 },
  { user: "רון שגב", open: 9, late: 1, closedToday: 4 },
  { user: "אבי מזרחי", open: 7, late: 2, closedToday: 3 },
  { user: null, open: 4, late: 0, closedToday: 0 }, // unassigned
];

const MOCK_PERFORMANCE = {
  avgTimeToClose: "2.4 ימים",
  closedThisWeek: 48,
  reopened: 3,
  avgFirstResponse: "1.8 שעות",
};

// card 5: counts per reason + the calls behind them.
// `problem` is one of: noResponsible | noUpdate24h | reopened | waitingTechAssign
const MOCK_INTERVENTION = {
  summary: { noResponsible: 4, noUpdate24h: 7, reopened: 3, waitingTechAssign: 4 },
  calls: [
    { id: 1031, customer: "אופנועי ניסים", description: "תקלה במצלמות אבטחה", problem: "waitingTechAssign" },
    { id: 1028, customer: "יוסי חשמל", description: "אין מתח בלוח הראשי", problem: "noResponsible" },
    { id: 1022, customer: "מזרני סביון", description: "דליפת מים מהמזגן", problem: "noUpdate24h" },
    { id: 1015, customer: "אופנועי ניסים", description: "אזעקה מתריעה ללא סיבה", problem: "reopened" },
  ],
};

const PROBLEM_BADGE = {
  noResponsible: "text-bg-danger",
  noUpdate24h: "text-bg-warning",
  reopened: "text-bg-info",
  waitingTechAssign: "text-bg-secondary",
};

function StatTile({ label, value, variant = "secondary", icon }) {
  return (
    <div className="col"> 
    {/* <!--"col-6 col-lg-4 col-xl-3">- */}
      <div className={`card text-bg-${variant} shadow-sm h-100`}>
        <div className="card-body text-center py-3">
          {icon ? <FontAwesomeIcon icon={["fas", icon]} className="mb-2 fs-4 opacity-75" /> : null}
          <div className="fs-3 fw-bold lh-1">{value}</div>
          <div className="small mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(MOCK_SUMMARY);
  const [highPriority, setHighPriority] = useState(MOCK_HIGH_PRIORITY);
  const [perUser, setPerUser] = useState(MOCK_PER_USER);
  const [performance, setPerformance] = useState(MOCK_PERFORMANCE);
  const [intervention, setIntervention] = useState(MOCK_INTERVENTION);

  // TODO (server side): GET /api/dashboard
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // const res = await fetch("/api/dashboard");
        // const d = await res.json();
        // if (!cancelled) { setSummary(d.summary); setHighPriority(d.highPriority); ... }
      } catch (e) {
        console.error("Error loading dashboard:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const statusBadge = (status) => (
    <span className={`badge ${STATUS_BADGE[status] || "text-bg-secondary"}`}>
      {t(`servicecall.status_${status}`)}
    </span>
  );

  const highPriorityColumns = useMemo(
    () => [
      { key: "id", label: t("servicecall.id"), width: 1 },
      { key: "customer", label: t("dashboard.customer"), width: 2 },
      { key: "description", label: t("servicecall.description"), truncate: true },
      { key: "status", label: t("servicecall.status"), width: 2, render: (r) => statusBadge(r.status) },
      { key: "opened_at", label: t("servicecall.openedAt"), width: 2 },
      { key: "responsible", label: t("servicecall.responsible"), width: 2, render: (r) => r.responsible || <span className="text-muted">{t("dashboard.unassigned")}</span> },
      {
        key: "_link", label: "", width: 1, sortable: false,
        render: (r) => (
          <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/calls/${r.id}`)}>
            #{r.id}
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, navigate]
  );

  const perUserColumns = useMemo(
    () => [
      { key: "user", label: t("dashboard.user"), render: (r) => r.user || <span className="text-muted">{t("dashboard.unassigned")}</span> },
      { key: "open", label: t("dashboard.openCount"), width: 2 },
      { key: "late", label: t("dashboard.lateCount"), width: 2, render: (r) => r.late > 0 ? <span className="text-danger fw-bold">{r.late}</span> : r.late },
      { key: "closedToday", label: t("dashboard.closedTodayCount"), width: 2 },
    ],
    [t]
  );

  const interventionColumns = useMemo(
    () => [
      {
        key: "id", label: t("servicecall.id"), width: 2, sortable: false,
        render: (r) => (
          <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/calls/${r.id}`)}>
            #{r.id}
          </button>
        ),
      },
      { key: "customer", label: t("dashboard.customer"), width: 3 },
      { key: "description", label: t("servicecall.description"), truncate: true },
      {
        key: "problem", label: t("dashboard.problem"), width: 3,
        render: (r) => (
          <span className={`badge ${PROBLEM_BADGE[r.problem] || "text-bg-secondary"}`}>
            {t(`dashboard.${r.problem}`)}
          </span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, navigate]
  );

  if (loading) return <div className="text-center p-4">{t("common.loading")}</div>;

  return (
    <div className="container-fluid">
      <h1 className="mb-3">{t("dashboard.title")}</h1>

      {/* ===== card 1: status summary ===== */}
      <div className="card shadow-sm mb-3">
        <div className="card-header fw-bold">{t("dashboard.statuses")}</div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <StatTile label={t("dashboard.opened")} value={summary.opened} variant="primary" icon="folder-open" />
            <StatTile label={t("dashboard.newToday")} value={summary.newToday} variant="secondary" icon="plus" />
            <StatTile label={t("dashboard.late")} value={summary.late} variant="danger" icon="clock" />
            <StatTile label={t("dashboard.waitingCustomer")} value={summary.waitingCustomer} variant="warning" icon="user" />
            <StatTile label={t("dashboard.waitingTechnician")} value={summary.waitingTechnician} variant="info" icon="user-gear" />
            <StatTile label={t("dashboard.closedToday")} value={summary.closedToday} variant="dark" icon="xmark" />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {/* ===== card 2: high priority calls ===== */}
        <div className="col-12 col-xl-12">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-bold">{t("dashboard.highPriority")}</div>
            <div className="card-body">
              <DataTable
                columns={highPriorityColumns}
                data={highPriority.slice(0, 10)}
                initialSort={{ key: "opened_at", dir: "asc" }}
                pageSizeOptions={[10, 20]}
              />
            </div>
          </div>
        </div>

        
      </div>

<div className="row g-3 mb-3">
      {/* ===== card 4: performance ===== */}
      <div className="col-8">
      <div className="card shadow-sm h-100 ">
        <div className="card-header fw-bold">{t("dashboard.performance")}</div>
        <div className="card-body">
          <div className="row g-3">
            <StatTile label={t("dashboard.avgTimeToClose")} value={performance.avgTimeToClose} variant="primary" icon="clock" />
            <StatTile label={t("dashboard.closedThisWeek")} value={performance.closedThisWeek} variant="success" icon="xmark" />
            <StatTile label={t("dashboard.reopened")} value={performance.reopened} variant="warning" icon="arrows-rotate" />
            <StatTile label={t("dashboard.avgFirstResponse")} value={performance.avgFirstResponse} variant="info" icon="paper-plane" />
          </div>
        </div>
      </div>
      </div>

      {/* ===== card 3: calls per user ===== */}
        <div className="col-4">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-bold">{t("dashboard.perUser")}</div>
            <div className="card-body">
              <DataTable
                columns={perUserColumns}
                data={perUser}
                initialSort={{ key: "open", dir: "desc" }}
                pageSizeOptions={[10, 20]}
                showPagination = {false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
      {/* ===== card 5: calls requiring intervention ===== */}
        <div className="col-12 col-xl-12">
          <div className="card shadow-sm ">
            <div className="card-header fw-bold">{t("dashboard.intervention")}</div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <StatTile label={t("dashboard.noResponsible")} value={intervention.summary.noResponsible} variant="danger" icon="user" />
                <StatTile label={t("dashboard.noUpdate24h")} value={intervention.summary.noUpdate24h} variant="warning" icon="clock" />
                <StatTile label={t("dashboard.reopened")} value={intervention.summary.reopened} variant="info" icon="arrows-rotate" />
                <StatTile label={t("dashboard.waitingTechAssign")} value={intervention.summary.waitingTechAssign} variant="secondary" icon="user-gear" />
              </div>
              <DataTable
                columns={interventionColumns}
                data={intervention.calls}
                initialSort={{ key: "id", dir: "desc" }}
                pageSizeOptions={[10, 20]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
