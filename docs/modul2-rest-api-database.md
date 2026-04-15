# Modul 2: REST API & Database PostgreSQL

## 📌 Tujuan
Modul ini mendokumentasikan pembuatan layer Backend menggunakan arsitektur REST API dengan framework **FastAPI** dan pengelolaan database relasional menggunakan **PostgreSQL** yang dihubungkan melalui ORM **SQLAlchemy**.

## 🗄️ Database Architecture (Skema Tabel)
Proyek ini mengelola data revenue dan monitoring dari Telkom Regional 4 Kalimantan yang memiliki relasi cukup kompleks. Database direpresentasikan di `backend/models.py`.

Terdapat 5 tabel utama yang dibuat:

1. **`users`**
   - Fungsi: Menyimpan kredensial autentikasi (Login/Register) dan Role sistem (admin/viewer).
   - Kolom Utama: `id`, `email`, `name`, `hashed_password`, `role`.
2. **`sales_data`**
   - Fungsi: Core data revenue. Menyimpan target dan realisasi penjualan berdasarkan wilayah, channel, dan layanan.
   - Kolom Utama: `id`, `witel`, `telda`, `revenue_target`, `revenue_actual`, `layanan`, `nama_am`.
3. **`inbox_items`**
   - Fungsi: Menyimpan tiket monitoring, kendala operasional, dan eskalasi per Witel.
   - Kolom Utama: `id`, `title`, `description`, `status` (pending, progress, completed), `priority`.
4. **`telda`** (Telkom Daerah)
   - Fungsi: Tabel referensi data Witel (Wilayah Telekomunikasi) dan Branch Type.
   - Kolom Utama: `id`, `name`, `witel`, `branch_type`.
5. **`data_sources`**
   - Fungsi: Mencatat log sumber data (CSV/Excel) yang diunggah ke dalam sistem.

## ⚙️ Koneksi & Konfigurasi (*Database Layer*)
Koneksi database diatur di `backend/database.py` dengan membaca URL pada file `.env`. 
Format `DATABASE_URL`:
`postgresql://<user>:<password>@<host>:<port>/<dbname>`

## 🌐 Rancangan REST API (Endpoints)
Proses bisnis (CRUD) di-handle oleh library Pydantic (`schemas.py`) untuk validasi request & response, dan diproses oleh `crud.py`. Berikut adalah daftar endpoint utama yang disajikan oleh `main.py`:

### Autentikasi & Users
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/auth/register` | Mendaftarkan pengguna baru (Password di-hash). |
| `POST` | `/auth/login` | Login user, mengembalikan token JWT untuk session. |

### Sales & Revenue Data
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET`  | `/api/sales` | Menampilkan seluruh data sales (mendukung pagination: `skip`, `limit` dan parameter filter `witel`). |
| `GET`  | `/api/sales/stats` | Endpoint khusus analytics, menghitung Aggregate (Total Revenue, Total Target, Growth per unit). |
| `POST` | `/api/sales` | Input data realisasi harian/bulanan baru. |

### Inbox & Monitoring
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET`  | `/api/inbox` | List tiket/kendala aktif (filter by status/witel). |
| `POST` | `/api/inbox` | Buat tiket pelaporan baru. |
| `PUT`  | `/api/inbox/{id}` | Update status tiket (misal: "pending" -> "completed"). |
| `DELETE`|`/api/inbox/{id}` | Hapus log tiket. |

## 🧪 Validasi Uji Coba API
Seluruh Endpoint di atas telah diuji cobakan menggunakan fasilitas **Swagger UI** (Docs bawaan FastAPI) yang berjalan secara interaktif di `http://localhost:8000/docs`. Swagger me-render otomatis dokumentasi Pydantic Schema model sehingga QA dan pengembang Frontend dapata mengetahui struktur Response Body JSON secara jelas.
