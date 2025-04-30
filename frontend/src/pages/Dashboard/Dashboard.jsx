import { useEffect, useState } from "react";
import {
  fetchReadings,
  fetchSensors,
  fetchLocations,
  fetchFranchises,
} from "../../services/api";
import SensorChart from "../../components/sensorchart/SensorChart";
import SensorSelector from "../../components/SensorSelector";

function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sensorTypes, setSensorTypes] = useState([]);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [alertConfigs, setAlertConfigs] = useState({});
  const [timeRange, setTimeRange] = useState("7d");

  const sensorNames = [
    ...new Map(
      rawData.map(entry => [
        `${entry.facility}|${entry.sensor_name}|${entry.type}`,
        {
          sensor_name: entry.sensor_name,
          facility: entry.facility,
          type: entry.type
        }
      ])
    ).values()
  ];
  

  useEffect(() => {
    fetchReadings().then(setRawData);
    fetchLocations().then(setLocations);
    fetchSensors().then(data => {
        console.log("Fetched sensors:", data);
        const types = [...new Set(data.map(sensor => sensor.type))];
        console.log("Extracted types:", types);
        setSensorTypes(types);
      });
    fetchFranchises(); // if you want to store them later
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

            const sensorKey = `${sensor.facility}|${sensor.sensor_name}|${sensor.type}`;
            const alertConfig = alertConfigs[sensorKey] || { showAverage: false };

            return (
              <div
                key={`${sensorKey}|${index}`}
                className="col-md-6 col-lg-4"
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
  );
}

export default Dashboard;
