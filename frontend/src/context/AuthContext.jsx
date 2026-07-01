import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [wakingUp, setWakingUp] = useState(true);

  useEffect(() => {
    const wakeUp = async () => {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 30000);
        await fetch(`${API_URL.replace("/api", "")}/api/health`, { signal: controller.signal });
        clearTimeout(id);
      } catch {
        // Railway is now awake even if the request failed
      } finally {
        setWakingUp(false);
      }
    };
    wakeUp();
  }, []);

  useEffect(() => {
    if (!wakingUp) {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        fetchProfile();
      } else {
        setLoading(false);
      }
    }
  }, [token, wakingUp]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data.user);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    const { data } = await api.post("/auth/demo-login");
    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, wakingUp, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
