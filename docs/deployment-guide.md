# Deployment Guide — DeployCC (ITK)

Panduan deploy Dashboard Telkom Regional 4 ke **DeployCC** (platform deploy mata kuliah CC).

Referensi resmi: [akhzaozy/deploycc](https://github.com/akhzaozy/deploycc)

## Prasyarat

1. Repository memiliki struktur `backend/` dan `frontend/`.
2. Workflow CI bernama **`CI Pipeline`** (`.github/workflows/ci.yml`).
3. Workflow CD (`.github/workflows/cd.yml`) terpasang di repository.
4. Secret GitHub: **`DEPLOY_API_KEY`** (minta ke asdos jika berbeda dari `deploycc-classroom`).

## Alur CI/CD

```text
push/PR ke main
    → CI Pipeline (lint, test, build docker)
    → (jika CI sukses & branch main) CD — Deploy ke DeployCCC
    → Aplikasi live di *.akhzafachrozy.my.id
```

Deploy **tidak** berjalan saat Pull Request — hanya saat CI sukses di `main` atau trigger manual.

## GitHub Secrets

| Secret | Keterangan |
|--------|------------|
| `DEPLOY_API_KEY` | API key DeployCC (dari asdos) |

## GitHub Variables (opsional)

| Variable | Keterangan |
|----------|------------|
| `VITE_API_URL` | Override URL API frontend saat build CD (default auto: `https://<repo-slug>.akhzafachrozy.my.id/api`) |

## Setelah Deploy Berhasil

Buka **GitHub Actions** → workflow **CD — Deploy ke DeployCCC** → job **Deploy** → **Summary**:

- URL live aplikasi
- Kredensial SSH (username, password, command)
- Port Uvicorn
- Info database (deploy pertama)

## SSH ke Server

### Windows

1. Jalankan `scripts/cloudflaredinstall.bat` (sekali, sebagai Administrator).
2. Jalankan `scripts/ssh.bat`, masukkan username dari summary DeployCC.

### macOS / Linux

```bash
brew install cloudflared
chmod +x scripts/ssh.sh
./scripts/ssh.sh
```

## Setup Backend di Server (jika perlu manual)

Setelah SSH (otomatis masuk folder project):

```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install "uvicorn[standard]"
```

## Database (dbtool)

```bash
# Login (password default sesuai panduan asdos)
ssh dbtool@server

# Di psql:
CREATE DATABASE nama_db;
```

Deploy pertama biasanya **auto-create** DB oleh DeployCC — cek summary Actions.

## Service Control

```bash
systemctl status deploycc-<repo>.service
systemctl restart deploycc-<repo>.service
```

Alias di server (jika tersedia): `svc-status`, `svc-logs`, `svc-restart`, `editenv`.

## Rollback Manual

1. SSH ke server.
2. `git checkout <commit-stabil>` atau restore backup folder project.
3. `svc-restart`
4. Verifikasi: `curl https://<domain>/health` → HTTP 200.

Alternatif: push commit revert ke `main` → CI sukses → CD deploy ulang.

## Troubleshooting

| Gejala | Solusi |
|--------|--------|
| CD tidak jalan | Pastikan CI **CI Pipeline** sukses; nama workflow harus persis sama |
| Deploy gagal HTTP 4xx/5xx | Cek `DEPLOY_API_KEY`, ukuran ZIP < 512 MB |
| Backend belum live | SSH → `svc-logs`, perbaiki `backend/.env` / kode |
| CORS error | Update `ALLOWED_ORIGINS` di `backend/.env` sesuai domain frontend |
| Frontend blank | Pastikan `VITE_API_URL` benar saat build (lihat log CD job Build frontend) |

## File Workflow

| File | Fungsi |
|------|--------|
| `.github/workflows/ci.yml` | CI: lint, test, build Docker |
| `.github/workflows/cd.yml` | CD: deploy ke DeployCC setelah CI hijau |
