'use client';

import React, { useState } from 'react';
import { HelpCircle, Plus, Check, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { QuestionType } from '@/types/exam';

export default function QuestionBankPage() {
  const [questionType, setQuestionType] = useState<QuestionType>('SINGLE_CHOICE');
  const [questionText, setQuestionText] = useState('');
  
  // State Opsi Tipe 1: Pilihan Ganda (4 Opsi A-D, 1 Benar)
  const [singleOptions, setSingleOptions] = useState([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ]);
  const [singleCorrect, setSingleCorrect] = useState('A');

  // State Opsi Tipe 2: Pilihan Ganda Kompleks (3 Opsi Centang, 2 Benar 1 Salah)
  const [complexOptions, setComplexOptions] = useState([
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' },
    { id: 'opt_3', text: '' },
  ]);
  const [complexCorrect, setComplexCorrect] = useState<string[]>(['opt_1', 'opt_2']);

  // State Opsi Tipe 3: Benar / Salah (3 Pernyataan, Kunci Benar/Salah)
  const [trueFalseStatements, setTrueFalseStatements] = useState([
    { id: 's1', text: '' },
    { id: 's2', text: '' },
    { id: 's3', text: '' },
  ]);
  const [trueFalseCorrect, setTrueFalseCorrect] = useState<Record<string, boolean>>({
    s1: true,
    s2: false,
    s3: true,
  });

  const [saving, setSaving] = useState(false);

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let payloadOptions: any;
    let payloadCorrect: any;

    if (questionType === 'SINGLE_CHOICE') {
      payloadOptions = singleOptions;
      payloadCorrect = singleCorrect;
    } else if (questionType === 'COMPLEX_MULTIPLE_CHOICE') {
      payloadOptions = complexOptions;
      payloadCorrect = complexCorrect;
    } else {
      payloadOptions = trueFalseStatements;
      payloadCorrect = trueFalseCorrect;
    }

    console.log('Menyimpan Soal:', {
      type: questionType,
      text: questionText,
      options: payloadOptions,
      correctAnswer: payloadCorrect,
    });

    setTimeout(() => {
      alert('Soal berhasil disimpan ke Bank Soal TKA!');
      setSaving(false);
      setQuestionText('');
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Bank Soal TKA</h1>
        <p className="text-xs text-slate-500 mt-1">
          Buat dan kelola butir soal simulasi dengan 3 format baku: Pilihan Ganda (4 Opsi), Pilihan Ganda Kompleks (Centang), atau Matriks Benar/Salah.
        </p>
      </div>

      <form onSubmit={handleSaveQuestion} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Pemilihan Tipe Soal */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Format / Jenis Soal
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setQuestionType('SINGLE_CHOICE')}
              className={`p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex flex-col justify-between ${
                questionType === 'SINGLE_CHOICE'
                  ? 'border-[#23A68A] bg-emerald-50 text-slate-900 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className="font-bold">1. Pilihan Ganda</span>
              <span className="text-[11px] text-slate-400 font-normal mt-1">4 Pilihan (A-D), 1 Benar</span>
            </button>

            <button
              type="button"
              onClick={() => setQuestionType('COMPLEX_MULTIPLE_CHOICE')}
              className={`p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex flex-col justify-between ${
                questionType === 'COMPLEX_MULTIPLE_CHOICE'
                  ? 'border-[#23A68A] bg-emerald-50 text-slate-900 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className="font-bold">2. Pilihan Ganda Kompleks</span>
              <span className="text-[11px] text-slate-400 font-normal mt-1">3 Opsi Centang (2 Benar 1 Salah)</span>
            </button>

            <button
              type="button"
              onClick={() => setQuestionType('TRUE_FALSE')}
              className={`p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex flex-col justify-between ${
                questionType === 'TRUE_FALSE'
                  ? 'border-[#23A68A] bg-emerald-50 text-slate-900 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className="font-bold">3. Benar / Salah</span>
              <span className="text-[11px] text-slate-400 font-normal mt-1">3 Pernyataan Matriks</span>
            </button>
          </div>
        </div>

        {/* Teks Pertanyaan Soal */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Isi Narasi / Pertanyaan Soal
          </label>
          <textarea
            required
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Tuliskan stimulus teks, soal penalaran matematika, atau narasi literasi..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#23A68A] focus:ring-2 focus:ring-[#23A68A]/20 transition"
          />
        </div>

        {/* Render Formulir Sesuai Tipe Soal */}
        {questionType === 'SINGLE_CHOICE' && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              4 Pilihan Jawaban & Tentukan 1 Kunci Jawaban
            </label>
            {singleOptions.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSingleCorrect(opt.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                    singleCorrect === opt.id
                      ? 'bg-[#23A68A] text-white shadow'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="Klik untuk jadikan kunci jawaban"
                >
                  {opt.id}
                </button>
                <input
                  type="text"
                  required
                  placeholder={`Teks pilihan jawaban ${opt.id}...`}
                  value={opt.text}
                  onChange={(e) => {
                    const updated = [...singleOptions];
                    updated[idx].text = e.target.value;
                    setSingleOptions(updated);
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
              </div>
            ))}
          </div>
        )}

        {questionType === 'COMPLEX_MULTIPLE_CHOICE' && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3 Opsi Jawaban (Beri Centang Hijau Pada 2 Opsi yang Benar)
            </label>
            {complexOptions.map((opt, idx) => {
              const isChecked = complexCorrect.includes(opt.id);
              return (
                <div key={opt.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isChecked) {
                        setComplexCorrect(complexCorrect.filter((x) => x !== opt.id));
                      } else {
                        setComplexCorrect([...complexCorrect, opt.id]);
                      }
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition ${
                      isChecked
                        ? 'bg-[#23A68A] text-white border-[#23A68A]'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                  <input
                    type="text"
                    required
                    placeholder={`Teks opsi pernyataan ke-${idx + 1}...`}
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...complexOptions];
                      updated[idx].text = e.target.value;
                      setComplexOptions(updated);
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#23A68A]"
                  />
                </div>
              );
            })}
          </div>
        )}

        {questionType === 'TRUE_FALSE' && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3 Pernyataan & Kunci Kebenarannya
            </label>
            {trueFalseStatements.map((stmt, idx) => (
              <div key={stmt.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-xs text-slate-500 w-6">#{idx + 1}</span>
                <input
                  type="text"
                  required
                  placeholder={`Tuliskan pernyataan ke-${idx + 1}...`}
                  value={stmt.text}
                  onChange={(e) => {
                    const updated = [...trueFalseStatements];
                    updated[idx].text = e.target.value;
                    setTrueFalseStatements(updated);
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#23A68A]"
                />
                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTrueFalseCorrect((prev) => ({ ...prev, [stmt.id]: true }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      trueFalseCorrect[stmt.id] === true
                        ? 'bg-[#23A68A] text-white border-[#23A68A]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Benar
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrueFalseCorrect((prev) => ({ ...prev, [stmt.id]: false }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      trueFalseCorrect[stmt.id] === false
                        ? 'bg-[#EA5455] text-white border-[#EA5455]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Salah
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tombol Simpan */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#23A68A] hover:bg-[#1a8a72] text-white text-xs font-bold rounded-full transition shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'SIMPAN BUTIR SOAL'}
          </button>
        </div>

      </form>
    </div>
  );
}
