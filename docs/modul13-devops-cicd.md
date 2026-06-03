# Modul 13 — Lead DevOps & Lead CI/CD (Muhammad Khoiruddin Marzuq)

## Lead DevOps (`feature/compose-resilience`)

| Artefak | Deskripsi |
|---------|-----------|
| `scripts/migrate_data.py` | Migrasi `users`, `sales_data`, `inbox_items` dari monolith → `auth_db` + `dashboard_db` |
| `docker-compose.microservices.yml` | Healthcheck service-level, `depends_on: service_healthy`, `deploy.resources.limits` |
| `docker-compose.dev.yml` | Hot-reload auth/dashboard + expose DB `5433`/`5434` untuk migrasi dari host |
| `docker-compose.yml` | Healthcheck backend + resource limits (monolith) |

### Perintah

```bash
# Stack microservices
make ms-up

# Dev dengan hot-reload
make ms-dev

# Migrasi data (monolith harus reachable)
pip install sqlalchemy psycopg2-binary
make migrate-data
```

## Lead CI/CD (`feature/ci-integration-test`)

| Artefak | Deskripsi |
|---------|-----------|
| `tests/integration/` | 8 integration test via gateway `:8080` |
| `.github/workflows/ci.yml` | Job `integration-test` setelah unit test |

### Lokal

```bash
make ms-up
make integration-test
```

### CI

Job `🔗 Integration Tests` menjalankan `docker-compose.microservices.yml` (auth + dashboard + gateway), lalu `pytest tests/integration/`.
