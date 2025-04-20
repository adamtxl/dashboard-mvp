// src/main.jsx
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

console.log("🚀 Chart.js fully registered");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
