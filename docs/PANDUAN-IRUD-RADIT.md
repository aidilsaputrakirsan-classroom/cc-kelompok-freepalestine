# Panduan Pengerjaan Modul 1-11 — Irud & Radit

> **Dokumen ini dibuat oleh Ariel** setelah menyelesaikan semua tugas Lead Backend & Lead Frontend untuk Modul 1-11.
> Tujuan: memastikan Irud dan Radit menyelesaikan tugas mereka agar kelompok mendapat nilai penuh.

---

## Status Terkini (Per 14 Mei 2026)

- Branch `ariel` sudah di-push ke GitHub dengan semua pekerjaan Modul 1-15
- Branch `main` di GitHub masih di commit Modul 9 (terakhir push Irud)
- Branch `radit` di GitHub berisi dokumentasi Modul 1-9 (screenshot + laporan)

---

## LANGKAH PERTAMA (Wajib Sebelum Mulai Kerja)

### Untuk Irud:
```bash
git checkout irud
git pull origin irud
git merge origin/ariel
# Resolve conflict jika ada, lalu:
git push origin irud
```

### Untuk Radit:
```bash
git checkout radit
git pull origin radit
git merge origin/ariel
# Resolve conflict jika ada, lalu:
git push origin radit
```

> **PENTING:** Merge branch `ariel` ke branch masing-masing agar mendapat kode terbaru (frontend tests, config.py, ErrorBoundary, microservices, dll).

---

---

# IRUD — Muhammad Khoiruddin Marzuq (Lead DevOps)

## Apa yang SUDAH Irud Kerjakan

| Modul | Yang Sudah Dikerjakan | Bukti |
|-------|----------------------|-------|
| 1 | `docs/member-irud.md` | ✅ Commit `6fef4dd` |
| 3 | Update minor | ✅ Commit `3fb1de2` |
| 5 | Dokumentasi modul 5, setup guide | ✅ Commit `092fb5c`, `d5d70a1` |
| 6 | Optimasi backend Dockerfile (multi-stage build) | ✅ Commit `3263026` |
| 6 | Improvisasi optimisasi image docker | ✅ Commit `25e0794` |
| 9 | CODEOWNERS, PR template, CI/CD workflow, Makefile, CHANGELOG, git-workflow.md, docker-compose.prod.yml, modul09-verification.md | ✅ Commit `e9f8c20` |

## Apa yang BELUM Irud Kerjakan

### Modul 5 — Docker Fundamentals (Lead DevOps)

| Tugas | Status | Detail |
|-------|--------|--------|
| Menulis Dockerfile backend | ✅ Sudah | Ada di `backend/Dockerfile` |
| Build image & push ke Docker Hub | ⚠️ **Belum terbukti** | Tidak ada bukti push ke Docker Hub |
| `.dockerignore` | ✅ Sudah | Ada |

**Yang harus dilakukan:**
```bash
# 1. Build image
cd backend
docker build -t cloudapp-backend:v2 .

# 2. Tag untuk Docker Hub
docker tag cloudapp-backend:v2 DOCKER_USERNAME/cloudapp-backend:v2

# 3. Login & Push
docker login
docker push DOCKER_USERNAME/cloudapp-backend:v2

# 4. Screenshot bukti di Docker Hub → simpan di docs/screenshots/
```

---

### Modul 6 — Docker Advanced (Lead DevOps)

| Tugas | Status | Detail |
|-------|--------|--------|
| Docker network setup | ⚠️ **Tidak terdokumentasi** | Tidak ada bukti `docker network create` |
| PostgreSQL container dengan volume | ⚠️ **Tidak terdokumentasi** | Tidak ada screenshot/docs |
| Push frontend image ke Docker Hub | ❌ **Belum** | Tidak ada bukti |

**Yang harus dilakukan:**
```bash
# 1. Jalankan PostgreSQL di container
docker network create cloudnet
docker run -d --name db --network cloudnet \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=cloudapp -p 5433:5432 \
  -v pgdata:/var/lib/postgresql/data postgres:16-alpine

# 2. Verifikasi
docker ps
docker exec -it db psql -U postgres -d cloudapp -c "\dt"

# 3. Build & push frontend image
cd frontend
docker build -t cloudapp-frontend:v1 .
docker tag cloudapp-frontend:v1 DOCKER_USERNAME/cloudapp-frontend:v1
docker push DOCKER_USERNAME/cloudapp-frontend:v1

# 4. Screenshot semua langkah → docs/screenshots/modul6-*.png
```

---

### Modul 7 — Docker Compose (Lead DevOps)

| Tugas | Status | Detail |
|-------|--------|--------|
| Menulis `docker-compose.yml` | ✅ Sudah | Ada di root project |
| Buat `Makefile` | ✅ Sudah | Lengkap dengan semua target |
| Test `docker compose up -d` berjalan | ⚠️ **Perlu diverifikasi ulang** | Setelah merge ariel, perlu test ulang |

**Yang harus dilakukan:**
```bash
# 1. Pastikan docker-compose.yml berjalan
docker compose up --build -d
docker compose ps

# 2. Test semua service healthy
curl http://localhost:8000/health

# 3. Screenshot docker compose ps → docs/screenshots/modul7-compose-ps.png
# 4. Commit bukti
git add docs/screenshots/
git commit -m "docs(irud): add Docker Compose verification screenshots Modul 7"
```

---

### Modul 9 — Git Workflow (Lead DevOps)

| Tugas | Status | Detail |
|-------|--------|--------|
| Setup branch protection rules | ⚠️ **Belum diaktifkan di GitHub** | Tercatat di modul09-verification.md sebagai "manual checklist" |
| CODEOWNERS | ✅ Sudah | `.github/CODEOWNERS` |
| PR template | ✅ Sudah | `.github/pull_request_template.md` |
| Makefile update (lint, test, pr-check) | ✅ Sudah | Di Makefile |
| `docker-compose.prod.yml` | ✅ Sudah | Ada |
| `docs/git-workflow.md` | ✅ Sudah | Ada |
| CHANGELOG | ✅ Sudah | Ada |

**Yang harus dilakukan (di GitHub UI):**
1. Buka https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine/settings/branches
2. Add branch ruleset untuk `main`:
   - Require pull request before merging ✅
   - Required approvals: 1 ✅
   - Block force pushes ✅
3. Screenshot settings → `docs/screenshots/modul9-branch-protection.png`

---

### Modul 10 — CI Pipeline (Lead DevOps)

| Tugas | Status | Detail |
|-------|--------|--------|
| Menulis `.github/workflows/ci.yml` | ✅ Sudah | Ada (3 jobs: test-backend, build-frontend, build-docker) |
| Verifikasi CI berjalan di GitHub Actions | ⚠️ **Perlu trigger** | CI belum pernah jalan karena belum ada PR ke main |

**Yang harus dilakukan:**
```bash
# 1. Buat PR dari branch ariel ke main
# Di GitHub: New Pull Request → base: main, compare: ariel
# Ini akan trigger CI pipeline

# 2. Pastikan CI passing (hijau)
# 3. Screenshot GitHub Actions → docs/screenshots/modul10-ci-passing.png

# 4. Tambah CI badge di README.md:
# ![CI](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine/actions/workflows/ci.yml/badge.svg)
```

---

### Modul 11 — CD Pipeline (Lead DevOps)

| Tugas | Status | Detail |
|-------|--------|--------|
| Setup Railway project | ❌ **Belum** | Tidak ada bukti deployment |
| Deploy backend ke Railway | ❌ **Belum** | Tidak ada production URL |
| Deploy frontend ke Railway | ❌ **Belum** | Tidak ada production URL |
| Generate Railway token + simpan di GitHub Secrets | ❌ **Belum** | |
| Health check di CD pipeline | ❌ **Belum** | |
| `docs/deployment-guide.md` | ❌ **Belum** | |

**Yang harus dilakukan:**

```bash
# === RAILWAY SETUP ===

# 1. Buka https://railway.app/ → Login with GitHub
# 2. New Project → Empty Project → nama: "telkom-dashboard"
# 3. + Add Service → Database → PostgreSQL
# 4. + Add Service → GitHub Repo → pilih cc-kelompok-freepalestine
#    - Root Directory: /backend
#    - Generate Domain
# 5. Set environment variables di Railway:
#    DATABASE_URL = ${{Postgres.DATABASE_URL}}
#    SECRET_KEY = (generate: python -c "import secrets; print(secrets.token_hex(32))")
#    ALLOWED_ORIGINS = https://FRONTEND_URL.up.railway.app
#    ALGORITHM = HS256
#    ACCESS_TOKEN_EXPIRE_MINUTES = 60
# 6. Deploy frontend:
#    + Add Service → GitHub Repo
#    Root Directory: /frontend
#    Generate Domain
# 7. Verifikasi: buka URL/health → harus return {"status": "healthy"}

# === GITHUB SECRETS ===

# 8. Buka https://railway.app/account/tokens → Create Token
# 9. Buka repo Settings → Secrets → Actions → New secret:
#    Name: RAILWAY_TOKEN
#    Value: (paste token)

# === DOKUMENTASI ===

# 10. Buat docs/deployment-guide.md (lihat template di modul 11)
# 11. Update README dengan production URLs
# 12. Screenshot Railway dashboard → docs/screenshots/modul11-railway.png
```

---

### Ringkasan Tugas Irud yang Belum Selesai

| # | Modul | Tugas | Prioritas |
|---|-------|-------|-----------|
| 1 | 5 | Push image ke Docker Hub + screenshot | Medium |
| 2 | 6 | Push frontend image + screenshot network/volume | Medium |
| 3 | 7 | Verifikasi docker compose setelah merge + screenshot | Medium |
| 4 | 9 | Aktifkan branch protection di GitHub UI | **High** |
| 5 | 10 | Trigger CI via PR + screenshot passing | **High** |
| 6 | 11 | Deploy ke Railway + docs + screenshot | **High** |

---

---

# RADIT — Raditya Yudianto (Lead QA & Docs)

## Apa yang SUDAH Radit Kerjakan

| Modul | Yang Sudah Dikerjakan | Bukti |
|-------|----------------------|-------|
| 1 | `docs/member-radit.md`, laporan Modul 1 | ✅ Commit `429394a`, `2c8359c` |
| 2 | Dokumentasi API test results, screenshot Swagger | ✅ Commit `5b776cf`, `dc154db`, `a06c591` |
| 3 | UI test results + screenshot | ✅ Commit `3b5ce9c`, `1d22638` |
| 4 | Auth test results + screenshot | ✅ Commit `d926309` |
| 5 | Docker cheatsheet, image comparison, container testing | ✅ Commit `39e5ea6`, `9aa43ba`, `140d56b` |
| 7 | Dokumentasi docker compose + screenshot | ✅ Commit `4857bc0` |
| 9 | Dokumentasi git workflow + screenshot (PR, squash merge, git log) | ✅ Commit `1003beb`, `49d598b` |

## Apa yang BELUM Radit Kerjakan

### Modul 6 — Docker Advanced (Lead QA & Docs)

| Tugas | Status | Detail |
|-------|--------|--------|
| Buat `docs/docker-architecture.md` | ❌ **Belum** | Arsitektur 3-container: ports, networks, volumes, env vars |

**Yang harus dilakukan:**
```markdown
# Buat file: docs/docker-architecture.md
# Isi dengan:
# - Diagram arsitektur 3 container (Mermaid)
# - Tabel ports mapping
# - Tabel networks
# - Tabel volumes
# - Tabel environment variables per service
# Lihat contoh di Modul 6 Bagian C (Tugas Lead QA & Docs)
```

---

### Modul 7 — Docker Compose (Lead QA & Docs)

| Tugas | Status | Detail |
|-------|--------|--------|
| Testing lifecycle (up, down, restart) | ✅ Sudah | Screenshot ada |
| Final README review | ⚠️ **Partial** | README perlu update setelah merge ariel |
| `docs/uts-demo-script.md` | ❌ **Belum** | Script demo UTS step-by-step |

**Yang harus dilakukan:**
```markdown
# Buat file: docs/uts-demo-script.md
# Isi: urutan demo UTS (docker compose up, register, login, CRUD, down/up persist)
# Lihat contoh di Modul 7 Bagian C
```

---

### Modul 9 — Git Workflow (Lead QA & Docs)

| Tugas | Status | Detail |
|-------|--------|--------|
| Buat PR untuk update dokumentasi | ✅ Sudah | Branch `docs/modul9-git-workflow` ada |
| Review semua PR | ⚠️ **Belum terbukti** | Tidak ada review comment dari Radit di GitHub |
| Update README | ⚠️ **Partial** | |

**Yang harus dilakukan:**
1. Buka PR yang ada di GitHub
2. Berikan minimal 1 review comment yang substantif pada PR Ariel atau Irud
3. Screenshot review → `docs/screenshots/modul9-review-radit.png`

---

### Modul 10 — CI Pipeline (Lead QA & Docs)

| Tugas | Status | Detail |
|-------|--------|--------|
| Menjalankan & validasi semua test | ❌ **Belum** | Belum ada bukti Radit menjalankan test |
| Update README (CI badge) | ❌ **Belum** | Badge belum ada di README |
| Testing edge cases | ❌ **Belum** | Tidak ada tambahan test dari Radit |

**Yang harus dilakukan:**
```bash
# 1. Pull branch ariel terbaru
git checkout radit
git merge origin/ariel

# 2. Jalankan backend tests
cd backend
pip install -r requirements.txt
pytest test_main.py -v
# Screenshot hasil → docs/screenshots/modul10-backend-tests.png

# 3. Jalankan frontend tests
cd ../frontend
npm install
npm test
# Screenshot hasil → docs/screenshots/modul10-frontend-tests.png

# 4. Buat docs/test-report-modul10.md:
#    - Jumlah test: backend (X passed), frontend (16 passed)
#    - Coverage summary
#    - Edge cases yang ditest
#    - Screenshot bukti

# 5. Tambah CI badge di README.md (setelah CI jalan):
# ![CI](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine/actions/workflows/ci.yml/badge.svg)

# 6. Commit & push
git add docs/ README.md
git commit -m "docs(radit): add test report and CI badge for Modul 10"
git push origin radit
```

---

### Modul 11 — CD Pipeline (Lead QA & Docs)

| Tugas | Status | Detail |
|-------|--------|--------|
| Testing production URL end-to-end | ❌ **Belum** | Belum ada deployment |
| Update README dengan production URLs | ❌ **Belum** | |
| `docs/release-notes-m2.md` | ❌ **Belum** | Release notes Milestone 2 |
| Tag release `v2.0` | ❌ **Belum** | |

**Yang harus dilakukan (SETELAH Irud deploy ke Railway):**
```bash
# 1. Buka production URL yang Irud deploy
# 2. Lakukan smoke test:
#    - Register user baru
#    - Login
#    - Create item/sales
#    - Read items
#    - Update item
#    - Delete item
#    - Check /health
# 3. Dokumentasikan di docs/production-test.md (tabel pass/fail)
# 4. Screenshot setiap langkah → docs/screenshots/modul11-prod-*.png

# 5. Buat docs/release-notes-m2.md:
#    - Version: 2.0.0
#    - Fitur: CI/CD, Git workflow, Docker Compose
#    - Production URLs
#    - Known issues
#    - Kontribusi tim

# 6. Update README:
#    - Tambah section "Live Demo" dengan URLs
#    - Tambah CI/CD badge
#    - Update roadmap (week 9-11 ✅)

# 7. Tag release
git tag v2.0
git push origin v2.0

# 8. Commit semua
git add docs/ README.md
git commit -m "docs(radit): add release notes, production test, and README update Modul 11"
git push origin radit
```

---

### Ringkasan Tugas Radit yang Belum Selesai

| # | Modul | Tugas | Prioritas |
|---|-------|-------|-----------|
| 1 | 6 | `docs/docker-architecture.md` (diagram arsitektur) | Medium |
| 2 | 7 | `docs/uts-demo-script.md` | Low |
| 3 | 9 | Review comment di PR (GitHub UI) | Medium |
| 4 | 10 | Jalankan tests + `docs/test-report-modul10.md` + CI badge | **High** |
| 5 | 11 | Production smoke test + `docs/release-notes-m2.md` + tag v2.0 | **High** |

---

---

# Urutan Pengerjaan yang Disarankan

## Irud (harus duluan karena Radit butuh production URL):

```
1. Merge branch ariel → irud
2. Aktifkan branch protection di GitHub (Modul 9)
3. Buat PR ariel → main, trigger CI (Modul 10)
4. Deploy ke Railway (Modul 11) ← PRIORITAS UTAMA
5. Push images ke Docker Hub + screenshot (Modul 5-6)
6. Commit semua docs/screenshots
7. Push ke branch irud
```

## Radit (setelah Irud deploy):

```
1. Merge branch ariel → radit
2. Jalankan tests lokal + dokumentasi (Modul 10)
3. Buat docker-architecture.md (Modul 6)
4. Buat uts-demo-script.md (Modul 7)
5. Review PR di GitHub (Modul 9)
6. Smoke test production URL + release notes (Modul 11)
7. Tag v2.0
8. Push ke branch radit
```

---

## Catatan Penting

1. **JANGAN merge branch `radit` ke `ariel` atau `main`** — branch Radit menghapus banyak file penting (microservices, CI/CD, dll) karena dimulai dari versi lama.
2. **Selalu merge `origin/ariel` ke branch kalian** sebelum mulai kerja.
3. **Setelah semua selesai**, Irud sebagai Lead DevOps yang merge `ariel` → `main` via PR.
4. Semua tugas di atas bisa dikerjakan dalam **1-2 hari** jika fokus.

---

*Dokumen ini dibuat oleh Ariel Itsbat Nurhaq — 14 Mei 2026*
