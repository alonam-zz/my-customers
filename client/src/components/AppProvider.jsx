import React ,{ useState } from "react";
import I18nProvider,{ useI18n }  from "../i18n/I18nProvider.jsx";
import ConfirmProvider from "./ConfirmProvider.jsx";
import { getCookie, setCookie } from "../utils/cookies.js";


function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();  
  const next = locale === "he" ? "en" : "he"; console.log(next);

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
  // Read locale from cookie or use initial locale
  const getInitialLocale = () => {
    const cookieLocale = getCookie('locale');
    return cookieLocale || initialLocale;
  };

  const [locale, setLocale] = useState(getInitialLocale);
  // Put I18n outermost so it can set <html lang/dir> once.
  // const [ locale, setLocale ] = useState(initialLocale);
//   const { locale, setLocale } = useI18n();  
  return (
    <I18nProvider initialLocale={locale}>
      <ConfirmProvider>
         <LanguageSwitcher/>
        {children}
      </ConfirmProvider>
    </I18nProvider>
  );
}