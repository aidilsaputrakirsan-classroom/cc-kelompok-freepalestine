# Panduan Fix CI Pipeline untuk Isbat (Ariel)

**Dari:** Raditya Yudianto  
**Tanggal:** 17 Mei 2026  
**Tujuan:** Fix error CI Pipeline di branch `ariel` / `ariel-to-main`

---

## Kenapa CI Kamu Error?

Test Backend gagal dengan error ini:

```
ImportError: cannot import name 'AuditLog' from 'models'
```

**Penyebabnya:**
1. `backend/models.py` di branch kamu masih versi lama — tidak ada class `AuditLog` dan `WitelPerformance`
2. `ci.yml` tidak punya **PostgreSQL service** — jadi test tidak bisa connect ke database
3. `backend/test_main.py` punya assertion yang terlalu ketat (`total >= 1`) tapi data tidak tersedia saat CI

**Semua fix ini sudah ada di `main`** (di-merge dari branch `radit` tanggal 17 Mei).

---

## Cara Fix — Cukup Pull dari Main!

Buka **PowerShell** atau terminal di VS Code, jalankan:

### Langkah 1 — Pindah ke branch kamu
```powershell
cd C:\path\to\cc-kelompok-freepalestine

# Kalau branch kamu ariel-to-main:
git checkout ariel-to-main

# Atau kalau branch kamu ariel:
git checkout ariel
```

### Langkah 2 — Pull dari main untuk dapat semua fix
```powershell
git fetch origin
git merge origin/main
```

Kalau ada conflict, ketik:
```powershell
git merge origin/main -X ours
```

### Langkah 3 — Push ke branch kamu
```powershell
git push origin ariel-to-main
# atau
git push origin ariel
```

---

## Apa yang Sudah Diperbaiki di Main

| File | Perubahan |
|------|-----------|
| `.github/workflows/ci.yml` | ✅ Tambah PostgreSQL service agar test bisa connect DB |
| `backend/models.py` | ✅ Tambah class `AuditLog` dan `WitelPerformance` |
| `backend/crud.py` | ✅ Tambah fungsi `log_audit`, `list_users`, `admin_*` |
| `backend/schemas.py` | ✅ Tambah schema `AuditLogResponse`, `UserAdminCreate`, dll |
| `backend/test_main.py` | ✅ Fix assertion `test_list_sales` dan `test_list_inbox` |
| `frontend/src/App.jsx` | ✅ Sync dengan versi terbaru |
| `frontend/package.json` | ✅ Sync dengan versi terbaru |

---

## Hasil yang Diharapkan Setelah Fix

Setelah pull dari main dan push → CI Pipeline harusnya:

```
✅ Test Backend   — 19/19 tests passed
✅ Test Frontend  — semua passed
⏭️ Build Docker  — skipped (karena parallel)
✅ Notify PR     — passed
```

---

## Kalau Masih Error

Cek error spesifiknya di GitHub Actions → klik run yang merah → klik job yang error → lihat log.

Error umum dan solusinya:

| Error | Solusi |
|-------|--------|
| `ImportError: cannot import name 'AuditLog'` | `git checkout origin/main -- backend/models.py` |
| `assert 0 >= 1` di test_list_sales | `git checkout origin/main -- backend/test_main.py` |
| `npm run build` failed | `git checkout origin/main -- frontend/package.json frontend/src/App.jsx` |

---

*Panduan dibuat oleh Raditya Yudianto (10231076) — setelah berhasil fix CI Pipeline di branch `radit`*
