import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div
      className="home-wrapper text-light py-5"
      style={{
        background: "linear-gradient(to bottom right, #0d1b2a, #1b263b, #415a77)",
        minHeight: "100vh",
      }}
    >
      <div className="container text-center">
        <h1 className="display-4 text-info fw-bold mb-3">
          Welcome to RJ Energy Solutions
        </h1>
        <p className="lead mb-4">
          Monitor, analyze, and optimize your energy usage with real-time sensor
          insights. Predict faults before they happen. Save energy, save money.
        </p>

        <div className="d-flex justify-content-center gap-3 mb-5 flex-wrap">
          <Link to="/dashboard" className="btn btn-lg btn-info">
            🚀 Launch Dashboard
          </Link>
          <Link to="/locations" className="btn btn-lg btn-outline-light">
            📍 View Locations
          </Link>
        </div>

        <hr className="border-secondary my-4" />

        <div className="row text-start">
          <div className="col-md-4 mb-4">
            <h4 className="text-info">📡 Real-Time Monitoring</h4>
            <p>
              View live data from temperature, amperage, and motion sensors. Track
              equipment usage and anomalies with precision.
            </p>
          </div>
          <div className="col-md-4 mb-4">
            <h4 className="text-info">⚠️ Smart Alerts</h4>
            <p>
              Set custom thresholds for sensors and receive alerts when runtime or
              behavior exceeds expected norms.
            </p>
          </div>
          <div className="col-md-4 mb-4">
            <h4 className="text-info">📊 Historical Trends</h4>
            <p>
              Access rich historical data to analyze trends and improve efficiency
              over time. Visualize patterns that impact your energy costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
