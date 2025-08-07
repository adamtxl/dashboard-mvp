import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";


export const useAuthPoller = (intervalMs = 300000) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            console.warn("Session expired, logging out.");
            localStorage.removeItem("token");
            logout();
            navigate("/login");
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    const interval = setInterval(checkAuth, intervalMs);
    checkAuth();

    return () => clearInterval(interval);
  }, [navigate, intervalMs, logout, API_BASE_URL]);
};

