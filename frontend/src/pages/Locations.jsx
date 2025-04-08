import { useEffect, useState } from 'react'
import axios from 'axios'
import SensorChart from '../components/SensorChart'
import './Home.css'


function Locations() {
  const [rawData, setRawData] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSensors, setSelectedSensors] = useState([])
  const [timeRange, setTimeRange] = useState("7d")
const [alertConfigs, setAlertConfigs] = useState({})

const handleAlertConfigUpdate = (key, config) => {
  setAlertConfigs(prev => ({
    ...prev,
    [key]: { ...prev[key], ...config }
  }))
}


  useEffect(() => {
    axios.get('http://localhost:8000/data')
      .then(res => {
        setRawData(res.data)
        const locs = [...new Set(res.data.map(entry => entry.facility))]
        setLocations(locs)
        setSelectedLocation(locs[0])
      })
      .catch(err => console.error("Failed to fetch data:", err))
  }, [])

  const sensorsAtLocation = rawData
    .filter(d => d.facility === selectedLocation)
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
      
          <div className="sensor-grid">
            {Object.values(sensorsAtLocation).map((sensor, index) => (
              <div
              key={`${sensor.facility}|${sensor.sensor_name}|${sensor.type}|${index}`}
              className="sensor-card"
              >
                <SensorChart
                  sensor={sensor}
                  rawData={rawData}
                  timeRange={timeRange}
                  alertConfig={alertConfigs[`${sensor.facility}|${sensor.type}`] || {}}
                  onConfigChange={(config) =>
                    handleAlertConfigUpdate(`${sensor.facility}|${sensor.type}`, config)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )
    }

export default Locations
