
import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import SensorChart from '../components/sensorchart/SensorChart'
import './Home.css'

function Locations() {
  const [rawData, setRawData] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [timeRange, setTimeRange] = useState("7d")
  const [alertConfigs, setAlertConfigs] = useState({})

  useEffect(() => {
    axios.get("https://sensor-backend.fly.dev/data")
      .then(res => {
        setRawData(res.data)
        const locs = [...new Set(res.data.map(entry => entry.facility))]
        setLocations(locs)
        if (locs.length > 0) setSelectedLocation(locs[0])
      })
      .catch(err => console.error("Failed to fetch data:", err))
  }, [])

  const sensorTypes = useMemo(() => {
    return [...new Set(rawData.map(entry => entry.type))]
  }, [rawData])

  const handleAlertConfigUpdate = (key, config) => {
    setAlertConfigs(prev => ({
      ...prev,
      [key]: { ...prev[key], ...config }
    }))
  }

  const sensorsAtLocation = useMemo(() => {
    return rawData
      .filter(d => d.facility === selectedLocation)
      .filter(d => selectedType === 'all' || d.type === selectedType)
      .reduce((acc, entry) => {
        const key = `${entry.type}|${entry.sensor_id || 'default'}`
        if (!acc[key]) acc[key] = entry
        return acc
      }, {})
  }, [rawData, selectedLocation, selectedType])

  return (
    <div className="bg-dark text-light py-5 px-3 min-vh-100" style={{
      background: 'linear-gradient(to bottom right, #0d1b2a, #1b263b, #415a77)',
    }}>
      <div className="container">
        <h2 className="text-info mb-4">Location Overview</h2>

        <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
          <label className="form-label mb-0 text-white">
            Location:
            <select
              className="form-select bg-secondary text-white border-0 mt-1"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </label>

          <label className="form-label mb-0 text-white">
            Sensor Type:
            <select
              className="form-select bg-secondary text-white border-0 mt-1"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {sensorTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="form-label mb-0 text-white">
            Time Range:
            <select
              className="form-select bg-secondary text-white border-0 mt-1"
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="all">All Time</option>
            </select>
          </label>
        </div>

        <div className="sensor-grid">
          {Object.values(sensorsAtLocation).length === 0 ? (
            <div className="text-muted">No sensors found for this filter.</div>
          ) : (
            Object.values(sensorsAtLocation).map((sensor, index) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Locations