import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";

const AVAILABILITY = ["available", "busy", "away", "inactive"];
const LEVELS = ["L1", "L2", "L3"];

/**
 * Props:
 *  - initialAgent?: row from /api/supportAgents (includes employee fields via JOIN)
 *  - onSubmitForm: (agent) => void
 *  - onCloseForm: () => void
 *
 * NOTE: the DB column is spelled `availability_status` (per the support_agents table).
 */
export default function SupportAgentForm({ initialAgent = {}, onSubmitForm, onCloseForm }) {
  const { t } = useI18n();

  const [form, setForm] = useState({
    id: initialAgent.id ?? "",
    employee_id: initialAgent.employee_id ?? "",
    // employee contact fields
    first_name: initialAgent.first_name ?? "",
    last_name: initialAgent.last_name ?? "",
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
      max_open_calls: form.max_open_calls === "" ? null : Number(form.max_open_calls),
    };
    if (!agent.first_name) return; // minimal required
    const ok = await onSubmitForm?.(agent);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  return (
    <form className="container p-3" onSubmit={handleSubmit}>
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
          <label className="form-label">{t("employee.email")}</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
        </div>
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
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>{t("common.cancel")}</button>
        <button type="submit" className="btn btn-primary">{t("common.save")}</button>
      </div>
    </form>
  );
}
