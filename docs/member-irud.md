# Reflection Paper — Muhammad Khoiruddin Marzuq

| Field | Detail |
|-------|--------|
| **Nama** | Muhammad Khoiruddin Marzuq |
| **NIM** | 10231065 |
| **Peran** | Lead DevOps & Lead CI/CD |
| **Tim** | Free Palestine |

## Tanggung Jawab Utama

Sebagai Lead DevOps dan Lead CI/CD, saya bertanggung jawab mengelola infrastruktur container (Docker Compose monolith & microservices), API Gateway (Nginx), Makefile/skrip operasional, serta pipeline GitHub Actions dari unit test hingga integration test dan deploy ke **DeployCC**.

## Refleksi Singkat

### Keputusan penting

- **Compose terpisah:** monolith untuk DeployCC, microservices untuk dev/CI satu repo, dua mode deploy.
- **Healthcheck + `service_healthy`:** gateway dan service baru start jika benar-benar siap; mengurangi flake di CI.
- **Integration test di CI:** 8 test via gateway `:8080` menangkap bug routing (mis. trailing slash `/sales`).
- **Log artifacts:** export log Docker saat integration test gagal debugging tanpa SSH.
- **Makefile:** `ms-up`, `prod`, `logs`, `status` memadatkan perintah panjang untuk tim.

### Tantangan

- **Gateway healthcheck** gagal pakai `localhost` → diganti `127.0.0.1`.
- **Production DeployCC:** CD hijau, tapi systemd error `226/NAMESPACE` (path `hosting` vs `cc`). Uvicorn manual di `backend/` jalan; tanpa `sudo` tidak bisa perbaiki unit service perlu asdos.
- **Cloudflare 520:** origin mati karena crash loop systemd, bukan karena kode rusak.

### Pelajaran

1. CI/CD hijau ≠ production selalu hidup infrastruktur server juga harus sehat.
2. Integration test di pipeline adalah jaring pengaman terbaik saat microservices.
3. Observability (log rotation, `logs.sh`, CI artifacts) mempercepat troubleshooting.
4. Dokumentasi per modul (`modul13-devops-cicd.md`, `modul14-devops-cicd.md`) memudahkan review dan UAS.

### Yang akan saya lakukan berbeda

Verifikasi deploy di server lebih awal; tambah smoke test pasca-deploy; dokumentasikan perbedaan monolith vs microservices di README sejak Modul 12.

## Kontribusi per Modul

| Modul | Deliverable utama |
|-------|-------------------|
| 5–7 | `docker-compose.yml`, Makefile dasar, healthcheck monolith |
| 9–11 | CI/CD DeployCC, `deployment-guide.md` |
| 12 | `docker-compose.microservices.yml` |
| 13 | `migrate_data.py`, `docker-compose.dev.yml`, `tests/integration/`, job CI integration test, fix nginx routing |
| 14 | Prod compose, `logs.sh`/`logs.bat`, logging config, Makefile `dev/prod/logs/status`, CI log artifacts |
| 15 | Verifikasi CI/CD (#39) + CD (#37); troubleshooting production systemd |

## Statistik

| Metrik | Nilai |
|--------|--------|
| PR merged (Modul 13–14) | #19, #20 |
| Integration tests | 8 via gateway |
| CI jobs ditambah | Integration test + log artifacts |

## Penutup

Peran DevOps + CI/CD mengajarkan bahwa reliability cloud = kode + container + pipeline + konfigurasi server. Kontribusi terbesar saya di otomasi test microservices dan hardening compose; tantangan terbesar di production DeployCC yang memerlukan perbaikan platform.

**Artefak lengkap:** [devops-artifacts.md](devops-artifacts.md) · [modul13-devops-cicd.md](modul13-devops-cicd.md) · [modul14-devops-cicd.md](modul14-devops-cicd.md)
