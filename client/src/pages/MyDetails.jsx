import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../i18n/I18nProvider";
import useApi from "../hooks/useApi.js";
import useAuth from "../auth/AuthProvider.jsx";
import TechnicianForm from "../components/TechnicianForm.jsx";
import SupportAgentForm from "../components/SupportAgentForm.jsx";

/**
 * /my/details — lets the logged-in user view and update their own record.
 * Technicians edit a TechnicianForm; everyone else (support / manager / admin)
 * edits a SupportAgentForm. The record is fetched from the role-specific
 * `/me` endpoint, so the user only ever loads their own row.
 */
export default function MyDetails() {
  const { t } = useI18n();
  const send = useApi();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isTechnician = user?.role === "technician";

  const [record, setRecord] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const url = isTechnician ? "/api/technicians/me" : "/api/supportAgents/me";
      const { ok, data } = await send(url);
      if (!cancelled && ok) setRecord(data ?? null);
      if (!cancelled) setLoading(false);
    }
    async function loadAreas() {
      const { ok, data } = await send("/api/areas");
      if (!cancelled && ok) setAreas(Array.isArray(data.items) ? data.items : []);
    }
    load();
    if (isTechnician) loadAreas();
    return () => { cancelled = true; };
  }, [isTechnician]);

  // returns true on success so the form knows whether to close.
  const handleSubmit = async (data) => {
    const url = isTechnician ? `/api/technicians/${data.id}` : `/api/supportAgents/${data.id}`;
    const body = { ...data, role: isTechnician ? "technician" : "support" };
    const { ok } = await send(url, { method: "PUT", body });
    if (ok) toast.success(t( "user.yourDetailsUpdated"));
    return ok;
  };

  if (loading) return <div className="text-center p-4">{t("common.loading")}</div>;
  if (!record) return <div className="text-center p-4">{t("myDetails.noRecord")}</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="row mb-3">
        <div className="col-12"><h1>{t("myDetails.title")}</h1></div>
      </div>
      {isTechnician ? (
        <TechnicianForm
          initialTechnician={record}
          areas={areas}
          onSubmitForm={handleSubmit}
          onCloseForm={() => navigate("/")}
          disableEdit={false}
        />
      ) : (
        <SupportAgentForm
          initialAgent={record}
          onSubmitForm={handleSubmit}
          onCloseForm={() => navigate("/")}
          disableEdit={false}
        />
      )}
    </div>
  );
}
