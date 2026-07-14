import { useEffect, useState } from "react";
import SearchSelect from "./SearchSelect.jsx";

//for the dictionary
import { useI18n } from "../i18n/I18nProvider";
import useApi from "../hooks/useApi.js";
import {CALL_STATUSES,CALL_PRIORITIES,CALL_TYPES} from "../utils/constants.js";
import useAuth from "../auth/AuthProvider.jsx";
import toast from "react-hot-toast";

/**
 * Props:
 *  - initialCall?: { id, title, description, status, priority, support_agent_id, technician_id }
 *  - supportAgents: [{ id, name }]  (for the searchable select)
 *  - technicians: [{ id, name }]    (for the searchable select)
 *  - onSubmitForm: (call) => void
 *  - onCloseForm: () => void
 */
export default function CallForm({
  initialCall = {},
  onSubmitForm,
  onCloseForm,
  customerProducts,
  twoColsForm = false,
  onChangeSelectedFields = null,
  disabled=false
}) {
  const { t } = useI18n();
  const send = useApi();

  const {user} = useAuth();

  const [form, setForm] = useState({
    id: initialCall.id ?? "",
    customer_id: initialCall.customer_id ?? "",
    title: initialCall.title ?? "",
    description: initialCall.description ?? "",
    status: initialCall.status??"new",
    type: initialCall.type ?? "fault",
    priority: initialCall.priority ?? "mid",
    product_id: initialCall.product_id ?? 0,
    service_id: initialCall.service_id ?? 0,
    assigned_support_agent_id: initialCall.assigned_support_agent_id ?? null,
    assigned_technician_id: initialCall.assigned_technician_id ?? null,
  });

  const [productsServices, setProductServices] = useState({});

  const [product,setProduct] = useState(initialCall.product);

  const [services,setServices] = useState([]);

  const [technicians,setTechnicians] = useState([]);
  const [supportAgents,setSupportAgents] = useState([]);
  const [region,setRegion] = useState(""); // customer's region -> filters the technician list


  useEffect(()=>{
    async function UpdateNewCall(){
      const updated = { ...form, status: "open" };
      setForm(updated);
      const ok = await onSubmitForm?.(updated,false);
    }
    //when status is new call (edited for the first time)
    if (form.id && form.status=="new"){
      UpdateNewCall();
    }
  },[])

  // fetch the customer's region so the technician list can be filtered to it
  useEffect(()=>{
    const cid = initialCall.customer_id;
    if (!cid) return;
    (async ()=>{
      const { ok, data } = await send(`/api/customers/${cid}`);
      if (ok) setRegion((Array.isArray(data) ? data[0]?.region : data?.region) ?? "");
    })();
  },[initialCall.customer_id])

  // (re)load the dropdown options; technicians are filtered by the customer's region
  useEffect(()=>{
    fetchCallRefs();
  },[region])


  useEffect(
     ()=>{
      const getServices = async ()=>{
        if (productsServices[form.product_id]===undefined){
          try {
            const { ok, data: services } = await send(`/api/products/${form.product_id}/services`);
              if (!ok) { setProductServices((s)=>({...s,[form.product_id]:[]})); return; }
              setProductServices((s)=>({...s,[form.product_id]:services}))
          } catch (e) {
            console.error("Error loading customer products:", e);
            setProductServices((s)=>({...s,[form.product_id]:[]}))
          } 
        }    
    }

    if (form.product_id) getServices();
    else setServices([]);

    },[form]
  )


  useEffect(
     ()=>{
        if (form.product_id) setServices(productsServices[form.product_id]??[]); 
    },[productsServices]
  )
  

  const fetchCallRefs = async () => {
    try {
      // filter technicians to the customer's region (falls back to all if unknown)
      const techUrl = region
        ? `/api/technicians?all=1&filter=${encodeURIComponent(JSON.stringify({ region }))}`
        : `/api/technicians?all=1`;
      const [tRes, saRes] = await Promise.all([
        fetch(techUrl),
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    // if (name=="product_id"){
    //   setProduct(value);
    // }
    setForm((f) => ({ ...f, [name]: value }));
  };

  // native <select>: value + the option's visible text come straight off the event
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    const valueName = e.target.selectedOptions[0]?.text ?? "";
    setForm((f) => ({ ...f, [name]: value }));
    onChangeSelectedFields?.(name, value, valueName);
    handleSubmit();
  };

  // SearchSelect: only gives an id, so resolve the name from its options [{id, name}]
  const handleRefChange = (name, id, options) => {
    setForm((f) => ({ ...f, [name]: id }));
    const valueName = options.find((o) => String(o.id) === String(id))?.name ?? "";
    onChangeSelectedFields?.(name, id, valueName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const call = {
      id: form.id,
      customer_id: form.customer_id,
      title: form.title.trim(),
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      type: form.type,
      product_id: form.product_id,
      service_id: form.service_id,
      assigned_support_agent_id: form.assigned_support_agent_id ? Number(form.assigned_support_agent_id) : null,
      assigned_technician_id: form.assigned_technician_id ? Number(form.assigned_technician_id) : null,
    };
    if (!call.title) return; // minimal required
    const ok = await onSubmitForm?.(call);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  

  const firstRows = (
    <>
    <div className="col-12">
          <label className="form-label">{t("servicecall.callTitle")} *</label>
          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>
        

        <div className="col-12">
          <label className="form-label">{t("servicecall.description")}</label>
          <textarea
            className="form-control"
            rows={5}
            name="description"
            value={form.description}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
    </>
  )
  const subRows = (
    <>
    <div className="col-12 col-md-4">
          <label className="form-label">{t("servicecall.status")}</label>
          <select
            className="form-select"
            name="status"
            value={form.status}
            onChange={handleSelectChange}
            disabled={disabled}
          >
            {form.id?
            CALL_STATUSES.filter((s)=>(s!="new")).map((s)=>(
                (<option key={s} value={s}>{t("callStatus."+s)}</option>)
            )):
            <option key={"new"} value={"new"}>{t("callStatus.new")}</option>
            }
          </select>
        </div>

     <div className="col-12 col-md-4">
          <label className="form-label">{t("servicecall.type")}</label>
          <select
            className="form-select"
            name="type"
            value={form.type}
            onChange={handleSelectChange}
            disabled={disabled}
          >
            {CALL_TYPES.map((s)=>(
                (<option key={s} value={s}>{t("callType."+s)}</option>)
            ))}
          </select>
        </div>

        

        <div className="col-12 col-md-4">
          <label className="form-label">{t("servicecall.priority")}</label>
          <select
            className="form-select"
            name="priority"
            value={form.priority}
             onChange={handleSelectChange}
             disabled={disabled}
          >
            {CALL_PRIORITIES.map((s)=>(
                (<option key={s} value={s}>{t("callPriority."+s)}</option>)
            ))}
          </select>
        </div>
        
        <div className="col-12 col-md-6">
        <label className="form-label">{t("servicecall.product")}</label>
        <select
              name="product_id"
              className={`form-select ${form.id?"disabled":""}`}
              value={form.product_id}
              onChange={handleChange}
              disabled={(form.id?true:"")||disabled}
        >
          <option value="0"></option>
          {customerProducts.map((p)=>(
                (<option key={p.product_id} value={p.product_id}>{p.product_name}</option>)
            ))}
          </select>
        </div>  

        <div className="col-12 col-md-6">
        <label className="form-label">{t("servicecall.service")}</label>
        <select
              className="form-select"
              value={form.service_id}
              name="service_id"
               onChange={handleSelectChange}
               disabled={disabled}
        >
          <option value="0"></option>
          {services.map((s)=>(
                (<option key={s.id} value={s.id}>{s.name}</option>)
            ))}
          </select>
        </div>  

        

        <div className="col-12 col-md-6">
          <label className="form-label">{t("servicecall.responsible")}</label>
          <SearchSelect
            options={supportAgents}
            value={form.assigned_support_agent_id}
            onChange={(id) => handleRefChange('assigned_support_agent_id', id, supportAgents)}
            placeholder={t("servicecall.setSupportAgent")}
            searchPlaceholder={t("common.search") || ""}
            disabled={disabled}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("servicecall.technician")}</label>
          <SearchSelect
            options={technicians}
            value={form.assigned_technician_id}
            onChange={(id) => handleRefChange('assigned_technician_id', id, technicians)}
            placeholder={t("servicecall.selectTechnician")}
            searchPlaceholder={t("servicecall.selectTechnician")}
            disabled={disabled}
          />
        </div>
    </>
  )

  return (
    <form className="container p-3" onSubmit={handleSubmit}>
      {!twoColsForm
      ?(  
        
           <div className="row g-3">
            {firstRows}
            {subRows}
           </div> 
        
      )
      :(
          <div className="row g-4">
            <div className="col-6">
              <div className="bordered-card p-4 h-100"><div className="row g-3">{firstRows}</div></div>
            </div>
            <div className="col-6">
              <div className="bordered-card p-4 h-100"><div className="row g-3">{subRows}</div></div>
            </div>
           </div>
      )
      }
      { initialCall.status!='closed' && user.role!="technician" && (
      <div className={`d-flex ${!twoColsForm?"justify-content-end":"justify-content-start"} gap-2 mt-4`}>
        <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>
          {t("common.cancel")}
        </button>
        <button
          type="reset" disabled={disabled}
          className="btn btn-secondary"
          onClick={() =>
            setForm({
              id: form.id,
              title: "",
              description: "",
              status: "status_new",
              priority: "MID",
              assigned_support_agent_id: "",
              assigned_technician_id: "",
            })
          }
        >
          {t("common.reset")}
        </button>
        <button type="submit" className="btn btn-primary">
          {t("common.save")}
        </button>
      </div>
      )}
    </form>
  );
}
