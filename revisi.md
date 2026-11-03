# LOG REVISI & EKSEKUSI (revisi.md)
================================================================================
STATUS: SELESAI DITERAPKAN (APPLIED & SYNCED)
ENGINE: ZettBOT by Zettbos (System Architect & Mentor)
TANGGAL: 2026-11-03
================================================================================

## 1. Rincian Perubahan Terkini:
1. **Pemisahan Menu: Bank Soal (Input) & Manajemen Soal (Daftar & Edit):**
   - **Bank Soal (Input) (`/admin/questions`):** Khusus untuk pembuatan butir soal baru (manual & upload Excel) dengan pilihan wajib **"Pilih Sesi Ujian Tujuan"** di baris teratas formulir.
   - **Manajemen Soal (`/admin/manage-questions`):** Halaman baru di sidebar khusus untuk meninjau seluruh butir soal yang sudah masuk per sesi ujian.

2. **Fitur Edit & Hapus Butir Soal:**
   - Guru dapat memfilter soal berdasarkan sesi ujian yang dipilih.
   - Tombol **"Edit Soal"** membuka modal untuk memperbarui wacana stimulus, foto/gambar grafik, teks pertanyaan inti, opsi jawaban, dan kunci jawaban.
   - Guru juga bisa memindahkan butir soal ke sesi ujian lain.
   - Tombol **"Hapus"** untuk membuang butir soal yang keliru.

3. **Backend API Terintegrasi:**
   - `GET /api/admin/questions?examId=xxx`: Mengambil butir soal terfilter per sesi.
   - `PATCH /api/admin/questions`: Memperbarui butir soal yang diedit.
   - `DELETE /api/admin/questions?id=xxx`: Menghapus butir soal.

Riwayat ini telah disinkronkan ke dokumen master [prd.md](file:///d:/Project/LMS/CBT%20SIMULASI%20UJIAN%20TKA%202/prd.md).
