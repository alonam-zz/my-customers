import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import DataTable from "../components/DataTable.jsx";
import { useI18n } from "../i18n/I18nProvider";
import MyCalls from './MyCalls.jsx'
import useAuth from "../auth/AuthProvider.jsx";
import useApi from "../hooks/useApi.js";
import { formatDateTime } from "../utils/date.js";

import { STATUS_BADGE } from "../utils/constants.js";
import { Link } from "react-router-dom";

const PROBLEM_BADGE = {
  noResponsible: "text-info",
  noUpdate24h: "text-warning",
  noUpdate36h: "text-danger",
  waitingTechAssign: "text-secondary",
};

function StatTile({ label, value, variant = "secondary", icon }) {
  return (
    <div className="col"> 
    {/* <!--"col-6 col-lg-4 col-xl-3">- */}
      <div className={`card text-${variant} shadow-sm h-100`}>
        <div className="card-body text-center py-3">
          {icon ? <FontAwesomeIcon icon={["fas", icon]} className="mb-2 fs-4 opacity-75" /> : null}
          <div className="fs-1 fw-bold lh-1">{value}</div>
          <div className="small mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();

  // control flag read inside async callbacks / setTimeout — must be a ref so every
  // closure sees the live value (React state would be stale in those closures).
  const breakStateRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(true);
  const [loading4, setLoading4] = useState(true);
  const [loading5, setLoading5] = useState(true);
  const [summary, setSummary] = useState({});
  const [highPriority, setHighPriority] = useState([]);
  const [perUser, setPerUser] = useState([]);
  const [performance, setPerformance] = useState({});
  const [intervention, setIntervention] = useState({ summary: {}, calls: [] });

  const {user} = useAuth()
  const send = useApi()

  if (["support","technician"].includes(user.role) ){
    return <MyCalls/>
  }

  const fetchStates = async (state)=>{
    const {ok,data,status} = await send(`/api/dashboard/getState?state=${state}`);  
    if (ok){
      switch(state){
        case 1:
          setSummary(data);
          setLoading1(false);
          break;
        case 2:
          setHighPriority(data);
          setLoading2(false);
          break;
        case 3:
          setPerformance(data);
          setLoading3(false);
          break;
        case 4:
          setPerUser(data);
          setLoading4(false);
          break;
        case 5:
          setIntervention(data);
          setLoading5(false);
          break;

      }
    }
    else if (status==401){
      navigate("/login");
    }
    return status;
  }

  const callState = async (i) =>{
    if (breakStateRef.current) return;
    const status = await fetchStates(i);
    if (status==401){
      breakStateRef.current = true;
      return;
    }

  }

  const callStates = async () =>{
    if (breakStateRef.current) return;
    for (let i=1;i<=5;i++){
      if (breakStateRef.current) break;    
      await callState(i);
    }
    setTimeout(async ()=>{ await callStates(); }, 0.5 * 60  * 1000);
  }
    

  useEffect(() => {
    let cancelled = false; 
    async function load() {
      try {
        // setLoading(true);
        await callStates();
        

      } catch (e) {
        console.error("Error loading dashboard:", e);
      } finally {
        // if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const statusBadge = (status) => (
    <span className={`badge ${STATUS_BADGE[status] || "text-secondary"}`}>
      {t(`servicecall.status_${status}`)}
    </span>
  );

  const loadingCircle = ()=>{
    return (
      <div className="position-absolute top-50 start-50 translate-middle ">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("common.loading")}</span>
        </div>
      </div>
    )
  }

  const highPriorityColumns = useMemo(
    () => [
      {key: "id", label: t("servicecall.id"), width: 1,hide:true},
      {key: "customer_id", label: '', width: 1,hide:true},
      {key: "score", label: '', width: 1,hide:true},
      {key: "token", label: t("servicecall.token"), width: 2,
        render: (r) => (
          <Link className="btn btn-sm btn-link p-0 text-decoration-none"  to={`/customers/${r.customer_id}/calls/${r.id}`} target="_new" rel="noopener noreferrer">
        {r.token}
        </Link>
        )
      },
      { key: "customer_name", label: t("dashboard.customer"), width: 2 ,truncate:true,
        render: (r) => (
        <Link className="btn btn-sm btn-link p-0 text-decoration-none"  to={`/customers/${r.customer_id}`} target="_new" rel="noopener noreferrer">
        {r.customer_name}
        </Link>
        )
      },
      { key: "description", label: t("servicecall.description"), truncate: true ,width:3 },
      {
              key: "status",
              label: t("servicecall.status"),
              width: 2,
              render: (r) => (
                <span className={`badge ${STATUS_BADGE[r.status] || "text-bg-secondary"}`}>
                  {t(`callStatus.${r.status}`)}
                </span>
              ),
              render: (r) => (
                <span className={`badge ${STATUS_BADGE[r.status] || "text-bg-secondary"}`}>
                  {t(`callStatus.${r.status}`)}
                </span>
              ),
      },
      { key: "openedAt", label: t("servicecall.openedAt"), width: 2 ,render:(r)=>formatDateTime(r.openedAt)},
      { key: "support_agent", label: t("dashboard.support_agent"), width: 2, truncate: true,render: (r) => r.support_agent || <span className="text-muted">{t("dashboard.unassigned")}</span> },
      // {
      //   key: "_link", label: "", width: 1, sortable: false,
      //   render: (r) => (
      //     <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/calls/${r.id}`)}>
      //       #{r.id}
      //     </button>
      //   ),
      // },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, navigate]
  );

  const perUserColumns = useMemo(
    () => [
      { key: "support_agent", label: t("dashboard.support_agent"),width:3, render: (r) => r.support_agent || <span className="text-muted">{t("dashboard.unassigned")}</span> },
      { key: "open", label: t("dashboard.openCount"), width: 2 },
      { key: "late", label: t("dashboard.lateCount"), width: 2, render: (r) => r.late > 0 ? <span className="text-danger fw-bold">{r.late}</span> : r.late },
      { key: "closedToday", label: t("dashboard.closedTodayCount"), width: 2 },
    ],
    [t]
  );

  const interventionColumns = useMemo(
    () => [
      {key: "id", label: t("servicecall.id"), width: 1,hide:true},
      {key: "customer_id", label: '', width: 1,hide:true},
      {key: "score", label: '', width: 1,hide:true},
      {key: "token", label: t("servicecall.token"), width: 1,
        render: (r) => (
          <Link className="btn btn-sm btn-link p-0 text-decoration-none"  to={`/customers/${r.customer_id}/calls/${r.id}`} target="_new" rel="noopener noreferrer">
        {r.token}
        </Link>
        )
      },
      { key: "customer_name", label: t("dashboard.customer"), width: 2,truncate:true,
        render: (r) => (
        <Link className="btn btn-sm btn-link p-0 text-decoration-none"  to={`/customers/${r.customer_id}`} target="_new" rel="noopener noreferrer">
        {r.customer_name}
        </Link>
        )

       },
      { key: "title", label: t("servicecall.description"), truncate: true ,width:2},
      {
        key: "problem", label: t("dashboard.problem"), width: 3,
        render: (r) => (
          (r.problem).map((p)=>(
            <span key={p} className={`badge ${PROBLEM_BADGE[p] || "text-secondary"}`}>
              {t(`dashboard.${p}`)}
            </span>
            ) 
          )
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, navigate]
  );

  if (loading) return <div className="text-center p-4">{t("common.loading")}</div>;
  
  return (
    <div className="container-fluid"> 
      {/* <h1 className="mb-3">{t("dashboard.title")}</h1> */}

      {/* ===== card 1: status summary ===== */}
      <div className="card shadow-sm mb-3">
        <div className="card-header fw-bold">{t("dashboard.statuses")}</div>
        <div className="card-body position-relative">
          <div className={`row g-3 mb-3 ${loading1 ? "invisible" : ""}`}>
            <StatTile label={t("dashboard.opened")} value={summary.opened} variant="primary" icon="folder-open" />
            <StatTile label={t("dashboard.newToday")} value={summary.newToday} variant="secondary" icon="plus" />
            <StatTile label={t("dashboard.late")} value={summary.late} variant="danger" icon="clock" />
            <StatTile label={t("dashboard.waitingCustomer")} value={summary.waitingCustomer} variant="warning" icon="user" />
            <StatTile label={t("dashboard.waitingTechnician")} value={summary.waitingTechnician} variant="info" icon="user-gear" />
            <StatTile label={t("dashboard.closedToday")} value={summary.closedToday} variant="dark" icon="xmark" />
          </div>
          {loading1 && (
            (loadingCircle())
          )}
        </div>
      </div>

      <div className="row g-3 mb-3">
        {/* ===== card 2: high priority calls ===== */}
        <div className="col-12 col-xl-12">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-bold">{t("dashboard.highPriority")}</div>
            <div className="card-body position-relative" >
              <div className={`${loading2 ? "invisible" : ""}`}>
              <DataTable
                columns={highPriorityColumns}
                data={highPriority.slice(0, 10)}
                initialSort={{ key: "score", dir: "desc" }}
                pageSizeOptions={[10, 20]}
              />
              </div>
              {loading2 && (
                (loadingCircle())
              )}
            </div>
          </div>
        </div>

        
      </div>

<div className="row g-3 mb-3">
      {/* ===== card 4: performance ===== */}
      <div className="col-7">
      <div className="card shadow-sm h-100 ">
        <div className="card-header fw-bold">{t("dashboard.performance")}</div>
        <div className="card-body position-relative">
          <div className={`${loading3 ? "invisible" : ""}`}>
            <div className="row g-3">
              <StatTile label={t("dashboard.avgTimeToClose")} value={`${performance.avgHoursToClose} ${t('dashboard.days')}`} variant="primary" icon="clock" />
              <StatTile label={t("dashboard.closedThisWeek")} value={`${performance.closedThisWeek} ${t('dashboard.calls')}`} variant="success" icon="xmark" />
              {/* <StatTile label={t("dashboard.reopened")} value={performance.reopened} variant="warning" icon="arrows-rotate" /> */}
              <StatTile label={t("dashboard.avgHoursToFirstResponse")} value={`${performance.avgHoursToFirstResponse} ${t('dashboard.hours')}`} variant="info" icon="paper-plane" />
            </div>
          </div>
          {loading3 && (
                (loadingCircle())
              )}    
        </div>
      </div>
      </div>

      {/* ===== card 3: calls per user ===== */}
        <div className="col-5">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-bold">{t("dashboard.perUser")}</div>
            <div className="card-body position-relative">
              <div className={`${loading4 ? "invisible" : ""}`}>
                <DataTable
                  columns={perUserColumns}
                  data={perUser}
                  initialSort={{ key: "open", dir: "desc" }}
                  pageSizeOptions={[10, 20]}
                  showPagination = {false}
                />
              </div>
              {loading4 && (
                (loadingCircle())
              )}
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
              <div className={`${loading5 ? "invisible" : ""}`}>
              <div className={`row g-3 mb-3`}>
                <StatTile label={t("dashboard.noResponsible")} value={intervention.summary.noResponsible} variant="info" icon="user" />
                <StatTile label={t("dashboard.noUpdate24h")} value={intervention.summary.noUpdate24h} variant="warning" icon="clock" />
                <StatTile label={t("dashboard.noUpdate36h")} value={intervention.summary.noUpdate36h} variant="danger" icon="circle-exclamation" />
                <StatTile label={t("dashboard.waitingTechAssign")} value={intervention.summary.waitingTechAssign} variant="secondary" icon="user-gear" />
              </div>
              <DataTable
                columns={interventionColumns}
                data={intervention.calls}
                initialSort={{ key: "id", dir: "desc" }}
                pageSizeOptions={[10, 20]}
              />
              
            </div>
            {loading5 && (
                (loadingCircle())
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
