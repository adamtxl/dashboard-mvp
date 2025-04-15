import { useEffect, useState, useMemo } from 'react'

function SensorSelector({ locations, sensorTypes, sensorNames, onAddSensor }) {
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [sensorName, setSensorName] = useState('')

  // Dynamically filter sensor names based on selected location + type
  const filteredSensorNames = useMemo(() => {
    return sensorNames.filter(nameObj =>
      (!location || nameObj.facility === location) &&
      (!type || nameObj.type === type)
    ).map(obj => obj.sensor_name)
  }, [sensorNames, location, type])

  useEffect(() => {
    if (locations.length > 0 && !location) {
      setLocation(locations[0])
    }
    if (sensorTypes.length > 0 && !type) {
      setType(sensorTypes[0])
    }
  }, [locations, sensorTypes])

  useEffect(() => {
    if (filteredSensorNames.length > 0 && !sensorName) {
      setSensorName(filteredSensorNames[0])
    }
  }, [filteredSensorNames])

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
        <select value={location} onChange={e => { setLocation(e.target.value); setSensorName('') }}>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </label>

      &nbsp;&nbsp;

      <label>
        Sensor Type:&nbsp;
        <select value={type} onChange={e => { setType(e.target.value); setSensorName('') }}>
          {sensorTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      &nbsp;&nbsp;

      <label>
        Sensor Name:&nbsp;
        <select value={sensorName} onChange={e => setSensorName(e.target.value)}>
          {filteredSensorNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>

      &nbsp;&nbsp;

      <button onClick={handleAdd}>➕ Add Widget</button>
    </div>
  )
}

export default SensorSelector;
