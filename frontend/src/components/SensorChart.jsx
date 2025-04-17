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

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
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
  const key = `${facility}|${sensor_name}|${type}`;
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
  }, [rawData, facility, type, sensor_name, alertConfig, timeRange]);

  const updateField = (field, value) => {
    onConfigChange({ [field]: value });
  };

  const chartData = (canvas) => {
    const ctx = canvas?.getContext("2d");
    let gradientFill = "rgba(136, 132, 216, 0.2)";
  
    if (ctx && resolvedChartType === "area") {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "rgba(136, 132, 216, 0.5)");
      gradient.addColorStop(1, "rgba(136, 132, 216, 0.05)");
      gradientFill = gradient;
    }
  
    const hasData = filteredData.length > 0;
  
    return {
      labels: hasData ? filteredData.map((d) => d.timestamp) : ["No Data"],
      datasets: [
        {
          label: `${type}`,
          data: hasData ? filteredData.map((d) => d.value) : [0],
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
          data: hasData ? filteredData.map((d) => (d.alert ? d.value : null)) : [null],
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
  
    console.log("Chart Data:", chartData(document.createElement("canvas")));

    return {
      labels: filteredData.length ? filteredData.map(d => d.timestamp) : ["No Data"],
      datasets: [
        {
          label: `${type}`,
          data: filteredData.length ? filteredData.map(d => d.value) : [0],
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
          data: filteredData.length ? filteredData.map((d) => d.alert ? d.value : null) : [null],
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
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Timestamp",
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

      <button onClick={() => setShowConfig(!showConfig)}>⚙️ Configure Alerts</button>

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
          <label>
            Chart Type:
            <select
              value={customChartType || chartTypeMap[type]}
              onChange={(e) => setCustomChartType(e.target.value)}
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="area">Area</option>
            </select>
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
          {resolvedChartType === "bar" ? (
            <Bar ref={chartRef} data={(canvas) => chartData(canvas)} options={chartOptions} />
          ) : (
            <Line
              ref={chartRef}
              data={(canvas) => chartData(canvas ?? document.createElement("canvas"))}
              options={chartOptions}
            />
          )}
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
