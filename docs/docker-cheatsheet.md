# 🐳 Docker Cheatsheet — cc-kelompok-freepalestine

**Dibuat oleh:** Raditya Yudianto (Lead Frontend)  
**Tanggal:** 31 Maret 2026  
**Referensi:** Modul 5 — Docker Fundamentals

---

## 📦 Build Image

| Command | Keterangan |
|---------|------------|
| `docker build -t cloudapp-backend:v1 .` | Build image dari Dockerfile di folder saat ini |
| `docker build -t cloudapp-backend:v1 ./backend` | Build dari subfolder backend |
| `docker build --no-cache -t cloudapp-backend:v1 .` | Build ulang tanpa cache (fresh build) |
| `docker images` | Lihat semua image yang tersimpan di lokal |
| `docker images cloudapp-backend` | Filter image berdasarkan nama |

**Contoh untuk proyek ini:**
```bash
cd backend
docker build -t cloudapp-backend:v1 .
```

---

## 🏃 Run Container

| Command | Keterangan |
|---------|------------|
| `docker run -p 8000:8000 cloudapp-backend:v1` | Jalankan container, map port host:container |
| `docker run -d -p 8000:8000 cloudapp-backend:v1` | Jalankan di background (detached mode) |
| `docker run --env-file .env cloudapp-backend:v1` | Jalankan dengan environment variables dari file |
| `docker run --name backend cloudapp-backend:v1` | Beri nama container agar mudah direferensi |

**Contoh untuk proyek ini (lengkap):**
```bash
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name backend \
  cloudapp-backend:v1
```

---

## 🔍 Inspect & Monitor

| Command | Keterangan |
|---------|------------|
| `docker ps` | Lihat container yang sedang berjalan |
| `docker ps -a` | Lihat semua container (termasuk yang sudah berhenti) |
| `docker logs backend` | Lihat log output container |
| `docker logs -f backend` | Ikuti log secara real-time (follow) |
| `docker inspect backend` | Detail lengkap container dalam format JSON |
| `docker stats` | Monitoring CPU, memory, network secara live |

---

## 💻 Masuk ke Dalam Container

| Command | Keterangan |
|---------|------------|
| `docker exec -it backend bash` | Buka terminal bash di dalam container |
| `docker exec -it backend sh` | Gunakan sh jika bash tidak tersedia (alpine) |
| `docker exec backend python --version` | Jalankan satu command tanpa masuk shell |

**Di dalam container, bisa cek:**
```bash
ls -la           # Lihat file
python --version # Cek versi Python
pip list         # Lihat packages terinstall
env              # Lihat environment variables
exit             # Keluar dari container
```

---

## 🛑 Stop & Remove

| Command | Keterangan |
|---------|------------|
| `docker stop backend` | Hentikan container dengan nama "backend" |
| `docker stop $(docker ps -q)` | Hentikan semua container yang berjalan |
| `docker rm backend` | Hapus container (harus sudah di-stop dulu) |
| `docker rm $(docker ps -aq)` | Hapus semua container |
| `docker rmi cloudapp-backend:v1` | Hapus image |

---

## ☁️ Push & Pull ke Docker Hub

| Command | Keterangan |
|---------|------------|
| `docker login` | Login ke Docker Hub |
| `docker tag cloudapp-backend:v1 USERNAME/cloudapp-backend:v1` | Beri tag dengan username Docker Hub |
| `docker push USERNAME/cloudapp-backend:v1` | Upload image ke Docker Hub |
| `docker pull USERNAME/cloudapp-backend:v1` | Download image dari Docker Hub |

**Contoh untuk proyek ini:**
```bash
docker login
docker tag cloudapp-backend:v1 raditya/cloudapp-backend:v1
docker push raditya/cloudapp-backend:v1
```

---

## 🧹 Cleanup

| Command | Keterangan |
|---------|------------|
| `docker image prune` | Hapus dangling images (tanpa tag) |
| `docker container prune` | Hapus semua container yang sudah stop |
| `docker system prune` | Bersihkan semua resource tidak terpakai |
| `docker system prune -a` | ⚠️ Hapus SEMUA images, containers, networks tak terpakai |

---

## 📋 Quick Reference untuk Proyek Ini

```bash
# 1. Build backend image
cd backend
docker build -t cloudapp-backend:v1 .

# 2. Jalankan backend di container
docker run -d -p 8000:8000 --env-file .env --name backend cloudapp-backend:v1

# 3. Test API berjalan
curl http://localhost:8000/health

# 4. Lihat logs
docker logs -f backend

# 5. Stop & cleanup
docker stop backend
docker rm backend
```
