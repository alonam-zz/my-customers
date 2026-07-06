import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AppProviders from './components/AppProvider.jsx'
import { AuthProvider } from "./auth/AuthProvider";
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
import Reports from './reports/Reports.jsx'
import Logs from './pages/Logs.jsx'

import useAuth  from "./auth/AuthProvider";
import  ProtectedRoute  from "./auth/ProtectedRoute";

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus, faEdit, faTrash,faCheck,
  faXmark, faPaperPlane, faArrowsRotate, faUserGear, faFloppyDisk, faUser,
  faFolderOpen, faClock,faChartColumn,faSearch
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faPlus, faEdit, faTrash,faCheck,
  faXmark, faPaperPlane, faArrowsRotate, faUserGear, faFloppyDisk, faUser,
  faFolderOpen, faClock,faChartColumn,faSearch
);

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
              <Route path="/my/changePassword" element={<ChangePasswordForm />} />
              <Route path="/customers" element={<CustomersList />} />
              <Route path="/customers/:id" element={<CustomerPageRoute />} />
              <Route path="customers/:customerId/calls/:id" element={<CallPageRoute />} />
              <Route path="customers/:id/calls" element={<CustomerPageRoute initialTab={"calls"}/>} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/services" element={<ServicesList />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/technicians" element={<TechniciansList />} />
              <Route path="/supportAgents" element={<SupportAgentsList />} />
              <Route path="/reports/" element={<Reports />} />
              <Route path="/logs/" element={<Logs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

          </Route>
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider> 
    </AppProviders>
  </StrictMode>,
)
