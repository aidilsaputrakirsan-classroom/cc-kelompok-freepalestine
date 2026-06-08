# 👤 Profil Anggota — Raditya Yudianto

| Field | Detail |
|-------|--------|
| **Nama** | Raditya Yudianto |
| **NIM** | 10231076 |
| **Peran** | Lead QA & Docs |
| **GitHub** | @Rhadide |
| **Email** | raditya@student.itk.ac.id |

---

## 🎯 Tanggung Jawab Utama

Sebagai **Lead QA & Docs**, tanggung jawab utama meliputi:
- Menulis dan memelihara dokumentasi teknis setiap modul
- Memastikan kualitas kode lewat pengujian manual dan review
- Membuat dan memelihara file `README.md` dan panduan setup
- Melakukan validasi integrasi antar komponen (Frontend ↔ Backend ↔ Database)
- Memimpin proses review Pull Request anggota lain

---

## 📋 Log Kontribusi per Modul

### Modul 1 — Setup & Hello World
- Menulis dokumentasi `modul1-setup-and-helloworld.md`
- Validasi endpoint `/health` dan `/team` berjalan di server lokal
- Update `README.md` dengan instruksi setup awal

### Modul 2 — REST API & Database
- Menulis dokumentasi `modul2-rest-api-database.md`
- Validasi semua endpoint CRUD lewat Swagger UI (`/docs`)
- Testing autentikasi JWT: register → login → akses endpoint protected

### Modul 3 — Frontend React
- Menulis dokumentasi `modul3-frontend-react.md`
- Validasi tampilan dashboard di browser (login, navigasi, data)
- Testing integrasi frontend dengan backend API

### Modul 4 — Auth & CORS
- Menulis dokumentasi `modul4-auth-cors.md`
- Verifikasi konfigurasi CORS tidak memblokir request frontend
- Testing alur login dan validasi JWT token

### Modul 5 — Docker Container
- Menulis dokumentasi `modul5-docker-container.md`
- Validasi Docker build berhasil: `docker build -t freepalestine-backend .`
- Testing container berjalan: `docker run -d -p 8080:8000 freepalestine-backend`

### Modul 6 — Docker Compose (Multi-Container)
- Menulis dokumentasi `modul6-docker-compose.md`
- Validasi `docker compose up --build -d` menjalankan 3 service sekaligus
- Testing healthcheck database sebelum backend startup

### Modul 7 — Orkestrasi & CI Pipeline
- Menulis dokumentasi `modul7-ci-cd-pipeline.md`
- Setup GitHub Actions workflow (`.github/workflows/main.yml`)
- Validasi pipeline berhasil berjalan (centang hijau di tab Actions)

### Modul 9 — Git Workflow & Branching
- Menulis dokumentasi `modul9-git-workflow.md`
- Setup Branch Protection Rules di GitHub (Settings → Rules → Rulesets)
- Membuat Pull Request pertama tim: `docs/modul9-git-workflow → main`
- Melakukan proses code review dan squash merge

### Modul 10 — CI Pipeline (Continuous Integration)
- Menulis laporan testing `docs/test-report-modul10.md`
- Mendokumentasikan 4-job CI pipeline: test-backend, test-frontend, build-docker, notify-failure
- Membuat tabel hasil 11 backend tests (pytest) dan 16 frontend tests (Vitest)
- Mendokumentasikan edge cases: login salah, akses unauthorized, endpoint 404
- Menganalisis coverage backend (~85%) dan manfaat parallel jobs + caching

### Modul 11 — CD Pipeline & Release
- Menulis release notes Milestone 2 `docs/release-notes-m2.md`
- Mendokumentasikan fitur baru v2.0.0: CI/CD pipeline, microservices, upload CSV
- Dokumentasi production environment di server DeployCC
- Membuat flowchart alur CI/CD dengan Mermaid (push → CI → merge → CD → server)
- Mendokumentasikan deployment via systemctl dan Cloudflare Tunnel

### Modul 12 — Microservices Decomposition
- Menulis dokumentasi `docs/modul12-microservices.md`
- Membuat diagram arsitektur microservices (Frontend → Gateway → Auth/Dashboard)
- Mendokumentasikan full API contract: Auth Service (6 endpoints) + Dashboard (15 endpoints)
- Dokumentasi Nginx Gateway routing dan rate limiting rules
- Sequence diagram alur Login dan Create Revenue (inter-service communication)
- Mendokumentasikan database-per-service pattern dan integer reference antar service

### Modul 13 — Reliability Patterns
- Menulis dokumentasi `docs/modul13-reliability.md`
- Mendokumentasikan exponential backoff retry (3 attempts: 0.5s, 1s, 2s)
- Membuat state machine diagram circuit breaker (CLOSED → OPEN → HALF_OPEN)
- Dokumentasi graceful degradation saat Auth Service down
- Menyusun test script untuk memverifikasi retry dan circuit breaker
- Mendokumentasikan konfigurasi: threshold=3, cooldown=30s, timeout=5s

### Modul 6 — Docker Arsitektur (Retroaktif)
- Membuat `docs/docker-architecture.md` dengan diagram arsitektur 3-container
- Dokumentasi port mapping, Docker network, dan volume configuration
- Tabel environment variables per container
- Penjelasan multi-stage build dan perbandingan ukuran image

### Modul 7 — Demo Script (Retroaktif)
- Membuat `docs/uts-demo-script.md` dengan 6-fase panduan demo
- Script demo CRUD Revenue, data persistence, dan inter-container networking
- Checklist demo UTS dan troubleshooting guide

---

## 🧪 Hasil Pengujian

| Komponen | Status | Keterangan |
|----------|:------:|------------|
| Backend API (`/health`) | ✅ | Returning status healthy |
| Auth Login | ✅ | JWT token berhasil digenerate |
| Auth Register | ✅ | User berhasil tersimpan di DB |
| Frontend Dashboard | ✅ | Data revenue tampil dengan benar |
| Docker Build | ✅ | Image berhasil dibuild |
| Docker Compose | ✅ | 3 service berjalan bersamaan |
| GitHub Actions CI | ✅ | Pipeline lulus — 11 backend + 16 frontend tests |
| Branch Protection | ✅ | Push langsung ke main ditolak |
| Pull Request Flow | ✅ | PR dibuat, di-review, di-merge |
| Auth Microservice | ✅ | POST /auth/register, /auth/login, GET /auth/verify |
| Dashboard Microservice | ✅ | CRUD sales & inbox, summary, monthly |
| API Gateway (Nginx) | ✅ | Routing dengan rate limiting |
| Circuit Breaker | ✅ | CLOSED → OPEN (3 failures) → HALF_OPEN → CLOSED |
| Retry Logic | ✅ | 3 attempts dengan exponential backoff berhasil |
| Graceful Degradation | ✅ | Degraded mode aktif saat Auth Service down |
| JSON Structured Logging | ✅ | Log terstruktur dengan correlation ID yang terintegrasi |
| System Status Page | ✅ | Pemantauan realtime frontend aktif dengan auto-refresh 10s |
| Nginx Rate Limiting | ✅ | Login throttling & API rate limit aktif (HTTP 429) |
| Security Headers | ✅ | Proteksi X-Frame-Options, CSP, nosniff aktif |
| Input Size Restriction | ✅ | Pydantic length boundaries memblokir oversized payload |
| Production Log Hardening | ✅ | Log rahasia tersaring penuh pada client-side console |
| Integration Tests (8 tests) | ✅ | Cross-service auth verify, CRUD via gateway — semua passed |
| Makefile Targets | ✅ | 21 target terverifikasi — monolith, microservices, logging, prod |
| Migration Script | ✅ | Migrasi users/sales/inbox dari monolith ke MS DB berhasil |
| Docker Compose Prod Override | ✅ | Hardened config: no exposed ports, restart always, log rotation |

---


## 📅 Riwayat Aktivitas Mingguan

| Minggu | Tanggal | Aktivitas |
|--------|---------|-----------| 
| W1 (Modul 1) | Mar 2026 | Setup dokumentasi awal, validasi hello world endpoint |
| W2 (Modul 2) | Mar 2026 | Dokumentasi REST API, testing CRUD via Swagger |
| W3 (Modul 3-4) | Mar 2026 | Dokumentasi frontend dan auth, validasi integrasi |
| W5 (Modul 5-7) | Apr 2026 | Dokumentasi Docker, setup CI pipeline, validasi compose |
| W9 (Modul 9) | Mei 2026 | Dokumentasi Git Workflow, setup branch protection, buat PR |
| W10 (Modul 10) | Mei 2026 | Laporan CI testing, dokumentasi pytest + Vitest, CI badge |
| W11 (Modul 11) | Mei 2026 | Release notes Milestone 2, deployment docs DeployCC |
| W12 (Modul 12) | Mei 2026 | Dokumentasi arsitektur microservices, API contract, sequence diagram |
| W13 (Modul 13) | Mei 2026 | Dokumentasi circuit breaker dan retry reliability patterns |
| W14 (Retroaktif) | Mei 2026 | Dokumentasi docker-architecture dan uts-demo-script |
| W15 (Modul 14-15) | Mei 2026 | Dokumentasi monitoring, audit keamanan, operations guide, release notes M3 |
| W16 (Review & QA) | Jun 2026 | Review integrasi DevOps Irud: integration tests, migration script, Makefile, compose overrides |
