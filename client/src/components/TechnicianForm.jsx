import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import Select from "./Select.jsx";
import UserName from "./UserName.jsx";
import Loader from "./Loader.jsx";
import { AVAILABILITY } from "../utils/constants.js";


/**
 * Props:
 *  - initialTechnician?: row from /api/technicians (includes employee fields via JOIN)
 *  - onSubmitForm: (technician) => void
 *  - onCloseForm: () => void
 *
 * NOTE: the DB column is spelled `availability_status` (per the technicians table).
 */
export default function TechnicianForm({ initialTechnician = {}, onSubmitForm, onCloseForm, disableEdit, areas = [] }) {
  const { t } = useI18n();
  const [submiting, setSubmiting] = useState(false);

  const [form, setForm] = useState({
    id: initialTechnician.id ?? "",
    employee_id: initialTechnician.employee_id ?? "",
    // employee contact fields
    first_name: initialTechnician.first_name ?? "",
    last_name: initialTechnician.last_name ?? "",
    username: initialTechnician.username ?? "",
    email: initialTechnician.email ?? "",
    phone: initialTechnician.phone ?? "",
    // technician fields
    region: initialTechnician.region ?? "",
    specialization: initialTechnician.specialization ?? "",
    availability_status: initialTechnician.availability_status ?? "available",
    max_daily_visits: initialTechnician.max_daily_visits ?? "",
    is_external: initialTechnician.is_external ?? false,
    vehicle_number: initialTechnician.vehicle_number ?? "",
    notes: initialTechnician.notes ?? "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const technician = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      max_daily_visits: form.max_daily_visits === "" ? null : Number(form.max_daily_visits),
      is_external: form.is_external ? 1 : 0,
      username: form.id?"":form.username.trim(),
    };
    if (!technician.first_name) return; // minimal required
    if (!form.id && (!technician.username || !technician.email)) return; // minimal required for new  technician
    setSubmiting(true);
    const ok = await onSubmitForm?.(technician);
    setSubmiting(false);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  return (
    <form className="container p-3 position-relative" onSubmit={handleSubmit}>
      {submiting && <Loader />}
      <fieldset disabled={disableEdit || submiting} >
      <div className="row g-3">
        {/* ----- employee contact ----- */}
        <div className="col-12 col-md-6">
          <label className="form-label">{t("employee.first_name")} *</label>
          <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} required />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("employee.last_name")}</label>
          <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("employee.email")} *</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required/>
        </div>
        <UserName
          value={form.username}
          onChange={form.id?{}:handleChange} 
          disabled={(form.id||(disableEdit))?true:false}
        />
        <div className="col-12 col-md-6">
          <label className="form-label">{t("employee.phone")}</label>
          <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <hr className="mt-2" />

        {/* ----- technician fields ----- */}
        <div className="col-12 col-md-6">
          <label className="form-label">{t("technician.region")}</label>
          <Select
            name="region"
            options={areas}
            value={form.region}
            onChange={handleChange}
            placeholder={t("technician.selectRegion")}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("technician.specialization")}</label>
          <input className="form-control" name="specialization" value={form.specialization} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">{t("employee.availability")}</label>
          <select className="form-select" name="availability_status" value={form.availability_status} onChange={handleChange}>
            {AVAILABILITY.map((v) => <option key={v} value={v}>{t(`avail.${v}`)}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">{t("technician.max_daily_visits")}</label>
          <input type="number" min="0" className="form-control" name="max_daily_visits" value={form.max_daily_visits} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">{t("user.activity")}</label>
          <select className="form-select" name="is_active" value={form.is_active} onChange={handleChange} disabled={disableEdit}>
            <option value={1}>{t("user.active")}</option>
            <option value={0}>{t("user.inactive")}</option>
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("technician.vehicle_number")}</label>
          <input className="form-control" name="vehicle_number" value={form.vehicle_number} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 d-flex align-items-end">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="is_external" name="is_external" checked={!!form.is_external} onChange={handleChange} />
            <label className="form-check-label" htmlFor="is_external">{t("technician.is_external")}</label>
          </div>
        </div>
        <div className="col-12">
          <label className="form-label">{t("technician.notes")}</label>
          <textarea className="form-control" rows={2} name="notes" value={form.notes} onChange={handleChange} />
        </div>
      </div>

      {!disableEdit && (
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>{t("common.cancel")}</button>
        <button type="submit" className="btn btn-primary">{t("common.save")}</button>
      </div>
      )}
      </fieldset>
    </form>
  );
}
