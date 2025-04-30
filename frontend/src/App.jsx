import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Locations from './pages/Locations'



function App() {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-black">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 border-bottom border-secondary">
          <div className="container-fluid">
            <Link className="navbar-brand text-info fw-bold" to="/">⚡ Sensor Dashboard</Link>

            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">🏠 Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/locations">📍 Locations</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/locations" element={<Locations />} />
          </Routes>
        </div>

        <footer className="bg-dark text-secondary text-center py-3 border-top border-secondary">
          <div>
            <small>
              © {new Date().getFullYear()} RJ Energy Solutions · All rights reserved ·{' '}
              <a href="https://rjenergysolutions.com" target="_blank" rel="noopener noreferrer" className="text-info text-decoration-none">
                Visit Website
              </a>
            </small>
          </div>
        </footer>
      </div>
    </Router>
  )
}


export default App
