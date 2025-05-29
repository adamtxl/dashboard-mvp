const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const READINGS_API_KEY = import.meta.env.VITE_READINGS_API_KEY;
const getToken = () => localStorage.getItem("token");


export const fetchReadings = async () => {
  const response = await fetch(`${BASE_URL}/enriched`, {
    headers: {
      Authorization: `Bearer ${READINGS_API_KEY}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch readings");
  return response.json();
};

export const fetchSensors = async () => {
  const response = await fetch(`${BASE_URL}/sensors`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch sensors");
  return response.json();
};


export const fetchLocations = async () => {
  const response = await fetch(`${BASE_URL}/locations`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch locations");
  return response.json();
};


export const fetchFranchises = async () => {
  const response = await fetch(`${BASE_URL}/franchises`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch franchises");
  return response.json();
};

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
