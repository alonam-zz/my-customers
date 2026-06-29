import { useState } from "react";
import { useI18n } from "./i18n/I18nProvider";

/**
 * Props:
 *  - initialProduct?: { id, name, sku, description, price }
 *  - onSubmitForm: (product) => void
 *  - onCloseForm: () => void
 */
export default function ProductForm({ initialProduct = {}, onSubmitForm, onCloseForm }) {
  const { t } = useI18n();

  const [form, setForm] = useState({
    id: initialProduct.id ?? "",
    name: initialProduct.name ?? "",
    sku: initialProduct.sku ?? "",
    description: initialProduct.description ?? "",
    price: initialProduct.price ?? "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = {
      id: form.id,
      name: form.name.trim(),
      sku: form.sku || null,
      description: form.description || null,
      price: form.price === "" ? null : Number(form.price),
    };
    if (!product.name) return; // minimal required
    const ok = await onSubmitForm?.(product);
    if (ok) onCloseForm?.(); // keep the form open if the request failed
  };

  return (
    <form className="container p-3" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">{t("products.name")} *</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("products.sku")}</label>
          <input className="form-control" name="sku" value={form.sku} onChange={handleChange} />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">{t("products.price")}</label>
          <input type="number" step="0.01" className="form-control" name="price" value={form.price} onChange={handleChange} />
        </div>

        <div className="col-12">
          <label className="form-label">{t("products.description")}</label>
          <textarea className="form-control" rows={3} name="description" value={form.description} onChange={handleChange} />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>{t("common.cancel")}</button>
        <button type="reset" className="btn btn-secondary" onClick={() =>
          setForm({ id: form.id, name: "", sku: "", description: "", price: "" })
        }>{t("common.reset")}</button>
        <button type="submit" className="btn btn-primary">{t("common.save")}</button>
      </div>
    </form>
  );
}
