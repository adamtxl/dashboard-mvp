import { useState, useMemo, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
	Chart as ChartJS,
	LineElement,
	BarElement,
	TimeScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend,
	CategoryScale,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { normalize } from '../../utils/normalize';

ChartJS.register(
	LineElement,
	BarElement,
	TimeScale,
	LinearScale,
	PointElement,
	Tooltip,
	Legend,
	CategoryScale,
	annotationPlugin
);

const chartTypeMap = {
	temperature: 'line',
	humidity: 'bar',
	pressure: 'bar',
	amperage: 'bar',
	voltage: 'line',
	co2: 'line',
	flow_rate: 'line',
	vibration: 'area',
	boolean: 'status',
	runtime: 'timeline',
	default: 'line',
};

const sensorTypeIcons = {
	temperature: '🌡️',
	humidity: '💧',
	pressure: '🧭',
	amperage: '⚡',
	voltage: '🔋',
	co2: '🫁',
	flow_rate: '🚰',
	vibration: '🎛️',
	boolean: '🔘',
	runtime: '⏱️',
	default: '📟',
};

function SensorChart({
	sensor,
	rawData,
	timeRange,
	alertConfig,
	onConfigChange,
	onRemove,
	customStart,
	customEnd,
	customRangeApplied,
}) {
	const [showConfig, setShowConfig] = useState(false);
	const [customChartType, setCustomChartType] = useState('');
	const { location, sensor_id, type } = sensor || {};
	const resolvedChartType = customChartType || chartTypeMap[type] || chartTypeMap.default;
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDarkMode(document.body.classList.contains('dark-mode'));
		});

		observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
		setIsDarkMode(document.body.classList.contains('dark-mode'));

		return () => observer.disconnect();
	}, []);
	const filteredData = useMemo(() => {
		if (!sensor || !rawData?.length) return [];

		const normalizedSensorLocation = normalize(sensor.location);
		const base = rawData.filter((d) => {
			const match =
				String(d.sensor_id) === String(sensor.sensor_id) &&
				d.type === sensor.type &&
				normalize(d.facility || '') === normalizedSensorLocation;
			return match;
		});

		const cutoff = new Date();
		let ranged = base;
		if (timeRange === '1h') {
			cutoff.setHours(cutoff.getHours() - 1);
			ranged = base.filter((d) => new Date(d.timestamp) >= cutoff);
		} else if (timeRange === '1d') {
			cutoff.setDate(cutoff.getDate() - 1);
			ranged = base.filter((d) => new Date(d.timestamp) >= cutoff);
		} else if (timeRange === '7d') {
			cutoff.setDate(cutoff.getDate() - 7);
			ranged = base.filter((d) => new Date(d.timestamp) >= cutoff);
		} else if (timeRange === 'custom' && customStart && customEnd && customRangeApplied) {
			const start = new Date(customStart);
			const end = new Date(customEnd);
			ranged = base.filter((d) => {
				const t = new Date(d.timestamp);
				return t >= start && t <= end;
			});
		}

		return ranged
			.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
			.map((d) => ({
				...d,
				alert:
					(alertConfig.low !== undefined && d.value < alertConfig.low) ||
					(alertConfig.high !== undefined && d.value > alertConfig.high),
			}));
	}, [rawData, location, sensor_id, type, timeRange, customStart, customEnd, customRangeApplied, alertConfig]);

	const averageValue = useMemo(() => {
		if (!filteredData.length) return null;
		return filteredData.reduce((sum, d) => sum + d.value, 0) / filteredData.length;
	}, [filteredData]);

	const chartData = useMemo(() => {
		if (['status', 'timeline'].includes(resolvedChartType)) return { datasets: [] };
		const datasets = [
			{
				label: type,
				data: filteredData.map((d) => ({ x: new Date(d.timestamp), y: d.value })),
				borderColor: '#36a2eb',
				backgroundColor:
					resolvedChartType === 'bar'
						? '#36a2eb'
						: resolvedChartType === 'area'
						? 'rgba(54, 162, 235, 0.2)'
						: 'transparent',
				tension: resolvedChartType === 'area' ? 0.4 : 0,
				fill: resolvedChartType === 'area',
			},
			{
				label: 'Alert',
				data: filteredData.filter((d) => d.alert).map((d) => ({ x: new Date(d.timestamp), y: d.value })),
				borderColor: 'red',
				backgroundColor: 'red',
				pointRadius: 10,
				pointHoverRadius: 10,
				pointStyle: 'star',
				showLine: false,
			},
		];
		if (alertConfig.showAverage && averageValue !== null) {
			datasets.push({
				label: 'Average',
				data: filteredData.map((d) => ({ x: new Date(d.timestamp), y: averageValue })),
				borderColor: 'orange',
				borderDash: [6, 6],
				pointRadius: 0,
				fill: false,
			});
		}
		return { datasets };
	}, [filteredData, resolvedChartType, type, averageValue, alertConfig]);

	const chartOptions = useMemo(() => {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
		const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		let unit = 'day',
			stepSize = 1,
			min,
			max,
			displayFormats = {};
		if (timeRange === '1h') {
			unit = 'minute';
			stepSize = 5;
			min = oneHourAgo.toISOString();
			max = now.toISOString();
			displayFormats = { minute: 'HH:mm' };
		} else if (timeRange === '1d') {
			unit = 'hour';
			stepSize = 2;
			min = oneDayAgo.toISOString();
			max = now.toISOString();
			displayFormats = { hour: 'MMM d, HH:mm' };
		} else if (timeRange === '7d') {
			unit = 'day';
			min = oneWeekAgo.toISOString();
			max = now.toISOString();
			displayFormats = { day: 'MMM d' };
		} else if (timeRange === 'custom' && customStart && customEnd && customRangeApplied) {
			min = new Date(customStart).toISOString();
			max = new Date(customEnd).toISOString();
			displayFormats = { day: 'MMM d' };
		}

		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { position: 'top' },
				tooltip: { mode: 'index', intersect: false },
			},
			scales: {
				x: {
					type: 'time',
					time: { unit, stepSize, tooltipFormat: 'PPpp', displayFormats },
					min,
					max,
					ticks: {
						autoSkip: false,
						maxTicksLimit: 12,
						color: isDarkMode ? '#fff' : '#1e293b',
					},
					title: {
						display: true,
						text: 'Timestamp',
						color: isDarkMode ? '#fff' : '#1e293b',
					},
				},
				y: {
					beginAtZero: true,
					ticks: {
						color: isDarkMode ? '#fff' : '#1e293b',
					},
					title: {
						display: true,
						text: 'Value',
						color: isDarkMode ? '#fff' : '#1e293b',
					},
				},
			},
		};
	}, [timeRange, customStart, customEnd, customRangeApplied, isDarkMode]);

	const updateField = (field, value) => onConfigChange({ [field]: value });

	return (
		<div className='card shadow-lg h-100 themed-bg themed-border themed-text'>
			<div
				className={`card-header themed-header d-flex justify-content-between align-items-center ${
					isDarkMode ? 'dark-header-bg' : 'themed-gradient'
				}`}
			>
				<h5 className='mb-0'>
					{location} – {sensorTypeIcons[type] || sensorTypeIcons.default} {sensor.display_name || sensor_id} ({type})
				</h5>
				<div className='d-flex gap-2'>
					<button className='btn btn-sm btn-outline-info' onClick={() => setShowConfig(!showConfig)} title='Configure'>
						{showConfig ? '🔙 Back' : '⚙️'}
					</button>
					<button className='btn btn-sm btn-outline-danger' onClick={() => onRemove(sensor)} title='Remove'>
						❌
					</button>
				</div>
			</div>

			{!showConfig ? (
				<div className='card-body themed-gradient themed-text' style={{ height: '300px' }}>
					{filteredData.length === 0 ? (
						<div className='d-flex align-items-center justify-content-center h-100 text-muted'>
							📭 No recent data available.
						</div>
					) : resolvedChartType === 'bar' ? (
						<Bar data={chartData} options={chartOptions} />
					) : (
						<Line data={chartData} options={chartOptions} />
					)}
				</div>
			) : (
				<div className='card-body animate__animated animate__fadeIn'>
					{['low', 'high'].map((field) => (
						<div className='mb-3' key={field}>
							<label className='form-label'>{field === 'low' ? 'Low' : 'High'} Threshold:</label>
							<input
								type='number'
								className='form-control themed-input'
								value={alertConfig[field] || ''}
								onChange={(e) => updateField(field, Number(e.target.value))}
							/>
						</div>
					))}
					<div className='mb-3'>
						<label className='form-label'>Alert Email:</label>
						<input
							type='email'
							className='form-control'
							value={alertConfig.email || ''}
							onChange={(e) => updateField('email', e.target.value)}
						/>
					</div>
					<div className='mb-3'>
						<label className='form-label'>Chart Type:</label>
						<select
							className='form-select themed-select'
							value={customChartType || chartTypeMap[type]}
							onChange={(e) => setCustomChartType(e.target.value)}
						>
							<option value='line'>Line</option>
							<option value='bar'>Bar</option>
							<option value='area'>Area</option>
						</select>
					</div>
					<div className='form-check form-switch mb-3'>
						<input
							type='checkbox'
							className='form-check-input'
							id='showAverage'
							checked={alertConfig?.showAverage || false}
							onChange={(e) => updateField('showAverage', e.target.checked)}
						/>
						<label className='form-check-label' htmlFor='showAverage'>
							Show Average Line
						</label>
					</div>
					<button className='btn btn-success w-100' onClick={() => setShowConfig(false)}>
						💾 Save & Close
					</button>
				</div>
			)}

			{filteredData.some((d) => d.alert) && !showConfig && (
				<div className='alert alert-danger m-3'>
					🚨 ALERT: {type} value out of range at {location}
				</div>
			)}
		</div>
	);
}

export default SensorChart;
