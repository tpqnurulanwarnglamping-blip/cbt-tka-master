'use client';

import React, { useState } from 'react';
import { Plus, Clock, Key, Calendar, BookOpen, Check } from 'lucide-react';

export default function ExamManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(90);
  const [token, setToken] = useState('TKA' + Math.random().toString(36).substring(2, 5).toUpperCase());
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));

  const generateNewToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setToken(res);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Sesi Ujian "${title}" berhasil dibuat dengan Token: ${token}`);
    setShowModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Sesi Ujian</h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur jadwal pelaksanaan simulasi, durasi timer ujian, dan generate token akses peserta.
          </p>
        </div>

        <button
          onClick={() => {
            generateNewToken();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition"
        >
          <Plus className="w-4 h-4" /> Tambah Sesi Ujian Baru
        </button>
      </div>

      {/* Grid Kartu Ujian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#23A68A] bg-emerald-50 px-3 py-1 rounded-full">
              TKA-202611-001
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
              Aktif
            </span>
          </div>

          <h3 className="font-bold text-slate-800 text-base">Simulasi TKA - Penalaran Matematika & Literasi</h3>
          
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Durasi: <strong>90 Menit</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span>Token Akses: <strong className="font-mono text-[#23A68A]">TKA889</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Jumlah Soal: <strong>25 Butir Soal</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#23A68A] bg-emerald-50 px-3 py-1 rounded-full">
              TKA-202611-002
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
              Aktif
            </span>
          </div>

          <h3 className="font-bold text-slate-800 text-base">Try Out TKA - Pemahaman Bacaan & Menulis</h3>
          
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Durasi: <strong>60 Menit</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span>Token Akses: <strong className="font-mono text-[#23A68A]">TKA92A</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Jumlah Soal: <strong>20 Butir Soal</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Ujian */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Buat Sesi Ujian Baru</h3>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Ujian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Simulasi TKA Akbar - Paket A"
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
                      title="Generate Acak"
                    >
                      Acak
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jadwal Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jadwal Selesai</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full transition shadow-md"
                >
                  Simpan Sesi Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
