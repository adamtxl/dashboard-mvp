import { fetchWithAuth } from "./client";

// Get readings for a single sensor (optionally limited)
export const fetchReadingsBySensor = (sensorId, limit = 500) =>
  fetchWithAuth(`/sensors/${sensorId}/readings?limit=${limit}`);

// Get readings for a location
export const fetchReadingsByLocation = (locationId, limit = 500) =>
  fetchWithAuth(`/locations/${locationId}/readings?limit=${limit}`);

// (optional) Get current user's enriched readings – not recommended for initial dashboard load
export const fetchEnrichedReadings = () => fetchWithAuth("/enriched");

// Admin endpoints
export const fetchAllReadingsAdmin = () => fetchWithAuth("/admin/data");
export const fetchAllEnrichedAdmin = () => fetchWithAuth("/admin/enriched");
