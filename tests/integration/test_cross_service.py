"""
Integration tests — Auth + Dashboard via API Gateway (Modul 13).

Run locally:
  docker compose -f docker-compose.microservices.yml up -d --build
  GATEWAY_URL=http://localhost:8080 pytest tests/integration/ -v
"""
import time

import httpx


def _sales_payload(suffix: str = ""):
    return {
        "witel": "BALIKPAPAN",
        "channel": "Direct",
        "product": "HSI",
        "revenue_target": 1.5,
        "revenue_actual": 1.2,
        "sales_target": 100,
        "sales_actual": 90,
        "period_month": 6,
        "period_year": 2025,
    }


def test_gateway_health(gateway_url):
    response = httpx.get(f"{gateway_url}/health", timeout=10.0)
    assert response.status_code == 200


def test_auth_service_health(gateway_url):
    response = httpx.get(f"{gateway_url}/health/auth", timeout=10.0)
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "auth-service"
    assert data["status"] == "healthy"


def test_dashboard_service_health(gateway_url):
    response = httpx.get(f"{gateway_url}/health/dashboard", timeout=10.0)
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "dashboard-service"
    assert data["status"] == "healthy"


def test_register_login_flow(gateway_url):
    email = f"flow-test-{int(time.time())}@example.com"

    resp = httpx.post(
        f"{gateway_url}/auth/register",
        json={"email": email, "password": "FlowTest123", "name": "Flow User"},
        timeout=30.0,
    )
    assert resp.status_code == 201
    assert resp.json()["email"] == email

    resp = httpx.post(
        f"{gateway_url}/auth/login",
        json={"email": email, "password": "FlowTest123"},
        timeout=30.0,
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_cross_service_auth_verification(gateway_url, test_user):
    """Dashboard memverifikasi token ke Auth Service (cross-service)."""
    resp = httpx.post(
        f"{gateway_url}/sales",
        json=_sales_payload(),
        headers=test_user["headers"],
        timeout=30.0,
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["witel"] == "BALIKPAPAN"
    assert "id" in data


def test_crud_via_gateway(gateway_url, test_user):
    headers = test_user["headers"]

    resp = httpx.post(
        f"{gateway_url}/sales",
        json=_sales_payload("crud"),
        headers=headers,
        timeout=30.0,
    )
    assert resp.status_code == 201
    sales_id = resp.json()["id"]

    resp = httpx.get(f"{gateway_url}/sales/{sales_id}", headers=headers, timeout=30.0)
    assert resp.status_code == 200
    assert resp.json()["channel"] == "Direct"

    resp = httpx.put(
        f"{gateway_url}/sales/{sales_id}",
        json={"revenue_actual": 2.0},
        headers=headers,
        timeout=30.0,
    )
    assert resp.status_code == 200
    assert resp.json()["revenue_actual"] == 2.0

    resp = httpx.delete(f"{gateway_url}/sales/{sales_id}", headers=headers, timeout=30.0)
    assert resp.status_code == 204

    resp = httpx.get(f"{gateway_url}/sales/{sales_id}", headers=headers, timeout=30.0)
    assert resp.status_code == 404


def test_unauthorized_without_token(gateway_url):
    resp = httpx.post(
        f"{gateway_url}/sales",
        json=_sales_payload(),
        timeout=30.0,
    )
    assert resp.status_code in (401, 403)


def test_invalid_token_rejected(gateway_url):
    resp = httpx.get(
        f"{gateway_url}/sales",
        headers={"Authorization": "Bearer invalid-fake-token"},
        timeout=30.0,
    )
    assert resp.status_code in (401, 403)
