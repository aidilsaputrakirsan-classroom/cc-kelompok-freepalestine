# Script Demo UTS — Docker Compose Full Stack

**Lead QA & Docs:** Raditya Yudianto (10231076)  
**Mata Kuliah:** Komputasi Awan — Modul 7 (Docker Compose)  
**Tanggal:** 17 Mei 2026

---

## Tujuan

Script ini adalah panduan **step-by-step** untuk melakukan demo aplikasi Dashboard Telkom Regional 4 Kalimantan menggunakan Docker Compose. Dokumen ini digunakan sebagai referensi saat presentasi UTS/UAS.

---

## Prasyarat

Sebelum demo dimulai, pastikan:
- [x] Docker Desktop sudah terinstall dan running
- [x] Repository sudah di-clone di laptop
- [x] Port 3000, 8000, dan 5432 tidak digunakan aplikasi lain

```bash
# Cek Docker versi
docker --version
docker compose version

# Cek port yang digunakan
netstat -an | findstr ":3000 :8000 :5432"
```

---

## FASE 1: Persiapan (2 menit)

### Langkah 1: Clone repository (jika belum)
```bash
git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine.git
cd cc-kelompok-freepalestine
```

### Langkah 2: Cek struktur project
```bash
# Lihat struktur folder
ls -la
# Pastikan ada: docker-compose.yml, backend/, frontend/

cat docker-compose.yml
# Lihat konfigurasi services
```

---

## FASE 2: Jalankan Aplikasi (3 menit)

### Langkah 3: Build dan jalankan semua container
```bash
# Build image dan jalankan container (detached mode)
docker compose up --build -d
```

**Output yang diharapkan:**
```
[+] Building backend ... done
[+] Building frontend ... done
[+] Running 3/3
 ✔ Container cc-kelompok-freepalestine-db-1        Running
 ✔ Container cc-kelompok-freepalestine-backend-1   Running
 ✔ Container cc-kelompok-freepalestine-frontend-1  Running
```

### Langkah 4: Verifikasi semua container berjalan
```bash
docker compose ps
```

**Output yang diharapkan:**
```
NAME                                       STATUS    PORTS
cc-...-db-1        Up 30 seconds  0.0.0.0:5432->5432/tcp
cc-...-backend-1   Up 30 seconds  0.0.0.0:8000->8000/tcp
cc-...-frontend-1  Up 30 seconds  0.0.0.0:3000->3000/tcp
```

### Langkah 5: Cek health endpoint backend
```bash
curl http://localhost:8000/health
```

**Output:**
```json
{
  "status": "healthy",
  "service": "backend",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## FASE 3: Demo Fitur Aplikasi (10 menit)

### Langkah 6: Buka aplikasi di browser

Buka: **http://localhost:3000**

Aplikasi akan menampilkan halaman login Dashboard Telkom Regional 4 Kalimantan.

### Langkah 7: Login dengan akun default

| User | Email | Password |
|------|-------|----------|
| Admin | ariel@student.itk.ac.id | password123 |
| Viewer | viewer@telkom.co.id | viewer123 |

**Gunakan akun Admin untuk demo penuh.**

### Langkah 8: Demo Dashboard
1. Setelah login → tampil halaman **Dashboard**
2. Tunjukkan **KPI Cards**: Total Revenue, Total Witel, Total Produk
3. Tunjukkan **Line Chart**: Trend revenue bulanan
4. Tunjukkan **Bar Chart**: Perbandingan per Witel
5. Tunjukkan **Donut Chart**: Revenue per channel

### Langkah 9: Demo CRUD Revenue
1. Klik menu **Revenue** di sidebar
2. **CREATE**: Klik tombol "Tambah Data"
   - Isi form: Witel, Bulan, Produk, Revenue
   - Klik Save → Data muncul di tabel
3. **READ**: Data tampil di tabel dengan pagination
4. **UPDATE**: Klik Edit pada salah satu baris
   - Ubah nilai Revenue
   - Klik Save → Nilai berubah di tabel
5. **DELETE**: Klik Delete pada baris
   - Konfirmasi → Data hilang dari tabel

### Langkah 10: Demo Upload CSV
1. Klik menu **Upload** di sidebar
2. Download template CSV yang tersedia
3. Upload file CSV berisi data revenue
4. Tunjukkan data masuk ke tabel

### Langkah 11: Demo Fitur Lain
- **Inbox/Customer Care**: Manajemen tiket customer
- **Leaderboard**: Ranking Witel berdasarkan revenue
- **About**: Informasi tim dan tech stack

---

## FASE 4: Demo Data Persistence (3 menit)

> **Poin Penting:** Buktikan bahwa data tidak hilang saat container di-restart!

### Langkah 12: Tambahkan data baru
Buat 1 entri revenue baru yang mudah dikenali (misal: nama Witel "TEST-DEMO-UTS")

### Langkah 13: Stop semua container
```bash
docker compose down
```

**Output:**
```
[+] Running 4/4
 ✔ Container cc-...-frontend-1  Removed
 ✔ Container cc-...-backend-1   Removed
 ✔ Container cc-...-db-1        Removed
 ✔ Network cc-...-default        Removed
```

> **Catatan:** Container dihapus, TAPI volume `pgdata` masih ada!

### Langkah 14: Jalankan kembali (tanpa rebuild)
```bash
docker compose up -d
# Tidak perlu --build karena image sudah ada
```

### Langkah 15: Verifikasi data masih ada
```bash
# Buka http://localhost:3000
# Login kembali
# Cari data "TEST-DEMO-UTS" yang tadi dibuat
```

**Hasil:** Data masih ada → Bukti persistensi data dengan Docker volume ✅

---

## FASE 5: Perintah Berguna Docker Compose (2 menit)

```bash
# Lihat logs semua service
docker compose logs

# Lihat logs service tertentu (real-time)
docker compose logs -f backend

# Restart satu service
docker compose restart backend

# Scale service (buka multiple instance)
docker compose up --scale backend=2 -d

# Stop tanpa hapus container
docker compose stop

# Hapus container DAN volume (data hilang!)
docker compose down -v

# Lihat penggunaan resource
docker stats
```

---

## FASE 6: Demo Inter-Container Networking

```bash
# Masuk ke container backend
docker exec -it cc-kelompok-freepalestine-backend-1 sh

# Dari dalam backend, panggil database (menggunakan nama service)
ping db
# Atau tes koneksi
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres123@db:5432/cloudapp'); print('Connected!')"
exit
```

**Penjelasan:** Container `backend` bisa menjangkau `db` menggunakan nama service — inilah keuntungan Docker network!

---

## Troubleshooting Saat Demo

| Masalah | Solusi |
|---------|--------|
| Port 3000 sudah dipakai | `docker compose down` → stop aplikasi lain → jalankan lagi |
| Container crash/exit | `docker compose logs backend` untuk lihat error |
| Database tidak connect | Tunggu 10-15 detik setelah `up` sebelum akses backend |
| Gambar tidak tampil | Hard refresh browser (Ctrl+Shift+R) |
| Login gagal | Pastikan seed data sudah dijalankan: `docker exec ... python seed.py` |

---

## Checklist Demo UTS

- [ ] Semua 3 container running (`docker compose ps`)
- [ ] Health endpoint mengembalikan `"status": "healthy"`
- [ ] Login berhasil
- [ ] Dashboard menampilkan data dan chart
- [ ] CRUD berhasil (Create, Read, Update, Delete)
- [ ] Data persist setelah `docker compose down` + `docker compose up`
- [ ] Inter-container networking terbukti

---

*Script demo dibuat oleh Raditya Yudianto (10231076) — Lead QA & Docs*
