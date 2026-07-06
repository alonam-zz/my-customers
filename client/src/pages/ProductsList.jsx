import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import ProductForm from "../components/ProductForm.jsx";
import useApi from "../hooks/useApi.js";
import { useAddLog } from "../utils/logs.js";
import { useI18n } from "../i18n/I18nProvider";

export default function ProductsList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const addLog = useAddLog();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});

  const fetchProducts = async (limit = 20, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?limit=${limit}&page=${page}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = {}) => { setEditItem(item); setOpen(true); };

  // returns true on success so the form knows whether to close.
  const handleSubmit = async (data) => {
    if (data.id) {
      const { ok, data: updated } = await send(`/api/products/${data.id}`, { method: "PUT", body: data });
      if (ok) {
          setItems((prev) => prev.map((p) => (p.id === (updated?.id ?? data.id) ? (updated ?? data) : p)));
          toast.success(t("products.updatedSuccess"));
      }
          return ok;
    }
    const { ok, data: created } = await send("/api/products", { method: "POST", body: data });
    if (ok && created) {
      setItems((prev) => [...prev, created]);
      toast.success(t("products.addedSuccess"));
      addLog("products", t("logs.productAdded", { name: created.name ?? data.name }));
    }
    return ok;
  };

  const listColumns = useMemo(() => [
    { key: "name", label: t("products.name") },
    { key: "sku", label: t("products.sku"), width: 2 },
    { key: "description", label: t("products.description"), truncate: true },
    { key: "price", label: t("products.price"), width: 2 },
  ], [t, locale]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("products.title")}</h1></div>
      </div>
      {loading && <div className="text-center">{t("common.loading")}</div>}
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={{ key: "name", dir: "asc" }}
        updateDataByPage={fetchProducts}
        pageCount={pageCount}
        hideActions={1}
        onNew={() => openModal({})}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <ProductForm
          initialProduct={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
