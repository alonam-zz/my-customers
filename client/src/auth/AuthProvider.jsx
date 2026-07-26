import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { MANAGER_ROLES,SERVICE_ROLES } from "../utils/constants";

const AuthContext = createContext(null);

// one page key per route — used for per-page access control
export const PAGE = {
  dashboard: "dashboard",
  myCalls: "mycalls",
  changePassword: "changePassword",
  customers: "customers",
  customer: "customer",
  call: "call",
  products: "products",
  services: "services",
  users: "users",
  technicians: "technicians",
  supportAgents: "supportAgents",
  reports: "reports",
  logs: "logs",
};

const ALL_PAGES = Object.values(PAGE);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        credentials: "include",
      });
    }
    catch(err){

    } finally { 
      setUser(null);
    }
  }, []);


   const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const isManager = useMemo(
      () =>  !!user && MANAGER_ROLES.includes(user.role),
      [user]
    );

   const isService = useMemo(
      () =>  !!user && SERVICE_ROLES.includes(user.role),
      [user]
    );

    const authDisableEdit = !isManager; // derived, no state, no effect

// pages the current user is allowed to open, built from their role
const allowedPages = useMemo(
      () =>  {
        let allowedPages = [];
        if (user) {
          if (isManager) {
            allowedPages = ALL_PAGES; // managers/admins see everything
          } else if (user.role === "technician") {
            allowedPages = [
              PAGE.call,
              PAGE.myCalls,
              PAGE.changePassword,
              PAGE.customer,
              PAGE.dashboard,
              PAGE.products,
              PAGE.services,
            ];
          } else if (user.role === "support") {
            // everything except reports and logs
            allowedPages = ALL_PAGES.filter((p) => p !== PAGE.reports && p !== PAGE.logs && p!==PAGE.dashboard);
          } else {
            allowedPages = ALL_PAGES;
          }
        }
        return allowedPages;
      },
      [user]
    );

  
 


  useEffect(() => {
    checkAuth();
  }, []);

const value = useMemo(
  () => ({ user, setUser, loading, checkAuth, logout, authDisableEdit, isManager, isService, allowedPages }),
  [user, loading, checkAuth, logout, authDisableEdit, isManager, isService, allowedPages]
);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}