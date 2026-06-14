# Reflection Paper Ariel Itsbat Nurhaq

| Field | Detail |
|---|---|
| **Nama** | Ariel Itsbat Nurhaq |
| **NIM** | 10231018 |
| **Peran** | Lead Backend & Lead Frontend |

## Tanggung Jawab Utama

Sebagai Lead Backend & Lead Frontend, saya bertanggung jawab atas keseluruhan arsitektur aplikasi dari desain database dan API di backend hingga implementasi antarmuka pengguna di frontend. Peran ganda ini memberikan perspektif menyeluruh tentang bagaimana sebuah aplikasi full-stack cloud-native dibangun dari nol.

## Refleksi Analitis

### Keputusan Teknis yang Diambil

**1. Memilih FastAPI dibanding Flask/Django:**
Keputusan pertama yang saya buat adalah menggunakan FastAPI sebagai framework backend. Alasan utamanya adalah dukungan bawaan untuk tipe data Pydantic yang memvalidasi input secara otomatis, serta fitur Swagger UI (/docs) yang langsung tersedia tanpa konfigurasi tambahan. Keputusan ini terbukti tepat ketika tim perlu mendokumentasikan API, Swagger otomatis menjadi "single source of truth" bagi frontend dan QA tanpa harus menulis dokumentasi terpisah.

**2. Arsitektur Monolith-First, lalu Microservices:**
Saya memilih pendekatan "monolith-first" di mana semua logika bisnis (auth, sales, inbox) berada di satu file main.py terlebih dahulu. Baru setelah monolith stabil (Modul 12), saya memecahnya menjadi Auth Service dan Dashboard Service. Strategi ini terbukti efisien: saya bisa mengembangkan fitur dengan cepat di awal tanpa overhead komunikasi antar-service, dan saat decomposition dilakukan, bounded context-nya sudah jelas karena kode monolith sudah terstruktur rapi per section.

**3. Database-per-Service dengan Integer Reference:**
Saat memecah ke microservices, saya memutuskan setiap service memiliki database sendiri (auth_db dan dashboard_db). Tantangan terbesar adalah bagaimana Dashboard Service mengetahui siapa yang membuat data tanpa mengakses auth_db secara langsung. Solusinya adalah menyimpan created_by sebagai integer user ID, Dashboard Service tidak perlu tahu detail user, cukup menyimpan referensi ID-nya. Validasi dilakukan via HTTP call ke /auth/verify.

**4. Circuit Breaker untuk Graceful Degradation:**
Implementasi circuit breaker di Dashboard Service adalah keputusan arsitektural yang saya anggap paling penting. Dengan threshold 3 kegagalan dan cooldown 30 detik, Dashboard Service tidak akan terus-menerus mencoba menghubungi Auth Service yang sedang down. Sebaliknya, ia masuk ke "degraded mode" dan tetap melayani request baca (read-only). Keputusan ini mengajarkan saya bahwa dalam sistem terdistribusi, kegagalan parsial adalah hal normal, yang penting adalah bagaimana sistem merespon kegagalan tersebut.

### Kesulitan yang Dihadapi

**1. CORS dan Konfigurasi Lintas-Environment:**
Kesulitan terbesar di awal proyek adalah mengkonfigurasi CORS. Frontend di localhost:5173 harus bisa mengakses backend di localhost:8000, dan saat di-deploy, domain berubah menjadi *.akhzafachrozy.my.id. Saya harus membuat sistem ALLOWED_ORIGINS yang fleksibel menggunakan environment variable agar satu kode bisa berjalan di development dan production tanpa perubahan.

**2. Upload Pipeline untuk Data Heterogen:**
Membangun fitur upload CSV/XLSX yang robust ternyata jauh lebih kompleks dari yang saya bayangkan. Data dari dunia nyata (Telkom) memiliki format yang tidak konsisten, ada kolom yang bertukar posisi, tipe data yang salah, dan baris kosong. Saya harus membuat sistem mapping yang toleran terhadap variasi ini di upload.py, dengan error reporting per baris agar user tahu persis baris mana yang bermasalah.

**3. Deployment ke DeployCC:**
Proses deployment ke server kampus (DeployCC) menghadirkan tantangan unik. Tidak seperti Railway atau Render yang "just works", DeployCC memerlukan pemahaman tentang systemd service, Cloudflare Tunnel, dan manajemen virtual environment Python di server Linux. Pengalaman ini justru menjadi pelajaran berharga tentang cara kerja deployment di dunia nyata, di mana tidak semua hal berjalan otomatis.

### Pelajaran yang Didapat

1. **Monolith-first bukan berarti monolith-forever.** Memulai dengan monolith memungkinkan iterasi cepat. Decomposition ke microservices menjadi jauh lebih mudah ketika kode monolith sudah terstruktur dengan bounded context yang jelas.

2. **Testing bukan opsional, tapi penyelamat.** Ketika saya melakukan decomposition dari monolith ke microservices, unit test yang sudah ada menjadi jaring pengaman. Setiap kali saya memindahkan kode, saya langsung tahu jika ada yang rusak karena test gagal. Tanpa test, proses ini akan jauh lebih berisiko.

3. **Observability harus dipikirkan sejak awal.** Menambahkan structured logging di akhir proyek (Modul 14) ternyata memerlukan refactoring di banyak tempat. Jika dipikirkan sejak awal, setiap endpoint sudah memiliki logging yang konsisten dari hari pertama.

4. **Keamanan bukan fitur tambahan, ia adalah fondasi.** Rate limiting, input validation, dan security headers seharusnya sudah ada sejak Modul 1. Menambahkannya di Modul 15 berarti ada jendela waktu di mana aplikasi rentan.

### Apa yang Akan Saya Lakukan Berbeda

Jika mengulang proyek ini dari awal, saya akan:
- Menerapkan structured logging sejak hari pertama, bukan menambahkannya di akhir.
- Membuat abstraksi repository pattern di backend agar peralihan dari monolith ke microservices tidak memerlukan perubahan besar di layer data access.
- Menggunakan Docker dari awal untuk development (bukan hanya untuk deployment) agar environment development identik dengan production.
- Menulis integration test lebih awal, bukan hanya di Modul 13.

## Log Kontribusi per Modul

### Modul 1-2 Setup & REST API
- Arsitektur backend: main.py, models.py, database.py, schemas.py, crud.py
- Desain database schema: User, SalesData, InboxItem
- Implementasi seluruh CRUD endpoint dengan paginasi dan filtering

### Modul 3 Frontend React
- Setup React 18 + Vite + React Router
- Implementasi komponen Dashboard, Revenue Analytics, Customer Care
- Integrasi Axios HTTP client dengan JWT interceptor

### Modul 4 Authentication & CORS
- Implementasi JWT auth: auth.py (bcrypt + python-jose)
- Login/Register flow end-to-end
- Konfigurasi CORS middleware

### Modul 5-6 Docker & Docker Compose
- backend/Dockerfile dengan non-root user
- frontend/Dockerfile multi-stage build (Node ke Nginx)
- docker-compose.yml untuk monolith stack
- frontend/nginx.conf dengan SPA routing + security headers

### Modul 9 Git Workflow
- Partisipasi dalam PR review dan squash merge flow

### Modul 10-11 CI/CD Pipeline
- Kontribusi pada test backend (test_main.py)
- Verifikasi pipeline CI/CD end-to-end

### Modul 12 Microservices
- Decomposition monolith: Auth Service (services/auth-service/) dan Dashboard Service (services/dashboard-service/)
- Database-per-service pattern
- Inter-service JWT verification via /auth/verify

### Modul 13 Reliability
- Implementasi Circuit Breaker class (CLOSED ke OPEN ke HALF_OPEN)
- Retry with Exponential Backoff (0.5s ke 1s ke 2s)
- Graceful Degradation saat Auth Service down

### Modul 14 Observability
- Structured JSON Logging di semua services + monolith
- Correlation ID middleware (X-Correlation-ID)
- Metrics endpoint (/metrics)
- System Status Page di frontend (auto-refresh 10 detik)

### Modul 15 Security & Final
- Rate limiting configuration di Nginx Gateway
- Security headers (X-Frame-Options, CSP, nosniff)
- Input validation via Pydantic field constraints
- Final code cleanup dan konsistensi

## Statistik Kontribusi

| Metrik | Nilai |
|---|---|
| Total file yang ditulis/dimodifikasi | 30+ |
| Backend endpoints | 25+ |
| Frontend pages/components | 8+ |
| Dockerfile | 2 (backend + frontend) |
| Docker Compose variants | 4 |
