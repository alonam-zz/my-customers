import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import Modal from '../components/Modal.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomerForm from "../components/CustomerForm.jsx";
import CallForm from "../components/CallForm.jsx";
import List from "../components/List.jsx";
import SearchSelect from "../components/SearchSelect.jsx";
import { useBreadcrumbs } from "../components/BreadcrumbContext.jsx";
import { useConfirm } from "../components/ConfirmProvider.jsx";
import useApi from "../hooks/useApi.js";
import { useAddLog } from "../utils/logs.js";
import { useI18n } from "../i18n/I18nProvider";
import { formatDateTime } from "../utils/date.js";
import {STATUS_BADGE,PRIORITY_BADGE,PAGE_SIZE,EMAIL_RE,CALL_STATUSES,CALL_PRIORITIES} from "../utils/constants.js"
import useAuth from "../auth/AuthProvider.jsx";
import { useAlert } from "../components/ConfirmProvider.jsx";


export default function CustomerPage({ customerId,initialTab = "details" }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { setLabel } = useBreadcrumbs();
  const send = useApi();
  const confirm = useConfirm();
  const addLog = useAddLog();
  // const initialTab = propTypes.initialTab;

  const {user} = useAuth();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [calls, setCalls] = useState([]);
  const [callPageCount, setCallsPageCount] = useState("");
  const [callsLimit, setCallsLimit] = useState(PAGE_SIZE);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [productsPageCount, setProductsPageCount] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [supportAgents, setSupportAgents] = useState([]);
  const [areas, setAreas] = useState([]);
  const [openCallModal, setOpenCallModal] = useState(false);
  const [openedCallItem,setOpenedCallItem] = useState({customer_id:customerId})

  const alert = useAlert();

  // load the grouped areas once for the customer form's region <Select>
  useEffect(() => {
    (async () => {
      const { ok, data } = await send("/api/areas");
      if (ok) setAreas(Array.isArray(data.items) ? data.items : []);
    })();
  }, []);
  
  // ----- load the customer (GET /api/customers/:id) -----
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { ok, data } = await send(`/api/customers/${customerId}`);
        if (!ok) return;
        if (!cancelled) setCustomer(data[0]);
      } catch (e) {
        console.error("Error loading customer:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [customerId]);

  // show the customer name (not the id) in the breadcrumbs
  useEffect(() => {
    if (customer?.name) setLabel(`/customers/${customerId}`, customer.name);
  }, [customer, customerId, setLabel]);

  // ----- load this customer's calls (GET — server side added later) -----
  const fetchCalls = async (limit = 20, page = 1, sortBy, sortDir, filter) => {
    try {
      const { ok, data } = await send(`/api/serviceCalls/${customerId}/calls?limit=${limit}&page=${page}${sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : ""}${filter && Object.keys(filter).length ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}`);
      if (!ok) return;
      setCalls(Array.isArray(data.items) ? data.items : []);
      setCallsPageCount(data?.pagination.totalPages);
      setCallsLimit(data?.pagination?.limit ?? PAGE_SIZE);
    } catch (e) {
      console.error("Error loading calls:", e);
      setCalls([]);
    }
  };


  // ----- load technicians + support agents for the CallForm dropdowns -----
  // mapped to { id, name } since SearchSelect expects a name field.
  

  // open the CallForm modal seeded with the clicked call (or a fresh one for "new")
  const onOpenCallListItem = async (item) => {
    if (!customerProducts.length) await fetchCustomerProducts();
    setOpenedCallItem(item);
    setOpenCallModal(true);
  }

  const onDeleteCallListItem = async (item) => {
    const ok = await confirm({
      title: t("servicecall.deleteTitle"),
      message: t("common.deleteWarning"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      variant: "danger",
    });
    if (!ok) return;
    const { ok: deleted } = await send(`/api/serviceCalls/${item.id}`, { method: 'DELETE' });
    if (deleted) setCalls((prev) => prev.filter((c) => c.id !== item.id));
  }

  const handleCallSubmit = async (data,showToast = true) => {
    if (data.id) {
      const { ok, data: updated } = await send(`/api/serviceCalls/${data.id}`, { method: 'PUT', body: data });
      if (ok) {
        setCalls((prev) => prev.map((c) => (c.id === (updated?.id ?? data.id) ? (updated ?? data) : c)));
        if (showToast) toast.success(t("servicecall.updatedSuccess")); 
      }
      return ok;
    }
    const { ok, data: created } = await send('/api/serviceCalls', { method: 'POST', body: data });
    if (ok && created) {
      fetchCalls();
      toast.success(t("servicecall.addedSuccess"));
      addLog("service_calls", t("logs.callAdded", { name: created.title ?? data.title }));
    }
    return ok;
  }


  // ----- load this customer's products + the full catalog (for the add box) -----
  const fetchCustomerProducts = async (limit = 20, page = 1, sortBy, sortDir) => {
    try {
      const [cpRes, pRes] = await Promise.all([
        fetch(`/api/customers/${customerId}/products?limit=${limit}&page=${page}${sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : ""}`),
        fetch(`/api/products?all=1`),
      ]);
      const cp = await cpRes.json();
      const all = await pRes.json();
      setCustomerProducts(Array.isArray(cp.items) ? cp.items : []);
      setProductsPageCount(cp?.pagination.totalPages);
      setAllProducts(Array.isArray(all.items) ? all.items : []);
    } catch (e) {
      console.error("Error loading customer products:", e);
      setCustomerProducts([]);
    }
  };

  // ----- add a product to this customer (POST /api/customer-products) -----
  const handleAddProduct = async (productId) => {
    if (!productId) return;
    const { ok } = await send(`/api/customers/${customerId}/add-product`, {
      method: "POST",
      body: {productId: Number(productId) },
    });
    if (ok) fetchCustomerProducts(); // refresh the table
  };

  // ----- save (PUT /api/customers/:id) -----
  // returns true on success so the form knows whether to close.
  const handleSave = async (data) => {
    if (data.email.trim() && !EMAIL_RE.test(data.email.trim())) {
      await alert({
          title: t("common.errorTitle"),
          message: t("messages.errEmail") ,
          confirmText: t("common.ok"),
          variant: "danger",
        });
      return;

    }
    const { ok, data: updated } = await send(`/api/customers/${data.id}`, { method: "PUT", body: data });
    if (ok && updated) {
      setCustomer(updated);
      toast.success(t("customer.updatedSuccess")); 
    }
    return ok;
  };

  // columns for the calls list
  const callColumns = useMemo(
    () => [
      {
        key: "id", label: t("servicecall.id"), width: 1,hide:true,
        render: (r) => (
          <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/customers/${customerId}/calls/${r.id}`)}>
            #{r.id}
          </button>
        ),
      },
      {
        key: "token", label: t("servicecall.token"), width: 1, filter: true,
        render: (r) => (
          <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => navigate(`/customers/${customerId}/calls/${r.id}`)}>
            {r.token}
          </button>
        ),
      },
      {
        key: "created_at", label: t("servicecall.openedAt"), width: 2,
        render: (r) => formatDateTime(r.created_at),
        filter: { type: "date"}
      },
      { key: "title", label: t("servicecall.callTitle") ,truncate:1, filter: true},
      {
        key: "status",
        label: t("servicecall.status"),
        width: 2,
        filter: { type: "select", options: CALL_STATUSES.map((s) => ({ value: s, label: t(`callStatus.${s}`) })) },
        render: (r) => (
          <span className={`badge ${STATUS_BADGE[r.status] || "text-bg-secondary"}`}>
            {t(`callStatus.${r.status}`)}
          </span>
        ),
      },
      {
        key: "priority",
        label: t("servicecall.priority"),
        width: 1,
        filter: { type: "select", options: CALL_PRIORITIES.map((v) => ({ value: v, label: t(`callPriority.${v}`) })) },
        render: (r) => (
          <span className={`badge ${PRIORITY_BADGE[r.priority] || "text-bg-secondary"}`}>
            {t(`callPriority.${r.priority}`)}
          </span>
        ),
      },

      {
        key: "support_agent_name",
        label: t("servicecall.responsible"),
        width: 2,
        truncate:1,
        filter: true,
      },
      {
        key: "technician_name",
        label: t("servicecall.technician_name"),
        width: 2,
        truncate:1,
        filter: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale]
  );

  // columns for the customer products list
  const productColumns = useMemo(
    () => [
      { key: "product_id", label: t("products.id"), width: 1 },
      { key: "product_name", label: t("products.name") },
      { key: "description", label: t("products.description"), truncate: true },
      { key: "sku", label: t("products.sku"), width: 2 },
      { key: "price", label: t("products.price"), width: 2 },
    ],
    [t]
  );

  if (loading) return <div className="text-center p-4">{t("common.loading")}</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex mb-3">
        <h1 className="flex-grow-1">{customer?.name || t("customer.title")}</h1>
        <button
            className="align-items-center btn btn-primary d-flex float-start gap-2"
            onClick={()=>onOpenCallListItem({ customer_id: customerId })}
          >
            <FontAwesomeIcon icon={['fas', 'plus']} className="icon-inherit-size" />
            {t("servicecall.openNewCAll")}
          </button>
      </div>
      

      <Tabs
        defaultActiveKey={initialTab?initialTab:"details"}
        className="mb-3"
      >
        {/* ---- tab 1: details ---- */}
        <Tab eventKey="details" title={t("customer.tabDetails")}>
          <CustomerForm
            initialCustomer={customer || {}}
            areas={areas}
            onSubmitForm={handleSave}
          />
        </Tab>

        {/* ---- tab 2: calls ---- */}
        <Tab eventKey="calls" title={t("customer.tabCalls")}>
          <List
            elements={calls}
            listColumns={callColumns}
            initialSort={{ key: "created_at", dir: "asc" }}
            updateDataByPage={fetchCalls}
            pageCount={callPageCount}
            newLabel ={t("servicecall.openNewCAll")}
            // onNew={() => onOpenCallListItem({ customer_id: customerId })}
            onOpenItem={(item) => onOpenCallListItem(item)}
            onDeleteItem={(item) => onDeleteCallListItem(item)}
            allowDelete = {false}
          />
            <Modal open={openCallModal} onClose={() => setOpenCallModal(false)} modalchildren>
              <CallForm initialCall={openedCallItem} customerProducts={customerProducts}
              onSubmitForm = {handleCallSubmit}
              supportAgents = {supportAgents}
              technicians = {technicians}
              disabled={user.role=="technician" || openedCallItem.status=='closed'}
              onCloseForm = {()=>setOpenCallModal(false)}/>
            </Modal>
        </Tab>

        {/* ---- tab 3: customer products ---- */}
        <Tab eventKey="products" title={t("customer.tabProducts")}>
          {/* inline add bar — pick a product from the catalog the customer
              doesn't already have; it's added instantly (no modal) */}
          <div className="mb-3" style={{ maxWidth: 360 }}>
            {/* <label className="form-label">{t("products.add")}</label> */}
            <SearchSelect
              options={allProducts.filter(
                (p) => !customerProducts.some((cp) => cp.product_id === p.id)
              )}
              value=""
              onChange={handleAddProduct}
              placeholder={t("products.add")}
              searchPlaceholder={t("products.searchToAdd")}
            />
          </div>
          <List
            elements={customerProducts}
            listColumns={productColumns}
            initialSort={{ key: "product_name", dir: "asc" }}
            updateDataByPage={fetchCustomerProducts}
            pageCount={productsPageCount}
            hideActions={1}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
