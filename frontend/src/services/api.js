const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Sensor Readings
export const fetchReadings = async () => {
  const res = await fetch(`${API_BASE_URL}/data`);
  if (!res.ok) throw new Error("Failed to fetch readings");
  return res.json();
};

// Sensors (metadata)
export const fetchSensors = async () => {
  const res = await fetch(`${API_BASE_URL}/sensors`);
  if (!res.ok) throw new Error("Failed to fetch sensors");
  return res.json();
};

// Locations
export const fetchLocations = async () => {
  const res = await fetch(`${API_BASE_URL}/locations`);
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
};

// Franchises
export const fetchFranchises = async () => {
  const res = await fetch(`${API_BASE_URL}/franchises`);
  if (!res.ok) throw new Error("Failed to fetch franchises");
  return res.json();
};
