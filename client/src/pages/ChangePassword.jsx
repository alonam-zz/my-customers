import { useState, useMemo } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useNavigate,useParams } from "react-router-dom";
import useApi from "../hooks/useApi.js";
import toast from "react-hot-toast";
import PasswordFields from "../components/PasswordFields.jsx";
import { validatePassword } from "../utils/passwordRules.js";
import useAuth from "../auth/AuthProvider.jsx";
import Activate from "./Activate.jsx";


export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const navigate = useNavigate();
  const send = useApi();
  const { t } = useI18n();
  const { token } = useParams();
  const {user} = useAuth();

   if (!user && token ){
      return <Activate/>
    }
  

  const checks = useMemo(
    () => validatePassword({ password, passwordConfirm, oldPassword, requireOld: true }),
    [password, passwordConfirm, oldPassword]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    const { ok } = await send("/api/auth/changePassword", {
      method: "PUT",
      body: { oldPassword, password, passwordConfirm },
    });
    if (!ok) return; // useApi already showed an error modal

    setPassword("");
    setPasswordConfirm("");
    setOldPassword("");
    toast.success(t("changePassword.passwordChangedSuccessfuly"));
    navigate("/");
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form
        onSubmit={handleSubmit}
        className="border rounded shadow-sm p-4 bg-white w-100"
        style={{ maxWidth: 400 }}
      >
        <h4 className="mb-4 text-center">{t("changePassword.title")}</h4>

        <PasswordFields
          requireOld
          oldPassword={oldPassword}
          password={password}
          passwordConfirm={passwordConfirm}
          onOldPasswordChange={setOldPassword}
          onPasswordChange={setPassword}
          onPasswordConfirmChange={setPasswordConfirm}
          checks={checks}
        />

        <button
          type="submit"
          className="btn btn-primary w-100 mt-2"
          disabled={!checks.allValid}
        >
          {t("changePassword.submit")}
        </button>
      </form>
    </div>
  );
}
