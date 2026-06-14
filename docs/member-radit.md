# Reflection Paper — Raditya Yudianto

| Field | Detail |
|-------|--------|
| **Nama** | Raditya Yudianto |
| **NIM** | 10231076 |
| **Peran** | Lead QA & Dokumentasi |
| **Tim** | Free Palestine |

---

## Tanggung Jawab Utama

Sebagai Lead QA & Docs, saya bertanggung jawab atas seluruh dokumentasi teknis per modul, pengujian kualitas antar komponen (Frontend ↔ Gateway ↔ Auth/Dashboard Service ↔ Database), review Pull Request anggota lain, serta penyusunan laporan rilis dan panduan operasional.

---

## Refleksi Analitis

### 1. Keputusan Teknis yang Paling Berdampak

**Memilih GitHub Flow dan Squash Merge sebagai strategi kolaborasi tim** adalah keputusan awal yang dampaknya terasa sepanjang proyek. Di Modul 9, kami berdiskusi antara Git Flow (dengan branch develop, release, hotfix) dan GitHub Flow yang lebih sederhana. Saya merekomendasikan GitHub Flow karena proyek kami melakukan continuous deployment — setiap merge ke `main` langsung di-deploy ke DeployCC. Dengan Git Flow, overhead pengelolaan branch develop dan release justru memperlambat iterasi. Squash merge dipilih agar commit history di `main` tetap bersih dan satu PR merepresentasikan satu perubahan yang dapat dilacak.

Keputusan ini terbukti tepat: tim bisa bergerak cepat dari Modul 9 ke Modul 15 tanpa konflik branch yang berarti, dan riwayat commit `main` tetap terbaca dengan jelas oleh semua anggota.

**Mendokumentasikan API contract dengan sequence diagram inter-service** di Modul 12 juga menjadi keputusan penting. Saat arsitektur dipecah menjadi Auth Service dan Dashboard Service, saya membuat diagram urutan yang menggambarkan alur "User Login → Gateway → Auth Service → JWT Token" dan "Request Data → Gateway → Dashboard Service → Verify ke Auth Service → Response". Dokumentasi ini bukan sekadar tulisan — ia menjadi acuan yang dipakai Ariel dan Irud untuk implementasi, sehingga tidak ada asumsi berbeda tentang kontrak antar service.

### 2. Tantangan Terbesar

Tantangan terbesar yang saya hadapi adalah **mendokumentasikan sistem yang terus berubah**. Di Modul 13 misalnya, saat Irud mengimplementasikan circuit breaker, saya harus memahami dan mendokumentasikan pola CLOSED → OPEN → HALF_OPEN beserta konfigurasinya (threshold=3, cooldown=30s) sebelum implementasinya benar-benar stabil. Beberapa kali dokumentasi yang baru saya tulis menjadi outdated dalam hitungan jam karena ada perbaikan di kode.

Pelajaran dari ini: dokumentasi teknis yang baik harus ditulis *bersama* pengembang, bukan setelah selesai. Sejak Modul 14, saya mulai praktek "dokumentasi dulu, implementasi sesuaikan" — saya draft dokumentasi berdasarkan desain yang disepakati, dan itulah yang menjadi panduan implementasi, bukan sebaliknya.

Tantangan kedua adalah **memahami komponen yang bukan bagian langsung saya kerjakan**. Sebagai QA, saya harus bisa memvalidasi fitur yang dikerjakan Ariel (backend/frontend) dan Irud (DevOps), padahal basis pengetahuan saya di keduanya tidak sedalam mereka. Saya mengatasinya dengan aktif membaca kode dan bertanya saat review PR, sehingga setiap review bukan hanya formalitas tetapi benar-benar pemahaman.

### 3. Pelajaran yang Didapat

**Pertama:** QA bukan sekadar "coba-coba dan catat error" — QA yang efektif berarti memahami *kontrak* yang seharusnya dipenuhi sistem, lalu memverifikasi apakah kontrak itu terpenuhi. Ketika saya mendokumentasikan 8 integration test yang dijalankan via Gateway di Modul 13, saya sadar bahwa test tersebut justru menemukan bug routing (trailing slash `/sales/` vs `/sales`) yang tidak terdeteksi di unit test. Ini membuktikan bahwa integration test dengan scope yang tepat lebih bernilai daripada ratusan unit test yang terisolasi.

**Kedua:** Dokumentasi adalah bentuk komunikasi, bukan arsip. README yang baik bukan yang paling lengkap, tapi yang paling berguna bagi orang yang baru bergabung atau bagi penguji yang ingin memahami sistem dalam 5 menit. Prinsip ini mengubah cara saya menulis: saya mulai dengan "siapa pembacanya dan apa yang mereka butuhkan" sebelum menentukan apa yang ditulis.

**Ketiga:** Di sistem terdistribusi seperti microservices, *visibility* adalah segalanya. Tanpa structured logging dan correlation ID yang terdokumentasi dengan baik, debugging menjadi sangat sulit. Saya bersyukur kami mendokumentasikan format log JSON dan cara menggunakan `logs.sh` di Modul 14 — ketika ada error di integration test CI, tim bisa langsung trace menggunakan correlation ID tanpa harus SSH ke server.

### 4. Yang Akan Saya Lakukan Berbeda

Jika mengulang proyek ini, saya akan **membuat test case dokumentasi sejak Modul 1**, bukan hanya mendokumentasikan hasil test yang sudah ada. Dengan mendefinisikan "apa yang harus dibuktikan berfungsi" lebih awal, kami bisa membangun test yang lebih terarah dan coverage yang lebih bermakna.

Saya juga akan **mengotomasi validasi dokumentasi** — misalnya, membuat script yang memverifikasi bahwa semua endpoint di `api-contract.md` benar-benar ada dan merespons sesuai yang terdokumentasi, sehingga dokumentasi tidak bisa out-of-sync dengan implementasi.

---

## Kontribusi per Modul

| Modul | Deliverable Utama |
|-------|-------------------|
| 1–4 | Dokumentasi setup, REST API, frontend, auth; validasi endpoint dan integrasi |
| 5–7 | Dokumentasi Docker & Compose; setup CI pipeline; validasi healthcheck |
| 9 | `modul9-git-workflow.md`; setup branch protection; buat & merge PR pertama |
| 10 | `test-report-modul10.md`; dokumentasi 11 backend tests + 16 frontend tests; analisis coverage |
| 11 | `release-notes-m2.md`; flowchart CI/CD dengan Mermaid; dokumentasi deployment DeployCC |
| 12 | `modul12-microservices.md`; sequence diagram login & data flow; full API contract (21 endpoint) |
| 13 | `modul13-reliability.md`; state machine circuit breaker; dokumentasi retry & graceful degradation |
| 14–15 | `modul14-monitoring-observability.md`; `security-checklist.md`; `operations-guide.md`; `release-notes-m3.md` |
| 15 (Review) | QA review integrasi DevOps Irud: integration tests, Makefile 21 target, compose overrides |

---

## Penutup

Peran Lead QA & Docs mengajarkan saya bahwa kualitas sebuah sistem tidak ditentukan hanya oleh seberapa canggih kodenya, tetapi oleh seberapa mudah sistem itu dipahami, diuji, dan dipelihara. Kontribusi terbesar saya di proyek ini ada pada memastikan setiap keputusan teknis tim terdokumentasi dengan alasan yang jelas — *mengapa* suatu pendekatan dipilih, bukan hanya *apa* yang diimplementasikan. Dokumentasi yang analitis inilah yang menurut saya paling bernilai jangka panjang.

---

*Dokumen ini merupakan reflection paper individual sebagai bagian dari penilaian Komponen C UAS Cloud Computing.*
