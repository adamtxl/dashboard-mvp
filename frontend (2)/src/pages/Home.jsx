import { useEffect, useState } from "react";
import axios from "axios";
import SensorChart from "../components/sensorchart/SensorChart";
import SensorSelector from "../components/SensorSelector";
import "./Home.css";

function Home() {
  const [rawData, setRawData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sensorTypes, setSensorTypes] = useState([]);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [alertConfigs, setAlertConfigs] = useState({});
  const [timeRange, setTimeRange] = useState("7d");

  const sensorNames = [
    ...new Set(
      rawData.map((entry) => ({
        sensor_name: entry.sensor_name,
        facility: entry.facility,
        type: entry.type,
      }))
    ),
  ];

  useEffect(() => {
    axios
      .get("http://localhost:8000/data")
      .then((res) => {
        setRawData(res.data);
        setLocations([...new Set(res.data.map((entry) => entry.facility))]);
        setSensorTypes([...new Set(res.data.map((entry) => entry.type))]);
      })
      .catch((err) => console.error("❌ Failed to fetch data:", err));
  }, []);

  const handleSensorAdd = (sensor) => {
    console.log("🚀 Adding sensor:", sensor);
    setSelectedSensors((prev) => [...prev, sensor]);
  };

  const handleSensorRemove = (sensorToRemove) => {
    setSelectedSensors((prev) =>
      prev.filter(
        (sensor) =>
          !(
            sensor.facility === sensorToRemove.facility &&
            sensor.sensor_name === sensorToRemove.sensor_name &&
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

  return (
    <div
      className="bg-dark text-light min-vh-100 py-5 px-3"
      style={{
        background:
          "linear-gradient(to bottom right, #0d1b2a, #1b263b, #415a77)",
      }}
    >
      <div className="container">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <h1 className="text-info">Sensor Dashboard</h1>
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
            {selectedSensors.map((sensor, index) => {
              const isValid =
                sensor && sensor.facility && sensor.sensor_name && sensor.type;
              if (!isValid) return null;

              const sensorKey = `${sensor.facility}|${sensor.type}`;
              const alertConfig = alertConfigs[sensorKey] || {};

              return (
                <div
                  key={`${sensor.facility}|${sensor.sensor_name}|${sensor.type}|${index}`}
                  className="col-md-6 col-lg-4"
                >
                  <div className="position-relative">

                    <SensorChart
                      sensor={sensor}
                      rawData={rawData}
                      timeRange={timeRange}
                      alertConfig={alertConfig}
                      onConfigChange={(config) =>
                        handleAlertConfigUpdate(sensorKey, config)}
                        onRemove={handleSensorRemove} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedSensors.length === 0 && rawData.length > 0 && (
          <div className="text-center mt-5">
            <div
              className="alert"
              style={{
                background: "linear-gradient(to right, #0d1b2a, #1b263b)",
                color: "white",
                border: "none",
              }}
            >
              <h5 className="mb-2">No sensors added yet 🚫</h5>
              <p className="mb-0 fw-light">
                ➕ Use the selector above to add sensor widgets and start
                monitoring data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
