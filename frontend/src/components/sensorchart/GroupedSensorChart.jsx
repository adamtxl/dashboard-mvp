// GroupedSensorChart.jsx
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';
import { getColorForIndex } from '../../utils/colors'; // You'll want a helper to assign unique colors

function GroupedSensorChart({ sensorType, sensors, rawData, timeRange, customStart, customEnd, customRangeApplied }) {
	const datasets = useMemo(() => {
	console.log('Sensors in group:', sensors);

	// Calculate time window
	let startTime = null;
	let endTime = new Date();

	if (timeRange === '1h') startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
	else if (timeRange === '1d') startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
	else if (timeRange === '7d') startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
	else if (timeRange === 'custom' && customRangeApplied && customStart && customEnd) {
		startTime = new Date(customStart);
		endTime = new Date(customEnd);
	} else if (timeRange === 'all') {
		startTime = null;
	}

	return sensors.map((sensor, index) => {
		const data = rawData
			.filter((d) => {
				if (d.sensor_id.toString() !== sensor.sensor_id.toString()) return false;

				const ts = new Date(d.timestamp);
				if (startTime && (ts < startTime || ts > endTime)) return false;

				return true;
			})
			.map((d) => ({ x: new Date(d.timestamp), y: d.value }));

		console.log(`Sensor ${sensor.sensor_id} has ${data.length} filtered points`);

		return {
			label: sensor.display_name || `Sensor ${sensor.sensor_id}`,
			data,
			borderColor: getColorForIndex(index),
			backgroundColor: getColorForIndex(index),
			fill: false,
		};
	});
}, [sensors, rawData, sensorType, timeRange, customStart, customEnd, customRangeApplied]);


	const chartData = {
		datasets,
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: { position: 'top' },
		},
		scales: {
			x: {
				type: 'time',
				time: { unit: 'minute' },
				title: { display: true, text: 'Time' },
			},
			y: {
				title: { display: true, text: 'Value' },
				beginAtZero: true,
			},
		},
	};

	return (
		<div className='card shadow-sm mb-3'>
			<div className='card-header'>📊 Grouped Chart: {sensorType}</div>
			<div className='card-body' style={{ height: '300px' }}>
				<Line data={chartData} options={chartOptions} />
			</div>
		</div>
	);
}

export default GroupedSensorChart;
