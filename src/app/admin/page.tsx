'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, Copy, Check, Plus, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    activeExams: 3,
    totalStudents: 128,
    averageScore: 78.4,
  });

  const [exams, setExams] = useState([
    {
      id: 'ex-1',
      code: 'TKA-202611-001',
      title: 'Simulasi TKA - Penalaran Matematika & Literasi',
      token: 'TKA889',
      durationMinutes: 90,
      totalQuestions: 25,
      isActive: true,
    },
    {
      id: 'ex-2',
      code: 'TKA-202611-002',
      title: 'Try Out TKA - Pemahaman Bacaan & Menulis',
      token: 'TKA92A',
      durationMinutes: 60,
      totalQuestions: 20,
      isActive: true,
    },
  ]);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Guru & Pengawas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan simulasi ujian, token akses aktif, dan analitik nilai peserta TKA.
          </p>
        </div>

        <a
          href="/admin/exams"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition"
        >
          <Plus className="w-4 h-4" /> Buat Sesi Ujian Baru
        </a>
      </div>

      {/* Grid 3-Kolom Metrik Dashboard (Standar ZettBOT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Kartu 1: Ujian Aktif */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#23A68A] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Sesi Ujian Aktif</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.activeExams}</div>
          </div>
        </div>

        {/* Kartu 2: Total Peserta */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Murid Terdaftar</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.totalStudents}</div>
          </div>
        </div>

        {/* Kartu 3: Rata-rata Nilai */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Rata-Rata Skor TKA</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.averageScore} / 100</div>
          </div>
        </div>

      </div>

      {/* Tabel Sesi Ujian Aktif & Token */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Daftar Ujian & Token Akses Cepat</h2>
          <span className="text-xs text-slate-400">Klik token untuk menyalin ke clipboard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Kode Ujian</th>
                <th className="px-6 py-3.5">Judul Sesi</th>
                <th className="px-6 py-3.5">Durasi</th>
                <th className="px-6 py-3.5">Jumlah Soal</th>
                <th className="px-6 py-3.5">Token Ujian</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {exams.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-mono font-semibold text-slate-800">{ex.code}</td>
                  <td className="px-6 py-4 text-slate-800 font-semibold">{ex.title}</td>
                  <td className="px-6 py-4">{ex.durationMinutes} Menit</td>
                  <td className="px-6 py-4">{ex.totalQuestions} Soal</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copyToClipboard(ex.token)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#23A68A] hover:bg-emerald-100 font-mono font-bold rounded-lg border border-emerald-200/60 transition"
                      title="Salin Token"
                    >
                      {ex.token}
                      {copiedToken === ex.token ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#23A68A]">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
