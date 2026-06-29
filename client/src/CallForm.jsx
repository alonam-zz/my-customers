import { useEffect, useState } from "react";
import SearchSelect from "./components/SearchSelect.jsx";

//for the dictionary
import { useI18n } from "./i18n/I18nProvider";
import {CALL_STATUSES,CALL_PRIORITIES,CALL_TYPES} from "./utils/constans.js";


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
  supportAgents = [],
  technicians = [],
  onSubmitForm,
  onCloseForm,
  customerProducts,
  twoColsForm = false,
  onChangeSelectedFields = null
}) {
  const { t } = useI18n();

  const [form, setForm] = useState({
    id: initialCall.id ?? "",
    customer_id: initialCall.customer_id ?? "",
    title: initialCall.title ?? "",
    description: initialCall.description ?? "",
    status: initialCall.status ?? "new",
    type: initialCall.type ?? "fault",
    priority: initialCall.priority ?? "mid",
    product_id: initialCall.product_id ?? 0,
    service_id: initialCall.service_id ?? 0,
    support_agent_id: initialCall.support_agent_id ?? "",
    technician_id: initialCall.technician_id ?? "",
  });

  const [productsServices, setProductServices] = useState({});

  const [product,setProduct] = useState(initialCall.product);

  const [services,setServices] = useState([]);


  useEffect(
     ()=>{
      const getServices = async ()=>{
        if (productsServices[form.product_id]===undefined){
          try {
            const res = await fetch(`/api/products/${form.product_id}/services`);
              const services = await res.json();
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
      assigned_support_agent_id: form.support_agent_id ? Number(form.support_agent_id) : null,
      assigned_technician_id: form.technician_id ? Number(form.technician_id) : null,
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
          />
        </div>
    </>
  )
  const subRows = (
    <>
     <div className="col-12 col-md-4">
          <label className="form-label">{t("servicecall.type")}</label>
          <select
            className="form-select"
            name="type"
            value={form.type}
            onChange={handleSelectChange}
          >
            {CALL_TYPES.map((s)=>(
                (<option value={s}>{t("callType."+s)}</option>)
            ))}
          </select>
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label">{t("servicecall.status")}</label>
          <select
            className="form-select"
            name="status"
            value={form.status}
            onChange={handleSelectChange}
          >
            {CALL_STATUSES.map((s)=>(
                (<option value={s}>{t("callStatus."+s)}</option>)
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
          >
            {CALL_PRIORITIES.map((s)=>(
                (<option value={s}>{t("callPriority."+s)}</option>)
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
              disabled={form.id?true:""}
        >
          <option value="0"></option>
          {customerProducts.map((p)=>(
                (<option value={p.product_id}>{p.product_name}</option>)
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
        >
          <option value="0"></option>
          {services.map((s)=>(
                (<option value={s.id}>{s.name}</option>)
            ))}
          </select>
        </div>  

        

        <div className="col-12 col-md-6">
          <label className="form-label">{t("servicecall.responsible")}</label>
          <SearchSelect
            options={supportAgents}
            value={form.support_agent_id}
            onChange={(id) => handleRefChange('support_agent_id', id, supportAgents)}
            placeholder={t("servicecall.setSupportAgent")}
            searchPlaceholder={t("common.search") || ""}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("servicecall.technician")}</label>
          <SearchSelect
            options={technicians}
            value={form.technician_id}
            onChange={(id) => handleRefChange('technician_id', id, technicians)}
            placeholder={t("servicecall.selectTechnician")}
            searchPlaceholder={t("servicecall.selectTechnician")}
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
      <div className={`d-flex ${!twoColsForm?"justify-content-end":"justify-content-start"} gap-2 mt-4`}>
        <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>
          {t("common.cancel")}
        </button>
        <button
          type="reset"
          className="btn btn-secondary"
          onClick={() =>
            setForm({
              id: form.id,
              title: "",
              description: "",
              status: "status_new",
              priority: "MID",
              support_agent_id: "",
              technician_id: "",
            })
          }
        >
          {t("common.reset")}
        </button>
        <button type="submit" className="btn btn-primary">
          {t("common.save")}
        </button>
      </div>
    </form>
  );
}
