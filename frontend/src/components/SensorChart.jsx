// src/components/SensorChart.jsx

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function SensorChart({ sensor, rawData, timeRange, alertConfig, onConfigChange }) {
  const { location, type } = sensor
  const [showConfig, setShowConfig] = useState(false)

  const key = `${location}|${type}`

  const filteredData = useMemo(() => {
    const base = rawData.filter(d => d.location === location && d.type === type)

    const cutoff = new Date()
    if (timeRange === "1h") cutoff.setHours(cutoff.getHours() - 1)
    else if (timeRange === "1d") cutoff.setDate(cutoff.getDate() - 1)
    else if (timeRange === "7d") cutoff.setDate(cutoff.getDate() - 7)

    const ranged = timeRange === "all" ? base : base.filter(d => new Date(d.timestamp) >= cutoff)

    return ranged.map(d => ({
      ...d,
      alert: (alertConfig.low && d.value < alertConfig.low) ||
             (alertConfig.high && d.value > alertConfig.high)
    }))
  }, [rawData, location, type, alertConfig, timeRange])

  const updateField = (field, value) => {
    onConfigChange({ [field]: value })
  }

  return (
    <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
      <h3>{location} – {type}</h3>

      <button onClick={() => setShowConfig(!showConfig)}>⚙️ Configure Alerts</button>

      {showConfig && (
        <div style={{ marginTop: '1rem' }}>
          <label>
            Low Threshold:
            <input
              type="number"
              value={alertConfig.low || ''}
              onChange={e => updateField('low', Number(e.target.value))}
            />
          </label><br />
          <label>
            High Threshold:
            <input
              type="number"
              value={alertConfig.high || ''}
              onChange={e => updateField('high', Number(e.target.value))}
            />
          </label><br />
          <label>
            Alert Email:
            <input
              type="email"
              value={alertConfig.email || ''}
              onChange={e => updateField('email', e.target.value)}
            />
          </label>
        </div>
      )}

      {filteredData.some(d => d.alert) && (
        <div style={{ marginTop: '1rem', backgroundColor: 'red', color: 'white', padding: '0.5rem' }}>
          🚨 ALERT: {type} value out of range at {location}
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" name={type} />
          {(alertConfig.low || alertConfig.high) && (
            <Line type="monotone" dataKey={d => d.alert ? d.value : null} stroke="red" dot />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SensorChart
