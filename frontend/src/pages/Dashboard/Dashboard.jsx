import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SensorChart from '../../components/sensorchart/SensorChart';
import GroupedSensorChart from '../../components/sensorchart/GroupedSensorChart';
import SensorSelector from '../../components/SensorSelector';
import { useAuth } from '../../AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { normalizeReadings } from '../../utils/normalizeReadings';

function Dashboard() {

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	console.log("🌍 Dashboard API_BASE_URL:", API_BASE_URL);
	const [timeRange, setTimeRange] = useState('all');
	const [sortBy, setSortBy] = useState('sensor_id');

	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [customStart, setCustomStart] = useState('');
	const [customEnd, setCustomEnd] = useState('');
	const [customRangeApplied, setCustomRangeApplied] = useState(false);
	const [groupByType, setGroupByType] = useState(false);
	const { dashboardId } = useParams();
	const isEditing = !!dashboardId; // truthy if editing, false if it's a blank dashboard
	const [toastMessage, setToastMessage] = useState(null);
	const [toastType, setToastType] = useState('success');
	const [isEditingName, setIsEditingName] = useState(false);
	const [tempUnit, setTempUnit] = useState('C');
	const {
		rawData,
		locations,
		sensorTypes,
		sensorNames,
		selectedSensors,
		sensors,
		alertConfigs,
		groupedByType,
		loadError,
		handleSensorAdd,
		handleSensorRemove,
		handleAlertConfigUpdate,
		setSelectedSensors,
		setLocations,
		setSensors,
		setSensorTypes,
		setSensorNames,
		loadDashboard,
		setRawData,
		setAlertConfigs,
		loadData,
		loading,
		dashboardName,
		setDashboardName,
		originalDashboardName,
		setOriginalDashboardName,
		updateDashboard,
		createDashboard,
	} = useDashboardData();

	useEffect(() => {
		loadData();
		
	}, []);

	useEffect(() => {
		if (!isAuthenticated) {
			alert('You must be logged in to view the dashboard.');
			navigate('/login');
		}
	}, [isAuthenticated]);

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

	const normalizedData = useMemo(() => normalizeReadings(rawData, tempUnit), [rawData, tempUnit]);
	const handleSaveDashboard = async () => {
		const name = prompt('Enter a name for this dashboard:');
		if (!selectedSensors.length) return alert('Please add sensors first.');
		if (!name.trim()) return;

		try {
			const sensorIds = selectedSensors.map((s) => s.sensor_id);
			const payload = {
				name,
				sensor_ids: sensorIds,
				business_id: sensors[0]?.business_id, // assumes all sensors are from the same biz
				is_admin_only: false,
			};
			await createDashboard(payload);
			setToastType('success');
			setToastMessage('Dashboard saved!');
			setTimeout(() => setToastMessage(null), 3000);
		} catch (err) {
			setToastType('danger');
			setToastMessage('Could not save dashboard. Please try again.');
			setTimeout(() => setToastMessage(null), 3000);
		}
	};

	const handleUpdateDashboard = async () => {
		if (!dashboardId) return;
		if (!selectedSensors.length) {
			alert('Please add at least one sensor before saving.');
			return;
		}

		if (!dashboardName || !dashboardName.trim()) {
			alert('Dashboard name cannot be empty.');
			return;
		}
		try {
			const sensorIds = selectedSensors.map((s) => s.sensor_id);
			await updateDashboard(dashboardId, { sensor_ids: sensorIds });
			setToastType('success');
			setToastMessage('Dashboard saved!');
			setTimeout(() => setToastMessage(null), 3000);
		} catch (err) {
			setToastType('danger');
			setToastMessage('Could not update dashboard! Please try again.');
			setTimeout(() => setToastMessage(null), 3000);
		}
	};

	return (
		<>
			{loading ? (
				<div className='text-center text-white py-5'>
					<div className='spinner-border text-light' role='status' />
					<p className='mt-3'>Loading dashboard...</p>
				</div>
			) : (
				<>
					{toastMessage && (
						<div className={`alert alert-${toastType} position-fixed top-0 end-0 m-3 shadow`} role='alert'>
							{toastMessage}
						</div>
					)}
					<div className='container py-4 themed-gradient'>
						<div className='d-flex justify-content-between align-items-center mb-4'>
							<div className='mb-4'>
								<div className='d-flex align-items-center gap-2'>
									<img src='/assets/rjes-logo.png' alt='RJES Logo' height='50' />
									
									<h1 className='themed-title m-0'>Sensor Dashboard</h1>
								</div>

								{dashboardName &&
									(isEditingName ? (
										<input
											className='form-control themed-input mt-2 ms-1'
											value={dashboardName}
											onChange={(e) => setDashboardName(e.target.value)}
											onBlur={async () => {
												setIsEditingName(false);
												if (isEditing && dashboardName.trim() && dashboardName.trim() !== originalDashboardName) {
													const confirmUpdate = window.confirm('Save new dashboard name?');
													if (confirmUpdate) {
														try {
															await updateDashboard(dashboardId, { name: dashboardName.trim() });
															setOriginalDashboardName(dashboardName.trim());
															setToastType('success');
															setToastMessage('Dashboard name updated!');
															setTimeout(() => setToastMessage(null), 3000);
														} catch (err) {
															setToastType('danger');
															setToastMessage('Could not update dashboard name.');
															setTimeout(() => setToastMessage(null), 3000);
														}
													}
												}
											}}
											onKeyDown={async (e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													e.target.blur(); // triggers onBlur logic
												}
											}}
											autoFocus
										/>
									) : (
										<h4
											className='text-white mt-2 ms-1'
											onClick={() => setIsEditingName(true)}
											style={{ cursor: 'pointer', borderBottom: '1px dashed #ccc' }}
											title='Click to edit name'
										>
											{dashboardName}
										</h4>
									))}
							</div>

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
								<button
									className='btn btn-secondary'
									onClick={() => {
										setCustomStart('');
										setCustomEnd('');
										setCustomRangeApplied(false);
									}}
								>
									Clear
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
							<div className='form-check form-switch text-white ms-3'>
								<input
									className='form-check-input'
									type='checkbox'
									id='unitToggle'
									checked={tempUnit === 'F'}
									onChange={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
								/>
								<label className='form-check-label' htmlFor='unitToggle'>
									°{tempUnit === 'C' ? 'C' : 'F'}
								</label>
							</div>

							<button
								className='btn themed-btn ms-3'
								disabled={!selectedSensors.length}
								onClick={isEditing ? handleUpdateDashboard : handleSaveDashboard}
							>
								{isEditing ? '💾 Save Changes' : '💾 Save Dashboard'}
							</button>
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
													rawData={normalizeReadings}
													timeRange={timeRange}
													customStart={customStart}
													customEnd={customEnd}
													customRangeApplied={customRangeApplied}
													tempUnit={tempUnit}
												/>
											</div>
									  ))
									: sortedSensors.map((sensor, index) => {
											const isValid = sensor && sensor.location && sensor.sensor_id && sensor.type;
											if (!isValid) return null;

											const sensorKey = `${sensor.location}|${sensor.sensor_id}|${sensor.type}`;
											const alertConfig = alertConfigs[sensorKey] || { showAverage: false };

											return (
												<div
													key={`${sensorKey}|${index}`}
													className='col-md-6 col-lg-4 animate__animated animate__fadeIn'
												>
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
														tempUnit={tempUnit}
													/>
												</div>
											);
									  })}
							</div>
						)}
					</div>
				</>
			)}
		</>
	);
}

export default Dashboard;
