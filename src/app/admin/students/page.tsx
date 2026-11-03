'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Key, Trash2, CheckCircle2, AlertCircle, Users, GraduationCap } from 'lucide-react';

interface Student {
  id: string;
  identifier: string; // NISN
  name: string;
  classGrade?: string | null;
  createdAt: string;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'usr-student-1',
      identifier: '1234567890',
      name: 'Ahmad Fauzi',
      classGrade: 'XII MIPA 1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-student-2',
      identifier: '1234567891',
      name: 'Bunga Citra Lestari',
      classGrade: 'XII IPS 2',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<Student | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [password, setPassword] = useState('siswa123');
  const [newPassword, setNewPassword] = useState('');

  // Load students from API if available
  useEffect(() => {
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students && data.students.length > 0) {
          setStudents(data.students);
        }
      })
      .catch((e) => console.log('Using local fallback state', e));
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nisn, password, classGrade }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menambahkan siswa.');

      alert(`Siswa ${name} (NISN: ${nisn}) berhasil didaftarkan!`);
      setStudents((prev) => [data.student || { id: 'temp-' + Date.now(), identifier: nisn, name, classGrade, createdAt: new Date().toISOString() }, ...prev]);
      setShowModal(false);
      setName('');
      setNisn('');
      setClassGrade('');
      setPassword('siswa123');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal || !newPassword) return;

    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: showResetModal.id, newPassword }),
      });

      if (!res.ok) throw new Error('Gagal mereset kata sandi.');

      alert(`Kata sandi untuk ${showResetModal.name} berhasil direset menjadi: ${newPassword}`);
      setShowResetModal(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteStudent = async (id: string, sName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa "${sName}"? Sesi ujian siswa ini juga akan terhapus.`)) return;

    try {
      await fetch(`/api/admin/students?id=${id}`, { method: 'DELETE' });
      setStudents((prev) => prev.filter((s) => s.id !== id));
      alert(`Data siswa "${sName}" berhasil dihapus.`);
    } catch (err) {
      alert('Gagal menghapus siswa.');
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.identifier.includes(search) ||
      (s.classGrade && s.classGrade.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Data Siswa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftarkan peserta simulasi TKA. NISN siswa akan otomatis digunakan sebagai Username login.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition"
        >
          <UserPlus className="w-4 h-4" /> Tambah Siswa Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan Nama Siswa, NISN, atau Kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Tabel Data Siswa */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">NISN (Username)</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5">Kelas / Rombel</th>
                <th className="px-6 py-3.5">Status Akun</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.identifier}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#23A68A] font-bold text-[11px] flex items-center justify-center">
                      {item.name.charAt(0)}
                    </div>
                    <span>{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {item.classGrade || 'Belum diisi'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#23A68A]">
                      <CheckCircle2 className="w-3 h-3" /> Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setShowResetModal(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1"
                      title="Reset Kata Sandi"
                    >
                      <Key className="w-3.5 h-3.5" /> Reset Sandi
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(item.id, item.name)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Siswa */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tambah Peserta Ujian Baru</h3>
            <p className="text-xs text-slate-500 mb-6">NISN akan digunakan sebagai Username saat siswa masuk ke sistem.</p>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Murid</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NISN (Nomor Induk Siswa Nasional)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1234567892"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelas / Rombel</label>
                <input
                  type="text"
                  placeholder="Contoh: XII MIPA 2"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Awal</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: siswa123</span>
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
                  disabled={loading}
                  className="flex-1 py-3 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full transition shadow-md disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Daftarkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Reset Kata Sandi Siswa</h3>
            <p className="text-xs text-slate-500 mb-4">Siswa: <strong>{showResetModal.name}</strong> ({showResetModal.identifier})</p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Masukkan Kata Sandi Baru</label>
                <input
                  type="text"
                  required
                  placeholder="Kata sandi baru..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full transition shadow-md text-xs"
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
