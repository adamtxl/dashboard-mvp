import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 border-bottom border-secondary">
      <div className="container-fluid">
        <Link className="navbar-brand text-info fw-bold" to="/">
          ⚡ Sensor Dashboard
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                🏠 Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                📊 Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/locations">
                📍 Locations
              </Link>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-danger"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                🔓 Login/Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
