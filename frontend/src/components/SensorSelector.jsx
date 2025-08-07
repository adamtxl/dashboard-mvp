import { useEffect, useState, useMemo } from 'react';

function SensorSelector({ locations, sensorTypes, sensorNames, onAddSensor }) {
	const [location, setLocation] = useState('');
	const [type, setType] = useState('');
	const [sensorName, setSensorName] = useState('');
	const [isDarkMode, setIsDarkMode] = useState(false);

	const filteredSensorNames = useMemo(() => {
		return sensorNames.filter((obj) => (!location || obj.location === location) && (!type || obj.type === type));
	}, [sensorNames, location, type]);

	useEffect(() => {
		if (sensorNames.length > 0 && !location) {
			const defaultLocation = sensorNames[0].location;
			setLocation(defaultLocation);
		}
		if (sensorTypes.length > 0 && !type) setType(sensorTypes[0]);
	}, [sensorNames, sensorTypes]);

	useEffect(() => {
		if (filteredSensorNames.length > 0) {
			setSensorName(filteredSensorNames[0].sensor_id);
		} else {
			setSensorName('');
		}
	}, [filteredSensorNames]);

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDarkMode(document.body.classList.contains('dark-mode'));
		});

		observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

		// Set initial state
		setIsDarkMode(document.body.classList.contains('dark-mode'));

		return () => observer.disconnect();
	}, []);

	const handleAdd = () => {
		if (location && type && sensorName) {
			const selected = filteredSensorNames.find((s) => String(s.sensor_id) === String(sensorName));
			const newSensor = {
				location: selected?.location,
				type,
				sensor_id: sensorName,
				display_name: selected?.display_name || sensorName,
			};
			console.log('🚀 Adding sensor:', newSensor);
			onAddSensor(newSensor);
		} else {
			alert('Please select a location, sensor type, and sensor name.');
		}
	};


	return (
		<div className='card shadow-lg h-100 themed-bg themed-border themed-text'>
			<div className='card-body themed-gradient themed-text'>
				<h5 className='card-title mb-4'>➕ Add a Widget</h5>

				{sensorNames.length === 0 || locations.length === 0 ? (
					<div className='alert alert-warning mt-3'>
						⚠️ No sensors or locations available. Please check backend data.
					</div>
				) : (
					<div className='row g-3 align-items-end'>
						<div className='col-md-4'>
							<label className='form-label'>Location</label>
							<select
								className='form-select form-select-sm themed-select'
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

						<div className='col-md-4 '>
							<label className='form-label'>Sensor Type</label>
							<select
								className='form-select form-select-sm themed-select'
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

						<div className='col-md-4'>
							<label className='form-label'>Sensor Name</label>
							<select
								className='form-select form-select-sm themed-select'
								value={sensorName}
								onChange={(e) => setSensorName(e.target.value)}
							>
								{filteredSensorNames
									.filter((sensor) => sensor.sensor_id !== undefined)
									.map((sensor) => (
										<option key={sensor.sensor_id} value={sensor.sensor_id}>
											{sensor.display_name || sensor.sensor_id}
										</option>
									))}
							</select>
						</div>

						<div className='col-12 text-end mt-3'>
							<button
								className='btn btn-info px-4 transition-all '
								style={{
									transition: 'transform 0.15s ease-in-out',
									backgroundColor: isDarkMode ? '#4c777d' : 'rgba(15, 171, 93, 0.55)',
									color: '#fff',
									border: `solid 1px ${isDarkMode ? '#4c777d' : 'rgba(15, 171, 93, 0.55)'}`,
								}}
								onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
								onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
								onClick={handleAdd}
								disabled={sensorNames.length === 0 || locations.length === 0}
							>
								+ Add Widget
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default SensorSelector;
