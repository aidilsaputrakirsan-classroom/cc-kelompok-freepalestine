# 📊 Docker Image Size Comparison — Modul 5

**Dibuat oleh:** Raditya Yudianto (Lead QA & Docs)  
**Tanggal:** 31 Maret 2026  
**Tujuan:** Membandingkan ukuran base image Python untuk pemilihan image yang optimal

---

## Hasil Perbandingan

| Base Image | Ukuran | Deskripsi |
|-----------|--------|-----------|
| `python:3.12` | ~1.02 GB | Full Debian — semua tools termasuk |
| `python:3.12-slim` | ~150 MB | Debian minimal — tools tidak perlu dihapus |
| `python:3.12-alpine` | ~57 MB | Alpine Linux — sangat ringan, minimal |

> Data ukuran di atas berdasarkan `docker pull` masing-masing image dan dicek via `docker images`.

---

## Perbandingan Detail

| Aspek | `python:3.12` | `python:3.12-slim` | `python:3.12-alpine` |
|-------|--------------|-------------------|---------------------|
| **Ukuran** | ~1.02 GB | ~150 MB | ~57 MB |
| **Base OS** | Debian (full) | Debian (minimal) | Alpine Linux |
| **Build time** | Lambat | Sedang | Cepat |
| **Kompatibilitas** | ✅ Sangat tinggi | ✅ Tinggi | ⚠️ Perlu penyesuaian |
| **Package manager** | apt | apt | apk |
| **Cocok untuk** | Development | Production | Microservices ringan |

---

## Pilihan untuk Proyek Ini

**Digunakan: `python:3.12-slim`** ✅

**Alasan:**
1. **Ukuran 7x lebih kecil** dari `python:3.12` (150 MB vs 1.02 GB)
2. **Kompatibilitas tinggi** — tidak perlu penyesuaian seperti Alpine
3. **Cocok untuk production** — ringan tapi tetap stabil
4. **Library Python** seperti `psycopg2-binary` dan `cryptography` berjalan tanpa masalah di slim

**Mengapa tidak Alpine?**
Alpine menggunakan `musl libc` bukan `glibc`, sehingga beberapa package Python (terutama yang butuh compile C) bisa bermasalah. `psycopg2-binary` dan `cryptography` (untuk JWT) kadang error di Alpine.

---

## Kesimpulan

Untuk proyek **cloudapp-backend**, `python:3.12-slim` adalah pilihan terbaik karena:
- Menghemat **~870 MB** dibanding `python:3.12` full
- Lebih stabil daripada Alpine untuk dependency yang kompleks
- Build image akhir sekitar **~200 MB** (base + dependencies)
