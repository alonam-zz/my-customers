import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";


import CallForm from "../components/CallForm.jsx";
import List from "../components/List.jsx";
import { useBreadcrumbs } from "../components/BreadcrumbContext.jsx";
import useApi from "../hooks/useApi.js";
import { useI18n } from "../i18n/I18nProvider";
import { formatDateTime } from "../utils/date.js";
import  useAuth  from "../auth/AuthProvider.jsx";
import { useAddLog } from "../utils/logs.js";





// page size for the call-lines list
const CALL_LINES_LIMIT = 20;

export default function CallPage({ customerId,callId }) {
  const { t, locale } = useI18n();
  const { setLabel } = useBreadcrumbs();
  const send = useApi();

  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [call, setCall] = useState(null);

  const [callLines, setCallLines] = useState([]);
  const [callLinesPageCount, setCallLinesPageCount] = useState("");
  const [callLinesLimit, setCallLinesLimit] = useState(CALL_LINES_LIMIT);
  const [customerProducts, setCustomerProducts] = useState([]);

  const [newCallLineDescription,setNewCallLineDescription] = useState("");

  const {user} = useAuth();
  const addLog = useAddLog();

  // ----- load the customer (GET /api/customers/:id) -----
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { ok, data } = await send(`/api/serviceCalls/${callId}`);
        if (!ok) return;

        const [cnRes,cpRes] = await Promise.all([
            fetch(`/api/customers/${customerId}/name`),
            fetch(`/api/customers/${customerId}/products?all=1`),
        ]);

        const cn = await cnRes.json();
        const cp = await cpRes.json();

        setCustomerName(cn[0].name);
        setCustomerProducts(Array.isArray(cp.items) ? cp.items : []);

        if (!cancelled) setCall(data);
      } catch (e) {
        console.error("Error loading call:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [callId,customerId]);

  // show the customer name + call title (not the ids) in the breadcrumbs.
  // keys must be the full accumulated path the Header builds for each segment.
  useEffect(() => {
    if (customerName) setLabel(`/customers/${customerId}`, customerName);
    if (call) setLabel(`/customers/${customerId}/calls/${callId}`, call.title);
  }, [callId,customerId,call,customerName,setLabel]);

  // ----- load this customer's calls (GET — server side added later) -----
  const fetchCallLines = async (limit = CALL_LINES_LIMIT, page = 1, sortBy, sortDir) => {
    try {
      const { ok, data } = await send(`/api/serviceCallLines/${callId}?limit=${limit}&page=${page}${sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : ""}`);
      if (!ok) return;
      setCallLines(Array.isArray(data.items) ? data.items : []);
      setCallLinesPageCount(data?.pagination.totalPages);
      setCallLinesLimit(data?.pagination?.limit ?? CALL_LINES_LIMIT);
    } catch (e) {
      console.error("Error loading calls:", e);
      setCallLines([]);
    }
  };


  const callSelectedFieldsChange = async(field,value,valueName = "") =>{
    let desc = ""; 
    switch (field){
        case "status":
            desc = t("callLine.statusChanged")+t(`callStatus.${value}`);
            call.status = value;
            if (value === "closed")
                addLog("service_calls", t("logs.callClosed", { name: call.title }));
            break;
        case "type":
            desc = t("callLine.typeChanged")+t(`callType.${value}`);;
            call.type = value;
            break;
        case 'priority':
            desc = t("callLine.priorityChanged")+t(`callPriority.${value}`);
            call.priority = value;
            break;
        case 'assigned_support_agent_id':
            desc = t("callLine.movedToEmployee")+' '+valueName ;
            call.assigned_support_agent_id = value;
            addLog("service_calls", t("logs.supportAgentSet", { name: valueName, call: call.title }));
            break;
        case 'assigned_technician_id':
            desc = t("callLine.technicianSet")+' '+valueName ;
            call.assigned_technician_id = value;
            addLog("service_calls", t("logs.technicianSet", { name: valueName, call: call.title }));
            break;
        case 'service_id':
            desc = t("callLine.serviceChanged")+valueName;
            call.service_id = value;
            break;
        
        
    }

    const data = {
        description:desc,
        status:call.status,
        employee_id:user.id
    }
    await addCallLine(data);
    await handleCallSubmit(call,true);
  }

  const addCallLine = async (newLine)=>{

    const { ok } = await send(`/api/serviceCallLines/${callId}`, { method: 'POST', body: newLine });
    setNewCallLineDescription("");
    // newest first (the list sorts by created_at desc); cap to one page
    if (ok){
      fetchCallLines(callLinesLimit)
    }

  }

  // technician marks the call as finished -> status "technician_completed",
  // then logs a call line describing the change (same shape as callSelectedFieldsChange)
  const finishByTechnician = async () => {
    const { ok } = await send(`/api/serviceCalls/${callId}/updateFinishByTechnician`, { method: 'PUT' });
    if (!ok) return;
    const value = "technician_completed";
    setCall((c) => ({ ...c, status: value }));
    const data = {
      description: t("callLine.statusChanged") + t(`callStatus.${value}`),
      status: value,
      employee_id: user.id,
    };
    await addCallLine(data);
  };

  const handleCallSubmit = async (data,showToast = true) => {
    if (data.id) {
      const { ok, data: updated } = await send(`/api/serviceCalls/${data.id}`, { method: 'PUT', body: data });
      if (ok) {
        setCall(updated ?? data);
        if (showToast) toast.success(t("servicecall.updatedSuccess"));
      }
      return ok;
    }
    const { ok, data: created } = await send('/api/serviceCalls', { method: 'POST', body: data });
    if (ok && created) {
      setCall((prev) => [...prev, created]);
      toast.success(t("servicecall.addedSuccess"));
    }
    return ok;
  }

  // columns for the call lines list
  const callLinesColumns = useMemo(
    () => [
      {
        key: "created_at", label: t("callLine.dateTime"), width: 2,
        render: (r) => formatDateTime(r.created_at),
        type:"date"
      },
      { key: "description", label: t("callLine.description"), truncate: 1, width:4 },
      { key: "employee_name", label: t("callLine.employeeName"), width: 3 },
      { key: "status", label: t("callLine.status"), width: 2, 
        render: (r) => t(`callStatus.${r.status}`),
      }
      ,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale]
  );

  if (loading) return <div className="text-center p-4">{t("common.loading")}</div>;

  return (
    <div className="container-fluid">
      {/* <h1 className="mb-3">{customer?.name || t("customer.title")}</h1> */}
    <div className ="row g-3">
     <CallForm initialCall={call} customerProducts={customerProducts}
              twoColsForm = {true}
              onSubmitForm = {(data, showToast) => handleCallSubmit(data, showToast)}
              onChangeSelectedFields = {callSelectedFieldsChange}
              disabled = {user?.role === "technician" || call?.status === "closed"}
              onCloseForm = {()=>{}}/>
    {
        user?.role === "technician" && call.status !== "closed" && call.status !== "technician_completed" && (
        <div className="row px-4 pt-3">
            <div className="col-12">
                <button type="button" className="btn btn-success" onClick={finishByTechnician}>
                    {t("servicecall.finishByTechnician")}
                </button>
            </div>
        </div>
        )
    }
    {
        call.status!="closed" && (
    <div className="row p-4">
        <div className="col-6 bordered-card p-4">
            <label className="form-label">{t("callLine.Update")}</label>
            <textarea
                className="form-control"
                rows={5}
                name="newCallLineDesc"
                value={newCallLineDescription}
                onChange={(e) => {setNewCallLineDescription(e.target.value)}}
                />
            <div className={`d-flex "justify-content-start gap-2 mt-4`}>
            <button type="button" className="btn btn-primary" onClick={()=>{
                const data = {
                    description:newCallLineDescription,
                    status:call.status,
                    employee_id:user.id
                }
                addCallLine(data);
                }}>
            {t("common.add")}
            </button>
            </div>

        </div>
    </div>
        )
    }
    <List
    elements={callLines}
    listColumns={callLinesColumns}
    initialSort={{ key: "created_at", dir: "desc" }}
    updateDataByPage={fetchCallLines}
    pageCount={callLinesPageCount}
    allowDelete = {false}
    allowEdit = {false}
    />



        
    </div>
    </div>
  );
}
