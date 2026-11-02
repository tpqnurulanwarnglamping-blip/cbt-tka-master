'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [studentResults, setStudentResults] = useState([
    {
      id: 'res-1',
      nisn: '1234567890',
      name: 'Ahmad Fauzi',
      examTitle: 'Simulasi TKA - Penalaran Matematika',
      score: 85.0,
      totalCorrect: 17,
      totalQuestions: 20,
      status: 'SUBMITTED',
      submittedAt: '2026-11-02 09:45',
    },
    {
      id: 'res-2',
      nisn: '1234567891',
      name: 'Bunga Citra',
      examTitle: 'Simulasi TKA - Penalaran Matematika',
      score: 92.5,
      totalCorrect: 19,
      totalQuestions: 20,
      status: 'SUBMITTED',
      submittedAt: '2026-11-02 09:40',
    },
    {
      id: 'res-3',
      nisn: '1234567892',
      name: 'Dimas Aditya',
      examTitle: 'Simulasi TKA - Penalaran Matematika',
      score: 65.0,
      totalCorrect: 13,
      totalQuestions: 20,
      status: 'TIMED_OUT',
      submittedAt: '2026-11-02 09:50',
    },
  ]);

  const handleExportExcel = () => {
    const worksheetData = studentResults.map((r, idx) => ({
      No: idx + 1,
      NISN: r.nisn,
      'Nama Peserta': r.name,
      'Sesi Ujian': r.examTitle,
      'Skor Akhir': r.score,
      'Jawaban Benar': `${r.totalCorrect} / ${r.totalQuestions}`,
      Status: r.status === 'SUBMITTED' ? 'Selesai Mandiri' : 'Waktu Habis (Auto-Submit)',
      'Waktu Pengumpulan': r.submittedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil_Ujian_TKA');

    XLSX.writeFile(workbook, `Rekap_Nilai_TKA_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filtered = studentResults.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan & Hasil Ujian Peserta</h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekap skor real-time hasil pengerjaan simulasi Tes Kemampuan Akademik (TKA).
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition"
        >
          <FileSpreadsheet className="w-4 h-4" /> Ekspor ke Excel (.xlsx)
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama murid atau NISN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Tabel Hasil Ujian */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">NISN</th>
                <th className="px-6 py-3.5">Nama Peserta</th>
                <th className="px-6 py-3.5">Sesi Ujian</th>
                <th className="px-6 py-3.5">Skor Akhir</th>
                <th className="px-6 py-3.5">Jumlah Benar</th>
                <th className="px-6 py-3.5">Status Pengumpulan</th>
                <th className="px-6 py-3.5">Waktu Submit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.nisn}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">{item.examTitle}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-extrabold text-sm text-[#23A68A]">
                      {item.score}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.totalCorrect} / {item.totalQuestions}</td>
                  <td className="px-6 py-4">
                    {item.status === 'SUBMITTED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Selesai Mandiri
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                        <AlertCircle className="w-3 h-3" /> Waktu Habis
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{item.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
