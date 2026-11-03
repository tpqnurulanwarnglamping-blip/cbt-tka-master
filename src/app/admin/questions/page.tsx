'use client';

import React, { useState, useRef } from 'react';
import { HelpCircle, Plus, Check, FileSpreadsheet, Upload, Image as ImageIcon, X, Download } from 'lucide-react';
import { QuestionType } from '@/types/exam';
import * as XLSX from 'xlsx';

export default function QuestionBankPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [questionType, setQuestionType] = useState<QuestionType>('SINGLE_CHOICE');
  
  // 4 Bagian Struktur Soal TKA
  const [stimulusText, setStimulusText] = useState(''); // Bagian 1: Stimulus/Wacana
  const [questionImage, setQuestionImage] = useState<string | null>(null); // Bagian 2: Gambar Pendukung
  const [questionText, setQuestionText] = useState(''); // Bagian 3: Pertanyaan Inti
  
  // Bagian 4: Pilihan Jawaban Sesuai Tipe
  // Tipe 1: Pilihan Ganda (4 Opsi A-D, 1 Benar)
  const [singleOptions, setSingleOptions] = useState([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ]);
  const [singleCorrect, setSingleCorrect] = useState('A');

  // Tipe 2: Pilihan Ganda Kompleks (3 Opsi Centang, Non-ABC, 2 Benar 1 Salah)
  const [complexOptions, setComplexOptions] = useState([
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' },
    { id: 'opt_3', text: '' },
  ]);
  const [complexCorrect, setComplexCorrect] = useState<string[]>(['opt_1', 'opt_2']);

  // Tipe 3: Benar / Salah (3 Pernyataan Matriks)
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

  // 1. Handle Upload Gambar Soal (Convert to Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Simpan Soal Manual
  const handleSaveQuestion = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: questionType,
          stimulusText,
          questionImage,
          questionText,
          options: payloadOptions,
          correctAnswer: payloadCorrect,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Butir soal TKA berhasil disimpan ke Bank Soal!');
      // Reset form
      setStimulusText('');
      setQuestionImage(null);
      setQuestionText('');
      setSingleOptions([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ]);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan soal.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Download Template Excel (.xlsx)
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Tipe Soal': 'SINGLE_CHOICE',
        'Stimulus / Wacana': 'Perhatikan wacana tentang data pertumbuhan ekonomi kuartal II berikut...',
        'Pertanyaan Inti': 'Berdasarkan wacana di atas, sektor manakah yang bertumbuh paling pesat?',
        'Opsi 1': 'Sektor Pertanian',
        'Opsi 2': 'Sektor Industri Manufaktur',
        'Opsi 3': 'Sektor Transportasi',
        'Opsi 4': 'Sektor Pariwisata',
        'Kunci Jawaban': 'B',
      },
      {
        'Tipe Soal': 'COMPLEX_MULTIPLE_CHOICE',
        'Stimulus / Wacana': 'Diberikan deret geometri dengan a = 3 dan r = 2.',
        'Pertanyaan Inti': 'Tentukan 2 pernyataan yang BENAR terkait deret geometri di atas:',
        'Opsi 1': 'Suku ke-3 bernilai 12',
        'Opsi 2': 'Suku ke-4 bernilai 24',
        'Opsi 3': 'Jumlah 3 suku pertama adalah 25',
        'Opsi 4': '',
        'Kunci Jawaban': '1,2',
      },
      {
        'Tipe Soal': 'TRUE_FALSE',
        'Stimulus / Wacana': 'Analisis statistik deskriptif pada kumpulan data observasi.',
        'Pertanyaan Inti': 'Tentukan status Benar atau Salah untuk 3 pernyataan berikut:',
        'Opsi 1': 'Pernyataan 1: Rata-rata dari 4, 6, 8, 10 adalah 7',
        'Opsi 2': 'Pernyataan 2: Median selalu lebih besar dari modus',
        'Opsi 3': 'Pernyataan 3: Standar deviasi selalu bernilai positif',
        'Opsi 4': '',
        'Kunci Jawaban': 'B,S,B',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Soal_TKA');
    XLSX.writeFile(workbook, 'Template_Upload_Bank_Soal_TKA.xlsx');
  };

  // 4. Import Soal Massal dari Excel (.xlsx)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

        if (rows.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        const parsedItems = rows.map((r) => {
          const type = (r['Tipe Soal'] || 'SINGLE_CHOICE').trim();
          let options: any;
          let correctAnswer: any;

          if (type === 'SINGLE_CHOICE') {
            options = [
              { id: 'A', text: String(r['Opsi 1'] || '') },
              { id: 'B', text: String(r['Opsi 2'] || '') },
              { id: 'C', text: String(r['Opsi 3'] || '') },
              { id: 'D', text: String(r['Opsi 4'] || '') },
            ];
            correctAnswer = String(r['Kunci Jawaban'] || 'A').trim().toUpperCase();
          } else if (type === 'COMPLEX_MULTIPLE_CHOICE') {
            options = [
              { id: 'opt_1', text: String(r['Opsi 1'] || '') },
              { id: 'opt_2', text: String(r['Opsi 2'] || '') },
              { id: 'opt_3', text: String(r['Opsi 3'] || '') },
            ];
            const rawKeys = String(r['Kunci Jawaban'] || '1,2').split(',');
            correctAnswer = rawKeys.map((k) => `opt_${k.trim()}`);
          } else {
            options = [
              { id: 's1', text: String(r['Opsi 1'] || '') },
              { id: 's2', text: String(r['Opsi 2'] || '') },
              { id: 's3', text: String(r['Opsi 3'] || '') },
            ];
            const rawKeys = String(r['Kunci Jawaban'] || 'B,S,B').split(',');
            correctAnswer = {
              s1: rawKeys[0]?.trim().toUpperCase() === 'B',
              s2: rawKeys[1]?.trim().toUpperCase() === 'B',
              s3: rawKeys[2]?.trim().toUpperCase() === 'B',
            };
          }

          return {
            type,
            stimulusText: r['Stimulus / Wacana'] || null,
            questionText: r['Pertanyaan Inti'] || 'Pertanyaan',
            options,
            correctAnswer,
          };
        });

        const res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bulk: true, items: parsedItems }),
        });

        const data = await res.json();
        if (res.ok) {
          alert(`Sukses! ${parsedItems.length} butir soal dari Excel berhasil diimpor ke Bank Soal.`);
        } else {
          alert(data.message || 'Gagal mengimpor file Excel.');
        }
      } catch (err) {
        alert('Gagal memproses file Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Bank Soal TKA</h1>
          <p className="text-xs text-slate-500 mt-1">
            Format baku TKA: Stimulus Wacana $\rightarrow$ Gambar $\rightarrow$ Pertanyaan $\rightarrow$ Pilihan Jawaban.
          </p>
        </div>

        {/* Tombol Import / Download Template Excel */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition"
            title="Download Template Format Excel"
          >
            <Download className="w-3.5 h-3.5" /> Template Excel
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Excel (.xlsx)
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveQuestion} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* PILIH TIPE SOAL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Format Soal TKA
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

        {/* BAGIAN 1: STIMULUS / WACANA TEKS */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Bagian 1: Stimulus / Wacana / Narasi Teks (Opsional)</span>
            <span className="text-[10px] text-slate-400 font-normal">Wacana literasi atau pengantar masalah</span>
          </label>
          <textarea
            rows={3}
            value={stimulusText}
            onChange={(e) => setStimulusText(e.target.value)}
            placeholder="Tuliskan stimulus wacana bacaan, artikel, studi kasus, atau konteks data..."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#23A68A]"
          />
        </div>

        {/* BAGIAN 2: UPLOAD FOTO / GAMBAR PENDUKUNG */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Bagian 2: Gambar Pendukung / Grafik / Kurva (Opsional)
          </label>

          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {questionImage ? (
            <div className="relative inline-block border border-slate-200 rounded-2xl overflow-hidden bg-white p-2">
              <img src={questionImage} alt="Preview" className="max-h-48 object-contain rounded-xl" />
              <button
                type="button"
                onClick={() => setQuestionImage(null)}
                className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                title="Hapus Gambar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 hover:border-[#23A68A] text-slate-600 text-xs font-semibold rounded-xl transition"
            >
              <ImageIcon className="w-4 h-4 text-slate-400" />
              Pilih Gambar dari Komputer (PNG, JPG maks 2MB)
            </button>
          )}
        </div>

        {/* BAGIAN 3: PERTANYAAN INTI */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Bagian 3: Kalimat Pertanyaan Inti
          </label>
          <textarea
            required
            rows={2}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Tuliskan pertanyaan inti yang menguji pemahaman siswa berdasarkan stimulus di atas..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#23A68A] transition"
          />
        </div>

        {/* BAGIAN 4: PILIHAN JAWABAN */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Bagian 4: Pilihan Jawaban & Penentuan Kunci
          </label>

          {questionType === 'SINGLE_CHOICE' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 mb-2">Klik tombol lingkaran huruf untuk menandai 1 Kunci Jawaban Benar (berwarna hijau).</p>
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
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#23A68A]"
                  />
                </div>
              ))}
            </div>
          )}

          {questionType === 'COMPLEX_MULTIPLE_CHOICE' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 mb-2">Beri centang hijau pada 2 pilihan yang bernilai BENAR.</p>
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
                      placeholder={`Teks pilihan pernyataan ke-${idx + 1}...`}
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...complexOptions];
                        updated[idx].text = e.target.value;
                        setComplexOptions(updated);
                      }}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#23A68A]"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {questionType === 'TRUE_FALSE' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 mb-2">Tentukan status Benar atau Salah untuk 3 butir pernyataan.</p>
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
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#23A68A]"
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
        </div>

        {/* Tombol Simpan */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-[#23A68A] hover:bg-[#1a8a72] text-white text-xs font-bold rounded-full transition shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'SIMPAN BUTIR SOAL KE BANK SOAL'}
          </button>
        </div>

      </form>
    </div>
  );
}
