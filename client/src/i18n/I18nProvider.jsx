import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { messages } from "./messages";

// Resolve the actual URLs to the CSS assets (Vite feature)
//import bsHref from "bootstrap/dist/css/bootstrap.min.css?url";
//  import bsRtlHref from "bootstrap/dist/css/bootstrap.rtl.min.css?url";

const I18nCtx = createContext(null);
const RTL_LOCALES = new Set(["he", "ar", "fa", "ur"]);

function get(obj, path) {
  if (obj == null) return undefined;
  // exact match first, so keys whose text contains "." (e.g. server messages) resolve
  if (obj[path] !== undefined) return obj[path];
  const idx = String(path).indexOf(".");
  if (idx === -1) return undefined;
  return get(obj[path.slice(0, idx)], path.slice(idx + 1));
}

function interpolate(str, values = {}) {
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, k) => (values[k] ?? ""));
}

export default function I18nProvider({ children, initialLocale = "en" }) {
  // I18nProvider is the single source of truth for locale. `initialLocale` is
  // only the seed value — after mount, setLocale (via useI18n) owns it.
  const [locale, setLocale] = useState(initialLocale);

  // Set dir/lang for proper RTL/LTR & accessibility
  //both css files have been copied to public directory 
  useEffect(() => {

    const id = "bootstrap-css";
    const href = locale === "he" ? "/bootstrap.rtl.min.css" : "/bootstrap.min.css";

    let link = document.getElementById(id);
    if (!link) {
        link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }
    link.href = href;
    
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  }, [locale]);

  const t = useMemo(() => {
    const dict = messages[locale] || messages.en;

    return (key, values) => {
      // pluralization: if count provided and *_plural exists, pick it
      const base = get(dict, key);
      if (values && typeof values.count === "number") {
        const plural = get(dict, `${key}_plural`);
        const val = values.count === 1 ? base : (plural ?? base);
        return val ? interpolate(val, values) : key;
      }
      return base ? interpolate(base, values) : key; // fallback to key if missing
    };
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
