# 📋 Panduan Setup — Cloud Computing Modul 1

**Repository Tim:** https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine

> ⚠️ Pastikan kamu sudah punya akun GitHub dan sudah join team di GitHub Classroom.

---

## Langkah 1: Install Tools (Jika Belum)

- **Python 3.10+** → https://www.python.org/downloads/ (centang "Add Python to PATH")
- **Node.js 18+** → https://nodejs.org/ (pilih LTS)
- **Git** → https://git-scm.com/downloads
- **VS Code** → https://code.visualstudio.com/

Verifikasi di terminal:
```bash
python --version   # harus 3.10+
node --version     # harus 18+
npm --version
git --version
```

---

## Langkah 2: Konfigurasi Git

### Untuk Radit:
```bash
git config --global user.name "Raditya Yudianto"
git config --global user.email "10231076@student.itk.ac.id"
```

### Untuk Irud:
```bash
git config --global user.name "Muhammad Khoiruddin Marzuq"
git config --global user.email "10231065@student.itk.ac.id"
```

---

## Langkah 3: Generate SSH Key

### Untuk Radit:
```bash
ssh-keygen -t ed25519 -C "10231076@student.itk.ac.id"
```

### Untuk Irud:
```bash
ssh-keygen -t ed25519 -C "10231065@student.itk.ac.id"
```

Tekan **Enter** untuk semua pertanyaan (default location, tanpa passphrase).

Lalu tampilkan public key:
```bash
cat ~/.ssh/id_ed25519.pub
```

**Copy seluruh output**, lalu:
1. Buka https://github.com/settings/keys
2. Klik **"New SSH key"**
3. Title: `Laptop Kuliah`
4. Paste key → Klik **"Add SSH key"**

Verifikasi koneksi:
```bash
ssh -T git@github.com
# Expected: Hi [username]! You've successfully authenticated...
```

---

## Langkah 4: Clone Repository

```bash
git clone git@github.com:aidilsaputrakirsan-classroom/cc-kelompok-freepalestine.git
cd cc-kelompok-freepalestine
```

---

## Langkah 5: Push Member Info

### Untuk Radit:
```bash
echo "Nama: Raditya Yudianto | NIM: 10231076 | Peran: Lead QA & Docs" > docs/member-radit.md
git add .
git commit -m "docs: add member info - Radit"
git push origin main
```

### Untuk Irud:
```bash
echo "Nama: Muhammad Khoiruddin Marzuq | NIM: 10231065 | Peran: Lead DevOps" > docs/member-irud.md
git add .
git commit -m "docs: add member info - Irud"
git push origin main
```

> ⚠️ Jika terjadi error saat push, jalankan dulu:
> ```bash
> git pull --rebase origin main
> ```
> Lalu push lagi: `git push origin main`

---

## Langkah 6: Verifikasi

```bash
git log --oneline
```

Pastikan commit kamu muncul di log.

---

## Langkah 7: Test Aplikasi di Lokal

### Jalankan Backend (Terminal 1):
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Buka http://localhost:8000 → harus tampil JSON response.
Buka http://localhost:8000/docs → Swagger UI.

### Jalankan Frontend (Terminal 2, biarkan backend tetap jalan):
```bash
cd frontend
npm install
npm run dev
```
Buka http://localhost:5173 → harus tampil "☁️ Cloud App" dengan data dari API.

---

## Tugas Tambahan (Bagian C)

### Radit (Lead QA & Docs):
- Review seluruh isi **README.md** di repo
- Pastikan tidak ada typo atau informasi yang salah
- Jika ada perbaikan, edit dan commit:
  ```bash
  git add README.md
  git commit -m "docs: review and fix README"
  git push origin main
  ```

### Irud (Lead DevOps):
- Setup **branch protection rules** di GitHub:
  1. Buka repo → **Settings → Branches → Add rule**
  2. Branch name pattern: `main`
  3. Centang: **Require a pull request before merging**
  4. Klik **Create**

---

## Pembagian Peran Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Ariel Itsbat Nurhaq | 10231018 | Lead Backend & Lead Frontend |
| Raditya Yudianto | 10231076 | Lead QA & Docs |
| Muhammad Khoiruddin Marzuq | 10231065 | Lead DevOps |
