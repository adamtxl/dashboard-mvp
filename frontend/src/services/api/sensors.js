import { fetchWithAuth } from "./client";

export const fetchSensors = () => fetchWithAuth("/sensors");

export const fetchSensorTypes = async () => {
  const sensors = await fetchSensors();
  return [...new Set(sensors.map((s) => s.sensor_type_name))];
};

export const normalizeSensorData = (sensors, locations) => {
  return sensors.map((s) => ({
    sensor_id: s.sensor_id || s.id,
    type: s.sensor_type_name,
    location: locations.find((l) => l.id === s.location_id)?.name || "Unknown",
    display_name: s.sensor_name,
    unit: s.unit || 'C',
  }));
};

export const normalizeSensorMetadata = (sensors, locations) => {
  return sensors.map((s) => ({
    sensor_id: s.sensor_id,
    type: s.sensor_type_name,
    location:
      locations.find((l) => String(l.id) === String(s.location_id))?.name ||
      "Unknown",
    display_name: s.sensor_name || String(s.id),
    unit: s.unit || 'C',
  }));
};


