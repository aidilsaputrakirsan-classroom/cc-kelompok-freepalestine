# 📋 UI Test Results — Modul 3

**Tester:** Raditya Yudianto (Lead QA & Docs)  
**Tanggal:** 12 Maret 2026  
**URL:** http://localhost:5173  
**Status Backend:** http://localhost:8000 ✅ Running

---

## Daftar Test Case

| # | Test Case | Steps | Expected | Actual | Status | Dokumentasi |
|---|-----------|-------|----------|--------|--------|-------------|
| 1 | Cek koneksi API | Buka localhost:5173 | Header menampilkan "🟢 API Connected" | Header menampilkan "🟢 API Connected" | ✅ Pass | ![Test 1](screenshots/post/modul3_test1.png) |
| 2 | Tampil daftar items | Lihat daftar di halaman utama | Items dari Modul 2 muncul sebagai cards | Items (Laptop, Mouse, Keyboard) muncul sebagai cards | ✅ Pass | ![Test 2](screenshots/post/modul3_test2.png) |
| 3 | Tambah item baru | Isi form: Nama=Monitor, Harga=3500000, klik Tambah | Item baru muncul di daftar | Item "Monitor" berhasil ditambahkan | ✅ Pass | ![Test 3](screenshots/post/modul3_test3.png) |
| 4 | Verifikasi item muncul | Cek card di grid | Card "Monitor" tampil dengan harga benar | Card "Monitor" tampil dengan harga Rp3.500.000 | ✅ Pass | ![Test 4](screenshots/post/modul3_test4.png) |
| 5 | Klik tombol Edit | Klik ✏️ Edit pada item | Form terisi data item yang dipilih | Form terisi otomatis dengan data item | ✅ Pass | ![Test 5](screenshots/post/modul3_test5.png) |
| 6 | Update item | Ubah harga, klik Update Item | Harga berubah di daftar | Harga item berhasil diperbarui | ✅ Pass | ![Test 6](screenshots/post/modul3_test6.png) |
| 7 | Fitur Search | Ketik "laptop" di SearchBar, klik Cari | Hanya item Laptop yang tampil | Hanya 1 item "Laptop" yang ditampilkan | ✅ Pass | ![Test 7](screenshots/post/modul3_test7.png) |
| 8 | Clear Search | Klik tombol Clear | Semua item muncul kembali | Semua item kembali ditampilkan | ✅ Pass | ![Test 8](screenshots/post/modul3_test8.png) |
| 9 | Konfirmasi Hapus | Klik 🗑️ Hapus pada item | Dialog konfirmasi muncul | Dialog "Yakin ingin menghapus?" muncul | ✅ Pass | ![Test 9](screenshots/post/modul3_test9.png) |
| 10 | Hapus item | Klik OK di dialog | Item hilang dari daftar | Item berhasil dihapus dari daftar | ✅ Pass | ![Test 10](screenshots/post/modul3_test10.png) |

---

## Hasil Keseluruhan

- **Total Test:** 10

