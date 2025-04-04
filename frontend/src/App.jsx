import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function App() {
  const [rawData, setRawData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [locations, setLocations] = useState([])
  const [sensorTypes, setSensorTypes] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    axios.get('http://localhost:8000/data')
      .then(res => {
        setRawData(res.data)

        // Get distinct locations and types
        const locs = [...new Set(res.data.map(entry => entry.location))]
        const types = [...new Set(res.data.map(entry => entry.type))]
        setLocations(locs)
        setSensorTypes(types)

        // Default selections
        setSelectedLocation(locs[0])
        setSelectedType(types[0])
      })
      .catch(err => console.error("Failed to fetch data:", err))
  }, [])

  useEffect(() => {
    // Filter by location and type
    const filtered = rawData
      .filter(d => d.location === selectedLocation && d.type === selectedType)
      .map(d => ({
        timestamp: d.timestamp,
        value: d.value
      }))
    setFilteredData(filtered)
  }, [rawData, selectedLocation, selectedType])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sensor Dashboard</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Location:&nbsp;
          <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </label>

        &nbsp;&nbsp;

        <label>
          Sensor Type:&nbsp;
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            {sensorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" name={`${selectedType}`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default App
