import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home/Home";
import Locations from "./pages/Locations/Locations";
import Dashboard from "./pages/Dashboard/Dashboard";
import LoginPage from "./pages/LoginPage/LoginPage";
import NavBar from "./components/NavBar/NavBar";
import './themes/theme.css';
import './themes/theme-classes.css';

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("✅ API_BASE_URL is:", API_BASE_URL);

useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark-mode');
    }
  }
}, []);

const toggleTheme = () => {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

  return (
    

    <Router>
      <div className="d-flex flex-column min-vh-100 themed-gradient" style={{ backgroundColor: 'var(--bg-color)' }}>
        <NavBar />
        <div className="p-3 text-end">
          <button onClick={toggleTheme} className="btn btn-outline-secondary">
            🌓 Toggle Theme
          </button>
        </div>
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

        <footer
          className="text-center py-3 border-top"
          style={{
            backgroundColor: 'var(--card-color)',
            color: 'var(--text-color)',
            borderColor: 'var(--border-color)',
          }}
        >
          <small>
            © {new Date().getFullYear()} RJ Energy Solutions · All rights reserved ·{' '}
            <a
              href="https://rjenergysolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-color)' }}
              className="text-decoration-none"
            >
              Visit Website
            </a>
          </small>
        </footer>
      </div>
    </Router>
  
  );
}
export default App;
