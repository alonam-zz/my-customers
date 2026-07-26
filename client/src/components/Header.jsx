import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import { useI18n } from "../i18n/I18nProvider";
import { useBreadcrumbs } from "./BreadcrumbContext.jsx";
import  useAuth  from "../auth/AuthProvider.jsx";
import { useConfirm } from "./ConfirmProvider.jsx";


import { useNavigate } from "react-router-dom";



// TODO: replace with the real authenticated user (from auth context / API)
export default function Header({ onToggle, open }) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { labels } = useBreadcrumbs(); // per-path label overrides (e.g. customer name)


  const navigate = useNavigate();
  const {user,logout} = useAuth();

  const confirm = useConfirm();
  
    const onLogout = async ()=>{
      const ok = await confirm({
        title: t("common.areYouSure"),
        message: t("common.logoutQuestion"),
        confirmText: t("common.logout"),
        cancelText: t("common.cancel"),
        // variant: "danger",
      });
  
      if (ok) {
        await logout();
        navigate("/login");
      }
    }

  // map a path segment -> human label
  const labelFor = (seg) => {
    const map = {
      customers: t("menu.customers"),
      system: t("menu.system"),
      users: t("menu.users"),
      logs: t("menu.logs"),
      administration: t("menu.administration"),
      reports: t("menu.reports"),
      products: t("menu.products"),
      services: t("menu.services"),
      technicians: t("menu.technicians"),
      calls: t("servicecall.title"),
      supportAgents:t("menu.supportAgents"),
      mycalls: t("usermenu.myCalls"),
      my: t("usermenu.my"),
      details: t("usermenu.myDetails"),
      changePassword: t("usermenu.changePassword"),
    };
    if (map[seg]) return map[seg];
    if (/^\d+$/.test(seg)) return `#${seg}`; // numeric id
    return seg;
  };

  // build breadcrumb trail: always starts at Dashboard (home)
  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (pathname=="/") return [];
    const trail = [{ to: "/", label: t("menu.dashboard") }];
    let acc = "";
    segments.forEach((seg) => {
      acc += `/${seg}`;
      // a registered override (e.g. customer name) wins over the default label
      trail.push({ to: acc, label: labels[acc] ?? labelFor(seg) });
    });
    return trail;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, t, labels]);

  return (
    <header className="d-flex align-items-center gap-3 border-bottom bg-white px-3 mb-4">
      {/* <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={onToggle}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={faBars} />
      </button> */}

      {/* breadcrumbs */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li
                key={c.to}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast ? c.label : <Link to={c.to}>{c.label}</Link>}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* user menu — pushed to the end (right in LTR / left in RTL) */}
      <Dropdown align="end" className="ms-auto">
        <Dropdown.Toggle variant="light" size="sm" id="user-menu" className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faCircleUser} />
          {user.first_name+' '+user.last_name}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/mycalls">{t("usermenu.myCalls")}</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to="/my/details">{t("usermenu.myDetails")}</Dropdown.Item>
          <Dropdown.Item as={Link} to="/my/changePassword">{t("usermenu.changePassword")}</Dropdown.Item>
          <Dropdown.Item as="button" type="button" onClick={onLogout}>{t("usermenu.logout")}</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
}
