import React, { useState } from "react";
import { createPortal } from "react-dom";

//for the dictionary 
import { useI18n } from "./i18n/I18nProvider";
import Select from "./components/Select";
import {CUSTOMER_TYPE,CUSTOMER_PRIORITY,CUSTOMER_STATUSES} from './utils/constans.js'



/**
 * Props:
 *  - onSubmitForm: (task) => void
 *  - initial?: { title, description, startDate, dueDate, priority, category }
 */
export default function CustomerForm({ initialCustomer = {}, onSubmitForm ,...rest}) {

  const { t, locale, setLocale } = useI18n();

  const [form, setForm] = useState({
    id: initialCustomer.id ?? "",
    name: initialCustomer.name ?? "",
    first_name: initialCustomer.first_name ?? "",
    last_name: initialCustomer.last_name ?? "",
    address: initialCustomer.address ?? "",
    // priority is nullable (string ""), convert to number/null on submit
    phone: initialCustomer.phone ?? "",
    phone2: initialCustomer.phone2 ?? "",
    priority: initialCustomer.priority ?? "regular",
    type: initialCustomer.type ?? "private",
    is_active: initialCustomer.is_active ?? 1,
    is_lead:0
  });

  const onCloseForm = rest.onCloseForm;


  const customer_priorities = CUSTOMER_PRIORITY.reduce((arr,priority)=>{
    const obj = {id:priority,name:t("customerPriority."+priority)}
    arr.push(obj)
    return arr;
  },[]);

  console.log(customer_priorities);

  const customer_types = CUSTOMER_TYPE.reduce((arr,type)=>{
    const obj = {id:type,name:t("customerType."+type)}
    arr.push(obj)
    return arr;
  },[])


  const handleChange = (e) => {
    const { name, value } = e.target; console.log(value);
    let realValue = (e.target.type=="checkbox")?e.target.checked:value; console.log({ ...form, [name]: realValue }); 
    setForm((f) => ( { ...f, [name]: realValue }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const customer = {
      id: form.id,
      name: form.name.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      address: form.address || null,
      phone: form.phone || null,
      phone2: form.phone2 || null,
      email: form.email || null,
      priority: form.priority || "REGULAR",
      type: form.type || "PRIVATE",
      is_active: Number(form.is_active),
      is_lead: form.is_lead || 0  ,
    };

    if (!customer.name) return; // minimal required
    const ok = await onSubmitForm?.(customer);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  return (
    <form className="p-3" onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
      <div className="row g-3">
        <div className="col-12 col-md-12">
          <label className="form-label">{t("customer.name")} *</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder=""
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.type")}</label>
          <Select
            options={customer_types}
            value={form.type}
            name="type"
            onChange={handleChange}
          />
          {/* <input
            className="form-control"
            name="type"
            value={form.priority}
            onChange={handleChange}
          /> */}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.priority")}</label>
          <Select
            options={customer_priorities}
            value={form.priority}
            name="priority"
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.first_name")}</label>
          <input
            className="form-control"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.last_name")}</label>
          <input
            className="form-control"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.phone")}</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.phone2")}</label>
          <input
            type="tel"
            className="form-control"
            name="phone2"
            value={form.phone2}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.email")}</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("customer.address")}</label>
          <input
            className="form-control"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          </div>
          <div className="col-12 col-md-3">
          <label className="form-label">{t("customer.status")}</label>
          <select
            className="form-select"
            name="is_active"
            value={form.is_active}
            onChange={handleChange}
          >
            {CUSTOMER_STATUSES.map((s,i)=>(
                (<option value={i}>{t("customerStatus."+s)}</option>)
            ))}
          </select>
          </div>
        
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="cancel" className="btn btn-outline-secondary" onClick={onCloseForm} >{t("common.cancel")}</button>
        <button type="reset" className="btn btn-secondary" onClick={()=>{
          setForm({ name:"", first_name:"", last_name:"", address:"", phone:"", phone2:"", email:"", id:form.id } );
        }}>{t("common.reset")}</button>
        <button type="submit" className="btn btn-primary">{t("common.save")}</button>
      </div>
    </form>
  );
}
