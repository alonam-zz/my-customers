import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import TechnicianForm from "../components/TechnicianForm.jsx";
import useApi from "../hooks/useApi.js";
import { PAGE_SIZE,EMAIL_RE,AVAILABILITY } from "../utils/constants.js";
import { useI18n } from "../i18n/I18nProvider";
import useAuth from "../auth/AuthProvider.jsx";
import { useAlert } from "../components/ConfirmProvider.jsx";


export default function TechniciansList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [areas, setAreas] = useState([]);
  const {user,authDisableEdit} = useAuth();

  const alert = useAlert();

  // load the areas once for the form's region <Select> (grouped options)
  useEffect(() => {
    async function loadAreas() {
      try {
        const { ok, data } = await send("/api/areas");
        if (!ok) return;
        setAreas(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        console.error("Error fetching areas:", e);
      }
    }
    loadAreas();
  }, []);

  // area code -> display name (flatten groups + leaves), for the list's region column
  const areaNameByCode = useMemo(() => {
    const map = {};
    const walk = (arr) => arr.forEach((a) => {
      map[a.id] = a.name;
      if (Array.isArray(a.children)) walk(a.children);
    });
    walk(areas);
    return map;
  }, [areas]);

  const fetchTechnicians = async (limit = 20, page = 1, sortBy, sortDir, filter) => {
    try {
      setLoading(true);
      const { ok, data } = await send(`/api/technicians?limit=${limit}&page=${page}${sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : ""}${filter && Object.keys(filter).length ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}`);
      if (!ok) return;
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
      setPageLimit(data?.pagination?.limit ?? PAGE_SIZE);
    } catch (e) {
      console.error("Error fetching technicians:", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = {}) => { setEditItem(item); setOpen(true); };

  // create also creates the employee (handled server-side in one call).
  // returns true on success so the form knows whether to close.
  const handleSubmit = async (data) => {
    if (data.email.trim() && !EMAIL_RE.test(data.email.trim())) {
      await alert({
          title: t("common.errorTitle"),
          message: t("messages.errEmail") ,
          confirmText: t("common.ok"),
          variant: "danger",
        });
      return;
    }
    const url = data.id ? `/api/technicians/${data.id}` : "/api/employees";
    const method = data.id ? "PUT" : "POST";
    const { ok } = await send(url, { method, body:  {...data,role:'technician'}  });
    if (ok) {
      fetchTechnicians(); // refresh (joined employee fields)
      if (data.id) toast.success(t("technician.updatedSuccess")); 
      else toast.success(t("technician.addedSuccess")); 
    }
    return ok;
  };

  // columns = table columns minus employee_id, with the employee name instead
  const listColumns = useMemo(() => [
    {
      key: "name", label: t("employee.name"),
      render: (r) => [r.first_name, r.last_name].filter(Boolean).join(" "),
      filter: true,
    },
    { key: "phone", label: t("employee.phone"), width: 2, filter: true },
    { key: "email", label: t("employee.email"), filter: true },
    { key: "region", label: t("technician.region"), width: 2,
      render: (r) => (areaNameByCode[r.region] || r.region), filter: true },
    { key: "specialization", label: t("technician.specialization"), filter: true },
    {
      key: "availability_status", label: t("employee.availability"), width: 1,
      render: (r) => (r.availability_status ? t(`avail.${r.availability_status}`) : ""),
      filter: { type: "select", options: AVAILABILITY.map((v) => ({ value: v, label: t(`avail.${v}`) })) },
    },
    // { key: "max_daily_visits", label: t("technician.max_daily_visits"), width: 1 },
    {
      key: "is_external", label: t("technician.is_external"), width: 1,
      render: (r) => (r.is_external ? "✓" : ""),
      filter: { type: "select", options: [{ value: "1", label: "✓" }, { value: "0", label: "—" }] },
    },
    { key: "vehicle_number", label: t("technician.vehicle_number"), width: 1 },
    // { key: "notes", label: t("technician.notes"), truncate: true },
  ], [t, locale, areaNameByCode]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("technician.title")}</h1></div>
      </div>
      {loading && <div className="text-center">{t("common.loading")}</div>}
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={{ key: "name", dir: "asc" }}
        updateDataByPage={fetchTechnicians}
        pageCount={pageCount}
        hideActions={1}
        onNew={!authDisableEdit?() => openModal({}):""}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <TechnicianForm
          initialTechnician={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
          disableEdit={authDisableEdit}
          areas={areas}
        />
      </Modal>
    </>
  );
}
