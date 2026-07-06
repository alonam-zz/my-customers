import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import TechnicianForm from "../components/TechnicianForm.jsx";
import useApi from "../hooks/useApi.js";
import { useI18n } from "../i18n/I18nProvider";
import useAuth from "../auth/AuthProvider.jsx";

export default function TechniciansList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [allowEdit, setAllowEdit] = useState(false);
  const {user} = useAuth();

  const fetchTechnicians = async (limit = 20, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/technicians?limit=${limit}&page=${page}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
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
    const url = data.id ? `/api/technicians/${data.id}` : "/api/technicians";
    const method = data.id ? "PUT" : "POST";
    const { ok } = await send(url, { method, body: data });
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
    },
    { key: "phone", label: t("employee.phone"), width: 2 },
    { key: "email", label: t("employee.email") },
    { key: "region", label: t("technician.region"), width: 2 },
    { key: "specialization", label: t("technician.specialization") },
    {
      key: "availability_status", label: t("employee.availability"), width: 1,
      render: (r) => (r.availability_status ? t(`avail.${r.availability_status}`) : ""),
    },
    // { key: "max_daily_visits", label: t("technician.max_daily_visits"), width: 1 },
    {
      key: "is_external", label: t("technician.is_external"), width: 1,
      render: (r) => (r.is_external ? "✓" : ""),
    },
    { key: "vehicle_number", label: t("technician.vehicle_number"), width: 1 },
    // { key: "notes", label: t("technician.notes"), truncate: true },
  ], [t, locale]);

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
        onNew={() => openModal({})}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <TechnicianForm
          initialTechnician={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
