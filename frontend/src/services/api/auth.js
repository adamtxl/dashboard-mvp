import { fetchWithAuth } from "./client";

export const loginUser = async (username, password) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username, password }),
  });

  if (!response.ok) throw new Error("Invalid credentials");

  const data = await response.json();
  localStorage.setItem("token", data.access_token);
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
