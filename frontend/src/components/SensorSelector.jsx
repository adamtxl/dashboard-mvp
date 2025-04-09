import { useEffect, useState } from 'react'

function SensorSelector({ locations, sensorTypes, sensorNames, onAddSensor }) {
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [sensorName, setSensorName] = useState('')

  useEffect(() => {
    if (locations.length > 0 && !location) {
      setLocation(locations[0])
    }
    if (sensorTypes.length > 0 && !type) {
      setType(sensorTypes[0])
    }
    if (sensorNames.length > 0 && !sensorName) {
      setSensorName(sensorNames[0])
    }
  }, [locations, sensorTypes, sensorNames])

  const handleAdd = () => {
    if (location && type && sensorName) {
      onAddSensor({
        facility: location,
        type,
        sensor_name: sensorName
      })
    } else {
      alert("Please select a facility, sensor type, and sensor name.")
    }
  }

  return (
    <div style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
      <h2>Add a Sensor</h2>

      <label>
        Facility:&nbsp;
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

      <label>
        Sensor Name:&nbsp;
        <select value={sensorName} onChange={e => setSensorName(e.target.value)}>
          {sensorNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>

      &nbsp;&nbsp;

      <button onClick={handleAdd}>➕ Add Sensor</button>
    </div>
  )
}

export default SensorSelector
