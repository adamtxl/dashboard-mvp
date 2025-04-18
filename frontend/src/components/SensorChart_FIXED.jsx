import { useState, useMemo, useRef, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";

function SensorChart({ sensor, rawData, timeRange, alertConfig, onConfigChange }) {
  const chartRef = useRef(null);
  const [showConfig, setShowConfig] = useState(false);
  const [customChartType, setCustomChartType] = useState("");

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);
  

  if (!sensor?.facility || !sensor.sensor_name || !sensor.type) {
    return (
      <div style={{ padding: "1rem", border: "1px solid #ccc", marginBottom: "1rem" }}>
        <p>⚠️ Invalid sensor configuration. Please select a valid sensor.</p>
      </div>
    );
  }

  const { facility, sensor_name, type } = sensor;

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

    const ranged = timeRange === "all" ? base : base.filter((d) => new Date(d.timestamp) >= cutoff);

    const sorted = ranged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return sorted.map((d) => {
      const isAlert =
        (alertConfig.low !== undefined && d.value < alertConfig.low) ||
        (alertConfig.high !== undefined && d.value > alertConfig.high);
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

  const chartData = useMemo(() => {
    const hasData = filteredData.length > 0;

    return {
      datasets: hasData
        ? [
            {
              label: `${type}`,
              data: filteredData.map((d) => ({
                x: new Date(d.timestamp),
                y: d.value,
              })),
              borderColor: "#8884d8",
              backgroundColor:
                resolvedChartType === "bar"
                  ? "#8884d8"
                  : resolvedChartType === "area"
                  ? "rgba(136, 132, 216, 0.2)"
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
              pointRadius: 16,
              pointHoverRadius: 10,
              pointStyle: "star",
              tension: 0.4,
              showLine: false,
            },
          ]
        : [],
    };
  }, [filteredData, resolvedChartType, type]);

  const chartOptions = useMemo(() => {
    const annotations =
      type === "amperage"
        ? Object.fromEntries(
            runtimeSegments.map((segment, i) => [
              `runtime-${i}`,
              {
                type: "box",
                xMin: segment.start.getTime(),
                xMax: segment.end.getTime(),
                backgroundColor: "rgba(255, 99, 132, 0.25)",
                borderWidth: 0,
                label: {
                  content: `${segment.duration}s`,
                  enabled: true,
                  position: "start",
                  color: "#fff",
                  backgroundColor: "rgba(255,0,0,0.6)",
                },
              },
            ])
          )
        : {};

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: { mode: "index", intersect: false },
        // annotation: { annotations },  // TEMP removed for debug

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
  }, [runtimeSegments, type]);

  const updateField = (field, value) => {
    onConfigChange({ [field]: value });
  };

  return (
    <div
      style={{
        marginBottom: "2rem",
        padding: "1rem",
        border: "1px solid #ddd",
        width: "100%",
        boxSizing: "border-box",
        maxWidth: "100%",
        overflowX: "auto",
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

      <div style={{ height: 300, width: "100%", maxWidth: "100%" }}>
        {resolvedChartType === "bar" ? (
          <Bar
          key={`bar-${facility}-${sensor_name}-${type}-${timeRange}`}
            ref={chartRef}
  data={chartData}
  options={chartOptions}
/>
        ) : (
          <Line
          key={`line-${facility}-${sensor_name}-${type}-${timeRange}`}
                      ref={chartRef}
            data={chartData}
            options={chartOptions}
          />
        )}
      </div>
    </div>
  );
}

export default SensorChart;
