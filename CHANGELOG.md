# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses Conventional Commits.

## [Unreleased]

### Added
- Add `.github/CODEOWNERS` for automatic reviewer assignment by area.
- Add `.github/pull_request_template.md` to standardize PR quality checks.
- Add `docs/git-workflow.md` as team guide for branching, commits, and review.
- Add `docker-compose.prod.yml` as production compose override baseline.
- Add `make lint`, `make test`, and `make pr-check` as PR readiness targets.
- Add Modul 10 CI pipeline: lint (Ruff + ESLint), pytest, Vitest, Docker build, PR failure comment.
- Add Modul 11 CD: DeployCC workflow (`.github/workflows/cd.yml`), health check, SSH scripts, `docs/deployment-guide.md`.
- Add `backend/ruff.toml` and frontend Vitest test suite (6 tests).

### Changed
- Extend `Makefile` help output with DevOps/CI targets.
- Update README with Git workflow, CI badge, live demo (DeployCC), and CI/CD documentation.
- Split CI (Modul 10) and CD DeployCC (Modul 11); remove Railway deploy from workflows.

## [v1.0.0] - 2026-04-01

### Added
- Monolith full-stack baseline (FastAPI, React, PostgreSQL, Docker Compose).
- JWT authentication and protected CRUD endpoints.
- Dashboard pages for revenue, inbox, leaderboard, and upload workflow.

