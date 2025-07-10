import { createContext, useContext, useEffect, useState } from "react";
import { getToken, logoutUser } from "../src/services/api/auth.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());



  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutUser();
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
