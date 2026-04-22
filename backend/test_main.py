"""
Week 10: Backend Unit Tests — pytest
Jalankan: pytest test_main.py -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import os
# Pakai SQLite khusus test agar tidak bergantung credential PostgreSQL lokal.
os.environ["DATABASE_URL"] = "sqlite:///./test_temp.db"
os.environ["SECRET_KEY"] = "test-secret-key-for-ci-pipeline-minimum-32"

from main import app
from database import Base, engine, get_db

# Test database setup
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# ==================== SETUP ====================
@pytest.fixture(autouse=True, scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ==================== HEALTH ====================
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_team_info():
    response = client.get("/team")
    assert response.status_code == 200
    data = response.json()
    assert data["team"] == "cloud-team-freepalestine"
    assert len(data["members"]) == 3


# ==================== AUTH ====================
test_user = {"email": "test@itk.ac.id", "name": "Test User", "password": "password123"}

def test_register():
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_user["email"]
    assert "id" in data


def test_register_duplicate():
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 400


def test_login_success():
    response = client.post("/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password():
    response = client.post("/auth/login", json={"email": test_user["email"], "password": "wrongpassword"})
    assert response.status_code == 401


def get_token():
    response = client.post("/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
    return response.json()["access_token"]


def test_get_me():
    token = get_token()
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == test_user["email"]


def test_get_me_no_token():
    response = client.get("/auth/me")
    assert response.status_code == 401


# ==================== SALES CRUD ====================
test_sales = {
    "witel": "BALIKPAPAN", "channel": "Direct", "product": "HSI",
    "revenue_target": 10.5, "revenue_actual": 11.2,
    "sales_target": 500, "sales_actual": 520,
    "period_month": 6, "period_year": 2025
}

def test_create_sales():
    token = get_token()
    response = client.post("/sales", json=test_sales, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["witel"] == "BALIKPAPAN"
    assert data["id"] is not None


def test_list_sales():
    token = get_token()
    response = client.get("/sales", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_list_sales_filter_witel():
    token = get_token()
    response = client.get("/sales?witel=BALIKPAPAN", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    for item in response.json()["items"]:
        assert item["witel"] == "BALIKPAPAN"


def test_get_sales_summary():
    token = get_token()
    response = client.get("/sales/summary?year=2025", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "total_target" in data
    assert "achievement" in data


def test_update_sales():
    token = get_token()
    response = client.put("/sales/1", json={"revenue_actual": 12.0}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["revenue_actual"] == 12.0


def test_delete_sales():
    token = get_token()
    # Create one to delete
    create_res = client.post("/sales", json=test_sales, headers={"Authorization": f"Bearer {token}"})
    sales_id = create_res.json()["id"]
    response = client.delete(f"/sales/{sales_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 204


# ==================== INBOX CRUD ====================
test_inbox = {
    "title": "Test gangguan", "description": "Deskripsi test",
    "status": "pending", "priority": "high",
    "witel": "KALBAR", "category": "gangguan"
}

def test_create_inbox():
    token = get_token()
    response = client.post("/inbox", json=test_inbox, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    assert response.json()["title"] == "Test gangguan"


def test_list_inbox():
    token = get_token()
    response = client.get("/inbox", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_inbox_stats():
    token = get_token()
    response = client.get("/inbox/stats", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "pending" in data


def test_update_inbox():
    token = get_token()
    response = client.put("/inbox/1", json={"status": "in_progress"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"


def test_sales_not_found():
    token = get_token()
    response = client.get("/sales/99999", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
