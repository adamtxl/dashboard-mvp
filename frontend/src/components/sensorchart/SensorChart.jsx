import { useState, useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';
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
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { normalize } from "../../utils/normalize";


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


function SensorChart({ sensor, rawData, timeRange, alertConfig, onConfigChange, onRemove }) {
  const [showConfig, setShowConfig] = useState(false);
  const [customChartType, setCustomChartType] = useState("");

  const { facility, sensor_id, type } = sensor || {};
  const resolvedChartType = customChartType || chartTypeMap[type] || chartTypeMap.default;

  const filteredData = useMemo(() => {
    console.log("🔍 Raw data length:", rawData?.length);
    if (!sensor || !rawData?.length) {
      console.warn("⚠️ Missing sensor or rawData.");
      return [];
    }

    const nfExpected = normalize(facility);
    const nsExpected = normalize(String(sensor_id));
    const ntExpected = normalize(type);

    console.log("🧪 Sensor Info:", { facility, sensor_id, type });
    console.log("🔧 Normalized Match Targets:", { nfExpected, nsExpected, ntExpected });

    const base = rawData.filter((d, i) => {
      const nf = normalize(d.facility);
      const ns = normalize(String(d.sensor_id));
      const nt = normalize(d.type);

      const facilityMatch = nf === nfExpected;
      const sensorMatch = ns === normalize(String(sensor_id));
      const typeMatch = nt === ntExpected;

      if (!facilityMatch || !sensorMatch || !typeMatch) {
        console.log(`⛔ No Match [${i}]`, {
          rawRecord: d,
          nf, ns, nt,
          facilityMatch, sensorMatch, typeMatch
        });
      } else {
        console.log(`✅ Match [${i}]`, { nf, ns, nt, value: d.value, timestamp: d.timestamp });
      }

      return facilityMatch && sensorMatch && typeMatch;
    });

    console.log("📦 Base matched data:", base.length);

    const cutoff = new Date();
    if (timeRange === "1h") cutoff.setHours(cutoff.getHours() - 1);
    else if (timeRange === "1d") cutoff.setDate(cutoff.getDate() - 1);
    else if (timeRange === "7d") cutoff.setDate(cutoff.getDate() - 7);

    const ranged = timeRange === "all" ? base : base.filter((d) => {
      const ts = new Date(d.timestamp);
      const inRange = ts >= cutoff;
      if (!inRange) {
        console.log("🕒 Excluded due to time:", d.timestamp);
      }
      return inRange;
    });

    const sorted = ranged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log("⏱️ After time filter:", ranged.length);
    console.log("🧪 Final sorted data:", sorted);

    return sorted.map((d) => ({
      ...d,
      alert:
        (alertConfig.low !== undefined && d.value < alertConfig.low) ||
        (alertConfig.high !== undefined && d.value > alertConfig.high),
    }));
  }, [rawData, facility, sensor_id, type, timeRange, alertConfig]);

  const averageValue = useMemo(() => {
    if (!filteredData.length) return null;
    const total = filteredData.reduce((sum, d) => sum + d.value, 0);
    const avg = total / filteredData.length;
    console.log("📊 Calculated average:", avg);
    return avg;
  }, [filteredData]);

  const chartData = useMemo(() => {
    if (["status", "timeline"].includes(resolvedChartType)) {
      console.warn(`⚠️ Chart type "${resolvedChartType}" not supported yet.`);
      return { datasets: [] };
    }

    const datasets = [];

    if (filteredData.length) {
      datasets.push({
        label: type,
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
      });

      datasets.push({
        label: "Alert",
        data: filteredData.filter(d => d.alert).map(d => ({
          x: new Date(d.timestamp),
          y: d.value,
        })),
        borderColor: "red",
        backgroundColor: "red",
        pointRadius: 10,
        pointHoverRadius: 10,
        pointStyle: "star",
        showLine: false,
      });

      if (alertConfig.showAverage && averageValue !== null) {
        datasets.push({
          label: "Average",
          data: filteredData.map((d) => ({
            x: new Date(d.timestamp),
            y: averageValue,
          })),
          borderColor: "orange",
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
        });
      }
    } else {
      console.log("📉 No data available to render.");
    }

    return {
      datasets: datasets.length ? datasets : [{
        label: "No Data",
        data: [],
        backgroundColor: "rgba(255,255,255,0.1)",
      }]
    };
  }, [filteredData, resolvedChartType, type, averageValue, alertConfig]);

  const chartOptions = useMemo(() => ({
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
        title: { display: true, text: "Timestamp" },
        ticks: { autoSkip: true, maxTicksLimit: 10 },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Value" },
      },
    },
  }), []);

  const updateField = (field, value) => {
    onConfigChange({ [field]: value });
  };

  return (
    <div className="card bg-secondary text-white shadow-lg h-100">
      <div className="card-header bg-dark d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          {facility} – {(sensor.display_name || sensor_id)} ({type})
        </h5>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-info" onClick={() => setShowConfig(!showConfig)} title="Configure">
            {showConfig ? "🔙 Back" : "⚙️"}
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onRemove(sensor)} title="Remove">
            ❌
          </button>
        </div>
      </div>

      {!showConfig && (
        <div className="card-body" style={{ height: "300px" }}>
          {resolvedChartType === "bar" ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      )}

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
          <div className="form-check form-switch mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="showAverage"
              checked={alertConfig?.showAverage || false}
              onChange={(e) => updateField("showAverage", e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showAverage">
              Show Average Line
            </label>
          </div>
          <button className="btn btn-success w-100" onClick={() => setShowConfig(false)}>
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
