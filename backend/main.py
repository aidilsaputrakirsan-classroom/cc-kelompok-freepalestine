from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Dashboard Revenue Telkom Regional 4 Kalimantan API",
    description="API untuk Dashboard Revenue - Mata Kuliah Komputasi Awan",
    version="0.1.0"
)

# CORS - agar frontend bisa akses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development saja
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Hello from Dashboard Revenue Telkom Regional 4 Kalimantan API!",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-freepalestine",
        "project": "Dashboard Revenue Telkom Regional 4 Kalimantan",
        "members": [
            {
                "name": "Ariel Itsbat Nurhaq",
                "nim": "10231018",
                "role": "Lead Backend & Lead Frontend"
            },
            {
                "name": "Raditya Yudianto",
                "nim": "10231076",
                "role": "Lead QA & Docs"
            },
            {
                "name": "Muhammad Khoiruddin Marzuq",
                "nim": "10231065",
                "role": "Lead DevOps"
            },
        ]
    }
