from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Dashboard Telkom API",
    description="REST API Dashboard Monitoring Revenue - Telkom Regional 4 Kalimantan",
    version="0.1.0",
)

# CORS - agar frontend bisa akses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Hello from Dashboard Telkom API!",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-freepalestine",
        "project": "Dashboard Revenue Telkom Regional 4 Kalimantan",
        "members": [
            {"name": "Ariel Itsbat Nurhaq", "nim": "10231018", "role": "Lead Backend"},
            {"name": "Raditya Yudianto", "nim": "10231076", "role": "Lead QA & Docs"},
            {"name": "Muhammad Khoiruddin Marzuq", "nim": "10231065", "role": "Lead DevOps"},
        ],
    }
