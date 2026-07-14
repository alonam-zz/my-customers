import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useI18n } from "../i18n/I18nProvider";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import CallForm from "../components/CallForm.jsx";
import useApi from "../hooks/useApi.js";
import {CALL_TYPES,CALL_PRIORITIES,STATUS_BADGE,PRIORITY_BADGE,CALL_STATUSES,STATUS_BADGE_COLORS,TYPE_BADGE_COLORS,CHART_COLORS} from "../utils/constants.js"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import SearchSelect from "../components/SearchSelect.jsx"
import Select from "../components/Select.jsx"
import { useServiceCallColumns } from "../utils/listColumns.jsx"

import DatePicker,{registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { he } from "date-fns/locale/he"; 
import { toISO } from "../utils/date.js";


ChartJS.register(ArcElement, Tooltip, Legend);

// Stable references so the summary <List>s aren't re-rendered (via React.memo)
// every time an unrelated piece of Reports state changes.
const STATUS_SORT = { key: "status", dir: "asc" };
const TECHNICIAN_SORT = { key: "technician_name", dir: "asc" };
const SUPPORT_AGENT_SORT = { key: "support_agent_name", dir: "asc" };
const TYPE_SORT = { key: "type", dir: "asc" };
const EXTENDED_CALL_SORT = { key: "id", dir: "asc" };

// true if the filter has any active value (non-empty array or non-empty string).
// Used to keep an extended-calls list visible when a filter is applied even though
// it returned no rows; the list is only hidden when nothing is filtered AND it's empty.
const hasActiveFilter = (filter) =>
  Object.values(filter || {}).some((v) => (Array.isArray(v) ? v.length > 0 : v !== "" && v != null));

// function StatTile({ label, value, variant = "secondary", icon }) {
//   return (
//     <div className="col"> 
//     {/* <!--"col-6 col-lg-4 col-xl-3">- */}
//       <div className={`card text-${variant} shadow-sm h-100`}>
//         <div className="card-body text-center py-3">
//           {icon ? <FontAwesomeIcon icon={["fas", icon]} className="mb-2 fs-4 opacity-75" /> : null}
//           <div className="fs-1 fw-bold lh-1">{value}</div>
//           <div className="small mt-1">{label}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function Reports() {
  const { t,locale } = useI18n();
  const navigate = useNavigate();
  const send = useApi();

  const [loading, setLoading] = useState(true);
  const [initialTab, setInitialTab] = useState("status");
  const [statusReport, setStatusReport] = useState([]);
  const [technicianReport, setTechnicianReport] = useState([]);
  const [supportAgentReport, setSupportAgentReport] = useState([]);
  const [priorityReport, setPriorityReport] = useState([]);
  const [typeReport, setTypeReport] = useState([]);

  const [statusReportExtended, setStatusReportExtended] = useState([]);
  const [technicianReportExtended, setTechnicianReportExtended] = useState([]);
  const [supportAgentReportExtended, setSupportAgentReportExtended] = useState([]);
  const [typeReportExtended, setTypeReportExtended] = useState([]);

  const [statusExtendedCallPageCount, setStatusExtendedCallPageCount] = useState(10);
  const [technicianExtendedCallPageCount, setTechnicianExtendedCallPageCount] = useState(10);
  const [supportAgentExtendedCallPageCount, setSupportAgentExtendedCallPageCount] = useState(10);
  const [typeExtendedCallPageCount, setTypeExtendedCallPageCount] = useState(10);

  const [statusExtendedCallPageSize, setStatusExtendedCallPageSize] = useState(10);
  const [technicianExtendedCallPageCSize, setTechnicianExtendedCallPageSize] = useState(10);
  const [supportAgentExtendedCallPageSize, setSupportAgentExtendedCallPageSize] = useState(10);
  const [typeExtendedCallPageSize, setTypeExtendedCallPageSize] = useState(10);

  const [statusExtendedCallPage, setStatusExtendedCallPage] = useState(1);
  const [technicianExtendedCallPage, setTechnicianExtendedCallPage] = useState(1);
  const [supportAgentExtendedCallPage, setSupportAgentExtendedCallPage] = useState(1);
  const [typeExtendedCallPage, setTypeExtendedCallPage] = useState(1);


  // remember the clicked row's value per list so pagination can re-fetch the right rows
  const [statusExtendedValue, setStatusExtendedValue] = useState(null);
  const [technicianExtendedValue, setTechnicianExtendedValue] = useState(null);
  const [supportAgentExtendedValue, setSupportAgentExtendedValue] = useState(null);
  const [typeExtendedValue, setTypeExtendedValue] = useState(null);

  const [statusChartData, setStatusChartData] = useState({});
  const [technicianChartData, setTechnicianChartData] = useState({});
  const [supportAgentChartData, setSupportAgentChartData] = useState({});
  const [priorityChartData, setPriorityChartData] = useState({});
  const [typeChartData, setTypeChartData] = useState({});

  const [technicians, setTechnicians] = useState([]);
  const [supportAgents, setSupportAgents] = useState([]);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [openCallModal, setOpenCallModal] = useState(false);
  const [openedCallItem, setOpenedCallItem] = useState({});

  const emptyFilter = {
    fromDate:'',
    toDate:'',
    status:[],
    type:[],
    priority:[],
    assigned_technician_id:[],
    assigned_support_agent_id:[]
  };
  const [statusFilter, setStatusFilter] = useState(emptyFilter);
  const [technicianFilter, setTechnicianFilter] = useState(emptyFilter);
  const [supportAgentFilter, setSupportAgentFilter] = useState(emptyFilter);
  const [priorityFilter, setPriorityFilter] = useState(emptyFilter);
  const [typeFilter, setTypeFilter] = useState(emptyFilter);
  const [selectedReport, setSelectedReport] = useState("status");

  const [technicianChartColors, setTechnicianChartColors] = useState([]);
  const [supportAgentChartColors, setSupportAgentChartColors] = useState([]);

const root = getComputedStyle(document.documentElement);
const statusChartColors = CALL_STATUSES.map((status)=>root.getPropertyValue(STATUS_BADGE_COLORS[status]).trim());
const typeChartColors = CALL_TYPES.map((type)=>root.getPropertyValue(TYPE_BADGE_COLORS[type]).trim());

useEffect(()=>{
  if (!technicians.length) return;
  setTechnicianChartColors(technicians.map((t,i)=>root.getPropertyValue(CHART_COLORS[i]).trim()))
},[technicians]);

useEffect(()=>{
  if (!technicians.length) return;
  setSupportAgentChartColors(supportAgents.map((s,i)=>root.getPropertyValue(CHART_COLORS[i]).trim()))
},[supportAgents]);

useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { ok, data } = await send(`/api/reports/status`);
        if (!ok) return;
        setStatusReport(data['items']);
      } catch (e) {
        console.error("Error loading report:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadTechnicians() {
      const { ok, data: techs } = await send('/api/technicians?all=1');
      if (!ok) return;
      const toOption = (r) => ({
        id: r.id,
        name: [r.first_name, r.last_name].filter(Boolean).join(" "),
      });
      setTechnicians(techs['items'].map((t)=>toOption(t)));
    }

    async function loadSupportAgents() {
      const { ok, data: agents } = await send('/api/supportAgents?all=1');
      if (!ok) return;
      const toOption = (r) => ({
        id: r.id,
        name: [r.first_name, r.last_name].filter(Boolean).join(" "),
      });
      setSupportAgents(Array.isArray(agents.items) ? agents.items.map(toOption) : []);
    }
    load();
    loadTechnicians();
    loadSupportAgents();

    return () => { cancelled = true; };
  }, []);


   useEffect(()=>
  { 
    setStatusChartData(
      {
        labels: CALL_STATUSES.map((status)=> t(`callStatus.${status}`)),
        datasets: [
          {
            data: CALL_STATUSES.map((status)=>{
              const found = statusReport.find((item)=>item.status===status);
              return found?found.total:0;
            }),
            backgroundColor: statusChartColors,
            borderColor: 
              statusChartColors
            ,
            borderWidth: 1,
          },
        ],
        
      }
    )
  },
  [statusReport]);

  useEffect(()=>
  { 
    setTechnicianChartData(
      {
        labels: technicianReport.map((t)=> (t.technician_name)),
        datasets: [
          {
            data: technicianReport.map((t)=>(t.total)),
            backgroundColor: technicianChartColors,
            borderColor: 
              technicianChartColors
            ,
            borderWidth: 1,
          },
        ],
        
      }
    )
  },
  [technicianReport]);


  useEffect(()=>
  {
    setSupportAgentChartData(
      {
        labels: supportAgentReport.map((t)=> (t.support_agent_name)),
        datasets: [
          {
            data: supportAgentReport.map((t)=>(t.total)),
            backgroundColor: supportAgentChartColors,
            borderColor:
              supportAgentChartColors
            ,
            borderWidth: 1,
          },
        ],

      }
    )
  },
  [supportAgentReport]);


  useEffect(()=>
  {
    setTypeChartData(
      {
        labels: typeReport.map((item)=> (t(`callType.${item.type}`))),
        datasets: [
          {
            data: typeReport.map((t)=>(t.total)),
            backgroundColor: typeChartColors,
            borderColor: 
              typeChartColors
            ,
            borderWidth: 1,
          },
        ],
        
      }
    )
  },
  [typeReport]);

     useEffect(()=>
  {
  },
  [technicianChartData  ]);
  

  const handleSelectChange = (e,report) => {
    const { name, value } = e.target;
    switch(report){
      case "status":
        setStatusFilter((f)=>({...f,[name]:value}))
        break;
      case "technician":
        setTechnicianFilter((f)=>({...f,[name]:value}))
        break;
      case "supportAgent":
        setSupportAgentFilter((f)=>({...f,[name]:value}))
        break;
      case "type":
        setTypeFilter((f)=>({...f,[name]:value}))
        break;
    }
  };


  const handleShowReport = async (reportId)=>{
    setStatusReportExtended([]);
    setTechnicianReportExtended([]);
    setSupportAgentReportExtended([]);
    setTypeReportExtended([]);
    let filter = [];
    switch (reportId){
        case "status":
          filter = statusFilter;
          break;
        case "technician":
          filter = technicianFilter;
          break;
        case "supportAgent":
          filter = supportAgentFilter;
          break;
        case "type":
          filter = typeFilter;
          break;
     }
     const qs = new URLSearchParams({ filter: JSON.stringify(filter) });
     const { ok, data } = await send(`/api/reports/${reportId}?${qs}`);
     if (!ok) return;
     switch (reportId){
        case "status":
          setStatusReport(data['items']);
          break;
        case "technician":
          setTechnicianReport(data['items']);
          break;
        case "supportAgent":
          setSupportAgentReport(data['items']);
          break;
        case "type":
          setTypeReport(data['items']);
          break;
     }
  }


  const showExtendedCalls= async (reportId,lineValue,limit = 20, page = 1, sortBy, sortDir, columnFilter) =>{
    let filter = [];
    switch (reportId){
        case "status":
          filter = ({...statusFilter,['status']:lineValue})
          break;
        case "technician":
          filter = ({...technicianFilter,['assigned_technician_id']:lineValue})
          break;
        case "supportAgent":
          filter = ({...supportAgentFilter,['assigned_support_agent_id']:lineValue})
          break;
        case "type":
          filter = ({...typeFilter,['type']:lineValue})
          break;
    }
    // merge the DataTable column filters on top of the report's own filter
    filter = { ...filter, ...(columnFilter || {}) };
    const qs = new URLSearchParams({ filter: JSON.stringify(filter) });
    if (sortBy) { qs.set("sortBy", sortBy); qs.set("sortDir", sortDir); }
    const { ok, data } = await send(`/api/serviceCalls?limit=${limit}&page=${page}&${qs}`);
    if (!ok) return;
    switch (reportId){
        case "status":
          setStatusReportExtended(Array.isArray(data.items) ? data.items : []);
          setStatusExtendedCallPageCount(data?.pagination.totalPages);
          setStatusExtendedCallPageSize(data?.pagination.limit);
          setStatusExtendedCallPage(data?.pagination.page);
          setStatusExtendedValue(lineValue);
          break;
        case "technician":
          setTechnicianReportExtended(Array.isArray(data.items) ? data.items : []);
          setTechnicianExtendedCallPageCount(data?.pagination.totalPages);
          setTechnicianExtendedCallPageSize(data?.pagination.limit);
          setTechnicianExtendedCallPage(data?.pagination.page);
          setTechnicianExtendedValue(lineValue);
          break;
        case "supportAgent":
          setSupportAgentReportExtended(Array.isArray(data.items) ? data.items : []);
          setSupportAgentExtendedCallPageCount(data?.pagination.totalPages);
          setSupportAgentExtendedCallPageSize(data?.pagination.limit);
          setStatusExtendedCallPage(data?.pagination.page);
          setSupportAgentExtendedValue(lineValue);
          break;
        case "type":
          setTypeReportExtended(Array.isArray(data.items) ? data.items : []);
          setTypeExtendedCallPageCount(data?.pagination.totalPages);
          setTypeExtendedCallPageSize(data?.pagination.limit);
          setTypeExtendedCallPage(data?.pagination.page);
          setTypeExtendedValue(lineValue);
          break;
    }

  }
  // ----- load technicians + support agents for the CallForm dropdowns -----
  // mapped to { id, name } since SearchSelect expects a name field.
  const fetchCallRefs = async () => {
    try {
      const [tRes, saRes] = await Promise.all([
        fetch(`/api/technicians?all=1`),
        fetch(`/api/supportAgents?all=1`),
      ]);
      const techs = await tRes.json();
      const agents = await saRes.json();
      const toOption = (r) => ({
        id: r.id,
        name: [r.first_name, r.last_name].filter(Boolean).join(" "),
      });
      setTechnicians(Array.isArray(techs.items) ? techs.items.map(toOption) : []);
      setSupportAgents(Array.isArray(agents.items) ? agents.items.map(toOption) : []);
    } catch (e) {
      console.error("Error loading technicians/support agents:", e);
    }
  };

  // load the clicked call's customer products + full catalog (for the CallForm)
  const fetchCustomerProducts = async (customerId, limit = 20, page = 1) => {
    if (!customerId) { setCustomerProducts([]); return; }
    try {
      const { ok, data: cp } = await send(`/api/customers/${customerId}/products?limit=${limit}&page=${page}`);
      if (!ok) return;
      setCustomerProducts(Array.isArray(cp.items) ? cp.items : []);
    } catch (e) {
      console.error("Error loading customer products:", e);
      setCustomerProducts([]);
    }
  };

  // open the CallForm modal seeded with the clicked call, like the customer's calls list
  const onOpenCallListItem = async (item) => {
    await fetchCustomerProducts(item?.customer_id);
    if (!supportAgents.length) await fetchCallRefs();
    setOpenedCallItem(item);
    setOpenCallModal(true);
  }

  const handleCallSubmit = async (data) => {
    if (!data.id) return false;
    const { ok, data: updated } = await send(`/api/serviceCalls/${data.id}`, { method: 'PUT', body: data });
    if (ok) {
      let extendedValue = "",extendedPageSize = "",extendedPage = "";
      switch (selectedReport){
        case "status":
            extendedValue = statusExtendedValue;
            extendedPageSize = statusExtendedCallPageSize;
            extendedPage = statusExtendedCallPage;
          // const pageSize = stat
          break;
        case "technician":
            extendedValue = technicianExtendedValue;  
            extendedPageSize= technicianExtendedCallPageSize;
            extendedPage = technicianExtendedCallPage;
          break;
        case "supportAgent":
          extendedValue = supportAgentExtendedValue;
          extendedPageSize = supportAgentExtendedCallPageSize;
          extendedPage = supportAgentExtendedCallPage;
          break;
        case "type":
          extendedValue = typeExtendedValue;
          extendedPageSize = typeExtendedCallPageSize;
          extendedPage = typeExtendedCallPage;
          break;
    }

        await showExtendedCalls(selectedReport, extendedValue, extendedPageSize, extendedPage);
    }
    return ok;
  }
  // TODO (server side): GET /api/dashboard
//   useEffect(() => {
//     let cancelled = false;
//     async function load() {
//       try {
//         setLoading(true);
//         // const res = await fetch("/api/dashboard");
//         // const d = await res.json();
//         // if (!cancelled) { setSummary(d.summary); setHighPriority(d.highPriority); ... }
//       } catch (e) {
//         console.error("Error loading dashboard:", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }
//     load();
//     return () => { cancelled = true; };
//   }, []);

//   const statusBadge = (status) => (
//     <span className={`badge ${STATUS_BADGE[status] || "text-secondary"}`}>
//       {t(`servicecall.status_${status}`)}
//     </span>
//   );

//   const highPriorityColumns = useMemo(
//     () => [
//       { key: "id", label: t("servicecall.id"), width: 1 },
//       { key: "customer", label: t("dashboard.customer"), width: 2 },
//       { key: "description", label: t("servicecall.description"), truncate: true },
//       { key: "status", label: t("servicecall.status"), width: 2, render: (r) => statusBadge(r.status) },
//       { key: "opened_at", label: t("servicecall.openedAt"), width: 2 },
//       { key: "responsible", label: t("servicecall.responsible"), width: 2, render: (r) => r.responsible || <span className="text-muted">{t("dashboard.unassigned")}</span> },
//       {
//         key: "_link", label: "", width: 1, sortable: false,
//         render: (r) => (
//           <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/calls/${r.id}`)}>
//             #{r.id}
//           </button>
//         ),
//       },
//     ],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [t, navigate]
//   );

  const listColumnsStatus = useMemo(
    () => [
      { key: "status", label: t("servicecall.status"), 
        render: (r) => (
                  <span className={`badge ${STATUS_BADGE[r.status] || "text-bg-secondary"}`}>
                    {t(`callStatus.${r.status}`)}
                  </span>
                ),
        width:2
      },
      { key: "total", label: t("reports.callsQuantity"), width: 2 },
      { key: "percent", label: t("reports.percent"), width: 2, render: (r) => r.percent > 0 ? <span className="">{parseFloat(r.percent).toFixed(2)}%</span> : 0 },
      { key: "", label: "", 
        render: (r) => (
                  <span>
                  <a className="" onClick={()=>showExtendedCalls('status',r.status)}>{t(`reports.showCalls`)}</a>     
                  {/* {t(`report.${r.status}`)} */}
                  </span>
                ),
        width: 2 },
    ],
    [t]
  );

   const listColumnsTechnician = useMemo(
    () => [
      { key: "technician_name", label: t("servicecall.technician"), 
        // render: (r) => (
        //           <span className={`badge ${STATUS_BADGE[r.status] || "text-bg-secondary"}`}>
        //             {t(`callStatus.${r.status}`)}
        //           </span>
        //         ),
        width:2
      },
      { key: "total", label: t("reports.callsQuantity"), width: 2 },
      { key: "percent", label: t("reports.percent"), width: 2, render: (r) => r.percent > 0 ? <span className="">{parseFloat(r.percent).toFixed(2)}%</span> : 0 },
      { key: "", label: "", 
        render: (r) => (
                  <span>
                  <a className="" onClick={()=>showExtendedCalls('technician',r.id)}>{t(`reports.showCalls`)}</a>  
                  {/* {t(`report.${r.status}`)} */}
                  </span>
                ),
        width: 2 },
    ],
    [t]
  );

   const listColumnsSupportAgent = useMemo(
    () => [
      { key: "support_agent_name", label: t("servicecall.supportAgent"),
        width:2
      },
      { key: "total", label: t("reports.callsQuantity"), width: 2 },
      { key: "percent", label: t("reports.percent"), width: 2, render: (r) => r.percent > 0 ? <span className="">{parseFloat(r.percent).toFixed(2)}%</span> : 0 },
      { key: "", label: "",
        render: (r) => (
                  <span>
                  <a className="" onClick={()=>showExtendedCalls('supportAgent',r.id)}>{t(`reports.showCalls`)}</a>
                  </span>
                ),
        width: 2 },
    ],
    [t]
  );

   const listColumnsType = useMemo(
    () => [
      { key: "type", label: t("servicecall.type"), 
        render: (r) => (
                  <span >
                     {t(`callType.${r.type}`)}
                   </span>
                 ),
        width:2
      },
      { key: "total", label: t("reports.callsQuantity"), width: 2 },
      { key: "percent", label: t("reports.percent"), width: 2, render: (r) => r.percent > 0 ? <span className="">{parseFloat(r.percent).toFixed(2)}%</span> : 0 },
      { key: "", label: "", 
        render: (r) => (
                  <span>
                  <a className="" onClick={()=>showExtendedCalls('type',r.type)}>{t(`reports.showCalls`)}</a>  
                  {/* {t(`report.${r.status}`)} */}
                  </span>
                ),
        width: 2 },
    ],
    [t]
  );

  const listColumnsServiceCalls = useServiceCallColumns();

  

//   const interventionColumns = useMemo(
//     () => [
//       {
//         key: "id", label: t("servicecall.id"), width: 2, sortable: false,
//         render: (r) => (
//           <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/calls/${r.id}`)}>
//             #{r.id}
//           </button>
//         ),
//       },
//       { key: "customer", label: t("dashboard.customer"), width: 3 },
//       { key: "description", label: t("servicecall.description"), truncate: true },
//       {
//         key: "problem", label: t("dashboard.problem"), width: 3,
//         render: (r) => (
//           <span className={`badge ${PROBLEM_BADGE[r.problem] || "text-secondary"}`}>
//             {t(`dashboard.${r.problem}`)}
//           </span>
//         ),
//       },
//     ],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [t, navigate]
//   );

  if (loading) return <div className="text-center p-4">{t("common.loading")}</div>;

 
  const filterRow = (reportId,filter)=>{
    return(
    <div className="row mb-4">
      <div className="col">
        <label className="form-label">{t("servicecall.fromDate")}</label>
        <DatePicker
          type="date"
          className="form-control"
          name="fromDate"
          selected={filter.fromDate ? new Date(filter.fromDate) : null}
          onChange={(date)=>handleSelectChange({target:{name:'fromDate',value:toISO(date)}},reportId)}
          dateFormat="dd/MM/yyyy"
          locale={locale=="he"?he:''}
        />
      </div>
      -
      <div className="col">
        <label className="form-label">{t("servicecall.toDate")}</label>
        <DatePicker
          type="date"
          className="form-control"
          name="fromDate"
          selected={filter.toDate ? new Date(filter.toDate) : null}
          onChange={(date)=>handleSelectChange({target:{name:'toDate',value:toISO(date)}},reportId)}
          dateFormat="dd/MM/yyyy"
          locale={locale=="he"?he:''}
        />
      </div>

        <div className="col">
          <label className="form-label">{t("servicecall.status")}</label>
          <Select
            className="form-select"
            name="status"
            value={filter.status}
            onChange={(ids) => handleSelectChange({target:{name:'status',value:ids}},reportId)} 
            options = {CALL_STATUSES.map((item)=>({name:t("callStatus."+item),id:item}))}
            placeholder={t("servicecall.selectStatus")}
            multiple={true}
          />
            {/* {CALL_STATUSES.map((s)=>(
                (<option value={s}>{t("callStatus."+s)}</option>)
            ))}
          </select> */}
        </div>

        <div className="col">
          <label className="form-label">{t("servicecall.technician")}</label>
           <SearchSelect
          multiple={true}
            options={technicians}
            value={filter.assigned_technician_id}
            onChange={(ids) => handleSelectChange({target:{name:'assigned_technician_id',value:ids}},reportId)}
            placeholder={t("servicecall.selectTechnician")}
            searchPlaceholder={t("servicecall.selectTechnician")}
          />
        </div>

        <div className="col">
          <label className="form-label">{t("servicecall.supportAgent")}</label>
          <SearchSelect
          multiple={true}
            options={supportAgents}
            value={filter.assigned_support_agent_id}
            onChange={(ids) => handleSelectChange({target:{name:'assigned_support_agent_id',value:ids}},reportId)}
            placeholder={t("servicecall.selectSupportAgent")}
            searchPlaceholder={t("servicecall.selectSupportAgent")}
          />
        </div>

        <div className="col">
          <label className="form-label">{t("servicecall.priority")}</label>
          <Select
            className="form-select"
            name="priority"
            value={filter.priority}
            onChange={(ids) => handleSelectChange({target:{name:'priority',value:ids}},reportId)} 
            options = {CALL_PRIORITIES.map((item)=>({name:t("callPriority."+item),id:item}))}
            placeholder={t("servicecall.selectPriority")}
            multiple={true}
          />
        </div>

        <div className="col">
          <label className="form-label">{t("servicecall.type")}</label>
          <Select
            className="form-select"
            name="type"
            value={filter.type}
            onChange={(ids) => handleSelectChange({target:{name:'type',value:ids}},reportId)} 
            options = {CALL_TYPES.map((item)=>({name:t("callType."+item),id:item}))}
            placeholder={t("servicecall.selectType")}
            multiple={true}
          />

        </div>

        <div className="col flex-grow-1 align-content-end">
          <button className="btn btn-primary" onClick={()=>handleShowReport(reportId)}><FontAwesomeIcon
                    icon={['fa', 'chart-column']}
                    className="icon-inherit-size me-2"
                      />{t('reports.showReport')}</button>
        </div>
    </div>
    )
  }

  const doughnutChartoptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        align: "center",
      },
    },
  };

  return (
    <div className="container-fluid">
      <Tabs
        defaultActiveKey={initialTab?initialTab:"status"}
        className="mb-3"
        onSelect={(key) => {
          // key is the eventKey of the tab that was clicked: "status", "technician", "callType"
          // console.log("tab selected:", key);
          // e.g. load that tab's report on demand
          setSelectedReport(key);
          handleShowReport(key);
        }}
      >
        {/* ---- tab 1: status ---- */}
        <Tab eventKey="status" title={t("reports.byStatus")}>
          {filterRow("status",statusFilter)}
          <div className="row p-1 gap-3">
             <div className="col-7 ">
            <div className=" bordered-card p-4">
              <List elements={statusReport} listColumns={listColumnsStatus}
                initialSort={STATUS_SORT}
                hideActions={true} 
                showPagination={false}
              />
            </div>
            </div>
            <div className="col-4 flex-grow-1">
            <div className=" bordered-card h-100 p-4">
              <Doughnut data={statusChartData} options={doughnutChartoptions} />
            </div>
            </div>
          </div>
          <div className="row  p-1 mt-4">
            <div className="col col-md-12">
              {(statusExtendedValue !== null || hasActiveFilter(statusFilter))&& (
                <div className=" bordered-card p-4">
                  <List elements={statusReportExtended} listColumns={listColumnsServiceCalls}
                    allowDelete={false} initialSort={EXTENDED_CALL_SORT}
                    showPagination={true} pageCount={statusExtendedCallPageCount}
                    updateDataByPage={(pageSize, page, sortBy, sortDir, filter) => showExtendedCalls('status', statusExtendedValue, pageSize, page, sortBy, sortDir, filter)}
                    onOpenItem={(item) => onOpenCallListItem(item)}
                  />
                </div>
              )}
            </div>
          </div>

        </Tab>

        {/* ---- tab 2: technician ---- */}
        <Tab eventKey="technician" title={t("reports.byTechnician")}>
           {selectedReport==="technician" && 
           (
            <>
            {filterRow("technician",technicianFilter)}
          <div className="row p-1 gap-3">
             <div className="col-7 ">
            <div className=" bordered-card p-4">
              <List elements={technicianReport} listColumns={listColumnsTechnician}
                initialSort={TECHNICIAN_SORT}
                hideActions={true} 
                showPagination={false}
              />
            </div>
            </div>
            <div className="col-4 flex-grow-1">
            <div className=" bordered-card h-100 p-4">
              {technicianChartData!={} &&(<Doughnut data={technicianChartData} options={doughnutChartoptions} />)}
            </div>
            </div>
          </div>
          <div className="row p-1 mt-4">
            <div className="col col-md-12">
              {(technicianExtendedValue !== null || hasActiveFilter(technicianFilter)) && (
                <div className=" bordered-card p-4 ">
                  <List elements={technicianReportExtended} listColumns={listColumnsServiceCalls}
                    allowDelete={false} initialSort={EXTENDED_CALL_SORT}
                    showPagination={true} pageCount={technicianExtendedCallPageCount}
                    updateDataByPage={(pageSize, page, sortBy, sortDir, filter) => showExtendedCalls('technician', technicianExtendedValue, pageSize, page, sortBy, sortDir, filter)}
                    onOpenItem={(item) => onOpenCallListItem(item)}
                  />
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </Tab>

        {/* ---- tab 3: support agent ---- */}
        <Tab eventKey="supportAgent" title={t("reports.bySupportAgent")}>
           {selectedReport==="supportAgent" &&
           (
            <>
            {filterRow("supportAgent",supportAgentFilter)}
          <div className="row p-1 gap-3">
             <div className="col-7 ">
            <div className=" bordered-card p-4">
              <List elements={supportAgentReport} listColumns={listColumnsSupportAgent}
                initialSort={SUPPORT_AGENT_SORT}
                hideActions={true}
                showPagination={false}
              />
            </div>
            </div>
            <div className="col-4 flex-grow-1">
            <div className=" bordered-card h-100 p-4">
              {supportAgentChartData!={} &&(<Doughnut data={supportAgentChartData} options={doughnutChartoptions} />)}
            </div>
            </div>
          </div>
          <div className="row p-1 mt-4">
            <div className="col col-md-12">
              {(supportAgentExtendedValue !== null || hasActiveFilter(supportAgentFilter)) && (
                <div className=" bordered-card p-4 ">
                  <List elements={supportAgentReportExtended} listColumns={listColumnsServiceCalls}
                    allowDelete={false} initialSort={EXTENDED_CALL_SORT}
                    showPagination={true} pageCount={supportAgentExtendedCallPageCount}
                    updateDataByPage={(pageSize, page, sortBy, sortDir, filter) => showExtendedCalls('supportAgent', supportAgentExtendedValue, pageSize, page, sortBy, sortDir, filter)}
                    onOpenItem={(item) => onOpenCallListItem(item)}
                  />
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </Tab>

        {/* ---- tab 4: call type ---- */}
        <Tab eventKey="type" title={t("reports.byCallType")}>
          {selectedReport==="type" && (
          <>
          {filterRow("type",typeFilter)}
          <div className="row p-1 gap-3">
             <div className="col-7 ">
            <div className=" bordered-card p-4">
              <List elements={typeReport} listColumns={listColumnsType}
                initialSort={TYPE_SORT}
                hideActions={true} 
                showPagination={false}
              />
            </div>
            </div>
            <div className="col-4 flex-grow-1">
            <div className=" bordered-card h-100 p-4">
              {typeChartData!={} &&(<Doughnut data={typeChartData} options={doughnutChartoptions} />)}
            </div>
            </div>
          </div>
          <div className="row p-1 mt-4">
            <div className="col col-md-12">
              {(typeExtendedValue !== null || hasActiveFilter(typeFilter)) && (
                <div className=" bordered-card p-4">
                  <List elements={typeReportExtended} listColumns={listColumnsServiceCalls}
                    allowDelete={false} initialSort={EXTENDED_CALL_SORT}
                    showPagination={true} pageCount={typeExtendedCallPageCount}
                    updateDataByPage={(pageSize, page, sortBy, sortDir, filter) => showExtendedCalls('type', typeExtendedValue, pageSize, page, sortBy, sortDir, filter)}
                    onOpenItem={(item) => onOpenCallListItem(item)}
                  />
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </Tab>
      </Tabs>

      <Modal open={openCallModal} onClose={() => setOpenCallModal(false)} modalchildren>
        <CallForm
          initialCall={openedCallItem}
          customerProducts={customerProducts}
          onSubmitForm={handleCallSubmit}
          supportAgents={supportAgents}
          technicians={technicians}
          onCloseForm={() => setOpenCallModal(false)}
        />
      </Modal>
    </div>
  );
}
