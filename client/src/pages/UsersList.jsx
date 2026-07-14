import { useMemo, useState ,useEffect} from "react";
import toast from "react-hot-toast";
import List from "../components/List.jsx";
import Modal from "../components/Modal.jsx";
import UserForm from "../components/UserForm.jsx";
import useApi from "../hooks/useApi.js";
import { PAGE_SIZE, EMPLOYEE_ROLES } from "../utils/constants.js";
import { useAddLog } from "../utils/logs.js";
import { useI18n } from "../i18n/I18nProvider";
import useAuth from "../auth/AuthProvider.jsx";

export default function UsersList() {
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


  const fetchUsers = async (limit = 20, page = 1, sortBy, sortDir, filter) => {
    try {
      setLoading(true);
      const { ok, data } = await send(`/api/employees?limit=${limit}&page=${page}${sortBy ? `&sortBy=${sortBy}&sortDir=${sortDir}` : ""}${filter && Object.keys(filter).length ? `&filter=${encodeURIComponent(JSON.stringify(filter))}` : ""}`);
      if (!ok) return;
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
      setPageLimit(data?.pagination?.limit ?? PAGE_SIZE);
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
    if (ok) {
      fetchUsers();
      if (data.id) toast.success(t("user.updatedSuccess"));
      else {
        toast.success(t("user.addedSuccess"));
        addLog("employees", t("logs.userAdded", { name: [data.first_name, data.last_name].filter(Boolean).join(" ") }));
      }
    }
    return ok;
  };

  const listColumns = useMemo(() => [
    { key: "first_name", label: t("user.first_name"), filter: true },
    { key: "last_name", label: t("user.last_name"), filter: true },
    { key: "email", label: t("user.email"), filter: true },
    { key: "username", label: t("user.username"), width: 2, filter: true },
    { key: "phone", label: t("user.phone"), width: 2, filter: true },
    {
      key: "role", label: t("user.role"), width: 2,
      render: (r) => (r.role ? t(`userRole.${r.role}`) : ""),
      filter: { type: "select", options: EMPLOYEE_ROLES.map((r) => ({ value: r, label: t(`userRole.${r}`) })) },
    },
    {
      key: "is_active", label: t("user.activity"), width: 1,
      render: (r) => (r.is_active ? t("user.active") : t("user.inactive")),
      filter: { type: "select", options: [{ value: "1", label: t("user.active") }, { value: "0", label: t("user.inactive") }] },
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
        onNew={!authDisableEdit?() => openModal({}):null}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <UserForm
          initialUser={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
          disableEdit={authDisableEdit}
        />
      </Modal>
    </>
  );
}
