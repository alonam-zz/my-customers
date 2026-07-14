import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useI18n } from "../i18n/I18nProvider.jsx";

/* A met/unmet marker before each condition line */
function ConditionIcon({ met }) {
  return (
    <div className="me-2">
      {met ? (
        <FontAwesomeIcon icon={["fas", "check"]} className="icon-inherit-size" />
      ) : (
        <div style={{ width: "14px" }} className="icon-inherit-size" />
      )}
    </div>
  );
}

function Condition({ met, label }) {
  return (
    <label className="form-label small d-flex m-0">
      <ConditionIcon met={met} />
      {label}
    </label>
  );
}

/**
 * Controlled password fields + live condition checklist, shared by Activate and
 * ChangePassword. The parent owns the state (so it can submit/reset it) and the
 * computed `checks` (from validatePassword); this component only renders.
 *
 * @param {boolean} requireOld       show the "old password" field + "different from old" rule
 * @param {object}  checks           result of validatePassword(...)
 * @param values + on*Change         standard controlled-input props
 */
export default function PasswordFields({
  requireOld = false,
  oldPassword = "",
  password,
  passwordConfirm,
  onOldPasswordChange,
  onPasswordChange,
  onPasswordConfirmChange,
  checks,
}) {
  const { t } = useI18n();

  return (
    <>
      {requireOld && (
        <div className="mb-3">
          <label className="form-label">{t("changePassword.oldPassword")}</label>
          <input
            type="password"
            className="form-control"
            value={oldPassword}
            onChange={(e) => onOldPasswordChange(e.target.value)}
          />
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">{t("changePassword.password")}</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t("changePassword.passwordConfirm")}</label>
        <input
          type="password"
          className="form-control"
          value={passwordConfirm}
          onChange={(e) => onPasswordConfirmChange(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <Condition met={checks.length} label={t("changePassword.8to12chars")} />
        <Condition met={checks.oneLetter} label={t("changePassword.atLeastOneLetter")} />
        <Condition met={checks.oneNumber} label={t("changePassword.atLeastOneNumber")} />
        <Condition met={checks.oneSpecial} label={t("changePassword.atLeastOneSpecialChar")} />
        {requireOld && (
          <Condition met={checks.different} label={t("changePassword.otherThanOld")} />
        )}
      </div>
    </>
  );
}
