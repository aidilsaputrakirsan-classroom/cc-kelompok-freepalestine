# 🏢 Dashboard Telkom Regional 4 Kalimantan

**Tugas Besar Mata Kuliah Cloud Computing — Sistem Informasi ITK**

Dashboard monitoring revenue dan operasional Telkom Regional 4 Kalimantan, dibangun menggunakan arsitektur cloud-native microservices dengan FastAPI, React, PostgreSQL, Docker, dan CI/CD.

![CI Pipeline](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine/actions/workflows/ci.yml/badge.svg)

## 👥 Tim: Free Palestine

| Nama | NIM | Role |
|------|-----|------|
| Ariel Itsbat Nurhaq | 10231018 | Lead Backend & Lead Frontend |
| Raditya Yudianto | 10231076 | Lead QA & Docs |
| Muhammad Khoiruddin Marzuq | 10231065 | Lead DevOps |

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy, PostgreSQL |
| **Frontend** | React 18, Vite, Recharts, Axios, Lucide React |
| **Auth** | JWT (python-jose + bcrypt) |
| **Gateway** | Nginx (reverse proxy + rate limiting) |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions → DeployCC |
| **Reliability** | Circuit Breaker, Retry with Exponential Backoff |
| **Observability** | Structured JSON Logging, Correlation IDs, Metrics |
| **Security** | Rate Limiting, Security Headers, Input Constraints, Production Log Hardening |


## 🏗️ Arsitektur

```
                    ┌─────────────┐
     Browser  ───── │  Frontend   │ :3000
                    │  (React)    │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │   Gateway   │ :8080
                    │  (Nginx)    │
                    └──┬──────┬───┘
                       │      │
              ┌────────┘      └────────┐
              │                        │
       ┌──────┴──────┐         ┌──────┴──────┐
       │ Auth Service │         │  Dashboard  │
       │   :8001      │         │  Service    │
       └──────┬──────┘         │   :8002     │
              │                └──────┬──────┘
       ┌──────┴──────┐         ┌──────┴──────┐
       │  Auth DB    │         │ Dashboard DB │
       │ (Postgres)  │         │ (Postgres)   │
       └─────────────┘         └──────────────┘
```

## 🚀 Quick Start

### Cara 1: Microservices (Docker Compose)
```bash
docker compose -f docker-compose.microservices.yml up --build -d
```
- Frontend: http://localhost:3000
- Gateway API: http://localhost:8080
- API Docs Auth: http://localhost:8080/health/auth
- API Docs Dashboard: http://localhost:8080/health/dashboard

### Cara 2: Monolith (Docker Compose)
```bash
docker compose up --build -d
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

### Cara 3: Development (Manual)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env           # Edit DATABASE_URL
python seed.py                    # Isi data awal
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Default Login
| User | Email | Password |
|------|-------|----------|
| Admin | ariel@student.itk.ac.id | password123 |
| Viewer | viewer@telkom.co.id | viewer123 |

## 📋 Fitur

| Menu | Deskripsi | CRUD |
|------|-----------|------|
| 🔐 Login | JWT Auth + Session Timeout | - |
| 🏠 Dashboard | KPI cards, Revenue trend, Witel Leaderboard summary | Read |
| 📊 Revenue Analytics | Data penjualan per witel/channel/produk | ✅ Full CRUD |
| 📬 Customer Care | Tiket monitoring & NPS | ✅ Full CRUD |
| 🏆 Witel Leaderboard | Ranking performa Witel (score composite) | Read |
| 📤 Upload Data Sources | Upload CSV/XLSX + toggle aktif/nonaktif | Create/Toggle |
| 👤 User Management | Admin: CRUD users + role assignment | ✅ Admin Only |
| 📝 Audit Log | Riwayat semua aktivitas user | Read (Admin) |

## 📁 Struktur Folder

```
tubes-dashboard-telkom/
├── backend/                          # Monolith API (Week 1-6)
│   ├── main.py, models.py, crud.py   # FastAPI app
│   ├── auth.py, schemas.py           # Auth & validation
│   ├── seed.py, test_main.py         # Seeder & tests
│   └── Dockerfile                    # Container
├── frontend/                         # React UI
│   ├── src/components/               # Layout, Charts
│   ├── src/pages/                    # Auth, Dashboard, Revenue, Inbox
│   └── Dockerfile                    # Multi-stage build
├── services/                         # Microservices (Week 12+)
│   ├── auth-service/                 # Auth microservice (:8001)
│   ├── dashboard-service/            # Data microservice (:8002)
│   └── gateway/                      # Nginx API Gateway
├── .github/
│   ├── workflows/ci.yml              # CI pipeline (Modul 10)
│   ├── workflows/cd.yml              # CD DeployCC (Modul 11)
│   ├── CODEOWNERS                    # Auto-review
│   └── pull_request_template.md      # PR template
├── scripts/
│   ├── ssh.sh / ssh.bat              # SSH via Cloudflare tunnel
│   └── cloudflaredinstall.bat        # Install cloudflared (Windows)
├── docs/
│   ├── api-contract.md               # API documentation
│   ├── deployment-guide.md           # Deploy DeployCC + rollback
│   ├── git-workflow.md               # Git workflow
│   └── modul09-verification.md       # Checklist Modul 09
├── docker-compose.yml                # Monolith compose
└── docker-compose.microservices.yml  # Microservices compose
```

## 🔗 API Endpoints

### Auth Service
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | /auth/register | Register user | ❌ |
| POST | /auth/login | Login & JWT | ❌ |
| GET | /auth/me | Profil user | ✅ |
| GET | /auth/verify | Token validation (inter-service) | ✅ |

### Dashboard Service
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET/POST | /sales | List & Create sales | ✅ |
| GET/PUT/DELETE | /sales/{id} | Read, Update, Delete | ✅ |
| GET | /sales/summary | Revenue statistik | ✅ |
| GET | /sales/monthly | Chart data bulanan | ✅ |
| GET/POST | /inbox | List & Create tiket | ✅ |
| GET/PUT/DELETE | /inbox/{id} | Read, Update, Delete | ✅ |
| GET | /inbox/stats | Tiket per status | ✅ |

### System
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /health | Health check |
| GET | /metrics | Request metrics |
| GET | /team | Info tim |

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Aplikasi (DeployCC) | https://cc-kelompok-freepalestine.akhzafachrozy.my.id _(isi dari summary Actions setelah deploy)_ |
| API | `https://<repo-slug>.akhzafachrozy.my.id/api` |
| API Docs (Swagger) | `https://<repo-slug>.akhzafachrozy.my.id/docs` |

## 🔄 CI/CD

**CI** (`.github/workflows/ci.yml`) — push/PR ke `main`:

1. Lint — Ruff (backend) + ESLint (frontend)
2. Test backend — pytest
3. Test frontend — Vitest + production build
4. Build Docker images

**CD** (`.github/workflows/cd.yml`) — setelah **CI Pipeline** sukses di `main`:

1. Build frontend (dengan `VITE_API_URL` otomatis)
2. Deploy ke [DeployCC](https://deploycc.akhzafachrozy.my.id)
3. Health check `/health` + ringkasan SSH/DB di Actions Summary

Secret wajib: `DEPLOY_API_KEY`. Panduan: [docs/deployment-guide.md](docs/deployment-guide.md) · template: [akhzaozy/deploycc](https://github.com/akhzaozy/deploycc)

## 🧪 Testing

**Backend:**

```bash
cd backend
pip install pytest httpx
pytest test_main.py -v
```

**Frontend:**

```bash
cd frontend
npm install
npm test
```

## 🔀 Git Workflow & PR

Modul 09 menggunakan **GitHub Flow**:

- Branch per perubahan: `feature/*`, `fix/*`, `docs/*`, `chore/*`
- Commit mengikuti Conventional Commits
- PR wajib review minimal 1 orang
- Merge strategy default: **Squash and Merge**

File governance yang dipakai:

- `.github/CODEOWNERS` untuk auto-assign reviewer
- `.github/pull_request_template.md` untuk standarisasi deskripsi PR
- `docs/git-workflow.md` sebagai panduan detail workflow tim
- `docs/modul09-verification.md` sebagai checklist verifikasi final Modul 09

## 🧰 DevOps & CI Commands

Gunakan target berikut sebelum merge PR:

```bash
make lint      # Frontend lint + backend syntax check
make test      # Backend pytest
make pr-check  # Compose config + build + lint + test
```

Jika `make` belum tersedia di Windows, gunakan alternatif berikut:

```bash
npm --prefix frontend run lint
python -m compileall -q backend
pytest backend/test_main.py -v
```

Untuk production compose override:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 📊 Modul Coverage

| Week | Topik | Status |
|------|-------|--------|
| 1-2 | FastAPI + REST API + PostgreSQL | ✅ |
| 3 | Frontend React + Vite | ✅ |
| 4 | JWT Authentication + CORS | ✅ |
| 5-6 | Dockerfile + Docker Compose | ✅ |
| 7 | Docker Compose Finalization | ✅ |
| 9 | Git Workflow + CODEOWNERS + PR Template | ✅ |
| 10 | CI Pipeline (GitHub Actions) | ✅ |
| 11 | CD Pipeline (DeployCC) | ✅ |
| 12 | Microservices Decomposition | ✅ |
| 13 | Circuit Breaker + Retry | ✅ |
| 14 | Structured Logging + Metrics | ✅ |
| 15 | Rate Limiting + Security + Docs | ✅ |
