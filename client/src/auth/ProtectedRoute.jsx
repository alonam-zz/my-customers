import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./AuthProvider";

export default function ProtectedRoute() {
  const { checkAuth,user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) { 
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}