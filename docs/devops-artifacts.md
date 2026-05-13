# Artefak Lead CI/CD — Modul 6 & 7

Dokumen ini memetakan deliverable yang dikerjakan dari perspektif **Lead CI/CD** untuk tugas pada Modul 6 (multi-stage + image publish) dan Modul 7 (Docker Compose + release workflow).

---

## 1) Deliverable yang disiapkan

| Deliverable | File | Keterkaitan modul |
|-------------|------|-------------------|
| Compose orchestration 3 service (`db`, `backend`, `frontend`) | `docker-compose.yml` | Modul 7 |
| Template env untuk compose | `.env.docker.example` | Modul 7 |
| Shortcut command compose wajib (`up/down/build/logs/ps/clean`) | `Makefile` | Modul 7 |
| Target release image (build/tag/push + `latest`) | `Makefile` (`images-build`, `images-tag`, `images-push`, `release-images`) | Modul 6 + 7 |
| Script publish image ke Docker Hub | `scripts/push-images.sh` | Modul 6 + 7 |
| Multi-stage frontend runtime image (Node -> Nginx) | `frontend/Dockerfile` | Modul 6 |
| Bukti perbandingan/ukuran image | `docs/image-comparison.md` | Modul 6 |

---

## 2) Validasi teknis yang sudah dicek

```bash
docker compose --env-file .env.docker.example config
```

Hasil: **valid** (render service `db`, `backend`, `frontend`, network, volume, healthcheck).

```bash
docker images
```

Cuplikan image proyek yang terdeteksi:
- `cloudapp-backend:v2` -> sekitar `208MB`
- `cloudapp-backend:latest` -> sekitar `208MB`
- `cloudapp-frontend:latest` -> sekitar `73.9MB`
- `postgres:16-alpine` -> sekitar `395MB` (shared layers Docker lokal)

> Catatan: ukuran `docker images` pada host bisa berbeda antar mesin karena layer sharing dan cache lokal.

---

## 3) Workflow rilis image (Lead CI/CD)

### Opsi A: Pakai Makefile

```bash
# Build image lokal
make images-build

# Tag ke Docker Hub (versi + latest)
make images-tag DOCKERHUB_USERNAME=<username-dockerhub>

# Push semua tag
make images-push DOCKERHUB_USERNAME=<username-dockerhub>
```

Atau satu command:

```bash
make release-images DOCKERHUB_USERNAME=<username-dockerhub>
```

### Opsi B: Pakai script helper

```bash
DOCKERHUB_USERNAME=<username-dockerhub> sh scripts/push-images.sh
```

Tag yang di-push:
- Backend: `cloudapp-backend:v2` dan `cloudapp-backend:latest`
- Frontend: `cloudapp-frontend:v1` dan `cloudapp-frontend:latest`

---

## 4) Checklist tugas modul untuk peran Lead CI/CD

- [x] Menyiapkan command workflow standar Compose (Modul 7)
- [x] Menambahkan automation publish image (Modul 6/7)
- [x] Menyediakan tagging versi + `latest` (Modul 7)
- [x] Mendokumentasikan nama image dan ukuran (Modul 6)
- [x] Push final ke Docker Hub akun tim (`mukhoma`)

---

## 5) Bukti push Docker Hub (akun `mukhoma`)

Perintah yang dieksekusi:

```bash
DOCKERHUB_USERNAME=mukhoma sh scripts/push-images.sh
```

Output akhir:
- `Backend : mukhoma/cloudapp-backend:v2 dan :latest`
- `Frontend: mukhoma/cloudapp-frontend:v1 dan :latest`

Verifikasi registry:

```bash
docker manifest inspect mukhoma/cloudapp-backend:v2
docker manifest inspect mukhoma/cloudapp-frontend:v1
```

Kedua perintah berhasil (manifest ditemukan di Docker Hub).

---
