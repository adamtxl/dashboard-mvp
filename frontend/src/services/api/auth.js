import { fetchWithAuth } from "./client";

export const loginUser = async (username, password) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await response.json();
  localStorage.setItem("token", data.access_token);
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");

// ✅ Add this helper
export const getAuthHeaders = () => {
  const token = getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};
