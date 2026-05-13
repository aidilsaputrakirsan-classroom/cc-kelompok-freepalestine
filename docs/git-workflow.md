# Git Workflow Tim - Modul 09

Dokumen ini menjadi pedoman kolaborasi tim untuk fase CI/CD dan deployment.

## 1. Branching Strategy

Model yang digunakan adalah **GitHub Flow**.

- `main` harus selalu stabil dan deployable.
- Semua perubahan dibuat dari branch turunan `main`.
- Dilarang push langsung ke `main` setelah branch protection aktif.

### Naming Convention

- `feature/<deskripsi-singkat>`
- `fix/<deskripsi-singkat>`
- `docs/<deskripsi-singkat>`
- `refactor/<deskripsi-singkat>`
- `chore/<deskripsi-singkat>`

Contoh:
- `feature/about-page`
- `feature/health-endpoint`
- `chore/add-codeowners`

## 2. Commit Convention

Gunakan **Conventional Commits**:

```text
type(scope): short description
```

Contoh:
- `feat(backend): add category filter for inbox endpoint`
- `feat(frontend): add about page route`
- `chore(devops): add codeowners and pr template`

## 3. Pull Request Process

1. Buat branch dari `main` terbaru.
2. Kerjakan perubahan secara terfokus.
3. Jalankan validasi lokal:
   - `make lint`
   - `make test`
   - `make pr-check`
4. Push branch dan buat Pull Request.
5. Isi template PR dengan lengkap.
6. Minimal 1 reviewer melakukan review.
7. Merge menggunakan **Squash and Merge**.
8. Hapus branch setelah merge.

## 4. Review Guidelines

Reviewer memeriksa aspek berikut:

- Fungsionalitas sesuai requirement
- Kejelasan kode dan naming
- Potensi edge case dan error handling
- Risiko keamanan (secrets, auth, input validation)
- Konsistensi terhadap arsitektur dan konvensi tim

Minimal 1 komentar review yang substantif sebelum approve.

## 5. CODEOWNERS

File `.github/CODEOWNERS` digunakan agar reviewer otomatis ter-assign berdasarkan area perubahan:

- Backend
- Frontend
- DevOps/Infra
- CI/CD
- Dokumentasi

Ini membantu memastikan setiap PR direview oleh role yang relevan.

