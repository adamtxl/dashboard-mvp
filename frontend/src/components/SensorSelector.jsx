import { useEffect, useState, useMemo } from "react";

function SensorSelector({ locations, sensorTypes, sensorNames, onAddSensor }) {
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [sensorName, setSensorName] = useState("");

  // Filter sensor names based on selected location and type
  const filteredSensorNames = useMemo(() => {
    return sensorNames.filter(
      (obj) =>
        (!location || obj.facility === location) &&
        (!type || obj.type === type)
    );
  }, [sensorNames, location, type]);

  useEffect(() => {
    if (sensorNames.length > 0 && !location) {
      const defaultFacility = sensorNames[0].facility;
      setLocation(defaultFacility);
    }
    if (sensorTypes.length > 0 && !type) setType(sensorTypes[0]);
  }, [sensorNames, sensorTypes]);

  useEffect(() => {
    if (filteredSensorNames.length > 0) {
      setSensorName(filteredSensorNames[0].sensor_id);
    } else {
      setSensorName("");
    }
  }, [filteredSensorNames]);

  const handleAdd = () => {
    if (location && type && sensorName) {
      const newSensor = {
        facility: location,
        type,
        sensor_id: sensorName,
      };
      console.log("🚀 Adding sensor:", newSensor);
      onAddSensor(newSensor);
    } else {
      alert("Please select a facility, sensor type, and sensor name.");
    }
  };

  console.log("🧪 sensorNames:", sensorNames);

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
              {filteredSensorNames.map((sensor) => (
                <option key={sensor.sensor_id} value={sensor.sensor_id}>
                  {sensor.display_name || sensor.name || sensor.sensor_id}
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
