🔧 Sensor Dashboard Mockup

This project is a full-stack mockup of a real-time sensor monitoring dashboard, built to simulate and visualize data from multiple facilities and sensor types.

🚀 Tech Stack

Frontend: React (Vite) + Recharts

Backend: FastAPI (Python)

Mock Data: Static JSON file served via API

📦 Project Structure

sensor-dashboard/
├── backend/
│   ├── main.py              # FastAPI backend
│   └── fake_data.json       # Mock sensor data
├── frontend/
│   └── src/
│       └── App.jsx          # Main React component

⚙️ Getting Started

1. Backend (FastAPI)

Navigate to the backend directory (or project root if main.py is there):

# Optional: create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install FastAPI and Uvicorn
pip install fastapi uvicorn

# Run the backend
uvicorn backend.main:app --reload

API will be available at: http://localhost:8000/data

2. Frontend (React + Vite)

Navigate to the frontend directory:

# Install dependencies
npm install

# Start the dev server
npm run dev

Frontend runs at: http://localhost:5173/

🧪 Features

✅ Filter sensor data by location

✅ Filter sensor data by sensor type

✅ Line chart visualization using Recharts

✅ Responsive design for desktop/tablet

✅ Modular architecture for future sensor support

📈 Planned Additions



🤝 For Demo & Sales Use

This project is a mockup and does not require a database or authentication.Ideal for showcasing UI/UX and system design to potential clients or stakeholders.

📄 License

MIT – but we're just mocking stuff for now anyway 😉