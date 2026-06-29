import { useState } from "react";
import SearchSelect from "./components/SearchSelect.jsx";
import { useI18n } from "./i18n/I18nProvider";

/**
 * Props:
 *  - initialService?: { id, product_id, name, description, price }
 *  - products: [{ id, name }]  (for the searchable select)
 *  - onSubmitForm: (service) => void
 *  - onCloseForm: () => void
 */
export default function ServiceForm({ initialService = {}, products = [], onSubmitForm, onCloseForm }) {
  const { t } = useI18n();

  const [form, setForm] = useState({
    id: initialService.id ?? "",
    product_id: initialService.product_id ?? "",
    name: initialService.name ?? "",
    description: initialService.description ?? "",
    price: initialService.price ?? "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const service = {
      id: form.id,
      product_id: form.product_id ? Number(form.product_id) : null,
      name: form.name.trim(),
      description: form.description || null,
      price: form.price === "" ? null : Number(form.price),
    };
    if (!service.name) return; // minimal required
    const ok = await onSubmitForm?.(service);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  return (
    <form className="container p-3" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">{t("services.product")}</label>
          <SearchSelect
            disabled={form.id?true:false}
            options={products}
            value={form.product_id}
            onChange={(id) => setForm((f) => ({ ...f, product_id: id }))}
            placeholder={t("services.selectProduct")}
            searchPlaceholder={t("services.searchProduct")}
          />
        </div>

        <div className="col-12">
          <label className="form-label">{t("services.name")} *</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("services.price")}</label>
          <input type="number" step="0.01" className="form-control" name="price" value={form.price} onChange={handleChange} />
        </div>

        <div className="col-12">
          <label className="form-label">{t("services.description")}</label>
          <textarea className="form-control" rows={3} name="description" value={form.description} onChange={handleChange} />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>{t("common.cancel")}</button>
        <button type="reset" className="btn btn-secondary" onClick={() =>
          setForm({ id: form.id, product_id: "", name: "", description: "", price: "" })
        }>{t("common.reset")}</button>
        <button type="submit" className="btn btn-primary">{t("common.save")}</button>
      </div>
    </form>
  );
}
