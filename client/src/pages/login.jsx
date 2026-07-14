import { useState,useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
import {useNavigate} from "react-router-dom";
import useApi from "../hooks/useApi.js";
import useAuth from "../auth/AuthProvider";
import Modal from "../components/Modal.jsx";
import { useAlert } from "../components/ConfirmProvider.jsx";
import logo from "../assets/easyCRM.logo.png";

export default function LoginForm() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // forgot-password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);

  const navigate = useNavigate();
  const send = useApi();
  const alert = useAlert();
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

  async function handleForgot(e) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSending(true);
    const { ok } = await send(`/api/auth/activate/${encodeURIComponent(forgotEmail.trim())}`, { method: "POST" });
    setForgotSending(false);
    if (!ok) return; // useApi already showed the error (e.g. "no user with that email")
    setForgotOpen(false);
    setForgotEmail("");
    await alert({
      title: t("login.forgotPasswordTitle"),
      message: t("login.forgotPasswordSent"),
      confirmText: t("common.ok"),
    });
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      
      <form
        onSubmit={handleSubmit}
        className="border rounded shadow-sm p-4 bg-white w-100"
        style={{ maxWidth: 400 }}
      >
        <div className="d-flex justify-content-center pb-4"><img src={logo} alt="easyCRM" style={{ maxWidth: "60%", height: "auto" }} /></div>
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

        <div className="text-center mt-3">
          <a
            href="#"
            className="small text-decoration-none"
            onClick={(e) => { e.preventDefault(); setForgotEmail(""); setForgotOpen(true); }}
          >
            {t("login.forgotPassword")}
          </a>
        </div>
      </form>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title={t("login.forgotPasswordTitle")}>
        <form onSubmit={handleForgot}>
          <p className="text-muted small">{t("login.forgotPasswordDesc")}</p>
          <div className="mb-3">
            <label className="form-label">{t("login.email")}</label>
            <input
              type="email"
              className="form-control"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setForgotOpen(false)}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={forgotSending || !forgotEmail.trim()}>
              {forgotSending && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
              {t("login.forgotPasswordSubmit")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
