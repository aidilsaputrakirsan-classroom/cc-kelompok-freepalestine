# API Endpoints — Dashboard Telkom TREG 4 Kalimantan

> Base URL: `http://localhost:8000`  
> Auth: Bearer Token (JWT)

## Authentication

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/auth/register` | ❌ | Registrasi user baru |
| POST | `/auth/login` | ❌ | Login → JWT token |
| GET | `/auth/me` | ✅ | Get current user info |
| PUT | `/auth/change-password` | ✅ | Ubah password |

## Revenue / Sales

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/sales` | ✅ | List data penjualan (paginated, filterable) |
| POST | `/sales` | ✅ | Tambah data penjualan manual |
| GET | `/sales/{id}` | ✅ | Detail satu record |
| PUT | `/sales/{id}` | ✅ | Update record |
| DELETE | `/sales/{id}` | ✅ | Hapus record |
| GET | `/sales/summary` | ✅ | Ringkasan KPI (target, actual, achievement) |
| GET | `/sales/monthly` | ✅ | Revenue per bulan per witel |
| GET | `/sales/by-telda` | ✅ | Revenue per Telda |
| GET | `/sales/trend` | ✅ | Trend revenue tahunan |

### Query Parameters (GET /sales)
- `skip` (int) — offset pagination
- `limit` (int) — jumlah per halaman (max 10000)
- `witel` (string) — filter per witel
- `product` (string) — filter per produk
- `year` (int) — filter tahun
- `month` (int) — filter bulan
- `search` (string) — pencarian teks
- `datasource_id` (int) — filter per file upload

## Customer Care / Inbox

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/inbox` | ✅ | List tiket gangguan (paginated) |
| POST | `/inbox` | ✅ | Buat tiket baru |
| GET | `/inbox/{id}` | ✅ | Detail tiket |
| PUT | `/inbox/{id}` | ✅ | Update tiket |
| DELETE | `/inbox/{id}` | ✅ | Hapus tiket |
| GET | `/inbox/stats` | ✅ | Statistik tiket per status |

## Upload / Data Sources

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/upload/sales` | ✅ | Upload file CSV/XLSX data revenue |
| POST | `/upload/inbox` | ✅ | Upload file CSV/XLSX data gangguan |
| POST | `/upload/witel` | ✅ | Upload file CSV/XLSX data witel |
| GET | `/datasources` | ✅ | List semua file yang pernah di-upload |
| PATCH | `/datasources/{id}/toggle` | ✅ | Toggle aktif/nonaktif datasource |
| DELETE | `/datasources/{id}` | ✅ | Hapus datasource + data terkait |

## Leaderboard

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/leaderboard` | ✅ | Ranking Witel berdasarkan score |

### Query Parameters
- `year` (int) — filter tahun
- `month` (int) — filter bulan

## Monitoring

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/monitoring/summary` | ✅ | NPS score, resolution rate, by_witel |

## User Management (Admin Only)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/users` | ✅ Admin | List semua user |
| POST | `/users` | ✅ Admin | Buat user (by admin) |
| PUT | `/users/{id}` | ✅ Admin | Update user |
| DELETE | `/users/{id}` | ✅ Admin | Hapus user |

## Audit Log (Admin Only)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/audit-logs` | ✅ Admin | List aktivitas user |

## Utilities

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/health` | ❌ | Health check (DB connectivity) |
| GET | `/team` | ❌ | Info tim & arsitektur |
| GET | `/telda` | ❌ | List Telda per witel |
| GET | `/notifications` | ✅ | Notifikasi anomali & warning |

---

## Response Format

### Success (List)
```json
{
  "total": 150,
  "items": [...]
}
```

### Success (Single)
```json
{
  "id": 1,
  "witel": "BALIKPAPAN",
  ...
}
```

### Error
```json
{
  "detail": "Email atau password salah"
}
```

---

*Dokumentasi API by Ariel Itsbat Nurhaq — Lead Backend*
