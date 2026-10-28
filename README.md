# DompetKu - Aplikasi Pencatatan Keuangan Pribadi

Aplikasi web modern untuk mencatat pemasukan dan pengeluaran harian, analisis grafik, batas anggaran (*budgeting*), dan histori bulanan lengkap.

## 🚀 Cara Menjalankan

### 1. Menjalankan di Komputer Lokal (Development)
```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev
```
Buka peramban di `http://localhost:3000`.

### 2. Membangun untuk Production / GitHub Pages
```bash
# Build aplikasi
npm run build
```
Hasil build akan tersimpan di dalam folder `dist/`. Folder ini siap diunggah ke GitHub Pages, Vercel, Netlify, atau web hosting lainnya.

> **Catatan GitHub Pages:**
> Konfigurasi Vite telah diset ke `base: './'` agar semua file berkas JavaScript dan CSS dimuat secara relatif (`./assets/...`), sehingga tidak akan mengalami layar putih (*blank screen*) saat diakses melalui sub-direktori repositori GitHub (`https://<username>.github.io/<repo>/`).

## ✨ Fitur Unggulan

- **Pemasukan & Pengeluaran:** Catat transaksi dengan nominal Rupiah otomatis, kategori, tanggal, dan catatan.
- **Histori Bulanan (Monthly Archive):** Rekap perbandingan bulan ke bulan, alokasi pengeluaran per kategori, dan pengelompokan transaksi harian.
- **Visualisasi & Grafik:** Diagram lingkaran (*donut chart*) interaktif dan grafik tren 6 bulan terakhir.
- **Fitur Anggaran (*Budgeting*):** Menetapkan batas pengeluaran per kategori per bulan dengan indikator peringatan saat mendekati/melampaui kuota.
- **Ekspor & Impor:** Unduh laporan format CSV/Excel, dialog cetak/PDF, dan impor transaksi massal.
- **Transaksi Rutin:** Jadwal otomatis pengeluaran/pemasukan rutin (gaji, internet, sewa kos).
- **Mode Demo & Cloud:** Mendukung Mode Demo langsung tanpa login, serta sinkronisasi Cloud Firestore dengan akun Google.
