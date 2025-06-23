import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchReadings,
  fetchLocations,
} from "../../services/api";
import SensorChart from "../../components/sensorchart/SensorChart";
import SensorSelector from "../../components/SensorSelector";
import { normalize } from "../../utils/normalize";
import { fetchSensors, normalizeSensorMetadata } from "../../services/api/sensors";
import { useAuth } from "../../AuthContext";

function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sensorTypes, setSensorTypes] = useState([]);
  const [sensorNames, setSensorNames] = useState([]);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [alertConfigs, setAlertConfigs] = useState({});
  const [timeRange, setTimeRange] = useState("all");
  const [sortBy, setSortBy] = useState("sensor_id");
  const [loadError, setLoadError] = useState(false);
  const [sensors, setSensors] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const locs = await fetchLocations();
        const rawSensors = await fetchSensors();
        const readings = await fetchReadings();
        setLocations(locs);
        setSensors(rawSensors);
        setRawData(readings);
        setSensorTypes([...new Set(rawSensors.map(s => s.sensor_type_name))]);
        setSensorNames(normalizeSensorMetadata(rawSensors, locs));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      alert("You must be logged in to view the dashboard.");
      navigate("/login");
    }
  }, [isAuthenticated]);

  const handleSensorAdd = (sensor) =>
    setSelectedSensors((prev) => [...prev, sensor]);

  const handleSensorRemove = (sensorToRemove) => {
    setSelectedSensors((prev) =>
      prev.filter(
        (sensor) =>
          !(
            sensor.location === sensorToRemove.location &&
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
    <>
      <div
        className="container py-4 text-light"
        style={{
          background: "linear-gradient(to bottom, #1e1e1e, #2a2a2a)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
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
            <option value="location">Location</option>
            <option value="value">Latest Value</option>
          </select>
        </label>

        <SensorSelector
          locations={locations}
          sensorTypes={sensorTypes}
          sensorNames={sensorNames}
          onAddSensor={handleSensorAdd}
        />
        {selectedSensors.length === 0 && !loadError && rawData.length > 0 && (
          <div className="alert alert-info mt-4 text-center">
            ➕ Use "Add a Widget" above to start building your dashboard!
          </div>
        )}

        {loadError ? (
          <div className="alert alert-danger mt-4">
            🚨 Unable to load sensor data. Please try again later.
          </div>
        ) : rawData.length === 0 ? (
          <div className="alert alert-info mt-4">⏳ Loading sensor data...</div>
        ) : (
          <div className="row mt-4 gy-4">
            {sortedSensors.map((sensor, index) => {
              const isValid =
                sensor && sensor.location && sensor.sensor_id && sensor.type;
              if (!isValid) return null;

              const sensorKey = `${sensor.location}|${sensor.sensor_id}|${sensor.type}`;
              const alertConfig = alertConfigs[sensorKey] || {
                showAverage: false,
              };

              return (
                <div
                  key={`${sensorKey}|${index}`}
                  className="col-md-6 col-lg-4 animate__animated animate__fadeIn"
                >
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
    </>
  );
}

export default Dashboard;
