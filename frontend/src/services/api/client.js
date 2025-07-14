const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_READINGS_API_KEY;

export const getToken = () => localStorage.getItem("token");

export const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    Authorization: `Bearer ${token || API_KEY}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} – ${errorText}`);
  }

  return response.json();
};
