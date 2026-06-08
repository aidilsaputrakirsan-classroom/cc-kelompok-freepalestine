# Laporan QA — DevOps Tooling & Makefile Verification (Modul 13-14)

**Disusun oleh:** Raditya Yudianto (10231076) — Lead QA & Docs  
**Tanggal:** 8 Juni 2026  
**Cakupan:** Verifikasi `Makefile`, `scripts/logs.sh`, `scripts/logs.bat`, dan `docker-compose.dev.yml`

---

## 1. Gambaran Umum

Pada Modul 13-14, tim DevOps (Irud) menambahkan tooling operasional yang signifikan untuk memudahkan pengelolaan stack microservices di lingkungan lokal maupun produksi. Laporan ini mendokumentasikan hasil verifikasi QA terhadap seluruh tooling tersebut.

---

## 2. Makefile — Daftar Target dan Verifikasi

### Target Utama

| Target | Perintah yang Dijalankan | Fungsi | Status |
|--------|--------------------------|--------|:------:|
| `make up` | `docker compose up -d` | Start monolith stack | ✅ |
| `make build` | `docker compose up --build -d` | Rebuild & start | ✅ |
| `make down` | `docker compose down` | Stop monolith | ✅ |
| `make clean` | `down -v` + `docker system prune -f` | Bersihkan semua | ✅ |
| `make restart` | `docker compose restart` | Restart semua service | ✅ |
| `make logs-monolith` | `docker compose logs -f` | Tail log monolith | ✅ |
| `make logs-backend` | `docker compose logs -f backend` | Tail log backend saja | ✅ |
| `make ps` | `docker compose ps` | Status containers | ✅ |
| `make lint` | ESLint + Ruff + compileall | Cek sintaks | ✅ |
| `make test` | `pytest backend/test_main.py -v` | Unit test | ✅ |
| `make pr-check` | compose-config + build + lint + test | Full pre-merge check | ✅ |

### Target Microservices (Modul 12-14)

| Target | Fungsi | Status |
|--------|--------|:------:|
| `make ms-up` | Start microservices stack (build) | ✅ |
| `make ms-down` | Stop microservices stack (hapus volume) | ✅ |
| `make ms-dev` | Microservices + hot-reload dev override | ✅ |
| `make integration-test` | Jalankan `tests/integration/` | ✅ |
| `make migrate-data` | Jalankan `scripts/migrate_data.py` | ✅ |
| `make dev` | Alias `ms-dev` | ✅ |
| `make prod` | Microservices + production override | ✅ |
| `make ms-prod-down` | Stop production stack | ✅ |
| `make logs` | `bash scripts/logs.sh all` | ✅ |
| `make ms-logs` | Alias `make logs` | ✅ |
| `make status` | Health check gateway + kedua service | ✅ |

---

## 3. Scripts Logging (`scripts/logs.sh` & `scripts/logs.bat`)

### Deskripsi Fungsional

Script helper untuk memudahkan akses log container microservices. Tersedia dalam dua versi:
- `scripts/logs.sh` — untuk Linux/macOS/WSL
- `scripts/logs.bat` — untuk Windows CMD/PowerShell

### Perintah yang Tersedia

| Perintah | Fungsi |
|----------|--------|
| `./scripts/logs.sh all` | Tail log semua container microservices |
| `./scripts/logs.sh errors` | Filter hanya baris mengandung `ERROR` atau `CRITICAL` |
| `./scripts/logs.sh trace <correlation-id>` | Filter log berdasarkan Correlation ID spesifik |
| `./scripts/logs.sh metrics` | Filter log berisi data metrics (request count, dll) |
| `./scripts/logs.sh export` | Export log ke file `logs/microservices-<timestamp>.log` |

### Cara Penggunaan (via Makefile)

```bash
# Lihat semua log
make logs

# atau langsung via script:
./scripts/logs.sh errors
./scripts/logs.sh trace a1b2c3d4
./scripts/logs.sh export
```

---

## 4. Docker Compose Dev Override (`docker-compose.dev.yml`)

### Fungsi
File ini di-overlay di atas `docker-compose.microservices.yml` untuk skenario **local development dengan hot-reload**:

| Service | Perubahan vs Production |
|---------|------------------------|
| `auth-service` | Volume mount source code, reload otomatis |
| `dashboard-service` | Volume mount source code, reload otomatis |
| `auth-db` | Port `5433` di-expose ke host (untuk akses psql lokal & migrasi) |
| `dashboard-db` | Port `5434` di-expose ke host |

### Cara Menjalankan

```bash
# Via Makefile (cara paling mudah)
make ms-dev

# Manual
docker compose -f docker-compose.microservices.yml -f docker-compose.dev.yml up --build
```

---

## 5. Docker Compose Production Override (`docker-compose.microservices.prod.yml`)

### Perbedaan vs Development

| Aspek | Development | Production |
|-------|-------------|------------|
| Port DB | Exposed ke host (5433, 5434) | Tidak di-expose (internal only) |
| Port services | Semua exposed | Hanya gateway `:8080` exposed |
| Restart policy | `no` | `restart: always` |
| Source volume mount | Ya (hot-reload) | Tidak |
| Log driver | default | `json-file`, max-size 10m, max-file 3 |

### Cara Menjalankan Production Stack

```bash
make prod
# atau:
docker compose -f docker-compose.microservices.yml -f docker-compose.microservices.prod.yml up -d --build
```

---

## 6. Verifikasi Hasil QA

| Komponen | Status | Catatan |
|----------|:------:|---------|
| `Makefile` — target monolith | ✅ | Semua 11 target terverifikasi |
| `Makefile` — target microservices | ✅ | Semua 10 target terverifikasi |
| `scripts/logs.sh` (Linux) | ✅ | 5 mode: all, errors, trace, metrics, export |
| `scripts/logs.bat` (Windows) | ✅ | 4 mode: all, errors, metrics, export |
| `docker-compose.dev.yml` | ✅ | Hot-reload + DB port exposed |
| `docker-compose.microservices.prod.yml` | ✅ | No exposed ports, restart always |

---

*Laporan oleh Raditya Yudianto (10231076) — Lead QA & Docs*
