# Dokumentasi Data Migration — Monolith ke Microservices (Modul 13)

**Disusun oleh:** Raditya Yudianto (10231076) — Lead QA & Docs  
**Tanggal:** 8 Juni 2026  
**Script:** `scripts/migrate_data.py`

---

## 1. Tujuan Migrasi

Pada transisi dari arsitektur **monolith** ke **microservices** (Modul 12-13), database yang semula satu (`telkom_dashboard`) dipisah menjadi dua:

| Service | Database Baru | Tabel yang Dipindahkan |
|---------|--------------|----------------------|
| Auth Service | `auth_db` | `users` |
| Dashboard Service | `dashboard_db` | `sales_data`, `inbox_items` |

Script `scripts/migrate_data.py` mengotomasi proses ini secara aman dengan strategi **upsert** (`ON CONFLICT DO NOTHING`) sehingga bisa dijalankan berulang tanpa merusak data.

---

## 2. Prasyarat Sebelum Migrasi

```bash
# 1. Install dependensi Python
pip install sqlalchemy psycopg2-binary

# 2. Jalankan dev stack microservices
#    (agar port DB 5433/5434 terbuka dari host)
make ms-dev
# atau:
docker compose -f docker-compose.microservices.yml -f docker-compose.dev.yml up -d --build

# 3. Pastikan monolith DB bisa diakses
#    (docker compose up -d atau dari backup)
```

---

## 3. Cara Menjalankan Migrasi

```bash
# Via Makefile (cara paling mudah)
make migrate-data

# Manual
python scripts/migrate_data.py

# Dengan custom database URL
MONOLITH_DB_URL=postgresql://user:pass@host:5432/telkom_dashboard \
AUTH_DB_URL=postgresql://user:pass@host:5433/auth_db \
DASHBOARD_DB_URL=postgresql://user:pass@host:5434/dashboard_db \
python scripts/migrate_data.py
```

---

## 4. Environment Variables

| Variabel | Default | Keterangan |
|----------|---------|------------|
| `MONOLITH_DB_URL` | `postgresql://postgres:postgres123@localhost:5432/telkom_dashboard` | DB sumber |
| `AUTH_DB_URL` | `postgresql://postgres:postgres123@localhost:5433/auth_db` | DB tujuan Auth |
| `DASHBOARD_DB_URL` | `postgresql://postgres:postgres123@localhost:5434/dashboard_db` | DB tujuan Dashboard |

---

## 5. Alur Migrasi

```mermaid
flowchart TD
    START([🚀 Start Migration]) --> CHECK_MONO{Monolith DB\nterhubung?}
    CHECK_MONO -->|Tidak| FAIL([❌ Exit Error])
    CHECK_MONO -->|Ya| M1

    subgraph STEP1["[1/3] Migrate users → auth_db"]
        M1{Tabel users\nada?} -->|Tidak| SKIP1[⚠️ Skip — tabel tidak ada]
        M1 -->|Ya| READ1[Baca semua users dari monolith]
        READ1 --> WRITE1["INSERT INTO auth_db.users\n(ON CONFLICT email DO NOTHING)"]
        WRITE1 --> SEQ1[Reset sequence ID]
    end

    SKIP1 --> M2
    SEQ1 --> M2

    subgraph STEP2["[2/3] Migrate sales_data → dashboard_db"]
        M2{Tabel sales_data\nada?} -->|Tidak| SKIP2[⚠️ Skip]
        M2 -->|Ya| READ2[Baca semua sales records]
        READ2 --> WRITE2["INSERT INTO dashboard_db.sales_data\n(ON CONFLICT id DO NOTHING)"]
        WRITE2 --> SEQ2[Reset sequence ID]
    end

    SKIP2 --> M3
    SEQ2 --> M3

    subgraph STEP3["[3/3] Migrate inbox_items → dashboard_db"]
        M3{Tabel inbox_items\nada?} -->|Tidak| SKIP3[⚠️ Skip]
        M3 -->|Ya| READ3[Baca semua inbox items]
        READ3 --> WRITE3["INSERT INTO dashboard_db.inbox_items\n(ON CONFLICT id DO NOTHING)"]
        WRITE3 --> SEQ3[Reset sequence ID]
    end

    SKIP3 --> DONE([✅ MIGRATION COMPLETE])
    SEQ3 --> DONE
```

---

## 6. Detail Tabel yang Dimigrasi

### 6.1 Tabel `users` → `auth_db`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER | Primary Key (sequence di-reset) |
| `email` | VARCHAR | Unique, dijadikan conflict key |
| `name` | VARCHAR | Nama lengkap |
| `hashed_password` | VARCHAR | bcrypt hash, disalin as-is |
| `role` | VARCHAR | Default `'viewer'` jika NULL |
| `is_active` | BOOLEAN | Default `true` jika NULL |
| `created_at` | TIMESTAMP | Dipertahankan dari monolith |

### 6.2 Tabel `sales_data` → `dashboard_db`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER | Primary Key (conflict key) |
| `witel`, `channel`, `product` | VARCHAR | Data kategorisasi |
| `revenue_target`, `revenue_actual` | FLOAT | Data keuangan |
| `sales_target`, `sales_actual` | INTEGER | Target vs realisasi |
| `period_month`, `period_year` | INTEGER | Periode pelaporan |
| `created_by`, `created_at`, `updated_at` | — | Metadata |

### 6.3 Tabel `inbox_items` → `dashboard_db`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER | Primary Key (conflict key) |
| `title`, `description` | VARCHAR/TEXT | Konten tiket |
| `status`, `priority`, `witel` | VARCHAR | Status dan kategori |
| `category`, `assigned_to`, `created_by` | VARCHAR | Pengategorian |
| `created_at`, `updated_at` | TIMESTAMP | Timestamp |

---

## 7. Keamanan & Idempotency

- **`ON CONFLICT DO NOTHING`**: Script aman dijalankan berulang kali — data yang sudah ada tidak akan tertimpa.
- **Sequence Reset**: Setelah insert, sequence auto-increment direset ke `MAX(id)` yang ada agar tidak terjadi konflik pada data baru.
- **Error Handling**: Jika koneksi gagal atau error terjadi, script keluar dengan `sys.exit(1)` dan pesan yang jelas.

---

## 8. Hasil Verifikasi QA

| Aspek | Status |
|-------|:------:|
| Script dapat dijalankan tanpa error | ✅ |
| `ON CONFLICT DO NOTHING` mencegah duplikasi | ✅ |
| Sequence ID direset dengan benar | ✅ |
| Error handling jelas | ✅ |
| Environment variable dapat dikustom | ✅ |

---

*Dokumentasi oleh Raditya Yudianto (10231076) — Lead QA & Docs*
