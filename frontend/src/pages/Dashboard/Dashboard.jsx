import { useEffect, useState } from "react";
import {
  fetchReadings,
  fetchSensors,
  fetchLocations,
} from "../../services/api";
import SensorChart from "../../components/sensorchart/SensorChart";
import SensorSelector from "../../components/SensorSelector";

function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sensorTypes, setSensorTypes] = useState([]);
  const [sensorNames, setSensorNames] = useState([]);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [alertConfigs, setAlertConfigs] = useState({});
  const [timeRange, setTimeRange] = useState("7d");
  const [sortBy, setSortBy] = useState("sensor_id");

  useEffect(() => {
    async function loadData() {
      const [fetchedLocs, fetchedSensors, enrichedReadings] = await Promise.all(
        [
          fetchLocations(),
          fetchSensors(),
          fetchReadings(), // this now points to `/enriched`
        ]
      );

      setLocations(fetchedLocs);
      setRawData(enrichedReadings);

      // Match sensors with their location names
      const validSensorNames = fetchedSensors
        .map((sensor) => {
          const match = fetchedLocs.find(
            (loc) => loc.id === sensor.location_id
          );
          return match
            ? {
                sensor_id: sensor.sensor_id,
                display_name: sensor.display_name,
                type: sensor.sensor_type,
                facility: match.name,
              }
            : null;
        })
        .filter(Boolean);

      setSensorNames(validSensorNames);

      const types = [...new Set(validSensorNames.map((s) => s.type))];
      setSensorTypes(types);

      console.log("🚨 rawData loaded", enrichedReadings);
      console.log("🧪 sensorNames (final):", validSensorNames);
    }

    loadData();
  }, []);

  const handleSensorAdd = (sensor) => {
    setSelectedSensors((prev) => [...prev, sensor]);
  };

  const handleSensorRemove = (sensorToRemove) => {
    setSelectedSensors((prev) =>
      prev.filter(
        (sensor) =>
          !(
            sensor.facility === sensorToRemove.facility &&
            sensor.sensor_id === sensorToRemove.sensor_id &&
            sensor.type === sensorToRemove.type
          )
      )
    );
  };

  const handleAlertConfigUpdate = (key, config) => {
    setAlertConfigs((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...config },
    }));
  };
const sortedSensors = [...selectedSensors].sort((a, b) => {
              if (sortBy === "value") {
                // Get latest value from rawData
                const aReading = rawData.find(
                  (d) => d.sensor_id === a.sensor_id && d.type === a.type
                );
                const bReading = rawData.find(
                  (d) => d.sensor_id === b.sensor_id && d.type === b.type
                );
                return (bReading?.value || 0) - (aReading?.value || 0);
              } else {
                const valA = a[sortBy]?.toString().toLowerCase() || "";
                const valB = b[sortBy]?.toString().toLowerCase() || "";
                return valA.localeCompare(valB);
              }
            });
            
  return (
    <div className="container py-4 text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-info">📊 Sensor Dashboard</h1>
        <div>
          <label className="me-2">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select form-select-sm bg-secondary text-white border-0"
          >
            <option value="1h">Last Hour</option>
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      <label className="form-label mb-0 text-white">
        Sort By:
        <select
          className="form-select bg-secondary text-white border-0 mt-1"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="sensor_id">Sensor Name</option>
          <option value="type">Type</option>
          <option value="facility">Facility</option>
          <option value="value">Latest Value</option>
        </select>
      </label>
      <SensorSelector
        locations={locations}
        sensorTypes={sensorTypes}
        sensorNames={sensorNames}
        onAddSensor={handleSensorAdd}
      />

      {rawData.length === 0 ? (
        <div className="alert alert-info mt-4">⏳ Loading sensor data...</div>
      ) : (
        <div className="row mt-4 gy-4">
          {sortedSensors.map((sensor, index) => {

            const isValid =
              sensor && sensor.facility && sensor.sensor_id && sensor.type;
            if (!isValid) return null;

            const sensorKey = `${sensor.facility}|${sensor.sensor_id}|${sensor.type}`;
            const alertConfig = alertConfigs[sensorKey] || {
              showAverage: false,
            };
            

            return (
              <div key={`${sensorKey}|${index}`} className="col-md-6 col-lg-4">
                <SensorChart
                  sensor={sensor}
                  rawData={rawData}
                  timeRange={timeRange}
                  alertConfig={alertConfig}
                  onConfigChange={(config) =>
                    handleAlertConfigUpdate(sensorKey, config)
                  }
                  onRemove={handleSensorRemove}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
