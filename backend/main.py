import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "fake_sensor_data_full.json")

@app.get("/data")
async def get_data():
    with open(DATA_PATH) as f:
        data = json.load(f)
    return data
