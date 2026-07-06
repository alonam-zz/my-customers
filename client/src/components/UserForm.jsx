import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { EMPLOYEE_ROLES } from "../utils/constants.js";

/**
 * Props:
 *  - initialUser?: row from /api/employees
 *  - onSubmitForm: (user) => boolean
 *  - onCloseForm: () => void
 *
 * Same shape as TechnicianForm, but only the employee/user fields and no password.
 */
export default function UserForm({ initialUser = {}, onSubmitForm, onCloseForm ,disableEdit}) {
  const { t } = useI18n();

  const [form, setForm] = useState({
    id: initialUser.id ?? "",
    first_name: initialUser.first_name ?? "",
    last_name: initialUser.last_name ?? "",
    email: initialUser.email ?? "",
    username: initialUser.username ?? "",
    phone: initialUser.phone ?? "",
    role: initialUser.role ?? "support",
    is_active: initialUser.is_active ?? 1,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      username: form.username.trim(),
      is_active: Number(form.is_active) ? 1 : 0,
    };
    if (!user.first_name) return; // minimal required
    const ok = await onSubmitForm?.(user);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  return (
    <form className="container p-3" onSubmit={handleSubmit}>
      <fieldset disabled={disableEdit}>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">{t("user.first_name")} *</label>
          <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} required disabled={disableEdit}/>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("user.last_name")}</label>
          <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} disabled={disableEdit}/>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("user.email")} *</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required disabled={disableEdit}/>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("user.username")} *</label>
          <input className="form-control" name="username" value={form.username} onChange={form.id?{}:handleChange} disabled={(form.id||(!disableEdit))?true:false} required/>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("user.phone")}</label>
          <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} disabled={disableEdit}/>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("user.role")}</label>
          <select className="form-select" name="role" value={form.role} onChange={handleChange} disabled={disableEdit}>
            {EMPLOYEE_ROLES.map((r) => <option key={r} value={r}>{t(`userRole.${r}`)}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">{t("user.activity")}</label>
          <select className="form-select" name="is_active" value={form.is_active} onChange={handleChange} disabled={disableEdit}>
            <option value={1}>{t("user.active")}</option>
            <option value={0}>{t("user.inactive")}</option>
          </select>
        </div>
      </div>

    {disableEdit===false && (
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>{t("common.cancel")}</button>
        <button type="submit" className="btn btn-primary">{t("common.save")}</button>
      </div>
      )
    }
    </fieldset>
    </form>
  );
}
