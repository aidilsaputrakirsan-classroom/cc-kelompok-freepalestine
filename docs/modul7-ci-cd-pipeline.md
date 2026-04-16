# Modul 7: CI/CD Pipeline & Deployment

## 📌 Tujuan
Modul pamungkas yang membahas Automasi pengujian dan tata rilis (*Continuous Integration & Continuous Deployment*). Mengubah prosedur manual *Deployment* aplikasi menjadi arsitektur rilis yang mulus berbasis Pipeline yang terintegrasi secara langsung dengan kode di respositori GitHub.

## ⚙️ GitHub Actions Workflow (CI)
Di setiap kali anggota melakukan `Git Push` mengarah ke branch `main`, eksekusi Pipeline `.github/workflows/` akan aktif.
Aksi-aksi yang tercatat pada jobs meliputi:
- Pembuatan virtual runner (Instance Ubuntu GitHub).
- *Checkout repository* dan insiasi *cache tools*.
- Me-running sistem *Linter* lintasan program untuk standarisasi syntax.
- Melakukan Test Automasi (menggunakan PyTest / sejenisnya).
- Mencegah kode cacat (*broken bugs*) bergabung ke dalam server utama.

## 🚀 Continous Deployment (CD PaaS - Railway)
Ketika blok Integration dilaporkan centang hijau (*Passed*), *trigger* Pipeline berlanjut ke Workflow *Publishing*.
Proyek ini meneruskan Container `Backend API` Docker secara otonom menuju platform Cloud Hosting **Railway / Render** tanpa proses copy paste kode manual dari Admin.

## 🧪 Validasi Deployment & CI/CD Pipeline

Pengecekan laporan *Log Runners* di tab *Actions* milik GitHub.

| Output Passed CI Workflow GitHub Actions |
| :---: |
| ![CI Actions Success](./screenshots/modul7-ci-actions.png) |

| Live Deployment Railway Dashboard |
| :---: |
| ![CD Cloud Railway Server](./screenshots/modul7-cd-deploy.png) |
