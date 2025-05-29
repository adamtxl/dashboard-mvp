import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Locations from "./pages/Locations/Locations";
import Dashboard from "./pages/Dashboard/Dashboard";
import LoginPage from "./pages/LoginPage/LoginPage";
import NavBar from "./components/NavBar/NavBar";

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("✅ API_BASE_URL is:", API_BASE_URL);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-black">
        <NavBar />

        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

        <footer className="bg-dark text-secondary text-center py-3 border-top border-secondary">
          <div>
            <small>
              © {new Date().getFullYear()} RJ Energy Solutions · All rights
              reserved ·{" "}
              <a
                href="https://rjenergysolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-info text-decoration-none"
              >
                Visit Website
              </a>
            </small>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
