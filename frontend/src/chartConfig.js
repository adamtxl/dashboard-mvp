import {
  Chart,
  TimeScale,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from 'chart.js';

import 'chartjs-adapter-luxon';

Chart.register(
  TimeScale,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale
);

console.log("✅ Chart.js config loaded and time scale registered");
