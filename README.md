# 🏢 Dashboard Telkom Regional 4 Kalimantan

**Tugas Besar Mata Kuliah Cloud Computing — Sistem Informasi ITK**

Dashboard monitoring revenue dan operasional Telkom Regional 4 Kalimantan, dibangun menggunakan arsitektur cloud-native microservices dengan FastAPI, React, PostgreSQL, Docker, dan CI/CD.

## 👥 Tim: Free Palestine

| Nama | NIM | Role |
|------|-----|------|
| Ariel Itsbat Nurhaq | 10231018 | Lead Backend & Lead Frontend |
| Raditya Yudianto | 10231076 | Lead QA & Docs |
| Muhammad Khoiruddin Marzuq | 10231065 | Lead DevOps |

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, PostgreSQL |
| **Frontend** | React 19, Vite, Recharts, Axios, Lucide React |
| **Auth** | JWT (python-jose + bcrypt) |
| **Gateway** | Nginx (reverse proxy + rate limiting) |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions → Railway |
| **Reliability** | Circuit Breaker, Retry with Exponential Backoff |
| **Observability** | Structured JSON Logging, Correlation IDs, Metrics |
| **Security** | Rate Limiting, Security Headers, Input Validation |

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
| 🔐 Login | JWT Auth + CAPTCHA + Loading Animation | - |
| 🏠 Dashboard | KPI cards, Revenue trend, Bar chart, Donut chart | Read |
| 📊 Revenue | Data penjualan per witel/channel/produk | ✅ Full CRUD |
| 📬 Inbox | Tiket monitoring & Customer Care | ✅ Full CRUD |

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
│   ├── workflows/ci.yml              # CI pipeline
│   ├── workflows/cd.yml              # CD pipeline
│   ├── CODEOWNERS                    # Auto-review
│   └── pull_request_template.md      # PR template
├── docs/
│   ├── api-contract.md               # API documentation
│   ├── deployment-guide.md           # Deploy instructions
│   ├── branching-strategy.md         # Git workflow
│   └── release-notes.md              # Changelog
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

## 🧪 Testing

```bash
cd backend
pip install pytest httpx
pytest test_main.py -v
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
| 11 | CD Pipeline (Railway) | ✅ |
| 12 | Microservices Decomposition | ✅ |
| 13 | Circuit Breaker + Retry | ✅ |
| 14 | Structured Logging + Metrics | ✅ |
| 15 | Rate Limiting + Security + Docs | ✅ |
