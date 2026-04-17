# Docker Image Comparison — Modul 6 & 7 (Lead CI/CD)

Dokumen ini merangkum ukuran image yang relevan untuk tugas:
- Modul 6: optimasi image (multi-stage frontend)
- Modul 7: finalisasi workflow publish image versi + `latest`

---

## 1) Ukuran image aplikasi (hasil cek lokal)

Perintah yang dipakai:

```bash
docker images
```

Cuplikan image project:

| Image | Tag | Disk Usage (lokal) | Catatan |
|------|-----|---------------------|---------|
| `cloudapp-backend` | `v2` | ~208 MB | Backend FastAPI + deps Python |
| `cloudapp-backend` | `latest` | ~208 MB | Tag tambahan untuk release terbaru |
| `cloudapp-frontend` | `latest` | ~73.9 MB | Hasil multi-stage (`node:20-alpine` -> `nginx:alpine`) |
| `postgres` | `16-alpine` | ~395 MB | Image DB official, dipakai sebagai service compose |

---

## 2) Dampak optimasi multi-stage frontend

Arsitektur build frontend:
1. Stage builder: install dependency + `npm run build`
2. Stage runtime: hanya copy `dist` ke Nginx

Efek:
- Build tool (`node_modules`, source build-only) tidak ikut ke runtime image.
- Runtime image lebih kecil dibanding single-stage build.
- Start-up deployment lebih cepat dan konsumsi bandwidth registri lebih rendah.

---

## 3) Standar tagging untuk rilis

Tag yang dipakai untuk push ke Docker Hub:

- Backend: `cloudapp-backend:v2` dan `cloudapp-backend:latest`
- Frontend: `cloudapp-frontend:v1` dan `cloudapp-frontend:latest`

Pola ini membuat:
- versi rilis tetap bisa di-pin (`v1`, `v2`)
- deployment cepat tetap bisa pakai tag bergerak `latest`

---

## 4) Catatan interpretasi ukuran

Nilai `docker images` bisa berbeda antar mesin karena:
- layer sharing antar image
- cache build lokal
- versi Docker engine yang berbeda

Untuk evaluasi CI/CD, yang penting adalah:
- tren ukuran image stabil/menurun
- runtime image frontend tetap ringan
- tagging versi dan `latest` konsisten saat publish
