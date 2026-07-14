import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import ServiceForm from "../components/ServiceForm.jsx";
import useApi from "../hooks/useApi.js";
import { PAGE_SIZE } from "../utils/constants.js";
import { useAddLog } from "../utils/logs.js";
import { useI18n } from "../i18n/I18nProvider";
import useAuth from "../auth/AuthProvider.jsx";

export default function ServicesList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const addLog = useAddLog();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});

  const {user,authDisableEdit} = useAuth();

  const fetchServices = async (limit = 20, page = 1, sortBy, sortDir, filter) => {
    try {
      setLoading(true);
      const { ok, data } = await send(`/api/services?limit=${limit}&page=${page}${sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : ""}${filter && Object.keys(filter).length ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}`);
      if (!ok) return;
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
      setPageLimit(data?.pagination?.limit ?? PAGE_SIZE);
    } catch (e) {
      console.error("Error fetching services:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // high limit: the dropdown needs every product, not just one page
      const { ok, data } = await send("/api/products?all=1");
      if (!ok) return;
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
      if (ok) {
        setItems((prev) => prev.map((s) => (s.id === (updated?.id ?? data.id) ? (updated ?? data) : s)));
        toast.success(t("services.updateSuccess"));
      }
      return ok;
    }
    const { ok, data: created } = await send("/api/services", { method: "POST", body: data });
    if (ok && created) {
      fetchServices();
      toast.success(t("services.addedSuccess"));
      addLog("services", t("logs.serviceAdded", { name: created.name ?? data.name }));
    }
    return ok;
  };

  const listColumns = useMemo(() => [
    { key: "name", label: t("services.name"), filter: true },
    { key: "description", label: t("services.description"), truncate: true, filter: true },
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
        onNew={!authDisableEdit?() => openModal({}):""}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <ServiceForm
          initialService={editItem}
          products={products}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
          disableEdit={authDisableEdit}
        />
      </Modal>
    </>
  );
}
