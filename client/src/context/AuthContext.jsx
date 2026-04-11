import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiJson } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    if (!token) {
      setLoading(false);
      return;
    }
    apiJson("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => {
        localStorage.removeItem("nyaya_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, role) => {
    const data = await apiJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
    localStorage.setItem("nyaya_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const data = await apiJson("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    localStorage.setItem("nyaya_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("nyaya_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
