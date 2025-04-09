import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function SensorChart({
  sensor,
  rawData,
  timeRange,
  alertConfig,
  onConfigChange,
}) {
  const { facility, sensor_name, type } = sensor;
  const [showConfig, setShowConfig] = useState(false);
  const key = `${facility}|${sensor_name}|${type}`;

  const filteredData = useMemo(() => {
    const base = rawData.filter(
      (d) =>
        d.facility === facility &&
        d.sensor_name === sensor_name &&
        d.type === type
    );
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

    const cutoff = new Date();
    if (timeRange === "1h") cutoff.setHours(cutoff.getHours() - 1);
    else if (timeRange === "1d") cutoff.setDate(cutoff.getDate() - 1);
    else if (timeRange === "7d") cutoff.setDate(cutoff.getDate() - 7);

    const ranged =
      timeRange === "all"
        ? base
        : base.filter((d) => new Date(d.timestamp) >= cutoff);

    return ranged.map((d) => {
      const isAlert =
        (alertConfig.low && d.value < alertConfig.low) ||
        (alertConfig.high && d.value > alertConfig.high);
      return {
        ...d,
        alert: isAlert,
      };
    });
  }, [rawData, facility, type, sensor_name, alertConfig, timeRange]);

  const updateField = (field, value) => {
    onConfigChange({ [field]: value });
  };

  const chartData = {
    labels: filteredData.map((d) => d.timestamp),
    datasets: [
      {
        label: `${type}`,
        data: filteredData.map((d) => d.value),
        borderColor: "#8884d8",
        backgroundColor: "#8884d8",
        tension: 0.4,
      },
      {
        label: "Alert",
        data: filteredData.map((d) => (d.alert ? d.value : null)),
        borderColor: "red",
        backgroundColor: "red",
        pointRadius: 16,
        pointHoverRadius: 10,
        pointStyle: "star",
        tension: 0.4,
        showLine: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div
      style={{
        marginBottom: "2rem",
        padding: "1rem",
        border: "1px solid #ddd",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3>
        {facility} – {sensor_name} ({type})
      </h3>

      <button onClick={() => setShowConfig(!showConfig)}>
        ⚙️ Configure Alerts
      </button>

      {showConfig && (
        <div style={{ marginTop: "1rem" }}>
          <label>
            Low Threshold:
            <input
              type="number"
              value={alertConfig.low || ""}
              onChange={(e) => updateField("low", Number(e.target.value))}
            />
          </label>
          <br />
          <label>
            High Threshold:
            <input
              type="number"
              value={alertConfig.high || ""}
              onChange={(e) => updateField("high", Number(e.target.value))}
            />
          </label>
          <br />
          <label>
            Alert Email:
            <input
              type="email"
              value={alertConfig.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </label>
          <br />
          <button
            onClick={() => setShowConfig(false)}
            style={{ marginTop: "0.5rem" }}
          >
            💾 Save & Close
          </button>
        </div>
      )}

      {filteredData.some((d) => d.alert) && (
        <div
          style={{
            marginTop: "1rem",
            backgroundColor: "red",
            color: "white",
            padding: "0.5rem",
          }}
        >
          🚨 ALERT: {type} value out of range at {facility}
        </div>
      )}

      {filteredData.length > 0 ? (
        <div style={{ height: 300, width: "100%" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p>
          No data found for {facility} – {type} in selected timeframe.
        </p>
      )}
    </div>
  );
}

export default SensorChart;
