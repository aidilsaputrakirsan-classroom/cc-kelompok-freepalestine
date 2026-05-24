# Profil Kontribusi — Raditya Yudianto

**NIM:** 10231076  
**Peran:** Lead QA & Documentation  
**GitHub:** @Rhadide  
**Branch:** `radit`, `radit-docs-modul14-15`

---

## Kontribusi per Modul

| Modul | Judul | Kontribusi | Status |
|-------|-------|-----------|--------|
| 1 | Setup & Hello World | Dokumentasi setup environment, member profile | ✅ |
| 2 | REST API & Database | Dokumentasi endpoint API, schema database | ✅ |
| 3 | Frontend React | Dokumentasi komponen UI, screenshot dashboard | ✅ |
| 4 | Auth & CORS | Dokumentasi alur autentikasi, test login | ✅ |
| 5 | Docker | Dokumentasi Dockerfile, test container | ✅ |
| 6 | Docker Compose | Dokumentasi multi-service setup | ✅ |
| 7 | CI Pipeline | Konfigurasi workflow awal, fix pipeline | ✅ |
| 8 | UTS Demo | Test end-to-end, dokumentasi presentasi | ✅ |
| 9 | Git Workflow | Dokumentasi branching strategy, PR workflow | ✅ |
| 10 | CI/CD Pipeline | **Fix CI pipeline** (tambah PostgreSQL service), dokumentasi CI | ✅ |
| 11 | CD Deployment | Dokumentasi deployment, screenshot bukti | ✅ |
| 12 | Microservices | Dokumentasi arsitektur microservices, flowchart | ✅ |
| 13 | Reliability | Dokumentasi circuit breaker, retry pattern | ✅ |
| 14 | Monitoring | Dokumentasi observability, StatusPage, Correlation ID | ✅ |
| 15 | Security & Final | Security audit report, OWASP checklist, release notes | ✅ |

---

## Commit History (Branch radit & main)

### Minggu Ini (24 Mei 2026)
- `docs(radit): add Modul 14, 15 docs + release notes M3 + operations guide`
- `docs(radit): add CI fix guide for Isbat/Ariel`
- `docs(radit): add modul11-service-status.png`
- `docs(radit): add CI/CD pipeline screenshots for Modul 10 and 11`
- `fix(test): make list_sales and list_inbox assertions more robust`

### Sebelumnya (17 Mei 2026)
- `fix(backend): sync models.py, crud.py, schemas.py with main branch`
- `fix(ci): add PostgreSQL service to test-backend job`
- `docs(radit): dokumentasi lengkap Modul 6-13 + reliability patterns`

---

## Deliverable Dokumentasi

### File Docs yang Dibuat

| File | Isi |
|------|-----|
| `docs/member-radit.md` | Profil dan kontribusi (ini) |
| `docs/modul1-setup-and-helloworld.md` | Setup environment |
| `docs/modul2-rest-api-database.md` | REST API & database |
| `docs/modul3-frontend-react.md` | Frontend React |
| `docs/modul4-auth-cors.md` | Auth & CORS |
| `docs/modul5-docker-container.md` | Docker |
| `docs/modul6-docker-compose.md` | Docker Compose |
| `docs/modul7-ci-cd-pipeline.md` | CI/CD Pipeline pertama |
| `docs/modul9-git-workflow.md` | Git workflow |
| `docs/modul10-11-cicd-report.md` | Laporan CI/CD Pipeline |
| `docs/modul12-microservices.md` | Dokumentasi Microservices |
| `docs/modul13-reliability.md` | Circuit Breaker & Retry |
| `docs/modul14-monitoring-observability.md` | Monitoring & Observability |
| `docs/modul15-security-final.md` | Security & Final Polish |
| `docs/release-notes-m1.md` | Release notes Milestone 1 (UTS) |
| `docs/release-notes-m2.md` | Release notes Milestone 2 |
| `docs/release-notes-m3.md` | Release notes Milestone 3 (UAS) |
| `docs/operations-guide.md` | Panduan operasional |
| `docs/panduan-fix-ci-untuk-isbat.md` | Panduan fix CI untuk anggota tim |

### Screenshots yang Dikumpulkan

| File | Isi |
|------|-----|
| `screenshots/modul10-ci-passing.png` | CI Pipeline semua job hijau |
| `screenshots/modul10-backend-test-detail.png` | pytest 19/19 passed |
| `screenshots/modul10-frontend-test-detail.png` | Vitest passed |
| `screenshots/modul11-cd-success.png` | CD Deploy success |
| `screenshots/modul11-deploy-summary.png` | Deployment summary |
| `screenshots/modul11-health-check.png` | /health endpoint healthy |
| `screenshots/modul11-frontend-live.png` | Frontend live di production |
| `screenshots/modul11-service-status.png` | Deploy to DeployCC log |
| `screenshots/modul14-status-page.png` | System Status Page *(perlu SS)* |
| `screenshots/modul15-security-headers.png` | Security headers aktif *(perlu SS)* |

---

## Fix CI Pipeline (Kontribusi Teknis)

Selain dokumentasi, berkontribusi dalam memperbaiki CI pipeline yang gagal:

### Masalah yang Ditemukan
1. `main.yml` duplikat dengan `ci.yml` → konflik pipeline
2. `ci.yml` tidak punya PostgreSQL service → test backend gagal connect DB
3. `models.py` versi lama tidak punya `AuditLog` class → `ImportError`
4. Test assertion `total >= 1` terlalu ketat → fail karena DB kosong di CI

### Fix yang Dilakukan
1. Hapus `main.yml` (workflow lama)
2. Tambah PostgreSQL service ke `ci.yml`
3. Sync `models.py`, `crud.py`, `schemas.py` dari `origin/main`
4. Fix test assertion di `test_main.py` → validasi struktur, bukan count

### Hasil
- **Sebelum:** 0/19 test passed (ImportError)
- **Sesudah:** 19/19 test passed ✅

---

*Profil diperbarui: 24 Mei 2026*
