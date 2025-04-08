import { useEffect, useState } from 'react'
import axios from 'axios'
import SensorChart from '../components/SensorChart'

function Locations() {
  const [rawData, setRawData] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')

  useEffect(() => {
    axios.get('http://localhost:8000/data')
      .then(res => {
        setRawData(res.data)
        const locs = [...new Set(res.data.map(entry => entry.location))]
        setLocations(locs)
        setSelectedLocation(locs[0])
      })
      .catch(err => console.error("Failed to fetch data:", err))
  }, [])

  const sensorsAtLocation = rawData
    .filter(d => d.location === selectedLocation)
    .reduce((acc, entry) => {
      const key = `${entry.type}|${entry.sensor_id || 'default'}`
      if (!acc[key]) acc[key] = entry
      return acc
    }, {})

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Location Overview</h2>

      <label>
        Select Location:&nbsp;
        <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: '2rem' }}>
        {Object.values(sensorsAtLocation).map((sensor, index) => (
          <SensorChart
            key={index}
            sensor={{ location: selectedLocation, type: sensor.type }}
            rawData={rawData}
            timeRange="7d"
            alertConfig={{}}
            onConfigChange={() => {}}
          />
        ))}
      </div>
    </div>
  )
}

export default Locations
