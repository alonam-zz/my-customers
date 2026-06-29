import { useMemo, useState } from "react";
import List from "./List.jsx";
import Modal from "./Modal.jsx";
import UserForm from "./UserForm.jsx";
import useApi from "./hooks/useApi.js";
import { useI18n } from "./i18n/I18nProvider";

export default function UsersList() {
  const { t, locale } = useI18n();
  const send = useApi();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});

  const fetchUsers = async (limit = 20, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/employees?limit=${limit}&page=${page}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = {}) => { setEditItem(item); setOpen(true); };

  // create/update both go through /api/employees
  // returns true on success so the form knows whether to close.
  const handleSubmit = async (data) => {
    const url = data.id ? `/api/employees/${data.id}` : "/api/employees";
    const method = data.id ? "PUT" : "POST";
    const { ok } = await send(url, { method, body: data });
    if (ok) fetchUsers();
    return ok;
  };

  const listColumns = useMemo(() => [
    { key: "first_name", label: t("user.first_name") },
    { key: "last_name", label: t("user.last_name") },
    { key: "email", label: t("user.email") },
    { key: "username", label: t("user.username"), width: 2 },
    { key: "phone", label: t("user.phone"), width: 2 },
    {
      key: "role", label: t("user.role"), width: 2,
      render: (r) => (r.role ? t(`userRole.${r.role}`) : ""),
    },
    {
      key: "is_active", label: t("user.activity"), width: 1,
      render: (r) => (r.is_active ? t("user.active") : t("user.inactive")),
    },
  ], [t, locale]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("user.title")}</h1></div>
      </div>
      {loading && <div className="text-center">{t("common.loading")}</div>}
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={{ key: "first_name", dir: "asc" }}
        updateDataByPage={fetchUsers}
        pageCount={pageCount}
        hideActions={1}
        onNew={() => openModal({})}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <UserForm
          initialUser={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
