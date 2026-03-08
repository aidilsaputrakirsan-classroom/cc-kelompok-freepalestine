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
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/                # React app (akan dibuat minggu 3)
├── docs/
│   ├── member-ariel.md      # Info anggota
│   ├── member-radit.md
│   └── member-irud.md
├── .gitignore
└── README.md
```

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ⬜ |
| 3 | React Frontend | ⬜ |
| 4 | Full-Stack Integration | ⬜ |
| 5-7 | Docker & Compose | ⬜ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |

## 📝 API Endpoints


| Method | Endpoint | Deskripsi | Request Body |
|--------|----------|-----------|--------------| 
| GET | `/` | Root - info aplikasi | - |
| GET | `/health` | Health check | - |
| GET | `/team` | Informasi tim | - |
| POST | `/items` | Buat item baru | `{"name": "...", "price": ..., "description": "...", "quantity": ...}` |
| GET | `/items` | List semua items (pagination + search) | Query: `skip`, `limit`, `search` |
| GET | `/items/{id}` | Ambil item berdasarkan ID | - |
| PUT | `/items/{id}` | Update item | `{"name": "...", "price": ..., ...}` (partial) |
| DELETE | `/items/{id}` | Hapus item | - |
| GET | `/items/stats` | Statistik inventory | - |
| GET | `/docs` | Swagger UI (auto-generated) | - |

### Contoh Response

**POST /items (201 Created):**
```json
{
  "id": 1,
  "name": "Laptop",
  "price": 15000000.0,
  "description": "Laptop untuk cloud computing",
  "quantity": 5,
  "created_at": "2026-03-04T10:00:00",
  "updated_at": null
}
```

**GET /items/stats (200 OK):**
```json
{
  "total_items": 3,
  "total_value": 84600000.0,
  "most_expensive": {"name": "Laptop", "price": 15000000.0},
  "cheapest": {"name": "Mouse Wireless", "price": 250000.0}
}
```

## 📄 Lisensi

Proyek ini dibuat untuk keperluan mata kuliah **Komputasi Awan** - Program Studi Sistem Informasi, Institut Teknologi Kalimantan.
