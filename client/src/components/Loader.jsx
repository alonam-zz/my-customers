import { useI18n } from "../i18n/I18nProvider";

/**
 * Centered spinner overlay, matching the dashboard's loadingCircle.
 * Render it inside a `position-relative` container; give the underlying
 * content the `invisible` class so the layout height is preserved while loading.
 */
export default function Loader() {
  const { t } = useI18n();
  return (
    <div className="position-absolute top-50 start-50 translate-middle">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{t("common.loading")}</span>
      </div>
    </div>
  );
}
