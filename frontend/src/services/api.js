import axios from "axios";

let envUrl = import.meta.env.VITE_API_URL;
if (envUrl && envUrl.includes("railway.app")) {
  envUrl = null;
}

const API_URL =
  envUrl ||
  (import.meta.env.PROD
    ? "https://duepilot-backend.onrender.com/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
