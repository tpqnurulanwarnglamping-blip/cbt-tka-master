'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Search, CheckCircle2, AlertCircle, Edit3, Award } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentResult {
  id: string;
  nisn: string;
  name: string;
  classGrade?: string | null;
  examTitle: string;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  status: string;
  submittedAt: string;
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentResults, setStudentResults] = useState<StudentResult[]>([
    {
      id: 'res-1',
      nisn: '1234567890',
      name: 'Ahmad Fauzi',
      classGrade: 'XII MIPA 1',
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
      name: 'Bunga Citra Lestari',
      classGrade: 'XII IPS 2',
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
      classGrade: 'XII MIPA 1',
      examTitle: 'Simulasi TKA - Penalaran Matematika',
      score: 65.0,
      totalCorrect: 13,
      totalQuestions: 20,
      status: 'TIMED_OUT',
      submittedAt: '2026-11-02 09:50',
    },
  ]);

  // Modal Edit Skor
  const [editingItem, setEditingItem] = useState<StudentResult | null>(null);
  const [newScore, setNewScore] = useState<number>(0);
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          setStudentResults(data.results);
        }
      })
      .catch((e) => console.log('Using local fallback reports', e));
  }, []);

  const handleOpenEdit = (item: StudentResult) => {
    setEditingItem(item);
    setNewScore(item.score);
    setEditReason('');
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: editingItem.id,
          newScore,
          reason: editReason,
        }),
      });

      // Update local state
      setStudentResults((prev) =>
        prev.map((s) => (s.id === editingItem.id ? { ...s, score: Number(newScore) } : s))
      );

      alert(`Skor siswa ${editingItem.name} berhasil diperbarui menjadi ${newScore}!`);
      setEditingItem(null);
    } catch (err) {
      alert('Gagal memperbarui skor.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    const worksheetData = studentResults.map((r, idx) => ({
      No: idx + 1,
      NISN: r.nisn,
      'Nama Peserta': r.name,
      Kelas: r.classGrade || '-',
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
      s.nisn.includes(searchTerm) ||
      (s.classGrade && s.classGrade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan & Rekapitulasi Skor TKA</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau hasil simulasi real-time. Guru dapat mengedit skor secara manual atau mengekspor rekapitulasi ke Excel.
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
          placeholder="Cari berdasarkan nama murid, NISN, atau kelas..."
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
                <th className="px-6 py-3.5">Kelas</th>
                <th className="px-6 py-3.5">Sesi Ujian</th>
                <th className="px-6 py-3.5">Skor Akhir</th>
                <th className="px-6 py-3.5">Status Pengumpulan</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.nisn}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {item.classGrade || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.examTitle}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-extrabold text-sm text-[#23A68A] bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {item.score}
                    </span>
                  </td>
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
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#23A68A] hover:text-white text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1"
                      title="Edit Skor Manual"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Skor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Skor Siswa Manual */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#23A68A] flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Edit Skor Siswa Manual</h3>
            <p className="text-xs text-slate-500 mb-4">
              Siswa: <strong>{editingItem.name}</strong> ({editingItem.nisn})
            </p>

            <form onSubmit={handleSaveScore} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skor Baru (Skala 0 - 100)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0"
                  max="100"
                  value={newScore}
                  onChange={(e) => setNewScore(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Penyesuaian Skor</label>
                <input
                  type="text"
                  placeholder="Contoh: Tambahan nilai remedial / diskresi guru"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full transition shadow-md text-xs disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Perbarui Skor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
