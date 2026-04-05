# Artefak Lead DevOps — cc-kelompok-freepalestine

Dokumen ini memetakan **deliverable DevOps** di repository agar penilaian dan revisi dapat diverifikasi dari kode dan dokumentasi.

**Penanggung jawab peran:** Muhammad Khoiruddin Marzuq (10231065) — Lead DevOps.

---

## 1. Ringkasan artefak

| Artefak | Lokasi | Fungsi |
|---------|--------|--------|
| Template env backend | `backend/.env.example` | Variabel wajib: `DATABASE_URL`, JWT, `ALLOWED_ORIGINS`; catatan Docker (`host.docker.internal`) |
| Template env frontend | `frontend/.env.example` | `VITE_API_URL` untuk base URL API |
| Pengabaian secret di Git | `.gitignore` (root) | `.env` tidak ikut commit |
| Script setup otomatis | `setup.sh` | Install Python deps, salin `.env` backend & frontend dari example, `npm install` |
| Panduan setup lengkap | `docs/setup-guide.md` | Clone → PostgreSQL → konfigurasi env → jalankan backend & frontend → troubleshooting → Docker backend |
| Image container backend | `backend/Dockerfile` | Python 3.12-slim, layer cache-friendly, **non-root user** (`appuser`) |
| Build context bersih | `backend/.dockerignore` | Mengecualikan `.env`, cache, venv, `.git` dari image |

---

## 2. Verifikasi cepat

**Lokal (tanpa Docker)**

1. Ikuti [setup-guide.md](setup-guide.md).
2. Backend: `GET http://localhost:8000/health`
3. Frontend: dev server Vite (biasanya port 5173).

**Docker (backend)**

```bash
cd backend
docker build -t cloudapp-backend:local .
docker run --rm -p 8000:8000 --env-file .env cloudapp-backend:local
```

Pastikan `DATABASE_URL` di `.env` untuk container memakai host yang bisa dijangkau dari container (mis. `host.docker.internal` pada Docker Desktop).

---

## 3. Sinkronisasi dengan endpoint `/team` dan README

Data anggota di **`README.md`** dan **`GET /team`** (`backend/main.py`) harus **konsisten**.  
Sesuai catatan penilaian: minimum **4 anggota** per RPS — jika ada anggota ke-4 resmi (NIM + nama), tambahkan ke kedua tempat tersebut dan ke dokumen tim.

---

## 4. Riwayat modul (referensi kurikulum)

| Modul | Kaitan DevOps |
|-------|----------------|
| 2 | `backend/.env.example`, `.gitignore`, `setup.sh` |
| 3 | `frontend/.env.example`, pengecekan `frontend/.env` di `setup.sh`, `VITE_API_URL` |
| 4 | Dokumentasi env (JWT, CORS) di `setup-guide.md` dan `.env.example` |
| 5 | `Dockerfile`, `.dockerignore`, bagian Docker di `setup-guide.md` |

---

*Dokumen ini dapat dilampirkan saat pengajuan revisi penilaian agar artefak DevOps terlihat eksplisit.*
