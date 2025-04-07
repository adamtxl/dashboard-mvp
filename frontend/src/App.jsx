import { useEffect, useState } from 'react'
import axios from 'axios'
import SensorChart from './components/SensorChart'
import SensorSelector from './components/SensorSelector'


function App() {
  const [rawData, setRawData] = useState([])
  const [locations, setLocations] = useState([])
  const [sensorTypes, setSensorTypes] = useState([])
  const [selectedSensors, setSelectedSensors] = useState([])
  const [alertConfigs, setAlertConfigs] = useState({})
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    axios.get('http://localhost:8000/data')
      .then(res => {
        setRawData(res.data)

        const locs = [...new Set(res.data.map(entry => entry.location))]
        const types = [...new Set(res.data.map(entry => entry.type))]
        setLocations(locs)
        setSensorTypes(types)
      })
      .catch(err => console.error("Failed to fetch data:", err))
  }, [])

  
  const handleSensorAdd = (sensor) => {
    setSelectedSensors(prev => [...prev, sensor])
  }

  const handleAlertConfigUpdate = (key, config) => {
    setAlertConfigs(prev => ({
      ...prev,
      [key]: { ...prev[key], ...config }
    }))
  }
  console.log("🧪 selectedSensors:", selectedSensors)


  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sensor Dashboard</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>Time Range:&nbsp;
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="1h">Last Hour</option>
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>
        </label>
      </div>

      <SensorSelector
        locations={locations}
        sensorTypes={sensorTypes}
        onAddSensor={handleSensorAdd}
      />

      <div>
        {selectedSensors.map((sensor, index) => (
          <SensorChart
            key={`${sensor.location}|${sensor.type}|${index}`}
            sensor={sensor}
            rawData={rawData}
            timeRange={timeRange}
            alertConfig={alertConfigs[`${sensor.location}|${sensor.type}`] || {}}
            onConfigChange={(config) =>
              handleAlertConfigUpdate(`${sensor.location}|${sensor.type}`, config)
            }
          />
        ))}
      </div>
    </div>
  )
}

export default App
