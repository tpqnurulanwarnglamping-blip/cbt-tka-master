'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, GraduationCap, ArrowRight, LogOut, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/student/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Token ujian tidak valid.');
      }

      // Simpan data ujian sementara ke sessionStorage untuk render instan
      sessionStorage.setItem(`exam_${data.exam.id}`, JSON.stringify(data));
      router.push(`/student/exam/${data.exam.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#23A68A] flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">Dashboard Peserta</h1>
            <p className="text-xs text-slate-400">CBT Simulasi Ujian TKA</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-full transition flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col items-center justify-center">
        
        {/* Token Input Card */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center mb-6 text-[#23A68A]">
            <KeyRound className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">Masukkan Token Ujian</h2>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            Minta 6 digit token akses kepada Pengawas atau Guru untuk membuka lembar soal simulasi TKA.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-4">
            <div>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="CONTOH: TKA89X"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                className="w-full text-center text-xl font-mono tracking-widest uppercase font-bold py-3.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#23A68A] focus:ring-2 focus:ring-[#23A68A]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full py-3.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Memvalidasi Token...' : 'MULAI UJIAN SEKARANG'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Petunjuk Penggunaan Singkat */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl text-left">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">1. Format Soal</span>
            Terdapat Pilihan Ganda (4 Opsi), Pilihan Ganda Kompleks (Centang), dan Benar/Salah (Matriks).
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">2. Auto-Submit</span>
            Jawaban akan otomatis terkirim jika waktu ujian habis, pastikan seluruh soal terjawab.
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">3. Anti-Curang</span>
            Dilarang membuka tab lain atau meminimalkan browser selama sesi berlangsung.
          </div>
        </div>

      </main>
    </div>
  );
}
