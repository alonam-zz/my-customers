import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import SupportAgentForm from "../components/SupportAgentForm.jsx";
import useApi from "../hooks/useApi.js";
import { useI18n } from "../i18n/I18nProvider";
import { useAlert } from "../components/ConfirmProvider.jsx";
import useAuth from "../auth/AuthProvider.jsx";

export default function SupportAgentsList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});
  const {user} = useAuth();

  alert = useAlert();

  const fetchAgents = async (limit = 20, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/supportAgents?limit=${limit}&page=${page}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
    } catch (e) {
      console.error("Error fetching support agents:", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = {}) => { setEditItem(item); setOpen(true); };

  // create also creates the employee (handled server-side in one call).
  // returns true on success so the form knows whether to close.
  const handleSubmit = async (data) => {
    if (data.max_open_calls>100){
      await alert({
          title: t("common.errorTitle"),
          message: t("messages.maxOpenAbove100") ,
          confirmText: t("common.ok"),
          variant: "danger",
        });
      return;
    }
    const url = data.id ? `/api/supportAgents/${data.id}` : "/api/supportAgents";
    const method = data.id ? "PUT" : "POST";
    const { ok } = await send(url, { method, body: data });
    if (ok) {
      fetchAgents(); // refresh (joined employee fields)
      if (data.id) toast.success(t("supportagent.updatedSuccess")); 
      else toast.success(t("supportagent.addedSuccess")); 
    }
    return ok;
  };

  // columns = table columns minus employee_id, with the employee name instead
  const listColumns = useMemo(() => [
    {
      key: "name", label: t("employee.name"),
      render: (r) => [r.first_name, r.last_name].filter(Boolean).join(" "),
    },
    { key: "email", label: t("employee.email") },
    { key: "phone", label: t("employee.phone"), width: 2 },
    { key: "level", label: t("supportagent.level"), width: 1 },
    { key: "specialization", label: t("supportagent.specialization") },
    {
      key: "availability_status", label: t("employee.availability"), width: 2,
      render: (r) => (r.availability_status ? t(`avail.${r.availability_status}`) : ""),
    },
    { key: "max_open_calls", label: t("supportagent.max_open_calls"), width: 2 },
  ], [t, locale]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("supportagent.title")}</h1></div>
      </div>
      {loading && <div className="text-center">{t("common.loading")}</div>}
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={{ key: "name", dir: "asc" }}
        updateDataByPage={fetchAgents}
        pageCount={pageCount}
        hideActions={1}
        onNew={() => openModal({})}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <SupportAgentForm
          initialAgent={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
