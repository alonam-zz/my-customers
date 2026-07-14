import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { EMPLOYEE_ROLES } from "../utils/constants.js";
import UserName from "./UserName.jsx";
import Loader from "./Loader.jsx";
import useApi from "../hooks/useApi.js";
import useAuth from "../auth/AuthProvider.jsx";
import { useAlert } from "./ConfirmProvider.jsx";
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
  const send = useApi();
  const alert = useAlert();
  const { isManager } = useAuth(); // isManager === admin || manager
  const [submiting, setSubmiting] = useState(false);
  const [reactivating, setReactivating] = useState(false);

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
    setSubmiting(true);
    const ok = await onSubmitForm?.(user);
    setSubmiting(false);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  const handleReactivate = async () => {
    if (!form.id) return;
    setReactivating(true);
    const { ok } = await send(`/api/employees/reactivate/${form.email}`, { method: "PUT" });
    setReactivating(false);
    if (ok) {
      await alert({
        title: t("user.reactivateSentTitle"),
        message: t("user.reactivateSent"),
        confirmText: t("common.ok"),
      });
    }
  };

  return (
    <form className="container p-3 position-relative" onSubmit={handleSubmit}>
      {(submiting || reactivating) && <Loader />}
      <fieldset disabled={disableEdit || submiting || reactivating} >
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
        <UserName
          value={form.username}
          onChange={form.id?{}:handleChange} 
          disabled={(form.id||(disableEdit))?true:false}
        />
        {/* <div className="col-12 col-md-6">
          <label className="form-label">{t("user.username")} *</label>
          <input className="form-control" name="username" value={form.username}  required/>
        </div> */}
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
      <div className="d-flex justify-content-between align-items-center gap-2 mt-4">
        <div>
          {isManager && form.id && (
            <button type="button" className="btn btn-outline-warning" onClick={handleReactivate} disabled={reactivating}>
              {t("user.reactivate")}
            </button>
          )}
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>{t("common.cancel")}</button>
          <button type="submit" className="btn btn-primary">{t("common.save")}</button>
        </div>
      </div>
      )
    }
    </fieldset>
    </form>
  );
}
