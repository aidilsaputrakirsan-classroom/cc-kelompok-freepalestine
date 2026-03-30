# ☁️ Dashboard Revenue Telkom Regional 4 Kalimantan

Dashboard Revenue adalah aplikasi web full-stack untuk memvisualisasikan dan mengelola data revenue unit Regional Small Medium Enterprise Service (SMES) Telkom Regional 4 Kalimantan. Aplikasi ini menggantikan proses input dan visualisasi data yang sebelumnya dilakukan secara manual menggunakan Excel, menjadi dashboard digital yang interaktif dan real-time.

Dashboard mencakup visualisasi data revenue dari berbagai level: Regional, Witel, Telda, Account Manager (AM), Prognosa, dan NGTMA — dengan fitur realisasi, trend, dan laporan bulanan.

## 👥 Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Ariel Itsbat Nurhaq | 10231018 | Lead Backend & Lead Frontend |
| Raditya Yudianto | 10231076 | Lead QA & Docs |
| Muhammad Khoiruddin Marzuq | 10231065 | Lead DevOps |

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| FastAPI (Python) | Backend REST API |
| React + Vite | Frontend SPA |
| PostgreSQL | Database |
| Docker | Containerization |
| GitHub Actions | CI/CD Pipeline |
| Railway/Render | Cloud Deployment |

## 🏗️ Architecture

```
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
```

*(Diagram ini akan berkembang setiap minggu)*

### Fitur Dashboard Revenue

| Menu | Sub-Menu | Deskripsi |
|------|----------|-----------|
| Main Dashboard | - | Overview realisasi revenue keseluruhan |
| Regional | Realisasi, Trend | Data revenue tingkat regional |
| Witel | Realisasi, Trend, Monthly | Data revenue per Witel |
| Telda | Realisasi | Data revenue per Telda |
| AM | - | Performance Account Manager |
| Prognosa | - | Forecasting revenue |
| NGTMA | - | Next Gen Territory Management & Analytics |

## 🚀 Getting Started

Panduan setup lengkap dari clone hingga aplikasi berjalan (database, `.env`, troubleshooting): **[docs/setup-guide.md](docs/setup-guide.md)**.

### Prasyarat
- Python 3.10+
- Node.js 18+
- Git

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Buka browser:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Buka browser: http://localhost:5173

## 📁 Project Structure

```
cc-kelompok-freepalestine/
├── backend/
│   ├── main.py              # FastAPI application + CRUD endpoints
│   ├── database.py          # Koneksi database PostgreSQL
│   ├── models.py            # SQLAlchemy models (tabel database)
│   ├── schemas.py           # Pydantic schemas (validasi request/response)
│   ├── crud.py              # Fungsi CRUD (business logic)
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (TIDAK di-commit!)
│   └── .env.example         # Template environment variables
├── frontend/                # React app (akan dibuat minggu 3)
├── docs/
│   ├── setup-guide.md       # Panduan setup dari clone sampai running
│   ├── api-test-results.md  # Hasil testing API
│   ├── database-schema.md   # Schema database
│   ├── member-ariel.md      # Info anggota
│   ├── member-radit.md
│   └── member-irud.md
├── setup.sh                 # Script install dependencies
├── .gitignore
└── README.md
```

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ✅ |
| 3 | React Frontend | ✅ |
| 4 | Full-Stack Integration | ✅ |
| 5-7 | Docker & Compose | ⬜ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |

## 📝 API Endpoints

Base URL: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

### Health & Info

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/team` | Informasi tim |
| GET | `/docs` | Swagger UI (auto-generated) |

### CRUD — Items

#### 1. `POST /items` — Buat Item Baru

**Request Body:**
```json
{
  "name": "Laptop",
  "price": 15000000,
  "description": "Laptop untuk cloud computing",
  "quantity": 5
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Laptop",
  "price": 15000000.0,
  "description": "Laptop untuk cloud computing",
  "quantity": 5,
  "created_at": "2026-03-04T03:11:00+00:00",
  "updated_at": null
}
```

#### 2. `GET /items` — List Semua Items (dengan pagination & search)

**Query Parameters:**
| Parameter | Tipe | Default | Deskripsi |
|-----------|------|---------|-----------|
| `skip` | int | 0 | Offset untuk pagination |
| `limit` | int | 20 | Jumlah item per halaman (max 100) |
| `search` | string | null | Kata kunci pencarian nama/deskripsi |

**Response (200 OK):**
```json
{
  "total": 3,
  "items": [
    {
      "id": 1,
      "name": "Laptop",
      "price": 15000000.0,
      "description": "Laptop untuk cloud computing",
      "quantity": 5,
      "created_at": "2026-03-04T03:11:00+00:00",
      "updated_at": null
    }
  ]
}
```

#### 3. `GET /items/{item_id}` — Ambil Item by ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Laptop",
  "price": 15000000.0,
  "description": "Laptop untuk cloud computing",
  "quantity": 5,
  "created_at": "2026-03-04T03:11:00+00:00",
  "updated_at": null
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Item dengan id=999 tidak ditemukan"
}
```

#### 4. `PUT /items/{item_id}` — Update Item (Partial Update)

**Request Body** (semua field opsional):
```json
{
  "price": 14000000
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Laptop",
  "price": 14000000.0,
  "description": "Laptop untuk cloud computing",
  "quantity": 5,
  "created_at": "2026-03-04T03:11:00+00:00",
  "updated_at": "2026-03-04T03:15:00+00:00"
}
```

#### 5. `DELETE /items/{item_id}` — Hapus Item

**Response:** `204 No Content`

**Response jika tidak ditemukan (404):**
```json
{
  "detail": "Item dengan id=1 tidak ditemukan"
}
```

#### 6. `GET /items/stats` — Statistik Inventory

**Response (200 OK):**
```json
{
  "total_items": 3,
  "total_value": 84600000.0,
  "most_expensive": {
    "name": "Laptop",
    "price": 15000000.0
  },
  "cheapest": {
    "name": "Mouse Wireless",
    "price": 250000.0
  }
}
```

## 🔐 Authentication

Aplikasi menggunakan **JWT (JSON Web Token)** untuk autentikasi. Semua endpoint `/items` membutuhkan token.

### Alur Auth
1. **Register** → `POST /auth/register` dengan email, nama, password
2. **Login** → `POST /auth/login` → dapat `access_token`
3. **Akses endpoint** → kirim token di header: `Authorization: Bearer <token>`
4. **Token expired** → login ulang untuk dapat token baru

### Auth Endpoints

| Method | Endpoint | Deskripsi | Auth Required |
|--------|----------|-----------|---------------|
| POST | `/auth/register` | Daftar akun baru | ❌ Tidak |
| POST | `/auth/login` | Login, dapat JWT token | ❌ Tidak |
| GET | `/auth/me` | Profil user saat ini | ✅ Ya |

> ⚠️ Semua endpoint `/items` (GET, POST, PUT, DELETE) membutuhkan token JWT valid.

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan mata kuliah **Komputasi Awan** - Program Studi Sistem Informasi, Institut Teknologi Kalimantan.
