import { useState,useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import {useNavigate} from "react-router-dom";
import useApi from "../hooks/useApi.js";
import useAuth from "../auth/AuthProvider.jsx";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ChangePasswordForm() {
  const { t } = useI18n();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const navigate = useNavigate();
  const send = useApi();
  const { user, loading } = useAuth();

  const [passwordLength, setPasswordLength] = useState(false);
  const [passwordOneLetter, setPasswordOneLetter] = useState(false);
  const [passwordOneNumber, setPasswordOneNumber] = useState(false);
  const [passwordOneSpecial, setPasswordSpecial] = useState(false);
  const [passwordDifferent, setPasswordDifferent] = useState(false);
  // already authenticated (e.g. session restored on refresh) → skip the login page
  // useEffect(() => {
  //   if (!loading && user) navigate("/", { replace: true });
  // }, [loading, user, navigate]);

  // useEffect(() => {
  //   if (!loading && user) navigate("/", { replace: true });
  // }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const {ok} = await send("/api/auth/changePassword", {method: "PUT",
      body:{
        user,
        oldPassword,
        password,
        passwordConfirm
      }
    });
    if (!ok) return; // useApi already showed an error modal

    // tell AuthProvider we're logged in so ProtectedRoute lets us through
    setPassword("");
    setPasswordConfirm("");
    setOldPassword("");
    toast.success(t("changePassword.passwordChangedSuccessfuly"));
    navigate("/");
  }

 function ConditionExists (){
    return (
    <div className="me-2">
              <FontAwesomeIcon
                    icon={['fas','check']}
                    className="icon-inherit-size"
                      />
          </div>
    );
  }

  function EmptySpace (){
    return (
    <div className="me-2">
              <div style={{'width':'14px'}}
                    className="icon-inherit-size">                    
                    </div>
    </div>
    );
  }

  useEffect(()=>{
    if (password.length>=8 && password.length<=12)
      setPasswordLength(true);
    else setPasswordLength(false);

    console.log(password.length);
// const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{}'",.<>/?\\|`~]).{8,}$/;
    const regex1 = /[A-Za-z]/;
    const regex2 = /\d/;
    const regex3 = /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/;
    if (!regex1.test(password)){
      setPasswordOneLetter(false);
    }
    else setPasswordOneLetter(true);

    if (!regex2.test(password)){
      setPasswordOneNumber(false);
    }
    else setPasswordOneNumber(true);

    if (!regex3.test(password)){
      setPasswordSpecial(false);
    }
    else setPasswordSpecial(true);

    if (password==oldPassword){
      setPasswordDifferent(false);
    }
    else setPasswordDifferent(true);

  },[password])

  useEffect(()=>console.log(passwordLength),[passwordLength]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form
        onSubmit={handleSubmit}
        className="border rounded shadow-sm p-4 bg-white w-100"
        style={{ maxWidth: 400 }}
      >
        <h4 className="mb-4 text-center">{t("changePassword.title")}</h4>

        <div className="mb-3">
          <label className="form-label">{t("changePassword.oldPassword")}</label>
          <input
            type="password"
            className="form-control"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("changePassword.password")}</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("changePassword.passwordConfirm")}</label>
          <input
            type="password"
            className="form-control"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small d-flex m-0">
            <>
            {(passwordLength==true) ? <ConditionExists/>:<EmptySpace/>}
            {t("changePassword.8to12chars")}
            </>
          </label>
          <label className="form-label small d-flex m-0">
            <> 
            {passwordOneLetter?<ConditionExists/>:<EmptySpace/>}
            {t("changePassword.atLeastOneLetter")}
            </>
          </label>
          <label className="form-label small d-flex m-0">
            <>
            {passwordOneNumber?<ConditionExists/>:<EmptySpace/>}
            {t("changePassword.atLeastOneNumber")}
            </>
            </label>
          <label className="form-label small d-flex m-0">
            <>
            {passwordOneSpecial?<ConditionExists/>:<EmptySpace/>}
            {t("changePassword.atLeastOneSpecialChar")}
            </>
            </label>
          <label className="form-label small d-flex m-0">
            <>
            {passwordDifferent?<ConditionExists/>:<EmptySpace/>}
            {t("changePassword.otherThanOld")}
            </>
            </label>
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-2">{t("changePassword.submit")}</button>
      </form>
    </div>
  );
}
