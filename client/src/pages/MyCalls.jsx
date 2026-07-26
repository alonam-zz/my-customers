import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import List from "../components/List.jsx";
import { useI18n } from "../i18n/I18nProvider";
import useAuth from "../auth/AuthProvider.jsx";
import useApi from "../hooks/useApi.js";
import { useServiceCallColumns } from "../utils/listColumns.jsx";

// Shows the service calls assigned to the current user, whether they are a
// support agent or a technician. The logged-in user is an employee, so we filter
// by the employee behind the assigned support-agent / technician record.
function buildMyFilter(user) {
  if (!user) return null;
  if (user.role === "technician") return { technician_employee_id: user.id };
  if (user.role === "support") return { support_agent_employee_id: user.id };
  return null; // other roles have no "my calls"
}

const INITIAL_SORT = { key: "created_at", dir: "desc" };

export default function MyCalls() {
  const { t } = useI18n();
  const { user } = useAuth();
  const send = useApi();
  const navigate = useNavigate();
  const listColumns = useServiceCallColumns();

  const [items, setItems] = useState([]);
  const [pageCount, setPageCount] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMyCalls = useCallback(async (limit = 20, page = 1, sortBy, sortDir) => {
    const filter = buildMyFilter(user);
    if (!filter) { setItems([]); setLoading(false); return; }
    try {
      setLoading(true);
      const qs = new URLSearchParams({ filter: JSON.stringify(filter) });
      if (sortBy) { qs.set("sortBy", sortBy); qs.set("sortDir", sortDir); }
      const { ok, data } = await send(`/api/serviceCalls?limit=${limit}&page=${page}&${qs}`,{method:'GET'});
      
      setItems(Array.isArray(data.items) ? data.items : []);
      setPageCount(data?.pagination?.totalPages);
    } catch (e) {
      console.error("Error fetching my calls:", e);
    } finally {
      setLoading(false);
    }
  }, [send, user]);

  const openCall = useCallback(
    (item) => navigate(`/customers/${item.customer_id}/calls/${item.id}`),
    [navigate]
  );

  // (re)load when the user becomes available
  useEffect(() => { fetchMyCalls(); }, [user?.id, user?.role]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("usermenu.myCalls")}</h1></div>
      </div>
      {loading && <div className="text-center">{t("common.loading")}</div>}
      <List
        elements={items}
        listColumns={listColumns}
        initialSort={INITIAL_SORT}
        updateDataByPage={fetchMyCalls}
        pageCount={pageCount}
        showPagination={true}
        hideActions={1}
        onClickItem={openCall}
      />
    </>
  );
}
