import { useMemo, useState } from "react";
import List from "./List.jsx";
import { useI18n } from "./i18n/I18nProvider";

export default function EmployeesList() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async (limit = 20, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/employees?limit=${limit}&page=${page}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination.totalPages);
    } catch (e) {
      console.error("Error fetching employees:", e);
    } finally {
      setLoading(false);
    }
  };

  const listColumns = useMemo(() => [
    { key: "first_name", label: t("employee.first_name") },
    { key: "last_name", label: t("employee.last_name") },
    { key: "email", label: t("employee.email") },
    { key: "phone", label: t("employee.phone"), width: 2 },
    { key: "role", label: t("employee.role"), width: 2 },
    {
      key: "is_active", label: t("employee.is_active"), width: 1,
      render: (r) => (r.is_active ? "✓" : ""),
    },
  ], [t, locale]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("employee.title")}</h1></div>
      </div>
      {loading && <div className="text-center">{t("common.loading")}</div>}
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={{ key: "first_name", dir: "asc" }}
        updateDataByPage={fetchEmployees}
        pageCount={pageCount}
        hideActions={1}
      />
    </>
  );
}
