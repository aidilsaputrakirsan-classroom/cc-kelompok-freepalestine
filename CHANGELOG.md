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

### Changed
- Extend `Makefile` help output with DevOps/CI targets.
- Update README with Git workflow and PR validation commands.

## [v1.0.0] - 2026-04-01

### Added
- Monolith full-stack baseline (FastAPI, React, PostgreSQL, Docker Compose).
- JWT authentication and protected CRUD endpoints.
- Dashboard pages for revenue, inbox, leaderboard, and upload workflow.

