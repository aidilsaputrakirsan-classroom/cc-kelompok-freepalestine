# Database Schema — Cloud App

**Database:** PostgreSQL  
**Database Name:** `cloudapp`  
**ORM:** SQLAlchemy 2.0

---

## Tabel: `items`

Tabel utama untuk menyimpan data inventory items.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT, INDEX | ID unik item |
| `name` | `VARCHAR(100)` | NOT NULL, INDEX | Nama item (maks 100 karakter) |
| `description` | `TEXT` | NULLABLE | Deskripsi item (opsional) |
| `price` | `FLOAT` | NOT NULL | Harga item (harus > 0) |
| `quantity` | `INTEGER` | NOT NULL, DEFAULT 0 | Jumlah stok (harus ≥ 0) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Waktu pembuatan (otomatis) |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NULLABLE, ON UPDATE | Waktu update terakhir (otomatis saat update) |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────┐
│                   items                      │
├─────────────────────────────────────────────┤
│ PK │ id          │ INTEGER        │ AUTO    │
├────┼─────────────┼────────────────┼─────────┤
│    │ name        │ VARCHAR(100)   │ NOT NULL│
│    │ description │ TEXT           │ NULLABLE│
│    │ price       │ FLOAT          │ NOT NULL│
│    │ quantity    │ INTEGER        │ DEFAULT 0│
│    │ created_at  │ TIMESTAMPTZ    │ DEFAULT │
│    │ updated_at  │ TIMESTAMPTZ    │ NULLABLE│
└─────────────────────────────────────────────┘
```

---

## SQL Create Statement (Auto-generated oleh SQLAlchemy)

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX ix_items_id ON items (id);
CREATE INDEX ix_items_name ON items (name);
```

---

## Catatan

- Tabel dibuat otomatis oleh `Base.metadata.create_all(bind=engine)` di `main.py`
- `created_at` diisi otomatis oleh database saat INSERT
- `updated_at` diisi otomatis oleh SQLAlchemy saat UPDATE
- Index pada kolom `id` dan `name` untuk mempercepat query pencarian
