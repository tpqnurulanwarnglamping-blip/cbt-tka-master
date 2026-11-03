'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Clock, Key, Calendar, BookOpen, Edit2, Check, RefreshCw } from 'lucide-react';

interface ExamItem {
  id: string;
  code: string;
  title: string;
  durationMinutes: number;
  token: string;
  totalQuestions: number;
  isActive: boolean;
}

export default function ExamManagementPage() {
  const [exams, setExams] = useState<ExamItem[]>([
    {
      id: 'ex-tka-01',
      code: 'TKA-202611-001',
      title: 'Simulasi Akbar TKA - Penalaran Matematika & Literasi',
      durationMinutes: 90,
      token: 'TKA889',
      totalQuestions: 25,
      isActive: true,
    },
    {
      id: 'ex-tka-02',
      code: 'TKA-202611-002',
      title: 'Try Out TKA - Pemahaman Bacaan & Menulis',
      durationMinutes: 60,
      token: 'TKA92A',
      totalQuestions: 20,
      isActive: true,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(90);
  const [token, setToken] = useState('TKA889');

  useEffect(() => {
    fetch('/api/admin/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams && data.exams.length > 0) {
          setExams(data.exams);
        }
      })
      .catch((e) => console.log('Using local exam fallback', e));
  }, []);

  const generateNewToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setToken(res);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, durationMinutes: duration, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(`Sesi Ujian "${title}" berhasil dibuat dengan Token: ${token}`);
      setExams((prev) => [
        {
          id: data.exam?.id || 'temp-' + Date.now(),
          code: data.exam?.code || 'TKA-202611-NEW',
          title,
          durationMinutes: duration,
          token,
          totalQuestions: 0,
          isActive: true,
        },
        ...prev,
      ]);
      setShowCreateModal(false);
      setTitle('');
    } catch (err: any) {
      alert(err.message || 'Gagal membuat ujian.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    try {
      await fetch('/api/admin/exams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingExam.id,
          title: editingExam.title,
          durationMinutes: editingExam.durationMinutes,
          token: editingExam.token,
          isActive: editingExam.isActive,
        }),
      });

      setExams((prev) =>
        prev.map((item) => (item.id === editingExam.id ? editingExam : item))
      );

      alert(`Sesi Ujian "${editingExam.title}" berhasil diperbarui!`);
      setEditingExam(null);
    } catch (err) {
      alert('Gagal memperbarui sesi ujian.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Sesi Ujian</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ubah durasi waktu timer ujian, generate token akses baru, atau perbarui jadwal simulasi TKA.
          </p>
        </div>

        <button
          onClick={() => {
            generateNewToken();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition"
        >
          <Plus className="w-4 h-4" /> Tambah Sesi Ujian Baru
        </button>
      </div>

      {/* Grid Kartu Ujian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((ex) => (
          <div key={ex.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#23A68A] bg-emerald-50 px-3 py-1 rounded-full">
                {ex.code}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  ex.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {ex.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
                <button
                  onClick={() => setEditingExam({ ...ex })}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                  title="Edit Durasi & Token Ujian"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-base">{ex.title}</h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Durasi Pengerjaan: <strong className="text-slate-800">{ex.durationMinutes} Menit</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-400" />
                <span>Token Akses Peserta: <strong className="font-mono text-[#23A68A] font-bold">{ex.token}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Jumlah Soal: <strong>{ex.totalQuestions} Butir Soal</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit Ujian (Ubah Durasi & Token) */}
      {editingExam && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Pengaturan Ujian</h3>
            <p className="text-xs text-slate-500 mb-4">Kode Sesi: {editingExam.code}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Ujian</label>
                <input
                  type="text"
                  required
                  value={editingExam.title}
                  onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Durasi Timer (Menit)</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={300}
                  value={editingExam.durationMinutes}
                  onChange={(e) =>
                    setEditingExam({
                      ...editingExam,
                      durationMinutes: parseInt(e.target.value, 10) || 60,
                    })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Waktu countdown murid akan mengikuti durasi ini.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Token Akses Ujian</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingExam.token}
                    onChange={(e) =>
                      setEditingExam({ ...editingExam, token: e.target.value.toUpperCase() })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase text-slate-800 focus:outline-none focus:border-[#23A68A]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                      let res = '';
                      for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
                      setEditingExam({ ...editingExam, token: res });
                    }}
                    className="px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600"
                    title="Generate Acak"
                  >
                    Acak
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full transition shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Ujian Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Buat Sesi Ujian Baru</h3>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Ujian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Simulasi TKA Akbar - Paket B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={240}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Token Akses</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center uppercase text-slate-800 focus:outline-none focus:border-[#23A68A]"
                    />
                    <button
                      type="button"
                      onClick={generateNewToken}
                      className="px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600"
                    >
                      Acak
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full transition shadow-md"
                >
                  Buat Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
