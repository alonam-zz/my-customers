import { useState,useEffect } from "react";
import { useI18n } from "./i18n/I18nProvider";
import {useNavigate} from "react-router-dom";
import useApi from "./hooks/useApi.js";
import useAuth from "./auth/AuthProvider";

export default function LoginForm() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const send = useApi();
  const { user, loading, setUser } = useAuth();

  // already authenticated (e.g. session restored on refresh) → skip the login page
  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const {ok,data} = await send("/api/auth/login", {method: "POST",
      body:{
        username,
        password
      }
    });
    if (!ok) return; // useApi already showed an error modal

    setUser(data.user); // tell AuthProvider we're logged in so ProtectedRoute lets us through
    setPassword("");
    navigate("/");
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form
        onSubmit={handleSubmit}
        className="border rounded shadow-sm p-4 bg-white w-100"
        style={{ maxWidth: 400 }}
      >
        <h4 className="mb-4 text-center">{t("login.title")}</h4>

        <div className="mb-3">
          <label className="form-label">{t("login.username")}</label>
          <input
            type="text"
            className="form-control"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("login.password")}</label>
          <input
            type="password"
            className="form-control"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-2">{t("login.submit")}</button>
      </form>
    </div>
  );
}
