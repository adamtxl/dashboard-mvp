import { useEffect, useState } from 'react'


function SensorSelector({ locations, sensorTypes, onAddSensor }) {
    const [location, setLocation] = useState('')
    const [type, setType] = useState('')
  
    // Auto-select first option when data is loaded
    useEffect(() => {
      if (locations.length > 0 && !location) {
        setLocation(locations[0])
      }
      if (sensorTypes.length > 0 && !type) {
        setType(sensorTypes[0])
      }
    }, [locations, sensorTypes])
  
    const handleAdd = () => {
      if (location && type) {
        onAddSensor({ location, type })
      } else {
        alert("Please select a location and sensor type.")
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
