import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import UserName from "./UserName.jsx";
import Loader from "./Loader.jsx";
import { AVAILABILITY } from "../utils/constants.js";

const LEVELS = ["L1", "L2", "L3"];

/**
 * Props:
 *  - initialAgent?: row from /api/supportAgents (includes employee fields via JOIN)
 *  - onSubmitForm: (agent) => void
 *  - onCloseForm: () => void
 *
 * NOTE: the DB column is spelled `availability_status` (per the support_agents table).
 */
export default function SupportAgentForm({ initialAgent = {}, onSubmitForm, onCloseForm, disableEdit }) {
  const { t } = useI18n();
  const [submiting, setSubmiting] = useState(false);

  const [form, setForm] = useState({
    id: initialAgent.id ?? "",
    employee_id: initialAgent.employee_id ?? "",
    // employee contact fields
    first_name: initialAgent.first_name ?? "",
    last_name: initialAgent.last_name ?? "",
    username: initialAgent.username ?? "",
    email: initialAgent.email ?? "",
    phone: initialAgent.phone ?? "",
    // support agent fields
    level: initialAgent.level ?? "L1",
    specialization: initialAgent.specialization ?? "",
    availability_status: initialAgent.availability_status ?? "available",
    max_open_calls: initialAgent.max_open_calls ?? "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const agent = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      username: form.id?"":form.username.trim(),
      max_open_calls: form.max_open_calls === "" ? null : Number(form.max_open_calls),
    };
    if (!agent.first_name) return; // minimal required
     if (!form.id && (!agent.username || !agent.email)) return; // minimal required for new agent

    setSubmiting(true);
    const ok = await onSubmitForm?.(agent);
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

        {/* ----- support agent fields ----- */}
        {/* <div className="col-12 col-md-6">
          <label className="form-label">{t("supportagent.level")}</label>
          <select className="form-select" name="level" value={form.level} onChange={handleChange}>
            {LEVELS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div> */}
        <div className="col-12 col-md-6">
          <label className="form-label">{t("supportagent.specialization")}</label>
          <input className="form-control" name="specialization" value={form.specialization} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("employee.availability")}</label>
          <select className="form-select" name="availability_status" value={form.availability_status} onChange={handleChange}>
            {AVAILABILITY.map((v) => <option key={v} value={v}>{t(`avail.${v}`)}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">{t("supportagent.max_open_calls")}</label>
          <input type="number" min="0"  className="form-control" name="max_open_calls" value={form.max_open_calls} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">{t("user.activity")}</label>
          <select className="form-select" name="is_active" value={form.is_active} onChange={handleChange} disabled={disableEdit}>
            <option value={1}>{t("user.active")}</option>
            <option value={0}>{t("user.inactive")}</option>
          </select>
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
