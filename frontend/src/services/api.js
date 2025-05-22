
// Mocked API functions for demo

// Enriched Readings
export const fetchReadings = async () => {
  return Promise.resolve([
    // Sensor ABC - Temperature
    { id: 1, sensor_id: "sensor-abc", type: "temperature", value: 72.5, timestamp: "2024-05-20T14:00:00Z", facility: "Burger Barn" },
    { id: 2, sensor_id: "sensor-abc", type: "temperature", value: 73.1, timestamp: "2024-05-20T14:05:00Z", facility: "Burger Barn" },
    { id: 3, sensor_id: "sensor-abc", type: "temperature", value: 72.9, timestamp: "2024-05-20T14:10:00Z", facility: "Burger Barn" },
    { id: 4, sensor_id: "sensor-abc", type: "temperature", value: 74.0, timestamp: "2024-05-20T14:15:00Z", facility: "Burger Barn" },
    { id: 5, sensor_id: "sensor-abc", type: "temperature", value: 74.5, timestamp: "2024-05-20T14:20:00Z", facility: "Burger Barn" },
    { id: 6, sensor_id: "sensor-abc", type: "temperature", value: 73.8, timestamp: "2024-05-20T14:25:00Z", facility: "Burger Barn" },

    // Sensor DEF - Humidity
    { id: 7, sensor_id: "sensor-def", type: "humidity", value: 45, timestamp: "2024-05-20T14:00:00Z", facility: "Burger Barn" },
    { id: 8, sensor_id: "sensor-def", type: "humidity", value: 46, timestamp: "2024-05-20T14:05:00Z", facility: "Burger Barn" },
    { id: 9, sensor_id: "sensor-def", type: "humidity", value: 47, timestamp: "2024-05-20T14:10:00Z", facility: "Burger Barn" },
    { id: 10, sensor_id: "sensor-def", type: "humidity", value: 48, timestamp: "2024-05-20T14:15:00Z", facility: "Burger Barn" },
    { id: 11, sensor_id: "sensor-def", type: "humidity", value: 47, timestamp: "2024-05-20T14:20:00Z", facility: "Burger Barn" },
    { id: 12, sensor_id: "sensor-def", type: "humidity", value: 46, timestamp: "2024-05-20T14:25:00Z", facility: "Burger Barn" }
  ]);
};


// Sensors
export const fetchSensors = async () => {
  return Promise.resolve([
    {
      id: 2,
      sensor_id: "sensor-abc",
      location_id: 1,
      description: "Main dining room sensor",
      installed_on: "2024-01-10T08:00:00Z",
      display_name: "Dining Temp Sensor",
      sensor_type: "temperature"
    },
    {
      id: 3,
      sensor_id: "sensor-def",
      location_id: 1,
      description: "Kitchen humidity sensor",
      installed_on: "2024-01-12T08:00:00Z",
      display_name: "Kitchen Humidity",
      sensor_type: "humidity"
    }
  ]);
};

// Locations
export const fetchLocations = async () => {
  return Promise.resolve([
    {
      id: 1,
      name: "Burger Barn",
      address: "123 Fry St",
      city: "Frytown",
      state: "ND",
      zip: "58102",
      franchise_id: 1
    }
  ]);
};

// Franchises
export const fetchFranchises = async () => {
  return Promise.resolve([
    {
      name: "Burger Barn Franchises",
      id: 1
    }
  ]);
};