import { useEffect, useState } from 'react'
import axios from 'axios'
import SensorChart from '../components/SensorChart'
import SensorSelector from '../components/SensorSelector'
import './Home.css'

function Home() {
  const [rawData, setRawData] = useState([])
  const [locations, setLocations] = useState([])
  const [sensorTypes, setSensorTypes] = useState([])
  const [selectedSensors, setSelectedSensors] = useState([])
  const [alertConfigs, setAlertConfigs] = useState({})
  const [timeRange, setTimeRange] = useState("7d")
  const sensorNames = [...new Set(rawData.map(entry => entry.sensor_name))]
  const handleSensorRemove = (sensorToRemove) => {
    setSelectedSensors(prev =>
      prev.filter(sensor =>
        !(sensor.facility === sensorToRemove.facility &&
          sensor.sensor_name === sensorToRemove.sensor_name &&
          sensor.type === sensorToRemove.type)
      )
    )
  }
  


  useEffect(() => {
    axios.get('http://localhost:8000/data')
      .then(res => {
        setRawData(res.data)

        const locs = [...new Set(res.data.map(entry => entry.facility))]
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

  return (
    <div style={{ padding: '.5rem' }}>


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
  sensorNames={sensorNames}
  onAddSensor={handleSensorAdd}
/>


<div className="sensor-grid">
  {selectedSensors.map((sensor, index) => (
    <div
      key={`${sensor.facility}|${sensor.sensor_name}|${sensor.type}|${index}`}
      className="sensor-card"
    >
      <button
        onClick={() => handleSensorRemove(sensor)}
        style={{
          float: 'right',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: '#888'
        }}
        title="Remove Widget"
      >
        ❌
      </button>

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

export default Home
