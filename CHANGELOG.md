# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses Conventional Commits.

## [Unreleased]

## [v3.0.0] - 2026-06-14

### Added
- Add structured JSON logging (JSONFormatter) to monolith backend (`backend/main.py`)
- Add Correlation ID middleware for request tracing across services
- Add `/metrics` endpoint for monitoring performa aplikasi
- Add Witel Performance model & `/upload/witel` endpoint for leaderboard data
- Add `PATCH /datasources/{id}/toggle` for active/inactive datasource control
- Add comprehensive database schema documentation (`docs/database-schema.md`)
- Add complete API endpoints reference (`docs/api-endpoints.md`)
- Add upload file format guide (`docs/upload-format-guide.md`)
- Add frontend Dockerfile build-arg `VITE_API_URL` for deployment flexibility
- Add comprehensive `.dockerignore` for frontend
- Add reflection papers for all team members (`docs/member-*.md`)

### Changed
- Enable `Base.metadata.create_all` for auto-migration on startup
- Leaderboard now reads from WitelPerformance table (upload-based data)
- All sales/inbox queries now filter by active datasources only
- Update `.env.example` with detailed comments and 3 connection modes
- Update README with correct tech versions and complete feature list
- Update PANDUAN-IRUD-RADIT with current project status

### Removed
- Remove `backend/drop_all.py` (deprecated utility)
- Remove `backend/ruff.toml` (linting handled by CI)
- Remove outdated Header.test.jsx and SearchBar.test.jsx
- Remove AboutPage from navigation (simplify sidebar)

### Fixed
- Fix seed.py user password field (clean up corrupted data)
- Strengthen test assertions for sales and inbox endpoints


## [v1.0.0] - 2026-04-01

### Added
- Monolith full-stack baseline (FastAPI, React, PostgreSQL, Docker Compose).
- JWT authentication and protected CRUD endpoints.
- Dashboard pages for revenue, inbox, leaderboard, and upload workflow.

