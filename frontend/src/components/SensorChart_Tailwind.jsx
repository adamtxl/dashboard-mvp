
// SensorChart.jsx - Tailwind-polished version
// (Chart setup not shown here, assumed registered elsewhere)

function SensorChart({ sensor, rawData, timeRange, alertConfig, onConfigChange }) {
  const chartRef = useRef(null);
  const [showConfig, setShowConfig] = useState(false);
  const [customChartType, setCustomChartType] = useState("");

  if (!sensor?.facility || !sensor.sensor_name || !sensor.type) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
        <p>⚠️ Invalid sensor configuration. Please select a valid sensor.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-200 w-full max-w-4xl mx-auto transition hover:shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {sensor.facility} – {sensor.sensor_name} ({sensor.type})
      </h3>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
          onClick={() => setShowConfig(!showConfig)}
        >
          ⚙️ Configure Alerts
        </button>

        {filteredData.some((d) => d.alert) && (
          <div className="bg-red-500 text-white px-3 py-2 rounded mt-4">
            🚨 ALERT: {sensor.type} value out of range!
          </div>
        )}
      </div>

      {showConfig && (
        <div className="mt-4 space-y-2 border-t border-gray-300 pt-4">
          <label className="block font-medium text-gray-700">
            Low Threshold:
            <input
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              type="number"
              value={alertConfig.low || ""}
              onChange={(e) => onConfigChange({ low: Number(e.target.value) })}
            />
          </label>

          <label className="block font-medium text-gray-700">
            High Threshold:
            <input
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              type="number"
              value={alertConfig.high || ""}
              onChange={(e) => onConfigChange({ high: Number(e.target.value) })}
            />
          </label>

          <label className="block font-medium text-gray-700">
            Alert Email:
            <input
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              type="email"
              value={alertConfig.email || ""}
              onChange={(e) => onConfigChange({ email: e.target.value })}
            />
          </label>

          <label className="block font-medium text-gray-700">
            Chart Type:
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              value={customChartType || "line"}
              onChange={(e) => setCustomChartType(e.target.value)}
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="area">Area</option>
            </select>
          </label>
        </div>
      )}

      <div className="h-[300px] w-full max-w-full mt-6">
        {customChartType === "bar" ? (
          <Bar ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

export default SensorChart;
