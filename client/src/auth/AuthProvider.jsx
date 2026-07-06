import { createContext, useContext, useEffect, useState } from "react";
import { MANAGER_ROLES } from "../utils/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  function isManager(){
    if (MANAGER_ROLES.includes(user.role)){
      return true;
    }
    return false;
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth,logout,isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}