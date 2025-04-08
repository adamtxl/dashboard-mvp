import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Locations from './pages/Locations'

function App() {
  return (
    <Router>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1>Sensor Dashboard</h1>
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/">🏠 Home</Link> | <Link to="/locations">📍 Locations</Link>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/locations" element={<Locations />} />
      </Routes>
    </Router>
  )
}

export default App
