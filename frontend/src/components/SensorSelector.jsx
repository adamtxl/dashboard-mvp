// src/components/SensorSelector.jsx

import { useState } from 'react'

function SensorSelector({ locations, sensorTypes, onAddSensor }) {
  const [location, setLocation] = useState(locations[0] || '')
  const [type, setType] = useState(sensorTypes[0] || '')

  const handleAdd = () => {
    if (location && type) {
      onAddSensor({ location, type })
    }
  }

  return (
    <div style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
      <h2>Add a Sensor</h2>
      <label>
        Location:&nbsp;
        <select value={location} onChange={e => setLocation(e.target.value)}>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </label>

      &nbsp;&nbsp;

      <label>
        Sensor Type:&nbsp;
        <select value={type} onChange={e => setType(e.target.value)}>
          {sensorTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      &nbsp;&nbsp;

      <button onClick={handleAdd}>➕ Add Sensor</button>
    </div>
  )
}

export default SensorSelector
