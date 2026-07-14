import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AppProviders from './components/AppProvider.jsx'
import { AuthProvider, PAGE } from "./auth/AuthProvider";
import useAuth from "./auth/AuthProvider";
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CustomersList from './pages/CustomersList.jsx'
import CustomerPage from './pages/CustomerPage.jsx'
import CallPage from './pages/CallPage.jsx'
import ProductsList from './pages/ProductsList.jsx'
import ServicesList from './pages/ServicesList.jsx'
import UsersList from './pages/UsersList.jsx'
import TechniciansList from './pages/TechniciansList.jsx'
import SupportAgentsList from './pages/SupportAgentsList.jsx'
import LoginForm from './pages/login.jsx'
import ChangePasswordForm from './pages/ChangePassword.jsx'
import Activate from './pages/Activate.jsx'
import Reports from './reports/Reports.jsx'
import Logs from './pages/Logs.jsx'
import MyCalls from './pages/MyCalls.jsx'
import MyDetails from './pages/MyDetails.jsx'


import  ProtectedRoute  from "./auth/ProtectedRoute";

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus, faEdit, faTrash,faCheck,
  faXmark, faPaperPlane, faArrowsRotate, faUserGear, faFloppyDisk, faUser,
  faFolderOpen, faClock,faChartColumn,faSearch,faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faPlus, faEdit, faTrash,faCheck,
  faXmark, faPaperPlane, faArrowsRotate, faUserGear, faFloppyDisk, faUser,
  faFolderOpen, faClock,faChartColumn,faSearch,faCircleExclamation
);

/* ---- per-page access guard: redirect to "/" if the user's role can't see this page ---- */
function RequirePage({ page, children }) {
  const { allowedPages } = useAuth();
  if (!allowedPages.includes(page)) return <Navigate to="/" replace />;
  return children;
}

/* ---- route wrappers: read URL params and pass them as props ---- */
function CustomerPageRoute({initialTab = null}) {
  const { id } = useParams();
  return <CustomerPage initialTab={initialTab} customerId={id} />;
}

function CallPageRoute() {
  const { customerId,id } = useParams();

  const navigate = useNavigate();
  return (
    <CallPage
      callId={id}
      customerId={customerId}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders initialLocale={"he"}>
      <Toaster position="bottom-center" />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>           
              <Route path="/" element={<Dashboard />} />
              <Route path="/my/changePassword" element={<RequirePage page={PAGE.changePassword}><ChangePasswordForm /></RequirePage>} />
              <Route path="/my/details" element={<MyDetails />} />
              <Route path="/customers" element={<RequirePage page={PAGE.customers}><CustomersList /></RequirePage>} />
              <Route path="/customers/:id" element={<RequirePage page={PAGE.customer}><CustomerPageRoute /></RequirePage>} />
              <Route path="customers/:customerId/calls/:id" element={<RequirePage page={PAGE.call}><CallPageRoute /></RequirePage>} />
              <Route path="customers/:id/calls" element={<RequirePage page={PAGE.customer}><CustomerPageRoute initialTab={"calls"}/></RequirePage>} />
              <Route path="/products" element={<RequirePage page={PAGE.products}><ProductsList /></RequirePage>} />
              <Route path="/services" element={<RequirePage page={PAGE.services}><ServicesList /></RequirePage>} />
              <Route path="/users" element={<RequirePage page={PAGE.users}><UsersList /></RequirePage>} />
              <Route path="/technicians" element={<RequirePage page={PAGE.technicians}><TechniciansList /></RequirePage>} />
              <Route path="/supportAgents" element={<RequirePage page={PAGE.supportAgents}><SupportAgentsList /></RequirePage>} />
              <Route path="/reports/" element={<RequirePage page={PAGE.reports}><Reports /></RequirePage>} />
              <Route path="/logs/" element={<RequirePage page={PAGE.logs}><Logs /></RequirePage>} />
              <Route path="/mycalls" element={<RequirePage page={PAGE.myCalls}><MyCalls /></RequirePage>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

          </Route>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/activate/:token" element={<Activate />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider> 
    </AppProviders>
  </StrictMode>,
)
