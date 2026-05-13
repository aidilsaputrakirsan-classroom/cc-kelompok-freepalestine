# Verifikasi Modul 09 (Lead DevOps & Lead CI/CD)

Dokumen ini merangkum status final implementasi Modul 09 di repository.

## 1) Governance Git Workflow

- [x] `CODEOWNERS` tersedia di `.github/CODEOWNERS`
- [x] PR Template tersedia di `.github/pull_request_template.md`
- [x] Panduan workflow tim tersedia di `docs/git-workflow.md`
- [x] CHANGELOG tersedia di `CHANGELOG.md`

## 2) Otomasi Validasi PR

- [x] Target `lint`, `test`, `pr-check` ada di `Makefile`
- [x] Backend syntax check: `python -m compileall -q backend`
- [x] Frontend lint: `npm --prefix frontend run lint` (0 error)
- [x] Backend test: `pytest backend/test_main.py -v` (19 passed)
- [x] CI workflow tersedia di `.github/workflows/ci.yml`

## 3) CD Baseline

- [x] CD workflow Railway tersedia di `.github/workflows/cd.yml`
- [x] Production compose override tersedia di `docker-compose.prod.yml`

## 4) Catatan Windows

Jika `make` belum terpasang, gunakan command berikut:

```bash
npm --prefix frontend run lint
python -m compileall -q backend
pytest backend/test_main.py -v
```

## 5) Final Manual Checklist (GitHub UI)

Langkah berikut wajib dilakukan langsung di GitHub repository settings:

- [ ] Aktifkan branch protection untuk `main`
  - Require pull request before merging
  - Require approvals (minimal 1)
  - Require status checks to pass (pilih job CI)
  - Restrict direct pushes ke `main`
- [ ] Uji 1 PR end-to-end (feature branch -> PR -> review -> squash merge -> delete branch)

> Catatan: langkah manual tidak bisa dieksekusi dari environment lokal ini karena GitHub CLI (`gh`) belum tersedia.
