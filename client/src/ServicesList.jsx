import { useEffect, useMemo, useState } from "react";
import List from "./List.jsx";
import Modal from "./Modal.jsx";
import ServiceForm from "./ServiceForm.jsx";
import useApi from "./hooks/useApi.js";
import { useI18n } from "./i18n/I18nProvider";

export default function ServicesList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});

  const fetchServices = async (limit = 20, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/services?limit=${limit}&page=${page}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
    } catch (e) {
      console.error("Error fetching services:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // high limit: the dropdown needs every product, not just one page
      const res = await fetch("/api/products?all=1");
      const data = await res.json();
      setProducts(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  // the services list is paginated by DataTable; products are only needed
  // (in full) to populate the form's product dropdown.
  useEffect(() => { fetchProducts(); }, []);

  const openModal = (item = {}) => { setEditItem(item); setOpen(true); };

  // returns true on success so the form knows whether to close.
  const handleSubmit = async (data) => {
    if (data.id) {
      const { ok, data: updated } = await send(`/api/services/${data.id}`, { method: "PUT", body: data });
      if (ok) setItems((prev) => prev.map((s) => (s.id === (updated?.id ?? data.id) ? (updated ?? data) : s)));
      return ok;
    }
    const { ok, data: created } = await send("/api/services", { method: "POST", body: data });
    if (ok && created) setItems((prev) => [...prev, created]);
    return ok;
  };

  const listColumns = useMemo(() => [
    { key: "name", label: t("services.name") },
    { key: "description", label: t("services.description"), truncate: true },
    { key: "price", label: t("services.price"), width: 2 },
  ], [t, locale]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("services.title")}</h1></div>
      </div>
      {loading && <div className="text-center">{t("common.loading")}</div>}
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={{ key: "name", dir: "asc" }}
        updateDataByPage={fetchServices}
        pageCount={pageCount}
        hideActions={1}
        onNew={() => openModal({})}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <ServiceForm
          initialService={editItem}
          products={products}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
