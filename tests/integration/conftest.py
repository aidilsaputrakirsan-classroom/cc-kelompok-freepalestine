"""
Integration test configuration (Modul 13).
Requires: docker compose -f docker-compose.microservices.yml up -d
Gateway default: http://localhost:8080
"""
import os
import time

import httpx
import pytest

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:8080")


@pytest.fixture(scope="session")
def gateway_url():
    return GATEWAY_URL.rstrip("/")


@pytest.fixture(scope="session")
def test_user(gateway_url):
    """Register + login via gateway; return token and headers."""
    email = f"integration-test-{int(time.time())}@example.com"
    password = "IntegrationTestPass123"
    name = "Integration Test User"

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"{gateway_url}/auth/register",
            json={"email": email, "password": password, "name": name},
        )
        assert resp.status_code == 201, f"Register failed: {resp.text}"

        resp = client.post(
            f"{gateway_url}/auth/login",
            json={"email": email, "password": password},
        )
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        token = resp.json()["access_token"]

    return {
        "email": email,
        "password": password,
        "name": name,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }
