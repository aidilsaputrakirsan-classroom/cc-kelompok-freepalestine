# Panduan Format Upload File — Dashboard Telkom

> Menu Upload Data Sources menerima file CSV atau XLSX dengan format kolom tertentu.  
> File yang tidak sesuai format akan ditolak otomatis.

## 1. Data Revenue (→ Revenue Analytics)

### Kolom Wajib

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| witel | String | Nama Witel (BALIKPAPAN, BANJARMASIN, dll) |
| channel | String | Channel penjualan |
| product | String | Produk (HSI, IPTV, VoIP) |
| revenue_target | Number | Target revenue (dalam juta) |
| revenue_actual | Number | Realisasi revenue (dalam juta) |
| sales_target | Integer | Target SSL |
| sales_actual | Integer | Realisasi SSL |
| period_month | Integer | Bulan (1-12) |
| period_year | Integer | Tahun (2024, 2025, dst) |

### Kolom Opsional

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| telda | String | Nama Telkom Daerah |
| flag | String | NONPOT / POT |
| flag_2 | String | REV SCALING NEW, dll |
| flag_3 | String | SCALLING / SUSTAIN |
| nama_pelanggan | String | Nama pelanggan |
| layanan | String | Enterprise Connectivity, dll |
| nama_am | String | Nama Account Manager |

---

## 2. Data Customer Care (→ Customer Care & NPS)

### Kolom Wajib

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| title | String | Judul tiket |
| status | String | pending / in_progress / completed / rejected |
| priority | String | low / medium / high / critical |
| witel | String | Nama Witel |

### Kolom Opsional

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| description | String | Detail masalah |
| category | String | network / billing / service |
| assigned_to | String | PIC yang ditugaskan |

---

## 3. Data Witel Performance (→ Witel Leaderboard)

### Kolom Wajib

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| witel | String | Nama Witel |
| total_pelanggan | Integer | Total pelanggan aktif |
| pelanggan_baru | Integer | Pelanggan baru bulan ini |
| churn | Integer | Pelanggan lepas bulan ini |
| revenue_total | Number | Total revenue witel |
| nps_score | Integer | Net Promoter Score (0-100) |
| gangguan_total | Integer | Total laporan gangguan |
| gangguan_selesai | Integer | Gangguan yang terselesaikan |
| period_month | Integer | Bulan (1-12) |
| period_year | Integer | Tahun |

---

## Catatan Penting

1. **Header kolom harus tepat** — nama kolom harus sama persis (case-insensitive)
2. **Baris kosong** dilewati otomatis
3. **Baris invalid** dilaporkan di response (max 5 error ditampilkan)
4. **Format angka** — gunakan titik sebagai desimal (123.45), bukan koma
5. **Toggle Aktif/Nonaktif** — setelah upload, datasource bisa di-toggle tanpa hapus data

---

## Contoh File

Lihat folder `sample-upload/` untuk contoh file CSV yang valid:
- `revenue_data.csv`
- `customercare_data.csv`
- `witel_data.csv`

---

*Dokumentasi by Ariel Itsbat Nurhaq — Lead Backend & Frontend*
