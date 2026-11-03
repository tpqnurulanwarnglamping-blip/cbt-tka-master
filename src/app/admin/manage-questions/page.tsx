'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Edit3, Trash2, Plus, Check, CheckCircle2, XCircle, Image as ImageIcon, X, AlertTriangle, Layers, Filter } from 'lucide-react';
import { QuestionType } from '@/types/exam';

interface ExamItem {
  id: string;
  title: string;
  code: string;
  token: string;
  durationMinutes: number;
}

interface QuestionItem {
  id: string;
  examId: string;
  orderNumber: number;
  type: QuestionType;
  stimulusText?: string | null;
  questionText: string;
  questionImage?: string | null;
  options: any;
  correctAnswer: any;
  exam?: {
    id: string;
    title: string;
    code: string;
  };
}

export default function ManageQuestionsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal Edit Soal
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Ambil data sesi ujian & soal
  useEffect(() => {
    fetch('/api/admin/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams && data.exams.length > 0) {
          setExams(data.exams);
          // Default pilih sesi pertama
          setSelectedExamId(data.exams[0].id);
        }
      })
      .catch((e) => console.log('Error fetching exams', e));
  }, []);

  // Ambil soal berdasarkan selectedExamId
  const loadQuestions = () => {
    setLoading(true);
    const url = selectedExamId === 'ALL' ? '/api/admin/questions' : `/api/admin/questions?examId=${selectedExamId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          setQuestions(data.questions);
        }
      })
      .catch((e) => console.log('Error fetching questions', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedExamId) {
      loadQuestions();
    }
  }, [selectedExamId]);

  // Handle Buka Modal Edit
  const handleOpenEdit = (q: QuestionItem) => {
    // Salin deep copy agar tidak memodifikasi state asli sebelum disimpan
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
  };

  // Handle Simpan Perubahan Edit Soal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setSavingEdit(true);

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingQuestion.id,
          examId: editingQuestion.examId,
          type: editingQuestion.type,
          stimulusText: editingQuestion.stimulusText,
          questionImage: editingQuestion.questionImage,
          questionText: editingQuestion.questionText,
          options: editingQuestion.options,
          correctAnswer: editingQuestion.correctAnswer,
          orderNumber: editingQuestion.orderNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan perubahan soal.');

      alert('Soal berhasil diperbarui!');
      setEditingQuestion(null);
      loadQuestions(); // Muat ulang daftar soal
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Hapus Soal
  const handleDeleteQuestion = async (id: string, num: number) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Soal Nomor ${num}?`)) return;

    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus soal.');

      alert(`Soal Nomor ${num} berhasil dihapus.`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert('Gagal menghapus butir soal.');
    }
  };

  // Upload Gambar Baru saat Edit
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingQuestion) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingQuestion({
          ...editingQuestion,
          questionImage: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const currentExam = exams.find((e) => e.id === selectedExamId);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen & Edit Soal TKA</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tinjau seluruh butir soal yang telah dimasukkan ke setiap sesi ujian. Guru dapat mengedit isi soal atau menghapusnya.
          </p>
        </div>

        <a
          href="/admin/questions"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#23A68A] hover:bg-[#1a8a72] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition"
        >
          <Plus className="w-4 h-4" /> + Buat Butir Soal Baru
        </a>
      </div>

      {/* Filter Sesi Ujian (Dropdown) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#23A68A] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pilih Sesi Ujian untuk Ditinjau
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="mt-1 font-bold text-slate-800 text-sm bg-transparent border-b border-emerald-400 focus:outline-none cursor-pointer py-1"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.code} &bull; Token: {ex.token})
                </option>
              ))}
              <option value="ALL">-- Tampilkan Semua Soal dari Seluruh Sesi --</option>
            </select>
          </div>
        </div>

        {/* Ringkasan Sesi */}
        {currentExam && (
          <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <span>Kode: <strong className="font-mono text-slate-800">{currentExam.code}</strong></span>
            <span>&bull;</span>
            <span>Token: <strong className="font-mono text-[#23A68A] font-bold">{currentExam.token}</strong></span>
            <span>&bull;</span>
            <span>Total Soal: <strong className="text-slate-800">{questions.length} Butir</strong></span>
          </div>
        )}
      </div>

      {/* Daftar Kartu Soal */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
          Memuat daftar butir soal...
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Soal di Sesi Ujian Ini</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Silakan buat soal baru melalui menu Bank Soal atau gunakan fitur upload Excel untuk menambahkan soal ke sesi ini.
          </p>
          <a
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#23A68A] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Buat Soal Sekarang
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-[#23A68A]/50 transition-all space-y-4"
            >
              {/* Baris Atas: Nomor Soal, Tipe Soal & Tombol Aksi */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#23A68A] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {q.type === 'SINGLE_CHOICE' && '1. Pilihan Ganda (4 Opsi)'}
                    {q.type === 'COMPLEX_MULTIPLE_CHOICE' && '2. Pilihan Ganda Kompleks (Centang)'}
                    {q.type === 'TRUE_FALSE' && '3. Benar / Salah (Matriks)'}
                  </span>
                  {q.exam && (
                    <span className="text-[11px] text-slate-400">
                      Sesi: <strong>{q.exam.title}</strong>
                    </span>
                  )}
                </div>

                {/* Tombol Edit & Hapus */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-[#23A68A] hover:text-white text-slate-700 text-xs font-semibold rounded-xl transition"
                    title="Edit Soal Ini"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Soal
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id, idx + 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition"
                    title="Hapus Soal Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>

              {/* 1. Tampilan Stimulus (Jika Ada) */}
              {q.stimulusText && (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[10px] font-bold text-[#23A68A] uppercase tracking-wider block mb-1.5">
                    Stimulus / Wacana Bacaan:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {q.stimulusText}
                  </p>
                </div>
              )}

              {/* 2. Tampilan Gambar (Jika Ada) */}
              {q.questionImage && (
                <div className="max-w-xs border border-slate-200 rounded-2xl overflow-hidden bg-white p-2">
                  <img src={q.questionImage} alt="Gambar Soal" className="max-h-40 object-contain rounded-xl" />
                </div>
              )}

              {/* 3. Teks Pertanyaan Inti */}
              <div>
                <p className="text-slate-800 text-sm font-semibold leading-relaxed">
                  {q.questionText}
                </p>
              </div>

              {/* 4. Tampilan Opsi & Kunci Jawaban */}
              <div className="pt-2">
                {q.type === 'SINGLE_CHOICE' && Array.isArray(q.options) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt: any) => {
                      const isCorrect = q.correctAnswer === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                            isCorrect
                              ? 'border-[#23A68A] bg-emerald-50 text-slate-900 font-semibold'
                              : 'border-slate-100 bg-slate-50/50 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                              isCorrect ? 'bg-[#23A68A] text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && <Check className="w-4 h-4 text-[#23A68A] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'COMPLEX_MULTIPLE_CHOICE' && Array.isArray(q.options) && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Kunci Jawaban Benar (Bertanda Centang Hijau):
                    </span>
                    {q.options.map((opt: any) => {
                      const isCorrect = Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                            isCorrect
                              ? 'border-[#23A68A] bg-emerald-50 text-slate-900 font-semibold'
                              : 'border-slate-100 bg-slate-50/50 text-slate-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                              isCorrect
                                ? 'bg-[#23A68A] border-[#23A68A] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="flex-1">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'TRUE_FALSE' && Array.isArray(q.options) && (
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-400 font-semibold text-[10px] uppercase">
                        <tr>
                          <th className="px-3 py-2">Pernyataan</th>
                          <th className="px-3 py-2 w-28 text-center">Kunci Validasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {q.options.map((stmt: any, sIdx: number) => {
                          const isTrue = q.correctAnswer && q.correctAnswer[stmt.id] === true;
                          return (
                            <tr key={stmt.id}>
                              <td className="px-3 py-2 text-slate-700">
                                <span className="font-bold text-slate-400 mr-2">{sIdx + 1}.</span>
                                {stmt.text}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isTrue
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {isTrue ? '✓ Benar' : '✕ Salah'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT BUTIR SOAL */}
      {/* ========================================================================= */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#23A68A]" />
                Edit Butir Soal #{editingQuestion.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Sesi Ujian */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pindahkan ke Sesi Ujian</label>
                <select
                  value={editingQuestion.examId}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, examId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stimulus Teks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stimulus / Wacana Teks</label>
                <textarea
                  rows={3}
                  value={editingQuestion.stimulusText || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, stimulusText: e.target.value })}
                  placeholder="Stimulus bacaan..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              {/* Gambar Soal */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gambar Pendukung</label>
                {editingQuestion.questionImage ? (
                  <div className="relative inline-block border border-slate-200 rounded-xl p-1 bg-white mb-2">
                    <img src={editingQuestion.questionImage} alt="Preview" className="max-h-36 object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, questionImage: null })}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className="text-xs text-slate-500"
                  />
                )}
              </div>

              {/* Kalimat Pertanyaan Inti */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kalimat Pertanyaan Inti</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>

              {/* Edit Opsi & Kunci Berdasarkan Tipe Soal */}
              {editingQuestion.type === 'SINGLE_CHOICE' && Array.isArray(editingQuestion.options) && (
                <div className="space-y-2 pt-2">
                  <label className="block font-semibold text-slate-700">4 Opsi Jawaban & Kunci Benar (Klik Lingkaran)</label>
                  {editingQuestion.options.map((opt: any, oIdx: number) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: opt.id })}
                        className={`w-7 h-7 rounded-full font-bold text-xs shrink-0 flex items-center justify-center transition ${
                          editingQuestion.correctAnswer === opt.id
                            ? 'bg-[#23A68A] text-white shadow'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.id}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...editingQuestion.options];
                          newOpts[oIdx].text = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {editingQuestion.type === 'COMPLEX_MULTIPLE_CHOICE' && Array.isArray(editingQuestion.options) && (
                <div className="space-y-2 pt-2">
                  <label className="block font-semibold text-slate-700">3 Opsi Jawaban (Centang 2 yang Benar)</label>
                  {editingQuestion.options.map((opt: any, oIdx: number) => {
                    const isChecked = Array.isArray(editingQuestion.correctAnswer) && editingQuestion.correctAnswer.includes(opt.id);
                    return (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const curKeys: string[] = Array.isArray(editingQuestion.correctAnswer) ? [...editingQuestion.correctAnswer] : [];
                            const updated = isChecked ? curKeys.filter((x) => x !== opt.id) : [...curKeys, opt.id];
                            setEditingQuestion({ ...editingQuestion, correctAnswer: updated });
                          }}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-[#23A68A] border-[#23A68A] text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...editingQuestion.options];
                            newOpts[oIdx].text = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {editingQuestion.type === 'TRUE_FALSE' && Array.isArray(editingQuestion.options) && (
                <div className="space-y-2 pt-2">
                  <label className="block font-semibold text-slate-700">3 Pernyataan & Kunci Validitas</label>
                  {editingQuestion.options.map((stmt: any, sIdx: number) => {
                    const isTrue = editingQuestion.correctAnswer && editingQuestion.correctAnswer[stmt.id] === true;
                    return (
                      <div key={stmt.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <input
                          type="text"
                          required
                          value={stmt.text}
                          onChange={(e) => {
                            const newOpts = [...editingQuestion.options];
                            newOpts[sIdx].text = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingQuestion({
                                ...editingQuestion,
                                correctAnswer: { ...editingQuestion.correctAnswer, [stmt.id]: true },
                              })
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
                              isTrue ? 'bg-[#23A68A] text-white border-[#23A68A]' : 'bg-white text-slate-600'
                            }`}
                          >
                            Benar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingQuestion({
                                ...editingQuestion,
                                correctAnswer: { ...editingQuestion.correctAnswer, [stmt.id]: false },
                              })
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
                              !isTrue ? 'bg-[#EA5455] text-white border-[#EA5455]' : 'bg-white text-slate-600'
                            }`}
                          >
                            Salah
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tombol Aksi Modal */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 bg-[#23A68A] hover:bg-[#1a8a72] text-white font-semibold rounded-full transition shadow-md disabled:opacity-50"
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
