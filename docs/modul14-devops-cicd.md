# Modul 14 — Lead DevOps & Lead CI/CD (Muhammad Khoiruddin Marzuq)

## Lead DevOps (`feature/docker-production` + Workshop 14.5)

| Artefak | Deskripsi |
|---------|-----------|
| `docker-compose.microservices.yml` | Blok `logging` (json-file, max-size 10m, max-file 3) + `LOG_LEVEL` / `SERVICE_NAME` |
| `docker-compose.microservices.prod.yml` | Prod: hanya gateway `:8080`, DB/service tanpa port host, `restart: always` |
| `scripts/logs.sh` | Helper: `all`, `errors`, `trace <id>`, `metrics`, `export` |
| `scripts/logs.bat` | Versi Windows untuk `all`, `errors`, `metrics`, `export` |

### Perintah Makefile

```bash
make dev          # hot-reload (ms-dev)
make prod         # microservices + prod override
make logs         # follow logs microservices (Modul 14)
make status       # health check via gateway
make ms-logs      # alias untuk make logs
make logs-monolith # logs stack monolith (docker-compose.yml)
make ms-prod-down # stop prod stack
```

### Contoh logging

```bash
make ms-up
./scripts/logs.sh errors
./scripts/logs.sh trace a1b2c3d4e5f6
./scripts/logs.sh metrics
./scripts/logs.sh export
```

## Lead CI/CD (`feature/ci-log-artifacts`)

| Artefak | Deskripsi |
|---------|-----------|
| `.github/workflows/ci.yml` | Setelah integration test: export `docker compose logs` → `ci-logs/`, upload artifact |

Artifact name di GitHub Actions: `microservices-logs-<run_id>` (retention 14 hari).  
Selalu dijalankan (`if: always()`) agar log tersedia saat test gagal.
