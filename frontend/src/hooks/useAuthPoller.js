import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";


export const useAuthPoller = (intervalMs = 300000) => { // default 5 min
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/users/me", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            console.warn("Session expired, logging out.");
            localStorage.removeItem("token");
            logout(); // clear auth context
            navigate("/login"); //redirect to a logout page
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    const interval = setInterval(checkAuth, intervalMs);
    checkAuth(); // run immediately on mount

    return () => clearInterval(interval); // cleanup
  }, [navigate, intervalMs, logout]);
};
