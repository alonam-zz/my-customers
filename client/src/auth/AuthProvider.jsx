import { createContext, useContext, useEffect, useState } from "react";
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
  const [authDisableEdit, setAuthDisableEdit] = useState(true);

    async function logout() {
    try {
      await fetch("/api/auth/logout", {
        credentials: "include",
      });
    }
    catch(err){

    } finally { 
      setUser(null);
    }


  }
  async function checkAuth() {
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
  }

  const isManager = !!user && MANAGER_ROLES.includes(user.role);
  const isService = !!user && SERVICE_ROLES.includes(user.role);

  // pages the current user is allowed to open, built from their role
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


  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) setAuthDisableEdit(!isManager);
  }, [user]);

  

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth,logout,authDisableEdit,isManager,isService,allowedPages }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}