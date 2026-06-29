import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Lets pages override breadcrumb labels for dynamic paths.
 * e.g. CustomerPage registers "/customers/2" -> "מזרני סביון",
 * so the Header shows the name instead of the id.
 */
const Ctx = createContext(null);

export function BreadcrumbProvider({ children }) {
  const [labels, setLabels] = useState({});

  const setLabel = useCallback((path, label) => {
    setLabels((m) => (m[path] === label ? m : { ...m, [path]: label }));
  }, []);

  const value = useMemo(() => ({ labels, setLabel }), [labels, setLabel]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBreadcrumbs() {
  return useContext(Ctx) || { labels: {}, setLabel: () => {} };
}
