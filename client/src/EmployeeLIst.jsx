import { useEffect, useMemo, useState } from "react";
import List from "./List.jsx";
import Modal from "./Modal.jsx";
// import EmployeeForm from "./EmployeeForm.jsx";
import { useI18n } from "./i18n/I18nProvider.jsx";

export default function EmployeesList() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState({});

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/Employees");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching Employees:", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = {}) => { setEditItem(item); setOpen(true); };

  const handleSubmit = async (data) => {
    try {
      if (data.id) {
        const res = await fetch(`/api/Employees/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }
      } else {
        const res = await fetch("/api/Employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) => [...prev, created]);
        }
      }
    } catch (e) {
      console.error("Error saving Employee:", e);
    }
  };

  const listColumns = useMemo(() => [
    { key: "name", label: t("Employees.name") },
    { key: "sku", label: t("Employees.sku"), width: 2 },
    { key: "description", label: t("Employees.description"), truncate: true },
    { key: "price", label: t("Employees.price"), width: 2 },
  ], [t, locale]);

  if (loading) return <div className="text-center">{t("common.loading")}</div>;

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("Employees.title")}</h1></div>
      </div>
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={{ key: "name", dir: "asc" }}
        hideActions={1}
        onNew={() => openModal({})}
        onClickItem={(item) => openModal(item)}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <EmployeeForm
          initialEmployee={editItem}
          onSubmitForm={handleSubmit}
          onCloseForm={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
