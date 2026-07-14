import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import ProductForm from "../components/ProductForm.jsx";
import useApi from "../hooks/useApi.js";
import { PAGE_SIZE } from "../utils/constants.js";
import { useAddLog } from "../utils/logs.js";
import { useI18n } from "../i18n/I18nProvider";
import useAuth from "../auth/AuthProvider.jsx";

export default function ProductsList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const addLog = useAddLog();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});

  const {user,authDisableEdit} = useAuth();

  const fetchProducts = async (limit = 20, page = 1, sortBy, sortDir, filter) => {
    try {
      setLoading(true);
      const filterParam = filter && Object.keys(filter).length ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : "";
      const { ok, data } = await send(`/api/products?limit=${limit}&page=${page}${sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : ""}${filterParam}`);
      if (!ok) return;
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
      setPageLimit(data?.pagination?.limit ?? PAGE_SIZE);
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
      fetchProducts();
      toast.success(t("products.addedSuccess"));
      addLog("products", t("logs.productAdded", { name: created.name ?? data.name }));
    }
    return ok;
  };

  const listColumns = useMemo(() => [
    { key: "name", label: t("products.name"), filter: true },
    { key: "sku", label: t("products.sku"), width: 2, filter: true },
    { key: "description", label: t("products.description"), truncate: true, filter: true },
    { key: "price", label: t("products.price"), width: 2 ,filter: true},
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
        onNew={!authDisableEdit?() => openModal({}):""}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <ProductForm
          initialProduct={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
          disableEdit={authDisableEdit}
        />
      </Modal>
    </>
  );
}
