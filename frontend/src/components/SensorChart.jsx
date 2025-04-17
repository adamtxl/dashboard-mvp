import { useState, useMemo, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  annotationPlugin
);

function SensorChart({ sensor, rawData, timeRange, alertConfig, onConfigChange }) {
  if (!sensor || !sensor.facility || !sensor.sensor_name || !sensor.type) {
    return (
      <div style={{ padding: "1rem", border: "1px solid #ccc", marginBottom: "1rem" }}>
        <p>⚠️ Invalid sensor configuration. Please select a valid sensor.</p>
      </div>
    );
  }

  const { facility, sensor_name, type } = sensor;
  const [showConfig, setShowConfig] = useState(false);
  const [customChartType, setCustomChartType] = useState("");
  const chartRef = useRef(null);

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

  const resolvedChartType = customChartType || chartTypeMap[type] || chartTypeMap.default;

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

    const ranged = timeRange === "all"
      ? base
      : base.filter((d) => new Date(d.timestamp) >= cutoff);

    return ranged.map((d) => {
      const isAlert =
        (alertConfig.low && d.value < alertConfig.low) ||
        (alertConfig.high && d.value > alertConfig.high);
      return { ...d, alert: isAlert };
    });
  }, [rawData, facility, sensor_name, type, alertConfig, timeRange]);

  const runtimeSegments = useMemo(() => {
    if (type !== "amperage") return [];

    const segments = [];
    let start = null;

    for (let i = 0; i < filteredData.length; i++) {
      const point = filteredData[i];
      const isOn = point.value > 0;
      const time = new Date(point.timestamp);

      if (isOn && !start) {
        start = time;
      } else if (!isOn && start) {
        const duration = (time - start) / 1000;
        if (duration > 20) {
          segments.push({ start, end: time, duration: Math.round(duration) });
        }
        start = null;
      }
    }

    if (start) {
      const end = new Date(filteredData[filteredData.length - 1].timestamp);
      const duration = (end - start) / 1000;
      if (duration > 20) {
        segments.push({ start, end, duration: Math.round(duration) });
      }
    }

    return segments;
  }, [filteredData, type]);

  const chartData = (canvas) => {
    const ctx = canvas?.getContext("2d");

    let gradientFill = "rgba(136, 132, 216, 0.2)";
    if (ctx && resolvedChartType === "area") {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "rgba(136, 132, 216, 0.5)");
      gradient.addColorStop(1, "rgba(136, 132, 216, 0.05)");
      gradientFill = gradient;
    }

    if (!filteredData.length) {
      return {
        labels: [],
        datasets: [{
          label: "No data",
          data: [],
        }],
      };
    }

    return {
      labels: filteredData.map((d) => d.timestamp),
      datasets: [
        {
          label: `${type}`,
          data: filteredData.map((d) => d.value),
          borderColor: "#8884d8",
          backgroundColor:
            resolvedChartType === "bar"
              ? "#8884d8"
              : resolvedChartType === "area"
              ? gradientFill
              : "transparent",
          tension: resolvedChartType === "area" ? 0.4 : 0,
          fill: resolvedChartType === "area",
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
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
      annotation: {
        annotations: runtimeSegments.map((segment) => ({
          type: "box",
          xMin: segment.start.toISOString(),
          xMax: segment.end.toISOString(),
          backgroundColor: "rgba(255, 99, 132, 0.25)",
          borderWidth: 0,
          label: {
            content: `${segment.duration}s`,
            enabled: true,
            position: "start",
            color: "#fff",
            backgroundColor: "rgba(255,0,0,0.6)",
            callout: { display: false }, // Safe version
          },
        })),
      },
    },
    scales: {
      x: {
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
    <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" }}>
      <h3>{facility} – {sensor_name} ({type})</h3>

      <button onClick={() => setShowConfig(!showConfig)}>⚙️ Configure Alerts</button>

      {showConfig && (
        <div style={{ marginTop: "1rem" }}>
          <label>
            Low Threshold:
            <input type="number" value={alertConfig.low || ""} onChange={(e) => updateField("low", Number(e.target.value))} />
          </label>
          <br />
          <label>
            High Threshold:
            <input type="number" value={alertConfig.high || ""} onChange={(e) => updateField("high", Number(e.target.value))} />
          </label>
          <br />
          <label>
            Alert Email:
            <input type="email" value={alertConfig.email || ""} onChange={(e) => updateField("email", e.target.value)} />
          </label>
          <br />
          <label>
            Chart Type:
            <select value={customChartType || chartTypeMap[type]} onChange={(e) => setCustomChartType(e.target.value)}>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="area">Area</option>
            </select>
          </label>
          <br />
          <button onClick={() => setShowConfig(false)} style={{ marginTop: "0.5rem" }}>
            💾 Save & Close
          </button>
        </div>
      )}

      {filteredData.some((d) => d.alert) && (
        <div style={{ marginTop: "1rem", backgroundColor: "red", color: "white", padding: "0.5rem" }}>
          🚨 ALERT: {type} value out of range at {facility}
        </div>
      )}

      <div style={{ height: 300, width: "100%" }}>
        {resolvedChartType === "bar" ? (
          <Bar ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

export default SensorChart;
