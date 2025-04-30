import { useEffect, useState, useMemo } from "react";

function SensorSelector({ locations, sensorTypes, sensorNames, onAddSensor }) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [sensorName, setSensorName] = useState("");

  // Filter sensor names based on selected location and type
  const filteredSensorNames = useMemo(() => {
    return sensorNames
      .filter(
        (obj) =>
          (!location || obj.facility === location) &&
          (!type || obj.type === type)
      )
      .reduce((acc, obj) => {
        if (!acc.includes(obj.sensor_name)) acc.push(obj.sensor_name);
        return acc;
      }, []);
  }, [sensorNames, location, type]);

  useEffect(() => {
    if (locations.length > 0 && !location) setLocation(locations[0]);
    if (sensorTypes.length > 0 && !type) setType(sensorTypes[0]);
  }, [locations, sensorTypes]);

  useEffect(() => {
    if (filteredSensorNames.length > 0) {
      setSensorName(filteredSensorNames[0]);
    } else {
      setSensorName("");
    }
  }, [filteredSensorNames]);

  const handleAdd = () => {
    if (location && type && sensorName) {
      const newSensor = {
        facility: location,
        type,
        sensor_name: sensorName,
      };
      console.log("🚀 Adding sensor:", newSensor);
      onAddSensor(newSensor);
    } else {
      alert("Please select a facility, sensor type, and sensor name.");
    }
  };

  return (
    <div className="card bg-secondary text-white shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title mb-4">➕ Add a Widget</h5>

        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Facility</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-light"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Sensor Type</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-light"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {sensorTypes.filter(Boolean).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Sensor Name</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-light"
              value={sensorName}
              onChange={(e) => setSensorName(e.target.value)}
            >
              {filteredSensorNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 text-end mt-3">
            <button className="btn btn-info px-4" onClick={handleAdd}>
              ➕ Add Widget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorSelector;
