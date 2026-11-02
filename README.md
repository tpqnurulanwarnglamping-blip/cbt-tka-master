# CBT TKA Master - Web App Simulasi Ujian Kemampuan Akademik (Vercel-Ready)

Aplikasi Computer Based Test (CBT) modern berbasis Next.js App Router yang dirancang khusus untuk simulasi Tes Kemampuan Akademik (TKA) dan Asesmen Nasional. Dioptimalkan untuk lingkungan *Serverless* Vercel, didukung cloud database PostgreSQL dan Prisma ORM dengan *Connection Pooling*.

---

## 🌟 Fitur Utama & Keunggulan Arsitektur

### 1. Hak Akses (Role-Based Access Control)
- **Guru (Admin):**
  - Autentikasi aman terproteksi JWT cookie.
  - Dashboard statistik 3-kolom: Ujian Aktif, Total Peserta, Rata-rata Nilai.
  - Manajemen Soal (CRUD 3 jenis soal TKA & penentuan kunci jawaban).
  - Manajemen Ujian (Atur jadwal, durasi timer menit, generate token 6 digit acak).
  - Laporan & Rekapitulasi Real-Time dengan fitur **Ekspor ke Excel (.xlsx)**.
- **Peserta (Murid):**
  - Login kredensial aman via NISN & Kata Sandi.
  - Dashboard Murid dengan input token ujian.
  - Lembar Ujian Interaktif dengan countdown timer presisi dan grid nomor soal warna-warni (Belum dijawab, Sudah dijawab, Ragu-ragu).
  - **Sistem Pengumpulan Ganda:** Tombol Submit mandiri & **Auto-Submit** otomatis saat waktu server habis.

### 2. Tiga Jenis Format Soal TKA
1. **Pilihan Ganda (Single Choice):** 4 Opsi (A, B, C, D) dengan tepat 1 jawaban benar.
2. **Pilihan Ganda Kompleks:** 3 Opsi centang (*checkbox*) tanpa label huruf ABC, 2 jawaban benar dan 1 salah.
3. **Benar / Salah:** 3 Pernyataan mandiri dalam format tabel matriks dengan tombol centang [Benar] atau [Salah] per baris.

### 3. Proteksi & Anti-Cheat Canggih
- **Server Authority Timer:** Waktu akhir (`expiresAt`) dihitung dan divalidasi oleh server, kebal manipulasi jam lokal atau inspect element browser.
- **Client-Side Anti-Cheat:** Menonaktifkan klik kanan (`contextmenu`), shortcut copy-paste (`Ctrl+C`, `Ctrl+V`), dan deteksi keluar tab/layar (`visibilitychange` warning).
- **Auto-Recovery:** Jawaban tersimpan otomatis ke `localStorage` dan tersinkronisasi ke database agar aman jika laptop murid ter-restart atau koneksi terputus.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling & UI:** Tailwind CSS, Lucide React (SVG murni, Anti-AI Aesthetic)
- **Database:** PostgreSQL (Neon Serverless Postgres / Supabase)
- **ORM:** Prisma ORM v5 dengan Connection Pooling (`directUrl` & `url`)
- **Autentikasi:** Jose (JWT) & Bcryptjs via HTTP-Only Cookies
- **Ekspor:** SheetJS (XLSX)
- **Deployment:** Vercel Serverless Functions

---

## 🚀 Panduan Instalasi Lokal

### 1. Clone & Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel dengan kredensial database PostgreSQL Anda (Neon / Supabase):
```env
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-sample.region.neon.tech/neondb?sslmode=require"
JWT_SECRET="kunci-rahasia-jwt-acak-minimal-32-karakter"
```

### 3. Push Skema & Seed Data Awal
```bash
# Sinkronkan skema database
npx prisma db push

# Jalankan seeder akun & soal contoh
npm run seed
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🌐 Panduan Deploy ke Vercel (Produksi)

1. **Push Repositori ke GitHub / GitLab**.
2. Masuk ke [Vercel Dashboard](https://vercel.com) > Klik **"Add New..."** > **"Project"**.
3. Import repositori proyek ini.
4. Pada tab **Environment Variables**, tambahkan:
   - `DATABASE_URL` (Gunakan pooled connection string dari Neon/Supabase)
   - `DIRECT_URL` (Gunakan direct connection string port 5432)
   - `JWT_SECRET` (String acak aman 64 karakter)
5. Klik tombol **Deploy**. Vercel akan otomatis mengeksekusi `prisma generate` via skrip `postinstall` dan merilis aplikasi ke domain produksi aktif.

---

## 🔑 Akun Demo Bawaan (Hasil Seeding)

| Peran | Identifier (Email / NISN) | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Guru (Admin)** | `admin@sekolah.sch.id` | `admin123` | Akses penuh bank soal, ujian, dan rekap nilai |
| **Murid (Siswa 1)** | `1234567890` | `siswa123` | Peserta ujian simulasi |
| **Murid (Siswa 2)** | `1234567891` | `siswa123` | Peserta ujian simulasi |
| **Token Ujian Aktif** | **`TKA889`** | - | Masukkan di Dashboard Siswa untuk mulai tes |
