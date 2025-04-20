import { useState, useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  TimeScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  LineElement,
  BarElement,
  TimeScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  annotationPlugin
);

function SensorChart({
  sensor,
  rawData,
  timeRange,
  alertConfig,
  onConfigChange,
  onRemove,
}) {
  const [showConfig, setShowConfig] = useState(false);
  const [customChartType, setCustomChartType] = useState("");

  const chartTypeMap = {
    temperature: "line",
    humidity: "bar",
    pressure: "bar",
    amperage: "bar",
    voltage: "line",
    co2: "line",
    flow_rate: "line",
    vibration: "area",
    boolean: "status",
    runtime: "timeline",
    default: "line",
  };

  const { facility, sensor_name, type } = sensor || {};
  const resolvedChartType =
    customChartType || chartTypeMap[type] || chartTypeMap.default;

  const filteredData = useMemo(() => {
    const base = rawData.filter(
      (d) =>
        d.facility === facility &&
        d.sensor_name === sensor_name &&
        d.type === type
    );

    const cutoff = new Date();
    if (timeRange === "1h") cutoff.setHours(cutoff.getHours() - 1);
    else if (timeRange === "1d") cutoff.setDate(cutoff.getDate() - 1);
    else if (timeRange === "7d") cutoff.setDate(cutoff.getDate() - 7);

    const ranged =
      timeRange === "all"
        ? base
        : base.filter((d) => new Date(d.timestamp) >= cutoff);
    const sorted = ranged.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    return sorted.map((d) => {
      const isAlert =
        (alertConfig.low !== undefined && d.value < alertConfig.low) ||
        (alertConfig.high !== undefined && d.value > alertConfig.high);
      return { ...d, alert: isAlert };
    });
  }, [rawData, facility, sensor_name, type, alertConfig, timeRange]);

  const chartData = useMemo(() => {
    return {
      datasets: filteredData.length
        ? [
            {
              label: `${type}`,
              data: filteredData.map((d) => ({
                x: new Date(d.timestamp),
                y: d.value,
              })),
              borderColor: "#36a2eb",
              backgroundColor:
                resolvedChartType === "bar"
                  ? "#36a2eb"
                  : resolvedChartType === "area"
                  ? "rgba(54, 162, 235, 0.2)"
                  : "transparent",
              tension: resolvedChartType === "area" ? 0.4 : 0,
              fill: resolvedChartType === "area",
            },
            {
              label: "Alert",
              data: filteredData
                .filter((d) => d.alert)
                .map((d) => ({
                  x: new Date(d.timestamp),
                  y: d.value,
                })),
              borderColor: "red",
              backgroundColor: "red",
              pointRadius: 10,
              pointHoverRadius: 10,
              pointStyle: "star",
              showLine: false,
            },
          ]
        : [],
    };
  }, [filteredData, resolvedChartType, type]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          tooltipFormat: "MMM dd, yyyy HH:mm",
        },
        title: {
          display: true,
          text: "Timestamp",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Value",
        },
      },
    },
  };

  const updateField = (field, value) => {
    onConfigChange({ [field]: value });
  };

  return (
    <div className="card shadow border border-primary bg-dark text-white mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          {facility} – {sensor_name} ({type})
        </h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => setShowConfig(!showConfig)}
            title="Configure"
          >
            {showConfig ? "🔙 Back" : "⚙️"}
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onRemove?.(sensor)}
            title="Remove"
          >
            ❌
          </button>
        </div>
      </div>

      <div
        className={`card-body ${showConfig ? "d-none" : ""}`}
        style={{ height: "300px" }}
      >
        {resolvedChartType === "bar" ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {showConfig && (
        <div className="card-body bg-secondary text-white animate__animated animate__fadeIn">
          <div className="mb-3">
            <label className="form-label">Low Threshold:</label>
            <input
              type="number"
              className="form-control"
              value={alertConfig.low || ""}
              onChange={(e) => updateField("low", Number(e.target.value))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">High Threshold:</label>
            <input
              type="number"
              className="form-control"
              value={alertConfig.high || ""}
              onChange={(e) => updateField("high", Number(e.target.value))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Alert Email:</label>
            <input
              type="email"
              className="form-control"
              value={alertConfig.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Chart Type:</label>
            <select
              className="form-select"
              value={customChartType || chartTypeMap[type]}
              onChange={(e) => setCustomChartType(e.target.value)}
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="area">Area</option>
            </select>
          </div>
          <button
            className="btn btn-success w-100"
            onClick={() => setShowConfig(false)}
          >
            💾 Save & Close
          </button>
        </div>
      )}

      {filteredData.some((d) => d.alert) && !showConfig && (
        <div className="alert alert-danger m-3">
          🚨 ALERT: {type} value out of range at {facility}
        </div>
      )}
    </div>
  );
}

export default SensorChart;
