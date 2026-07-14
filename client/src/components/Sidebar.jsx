import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge, faUsers, faGear, faHeadset, faFileLines, faUserShield,faPeopleGroup ,
  faChartColumn, faBox, faScrewdriverWrench, faHelmetSafety, faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { useI18n } from "../i18n/I18nProvider";
import useAuth from "../auth/AuthProvider.jsx";
import { SERVICE_ROLES } from "../utils/constants.js";
import logo from "../assets/easyCRM.logo.png";


/* Single nav item -> active link is highlighted by react-router NavLink */
function Item({ to, icon, label }) {
  return (
    <li className="nav-item">
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          "nav-link d-flex align-items-center gap-2 px-3 py-2 rounded " +
          (isActive ? "active bg-primary text-white" : "text-dark")
        }
      >
        <FontAwesomeIcon icon={icon} />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

export default function Sidebar() {
  const { t } = useI18n();
  const { user ,isManager,isService} = useAuth();
  const [systemOpen, setSystemOpen] = useState(false);



  return (
    <div className="d-flex flex-column flex-shrink-0 " style={{ width: 250 }}>
    <div
      className="d-flex justify-content-center align-items-center p-3 bg-light border-end pb-4 "
    >
      <img src={logo} alt="easyCRM" style={{ maxWidth: "100%", height: "auto" }} />
    </div>
    <nav
      className="d-flex flex-column flex-shrink-0 p-2 bg-light border-end p-4"
      style={{ minHeight: "100vh" }}
    >
      {/* <div className="text-dark fw-bold fs-5 px-3 py-3">
        {t("dashboard.title")}
      </div> */}

      <ul className="nav nav-pills flex-column gap-1 mb-auto">
        <Item to="/" icon={faGauge} label={t("menu.home")} />

        {isService && (
          <>
            <Item to="/customers" icon={faPeopleGroup} label={t("menu.customers")} />
         
            <li className="nav-item">    {/* System: collapsible submenu */}
              <button
                type="button"
                className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded text-dark w-100 border-0 bg-transparent"
                onClick={() => setSystemOpen((o) => !o)}
                aria-expanded={systemOpen}
              >
                <FontAwesomeIcon icon={faGear} fixedWidth />
                <span>{t("menu.system")}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="ms-auto"
                  style={{ transition: "transform .2s", transform: systemOpen ? "rotate(180deg)" : "none" }}
                />
              </button>
              {systemOpen && (
                <ul className="nav flex-column ms-4 gap-1 mt-1">
                  <Item to="/users" icon={faUsers} label={t("menu.users")} />
                  { isManager && (<Item to="/logs" icon={faFileLines} label={t("menu.logs")} />)}
                </ul>
              )}
            </li>

            {/* <Item to="/administration" icon={faUserShield} label={t("menu.administration")} /> */}
            <Item to="/reports" icon={faChartColumn} label={t("menu.reports")} />
          </>
        )}

        <Item to="/products" icon={faBox} label={t("menu.products")} />
        <Item to="/services" icon={faScrewdriverWrench} label={t("menu.services")} />

        {isService && (
          <>
            <Item to="/supportAgents" icon={faHeadset} label={t("menu.supportAgents")} />
            <Item to="/technicians" icon={faHelmetSafety} label={t("menu.technicians")} />
          </>
        )}
      </ul>
    </nav>
    </div>
  );
}
