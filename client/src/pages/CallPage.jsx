import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Tabs, Tab } from "react-bootstrap";
import Modal from '../components/Modal.jsx'


import CallForm from "../components/CallForm.jsx";
import List from "../components/List.jsx";
import SearchSelect from "../components/SearchSelect.jsx";
import { useBreadcrumbs } from "../components/BreadcrumbContext.jsx";
import { useConfirm } from "../components/ConfirmProvider.jsx";
import useApi from "../hooks/useApi.js";
import { useI18n } from "../i18n/I18nProvider";
import { formatDateTime } from "../utils/date.js";
import {STATUS_BADGE,PRIORITY_BADGE} from "../utils/constants.js"
import  useAuth  from "../auth/AuthProvider.jsx";
import { useAddLog } from "../utils/logs.js";





// page size for the call-lines list
const CALL_LINES_LIMIT = 20;

export default function CallPage({ customerId,callId }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { setLabel } = useBreadcrumbs();
  const send = useApi();
  const confirm = useConfirm();

  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [call, setCall] = useState(null);

  const [callLines, setCallLines] = useState([]);
  const [callLinesPageCount, setCallLinesPageCount] = useState("");
  const [callLinesLimit, setCallLinesLimit] = useState(CALL_LINES_LIMIT);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [productsPageCount, setProductsPageCount] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [supportAgents, setSupportAgents] = useState([]);
  const [openCallModal, setOpenCallModal] = useState(false);
  const [openedCallItem,setOpenedCallItem] = useState({customer_id:customerId})

  const [newCallLineDescription,setNewCallLineDescription] = useState("");

  const {user} = useAuth();
  const addLog = useAddLog();

  // ----- load the customer (GET /api/customers/:id) -----
  useEffect(() => {
    let cancelled = false;
    async function load(pageSize,page=1) {
      try {
        setLoading(true);
        const { ok, data } = await send(`/api/serviceCalls/${callId}`);
        if (!ok) return;

        // setCustomerId(customerId);
        const [cnRes,cpRes,techRes,agentsRes] = await Promise.all([
            fetch(`/api/customers/${customerId}/name`),
            fetch(`/api/customers/${customerId}/products?all=1`),
            (user.role!="technician")?fetch(`/api/technicians?all=1`):fetch(`/api/technicians/${data?.assigned_technician_id}`),
            (user.role!="technician")?fetch(`/api/supportAgents?all=1:`):fetch(`/api/supportAgents/${data?.assigned_support_agent_id}`),
        ]);

        const cn = await cnRes.json();
        const cp = await cpRes.json();
        const techs = await techRes.json();
        const agents = await agentsRes.json();


        const toOption = (r) => ({
            id: r.id,
            name: [r.first_name, r.last_name].filter(Boolean).join(" "),
        });
        setCustomerName(cn[0].name);
        setCustomerProducts(Array.isArray(cp.items) ? cp.items : []);
        setTechnicians((Array.isArray(techs.items) ? techs.items:[techs]).map(toOption));
        setSupportAgents((Array.isArray(agents.items) ? agents.items:[agents]).map(toOption));


        if (!cancelled) setCall(data);
      } catch (e) {
        console.error("Error loading call:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load(20,1);
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
        case 'support_agent_id':
            desc = t("callLine.movedToEmployee")+' '+valueName ;
            call.support_agent_id = value;
            addLog("service_calls", t("logs.supportAgentSet", { name: valueName, call: call.title }));
            break;
        case 'technician_id':
            desc = t("callLine.technicianSet")+' '+valueName ;
            call.technician_id = value;
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

    const { ok, data: created } = await send(`/api/serviceCallLines/${callId}`, { method: 'POST', body: newLine });
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

  // ----- load technicians + support agents for the CallForm dropdowns -----
  // mapped to { id, name } since SearchSelect expects a name field.
  const fetchCallRefs = async () => {
    try {
      const [tRes, saRes] = await Promise.all([
        (user.role!="technician")?fetch(`/api/technicians?all=1`):fetch(`/api/technicians/${data?.assigned_technician_id}`),
        (user.role!="technician")?fetch(`/api/supportAgents?all=1:`):fetch(`/api/supportAgents/${data?.assigned_support_agent_id}`),
      ]);
      const techs = await tRes.json();
      const agents = await saRes.json();
      const toOption = (r) => ({
        id: r.id,
        name: [r.first_name, r.last_name].filter(Boolean).join(" "),
      });
      setTechnicians(Array.isArray(techs.items) ? techs.items.map(toOption) : [techs]);
      setSupportAgents(Array.isArray(agents.items) ? agents.items.map(toOption) : [agents]);
    } catch (e) {
      console.error("Error loading technicians/support agents:", e);
    }
  };

  // open the CallForm modal seeded with the clicked call (or a fresh one for "new")
  const onOpenCallListItem = async (item) => {
    if (!customerProducts.length) await fetchCustomerProducts();
    if (!technicians.length || !supportAgents.length) await fetchCallRefs();
    setOpenedCallItem(item);
    setOpenCallModal(true);
  }


  const handleCallSubmit = async (data,showToast = true) => {
    if (data.id) {
      const { ok, data: updated } = await send(`/api/serviceCalls/${data.id}`, { method: 'PUT', body: data });
      if (ok) {
        setCall(updated ?? data);
        if (showToast) toast.success(t("servicecall.updateSuccess"));
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

  // ----- load this customer's products + the full catalog (for the add box) -----
  const fetchCustomerProducts = async (limit = 20, page = 1) => {
    try {
      const [cpRes, pRes] = await Promise.all([
        fetch(`/api/customers/${customerId}/products?limit=${limit}&page=${page}`),
        fetch(`/api/products?all=1`),
      ]);
      const cp = await cpRes.json();
      const all = await pRes.json();
      setCustomerProducts(Array.isArray(cp.items) ? cp.items : []);
      setProductsPageCount(cp?.pagination.totalPages);
      setAllProducts(Array.isArray(all.items) ? all.items : []);
    } catch (e) {
      console.error("Error loading customer products:", e);
      setCustomerProducts([]);
    }
  };

  // ----- add a product to this customer (POST /api/customer-products) -----
  const handleAddProduct = async (productId) => {
    if (!productId) return;
    const { ok } = await send(`/api/customers/${customerId}/add-product`, {
      method: "POST",
      body: {productId: Number(productId) },
    });
    if (ok) fetchCustomerProducts(); // refresh the table
  };

  // ----- save (PUT /api/customers/:id) -----
  // returns true on success so the form knows whether to close.
  const handleSave = async (data) => {
    const { ok, data: updated } = await send(`/api/customers/${data.id}`, { method: "PUT", body: data });
    if (ok && updated) setCustomer(updated);
    return ok;
  };



  // columns for the customer products list
  const productColumns = useMemo(
    () => [
      { key: "product_id", label: t("products.id"), width: 1 },
      { key: "product_name", label: t("products.name") },
      { key: "description", label: t("products.description"), truncate: true },
      { key: "sku", label: t("products.sku"), width: 2 },
      { key: "price", label: t("products.price"), width: 2 },
    ],
    [t]
  );

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
              onSubmitForm = {handleCallSubmit}
              onChangeSelectedFields = {callSelectedFieldsChange}
              disabled = {user?.role === "technician" || call?.status === "closed"}
              onCloseForm = {()=>setOpenCallModal(false)}/>
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
