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
| GitHub Actions CI | ✅ | Pipeline lulus (centang hijau) |
| Branch Protection | ✅ | Push langsung ke main ditolak |
| Pull Request Flow | ✅ | PR dibuat, di-review, di-merge |

---

## 📅 Riwayat Aktivitas Mingguan

| Minggu | Tanggal | Aktivitas |
|--------|---------|-----------|
| W1 (Modul 1) | Mar 2026 | Setup dokumentasi awal, validasi hello world endpoint |
| W2 (Modul 2) | Mar 2026 | Dokumentasi REST API, testing CRUD via Swagger |
| W3 (Modul 3-4) | Mar 2026 | Dokumentasi frontend dan auth, validasi integrasi |
| W5 (Modul 5-7) | Apr 2026 | Dokumentasi Docker, setup CI pipeline, validasi compose |
| W9 (Modul 9) | Mei 2026 | Dokumentasi Git Workflow, setup branch protection, buat PR |
