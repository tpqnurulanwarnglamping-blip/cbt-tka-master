'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, GraduationCap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      if (data.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Aksen Dekoratif Lembut di Background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ea5455]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#fab839]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Kartu Utama (Split-Card Layout Sesuai Referensi Visual) */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100 z-10 transition-all">
        
        {/* Sisi Kiri: Banner Hijau Zamrud (#23A68A) */}
        <div className="md:w-5/12 bg-[#23A68A] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-wider uppercase">CBT TKA Master</span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight mb-4">
              Selamat Datang Kembali!
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Sistem ujian terkomputerisasi khusus Tes Kemampuan Akademik (TKA) dengan proteksi kecurangan dan kalkulasi nilai otomatis.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-500/40 relative z-10 text-xs text-emerald-100 flex items-center justify-between">
            <span>Standar TKA &bull; Vercel Serverless</span>
            <span className="font-mono">v1.1.0</span>
          </div>
        </div>

        {/* Sisi Kanan: Form Login */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Masuk ke Akun</h3>
            <p className="text-slate-500 text-sm mt-1">Pilih peran dan masukkan data kredensial Anda</p>
          </div>

          {/* Switch Tab Role (Guru / Murid) */}
          <div className="flex p-1 bg-slate-100 rounded-full mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('STUDENT');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 ${
                role === 'STUDENT'
                  ? 'bg-[#23A68A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" /> Peserta (Murid)
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('ADMIN');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 ${
                role === 'ADMIN'
                  ? 'bg-[#23A68A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Guru (Admin)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {role === 'STUDENT' ? 'Nomor Induk Siswa Nasional (NISN)' : 'Email Guru'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type={role === 'STUDENT' ? 'text' : 'email'}
                  required
                  placeholder={role === 'STUDENT' ? 'Contoh: 1234567890' : 'nama@sekolah.sch.id'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#23A68A] focus:ring-2 focus:ring-[#23A68A]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#23A68A] focus:ring-2 focus:ring-[#23A68A]/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Memvalidasi...
                </>
              ) : (
                <>
                  MASUK KE SISTEM <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
