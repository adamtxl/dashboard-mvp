import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SensorChart from '../../components/sensorchart/SensorChart';
import GroupedSensorChart from '../../components/sensorchart/GroupedSensorChart';
import SensorSelector from '../../components/SensorSelector';
import { normalize } from '../../utils/normalize';
import { fetchSensors, normalizeSensorMetadata } from '../../services/api/sensors';
import { useAuth } from '../../AuthContext';
import { fetchReadingsBySensor } from '../../services/api/readings';
import { fetchLocations } from '../../services/api/locations';
import { createDashboard, getDashboardById, getUserDashboards, getDashboard } from '../../services/api/dashboards';

function Dashboard() {
	const [rawData, setRawData] = useState([]);
	const [locations, setLocations] = useState([]);
	const [sensorTypes, setSensorTypes] = useState([]);
	const [sensorNames, setSensorNames] = useState([]);
	const [selectedSensors, setSelectedSensors] = useState([]);
	const [alertConfigs, setAlertConfigs] = useState({});
	const [timeRange, setTimeRange] = useState('all');
	const [sortBy, setSortBy] = useState('sensor_id');
	const [loadError, setLoadError] = useState(false);
	const [sensors, setSensors] = useState([]);
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [customStart, setCustomStart] = useState('');
	const [customEnd, setCustomEnd] = useState('');
	const [customRangeApplied, setCustomRangeApplied] = useState(false);
	const [groupByType, setGroupByType] = useState(false);
	const { dashboardId } = useParams();

	const loadDashboard = async (dashboardId, sensorMetadata) => {
		try {
			const data = await getDashboard(dashboardId);

			const sensorList = data.sensor_ids
				.map((id) => {
					const match = sensorMetadata.find((s) => s.sensor_id === id);
					if (!match) return null;
					return {
						sensor_id: id,
						display_name: match.display_name,
						location: match.location,
						type: match.type,
					};
				})
				.filter(Boolean);

			setSelectedSensors(sensorList);

			const readings = await Promise.all(
				sensorList.map(async (sensor) => {
					try {
						const rawReadings = await fetchReadingsBySensor(sensor.sensor_id);
						return rawReadings.map((r) => ({ ...r, type: sensor.type }));
					} catch (err) {
						return [];
					}
				})
			);

			setRawData(readings.flat());
		} catch (err) {}
	};

	useEffect(() => {
		const loadData = async () => {
			try {
				const locs = await fetchLocations();
				const rawSensors = await fetchSensors();

				setLocations(locs);
				setSensors(rawSensors);
				setSensorTypes([...new Set(rawSensors.map((s) => s.sensor_type_name))]);
				const normalized = normalizeSensorMetadata(rawSensors, locs);
				setSensorNames(normalized);

				if (dashboardId) {
					await loadDashboard(dashboardId, normalized);
				}
			} catch (err) {}
		};

		loadData();
	}, []);

	useEffect(() => {
		if (!isAuthenticated) {
			alert('You must be logged in to view the dashboard.');
			navigate('/login');
		}
	}, [isAuthenticated]);

	const handleSensorAdd = async (sensor) => {
		try {
			const rawReadings = await fetchReadingsBySensor(sensor.sensor_id);
			const readings = rawReadings.map((r) => ({ ...r, type: sensor.type }));
			setSelectedSensors((prev) => [...prev, sensor]);
			setRawData((prevData) => [...prevData, ...readings]);
		} catch (err) {
			setLoadError(true);
		}
	};

	const handleSensorRemove = (sensorToRemove) => {
		setSelectedSensors((prev) =>
			prev.filter(
				(sensor) =>
					!(
						sensor.location === sensorToRemove.location &&
						sensor.sensor_id === sensorToRemove.sensor_id &&
						sensor.type === sensorToRemove.type
					)
			)
		);
	};

	const handleAlertConfigUpdate = (key, config) => {
		setAlertConfigs((prev) => ({
			...prev,
			[key]: { ...prev[key], ...config },
		}));
	};

	const sortedSensors = [...selectedSensors].sort((a, b) => {
		if (sortBy === 'value') {
			const aReading = rawData.find((d) => d.sensor_id === a.sensor_id && d.type === a.type);
			const bReading = rawData.find((d) => d.sensor_id === b.sensor_id && d.type === b.type);
			return (bReading?.value || 0) - (aReading?.value || 0);
		} else {
			const valA = a[sortBy]?.toString().toLowerCase() || '';
			const valB = b[sortBy]?.toString().toLowerCase() || '';
			return valA.localeCompare(valB);
		}
	});

	const groupedByType = useMemo(() => {
		return selectedSensors.reduce((acc, sensor) => {
			acc[sensor.type] = acc[sensor.type] || [];
			acc[sensor.type].push(sensor);
			return acc;
		}, {});
	}, [selectedSensors]);

	const handleSaveDashboard = async () => {
		const name = prompt('Enter a name for this dashboard:');
		if (!name) return;

		try {
			const sensorIds = selectedSensors.map((s) => s.sensor_id);
			const payload = {
				name,
				sensor_ids: sensorIds,
				business_id: sensors[0]?.business_id, // assumes all sensors are from the same biz
				is_admin_only: false,
			};
			await createDashboard(payload);
			alert('Dashboard saved!');
		} catch (err) {
			alert('Could not save dashboard.');
		}
	};

	return (
		<>
			<div className='container py-4 themed-gradient'>
				<div className='d-flex justify-content-between align-items-center mb-4'>
					<h1 className='themed-title d-flex align-items-center gap-2'>
						<img src='src/assets/rjes-logo.png' alt='RJES Logo' height='50' />
						Sensor Dashboard
					</h1>
					<button className='btn btn-success ms-3' onClick={handleSaveDashboard}>
						💾 Save Dashboard
					</button>
					<div>
						<label className='me-2'>Time Range:</label>
						<select
							className='form-select themed-select'
							value={timeRange}
							onChange={(e) => setTimeRange(e.target.value)}
						>
							<option value='1h'>Last Hour</option>
							<option value='1d'>Last 24 Hours</option>
							<option value='7d'>Last 7 Days</option>
							<option value='all'>All Time</option>
							<option value='custom'>Custom Range</option>
						</select>
					</div>
				</div>
				{timeRange === 'custom' && (
					<div className='d-flex gap-3 align-items-end mt-3 flex-wrap'>
						<div>
							<label className='form-label'>Start:</label>
							<input
								type='datetime-local'
								className='form-control themed-input'
								value={customStart}
								onChange={(e) => setCustomStart(e.target.value)}
							/>
						</div>
						<div>
							<label className='form-label'>End:</label>
							<input
								type='datetime-local'
								className='form-control themed-input'
								value={customEnd}
								onChange={(e) => setCustomEnd(e.target.value)}
							/>
						</div>
						<button className='btn btn-info' onClick={() => setCustomRangeApplied(true)}>
							Apply
						</button>
					</div>
				)}
				<label className='form-label mb-0 text-white'>
					<select className='form-select themed-select' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
						<option value='sensor_id'>Sensor Name</option>
						<option value='type'>Type</option>
						<option value='location'>Location</option>
						<option value='value'>Latest Value</option>
					</select>
				</label>
				<div className='form-check form-switch mb-3'>
					<input
						className='form-check-input'
						type='checkbox'
						checked={groupByType}
						onChange={() => setGroupByType(!groupByType)}
					/>
					<label className='form-check-label'>Group Sensors by Type</label>
				</div>
				<SensorSelector
					locations={locations}
					sensorTypes={sensorTypes}
					sensorNames={sensorNames}
					onAddSensor={handleSensorAdd}
				/>
				{selectedSensors.length === 0 && !loadError && rawData.length > 0 && (
					<div className='alert alert-info mt-4 text-center themed-gradient shadow-lg'>
						➕ Use "Add a Widget" above to start building your dashboard!
					</div>
				)}
				{loadError ? (
					<div className='alert alert-danger mt-4'>🚨 Unable to load sensor data. Please try again later.</div>
				) : rawData.length === 0 ? (
					<div className='alert alert-info mt-4'>⏳ Loading sensor data...</div>
				) : (
					<div className='row mt-4 gy-4'>
						{groupByType
							? Object.entries(groupedByType).map(([type, sensorsOfType]) => (
									<div key={type} className='col-12'>
										<GroupedSensorChart
											sensorType={type}
											sensors={sensorsOfType}
											rawData={rawData}
											timeRange={timeRange}
											customStart={customStart}
											customEnd={customEnd}
											customRangeApplied={customRangeApplied}
										/>
									</div>
							  ))
							: sortedSensors.map((sensor, index) => {
									const isValid = sensor && sensor.location && sensor.sensor_id && sensor.type;
									if (!isValid) return null;

									const sensorKey = `${sensor.location}|${sensor.sensor_id}|${sensor.type}`;
									const alertConfig = alertConfigs[sensorKey] || { showAverage: false };

									return (
										<div key={`${sensorKey}|${index}`} className='col-md-6 col-lg-4 animate__animated animate__fadeIn'>
											<SensorChart
												sensor={sensor}
												rawData={rawData}
												timeRange={timeRange}
												customStart={customStart}
												customEnd={customEnd}
												customRangeApplied={customRangeApplied}
												alertConfig={alertConfig}
												onConfigChange={(config) => handleAlertConfigUpdate(sensorKey, config)}
												onRemove={handleSensorRemove}
											/>
										</div>
									);
							  })}
					</div>
				)}
			</div>
		</>
	);
}

export default Dashboard;
