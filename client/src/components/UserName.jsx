import { useI18n } from "../i18n/I18nProvider";

export default function UserName({ value,onChange,disabled}) {
    const {t} = useI18n();

    return(
    <div className="col-12 col-md-6">
          <label className="form-label">{t("user.username")} *</label>
          <input className="form-control" name="username" value={value} onChange={onChange} disabled={disabled} required/>
        </div>
    )
}