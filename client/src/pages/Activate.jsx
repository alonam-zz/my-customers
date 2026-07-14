import { useState, useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useNavigate ,useParams} from "react-router-dom";
import useApi from "../hooks/useApi.js";
import toast from "react-hot-toast";
import PasswordFields from "../components/PasswordFields.jsx";
import { validatePassword } from "../utils/passwordRules.js";
import useAuth from "../auth/AuthProvider.jsx";
import { useEffect } from "react";
import { useAlert } from "../components/ConfirmProvider.jsx";

export default function Activate() {
  const { t } = useI18n();
   const { token } = useParams();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const send = useApi();
  const alert = useAlert();

  // Already logged in? Send them home — but only once auth has resolved.
  // `user` is null on the first render(s) while checkAuth() is still in flight,
  // so acting before `loading` is false would wrongly treat you as logged out.
  // useEffect(() => {
  //   if (!loading && user) navigate("/", { replace: true });
  // }, [loading, user, navigate]);

  const checks = useMemo(
    () => validatePassword({ password, passwordConfirm, requireOld: false }),
    [password, passwordConfirm]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const qs = encodeURIComponent(token)
    const { ok } = await send(`/api/auth/activate/${qs}`, {
      method: "PUT",
      body: { password, passwordConfirm },
    });
    if (!ok) return; // useApi already showed an error modal

    setPassword("");
    setPasswordConfirm("");
    toast.success(t("activate.activatedSuccessfuly"));
    navigate("/login");
  }

  useEffect(()=>{
    if (loading) return;
    if (user) { navigate("/", { replace: true }); return; }
    async function getToken(){ 
      if (!token) {
        await alert(t('messages.ActivationLinkIsBroken'));
        navigate("/login");
      }
      const qs = encodeURIComponent(token);
      const {ok,data} = await send(`/api/auth/activate/${qs}`);
      if (!ok){
          // await alert(t('messages.ActivationLinkIsBroken'));
          navigate("/login");
      }
    }

    getToken();

  },[user,loading,navigate])

  return (
   (!loading && !user  && (
   <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form
        onSubmit={handleSubmit}
        className="border rounded shadow-sm p-4 bg-white w-100"
        style={{ maxWidth: 400 }}
      >
        <h4 className="mb-4 text-center">{t("activateUser.title")}</h4>

        <PasswordFields
          password={password}
          passwordConfirm={passwordConfirm}
          onPasswordChange={setPassword}
          onPasswordConfirmChange={setPasswordConfirm}
          checks={checks}
        />

        <button
          type="submit"
          className="btn btn-primary w-100 mt-2"
          disabled={!checks.allValid}
        >
          {t("activate.submit")}
        </button>
      </form>
    </div>
   )) 
  );
}
