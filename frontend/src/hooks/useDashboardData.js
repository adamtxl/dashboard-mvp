import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { fetchSensors, normalizeSensorMetadata } from '../services/api/sensors';
import { fetchLocations } from '../services/api/locations';
import { fetchReadingsBySensor } from '../services/api/readings';
import { getDashboard } from '../services/api/dashboards';
import { updateDashboard as apiUpdateDashboard } from '../services/api/dashboards';


export const useDashboardData = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { dashboardId } = useParams();
	const [rawData, setRawData] = useState([]);
	const [locations, setLocations] = useState([]);
	const [sensorTypes, setSensorTypes] = useState([]);
	const [sensorNames, setSensorNames] = useState([]);
	const [selectedSensors, setSelectedSensors] = useState([]);
	const [alertConfigs, setAlertConfigs] = useState({});
	const [sensors, setSensors] = useState([]);
	const [loadError, setLoadError] = useState(false);
	const [dashboardName, setDashboardName] = useState('');
	const [originalDashboardName, setOriginalDashboardName] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			alert('You must be logged in to view the dashboard.');
			navigate('/login');
		}
	}, [isAuthenticated]);

	const loadData = async () => {
		setLoading(true);
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
		} catch (err) {
			console.error('Error loading dashboard data', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const loadDashboard = async (dashboardId, metadata) => {
		try {
			const data = await getDashboard(dashboardId);
			setDashboardName(data.name);
			setOriginalDashboardName(data.name);
			const sensorList = data.sensor_ids
				.map((id) => {
					const match = metadata.find((s) => s.sensor_id === id);
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
						console.error('Failed to load readings', err);
					}
				})
			);

			setRawData(readings.flat());
		} catch (err) {
			console.error('Failed to load dashboard', err);
		}
	};

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

	const groupedByType = useMemo(() => {
		return selectedSensors.reduce((acc, sensor) => {
			acc[sensor.type] = acc[sensor.type] || [];
			acc[sensor.type].push(sensor);
			return acc;
		}, {});
	}, [selectedSensors]);

	const updateDashboard = async (id, updatedData) => {
	try {
		const result = await apiUpdateDashboard(id, updatedData);
		return result;
	} catch (err) {
		console.error('Failed to update dashboard:', err);
		throw err;
	}
};
	return {
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
		dashboardName,
		setDashboardName,
		loadData,
		loadDashboard,
		loading,
		setLoading,
		originalDashboardName,
		setOriginalDashboardName,
		updateDashboard,
	};
};
