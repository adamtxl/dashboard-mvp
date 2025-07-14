const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const READINGS_API_KEY = import.meta.env.VITE_READINGS_API_KEY;

const getToken = () => localStorage.getItem("token");

const getAuthHeader = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token || READINGS_API_KEY}`,
  };
};

// Generic helper
const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} – ${errorText}`);
  }

  return response.json();
};

// Auth
export const loginUser = async (username, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await response.json();
  localStorage.setItem("token", data.access_token);
  return data;
};

// Usage
export const fetchReadings = () => fetchWithAuth("/enriched");
export const fetchSensors = () => fetchWithAuth("/sensors");
export const fetchLocations = () => fetchWithAuth("/locations");
export const fetchFranchises = () => fetchWithAuth("/franchises");
