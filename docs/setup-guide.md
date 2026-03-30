# Panduan Setup Proyek (Clone → Running)

Panduan ini menjelaskan langkah **dari nol** sampai aplikasi full-stack (FastAPI + React + PostgreSQL) bisa dijalankan di komputer lokal. Ikuti urutan berikut.

---

## 1. Prasyarat

Pastikan sudah terpasang:

| Perangkat lunak | Versi minimal | Kegunaan |
|-----------------|---------------|----------|
| **Git** | Terbaru | Clone repository |
| **Python** | 3.10+ | Backend FastAPI |
| **Node.js** | 18+ (disertai npm) | Frontend React (Vite) |
| **PostgreSQL** | 14+ (disarankan) | Database aplikasi |

**Windows:** Jika ada beberapa versi Python (misalnya Laragon 3.10 dan Python 3.12), gunakan **satu** Python yang sama untuk `pip install` dan `uvicorn`, misalnya:

```bash
py -3.12 -m pip install -r requirements.txt
py -3.12 -m uvicorn main:app --reload --port 8000
```

---

## 2. Clone repository

```bash
git clone <URL-repository-tim-Anda>.git
cd cc-kelompok-freepalestine
```

Ganti `<URL-repository-tim-Anda>` dengan URL GitHub Classroom / tim Anda.

---

## 3. Database PostgreSQL

1. Pastikan layanan PostgreSQL **berjalan**.
2. Buat database untuk aplikasi ini (nama default di template: `cloudapp`):

   ```sql
   CREATE DATABASE cloudapp;
   ```

3. Catat **username**, **password**, **host** (biasanya `localhost`), dan **port** (biasanya `5432`).

Format connection string yang dipakai backend:

```text
postgresql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE
```

Contoh:

```text
postgresql://postgres:passwordAnda@localhost:5432/cloudapp
```

> **Catatan:** Tabel dibuat otomatis saat backend pertama kali jalan (`SQLAlchemy` `create_all`). Tidak perlu menjalankan migrasi manual untuk setup awal.

---

## 4. Konfigurasi environment (backend)

1. Masuk folder backend:

   ```bash
   cd backend
   ```

2. Salin template environment:

   ```bash
   # Linux / macOS / Git Bash
   cp .env.example .env
   ```

   Di **PowerShell**:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Buka file **`backend/.env`** dan sesuaikan **`DATABASE_URL`** dengan kredensial PostgreSQL Anda:

   ```env
   DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@localhost:5432/cloudapp
   ```

4. **Jangan** commit file `.env`. File ini sudah diabaikan oleh `.gitignore`.

---

## 5. Install dependency & jalankan backend

Masih di folder `backend`:

```bash
pip install -r requirements.txt
```

Lalu jalankan API:

```bash
uvicorn main:app --reload --port 8000
```

Atau dengan Python tertentu (Windows):

```bash
py -3.12 -m uvicorn main:app --reload --port 8000
```

**Cek berhasil:**

- Buka http://localhost:8000/docs — dokumentasi Swagger
- Buka http://localhost:8000/health — harus mengembalikan JSON status sehat

Biarkan terminal ini tetap berjalan selama development.

---

## 6. Konfigurasi environment (frontend)

Buka **terminal baru** (root project):

1. Masuk folder frontend:

   ```bash
   cd frontend
   ```

2. Salin template:

   ```bash
   cp .env.example .env
   ```

   PowerShell: `Copy-Item .env.example .env`

3. Isi **`frontend/.env`** (default untuk backend lokal):

   ```env
   VITE_API_URL=http://localhost:8000
   ```

   Jika backend di mesin atau port lain, ubah URL ini.

4. Jangan commit `frontend/.env` (sudah di-cover `.gitignore` di root untuk nama `.env`).

---

## 7. Install dependency & jalankan frontend

Masih di folder `frontend`:

```bash
npm install
npm run dev
```

**Cek berhasil:**

- Buka URL yang ditampilkan Vite (biasanya http://localhost:5173)

Anda perlu **dua terminal**: satu backend (port 8000), satu frontend (port 5173).

---

## 8. Otomatisasi dengan `setup.sh` (opsional)

Di **Git Bash** atau **WSL**, dari **root** repository:

```bash
chmod +x setup.sh
./setup.sh
```

Script akan:

- Meng-install dependency Python di `backend/`
- Membuat `backend/.env` dari `.env.example` jika belum ada
- Membuat `frontend/.env` dari `.env.example` jika belum ada
- Menjalankan `npm install` di `frontend/`

Setelah itu Anda tetap harus:

1. Mengedit **`backend/.env`** (password database yang benar).
2. Menjalankan backend dan frontend secara manual (perintah di bagian 5 dan 7).

---

## 9. Ringkasan perintah cepat

Setelah PostgreSQL dan `.env` siap:

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

---

## 10. Troubleshooting

| Gejala | Kemungkinan penyebab | Tindakan |
|--------|----------------------|----------|
| `DATABASE_URL tidak ditemukan di .env!` | `backend/.env` kosong / tidak ada | Buat dari `.env.example`, isi `DATABASE_URL`. |
| `No module named uvicorn` | Dependency belum di-install atau pakai Python lain | `cd backend` lalu `pip install -r requirements.txt` dengan **Python yang sama** yang dipakai menjalankan `uvicorn`. |
| Frontend tidak bisa ambil data API | Backend mati / URL salah | Pastikan backend jalan; cek `VITE_API_URL` di `frontend/.env`. Restart `npm run dev` setelah mengubah `.env`. |
| Error koneksi PostgreSQL | DB belum dibuat / password salah | Uji koneksi dengan psql atau pgAdmin; perbaiki string di `DATABASE_URL`. |
| Port 8000 atau 5173 sudah dipakai | Aplikasi lain memakai port | Tutup proses tersebut atau ubah port (misalnya `uvicorn ... --port 8001` dan sesuaikan `VITE_API_URL`). |
