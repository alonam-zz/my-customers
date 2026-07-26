import React from "react";
import I18nProvider,{ useI18n }  from "../i18n/I18nProvider.jsx";
import ConfirmProvider from "./ConfirmProvider.jsx";
import { getCookie, setCookie } from "../utils/cookies.js";


function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();  
  const next = locale === "he" ? "en" : "he";

  const handleLocaleChange = () => {
    setLocale(next);
    setCookie('locale', next);
  };

  return (
    <div className="position-fixed top-0 p-2 float-left" style={{ zIndex: 1200, right:'20px' }}>
      <button
        className="btn btn-sm btn-dark"
        onClick={handleLocaleChange} 
        title={`Switch to ${next.toUpperCase()}`}
      > 
        {next.toUpperCase()}
      </button>
    </div>
  );
}

export default function AppProvider({ children,initialLocale ="en" }) {
  // I18nProvider owns the locale from here on. We only compute the *initial*
  // value (cookie wins over the prop). Language changes go through
  // useI18n().setLocale in LanguageSwitcher — no locale state lives here.
  const startLocale = getCookie('locale') || initialLocale;

  // I18n is outermost so it can set <html lang/dir> once.
  return (
    <I18nProvider initialLocale={startLocale}>
      <ConfirmProvider>
         <LanguageSwitcher/>
        {children}
      </ConfirmProvider>
    </I18nProvider>
  );
}