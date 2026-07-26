import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { BreadcrumbProvider } from "./BreadcrumbContext.jsx";
import useAuth from "../auth/AuthProvider.jsx";

/**
 * App shell: collapsible sidebar + header + routed content.
 * Sidebar is first in the DOM, so Bootstrap RTL puts it on the
 * left in English (LTR) and on the right in Hebrew (RTL) automatically.
 */
export default function Layout() {
  const [open, setOpen] = useState(true);
  const {user} = useAuth();
  return (
    <BreadcrumbProvider>
      <div className="d-flex ">
        {open && <Sidebar user={user}/>}
        <main className="flex-grow-1 ms-3 me-3 pt-5" style={{ minWidth: 0 }}>
          <Header open={open} onToggle={() => setOpen((o) => !o)} />
          <div className="py-3">
          <Outlet />
          </div>
        </main>
      </div>
    </BreadcrumbProvider>
  );
}
