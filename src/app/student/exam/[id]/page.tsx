'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import QuestionRenderer from '@/components/exam/QuestionRenderer';
import QuestionNav from '@/components/exam/QuestionNav';
import { ClientQuestionPayload } from '@/types/exam';

interface ExamInteractivePageProps {
  params: { id: string };
}

export default function ExamInteractivePage({ params }: ExamInteractivePageProps) {
  const router = useRouter();
  const examId = params.id;

  const [examTitle, setExamTitle] = useState('Simulasi Ujian TKA');
  const [questions, setQuestions] = useState<ClientQuestionPayload[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Jawaban & Ragu-ragu
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  // Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(3600);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);

  // 1. Inisialisasi Data Ujian (Dari sessionStorage atau API)
  useEffect(() => {
    const cachedData = sessionStorage.getItem(`exam_${examId}`);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setExamTitle(parsed.exam?.title || 'Simulasi Ujian TKA');
        setQuestions(parsed.questions || []);
        setTimeLeftSeconds(parsed.remainingSeconds || 3600);
      } catch (e) {
        console.error('Error parsing exam cache', e);
      }
    }

    // Ambil jawaban yang tersimpan di LocalStorage jika ada (Crash Recovery)
    const savedAnswers = localStorage.getItem(`cbt_answers_${examId}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {}
    }

    const savedFlagged = localStorage.getItem(`cbt_flagged_${examId}`);
    if (savedFlagged) {
      try {
        setFlagged(JSON.parse(savedFlagged));
      } catch (e) {}
    }
  }, [examId]);

  // 2. Simpan jawaban ke LocalStorage setiap kali ada perubahan
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`cbt_answers_${examId}`, JSON.stringify(answers));
    }
  }, [answers, examId]);

  useEffect(() => {
    localStorage.setItem(`cbt_flagged_${examId}`, JSON.stringify(flagged));
  }, [flagged, examId]);

  // 3. Eksekusi Pengumpulan Ujian (Manual atau Auto-Submit)
  const handleSubmitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting) return;
      setSubmitting(true);

      try {
        const res = await fetch(`/api/student/exam/${examId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, isAutoSubmit }),
        });

        const data = await res.json();
        if (res.ok) {
          // Bersihkan local storage sesi ini
          localStorage.removeItem(`cbt_answers_${examId}`);
          localStorage.removeItem(`cbt_flagged_${examId}`);
          sessionStorage.removeItem(`exam_${examId}`);

          alert(
            isAutoSubmit
              ? 'Waktu habis! Jawaban Anda telah otomatis dikumpulkan ke server.'
              : `Ujian berhasil diselesaikan! Skor Anda: ${data.finalScore}`
          );
          router.push('/student');
        } else {
          alert(data.message || 'Gagal mengumpulkan ujian.');
          setSubmitting(false);
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan jaringan saat mengumpulkan ujian.');
        setSubmitting(false);
      }
    },
    [answers, examId, router, submitting]
  );

  // 4. Countdown Timer Engine
  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      handleSubmitExam(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeftSeconds, handleSubmitExam]);

  // 5. Anti-Cheat Protections (Disable Right-Click, Copy, Cut, Paste & Tab Switch)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyPaste = (e: ClipboardEvent) => e.preventDefault();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          alert(
            `PERINGATAN KECURANGAN (${next}): Anda terdeteksi meninggalkan halaman ujian! Aktivitas ini dicatat di server.`
          );
          return next;
        });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopyPaste);
    window.addEventListener('paste', handleCopyPaste);
    window.addEventListener('cut', handleCopyPaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Format Jam:Menit:Detik
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const currentQ = questions[currentIndex];

  const handleAnswerChange = (val: any) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Hitung jumlah soal terjawab
  const totalAnswered = useMemo(() => {
    return Object.values(answers).filter((val) => {
      if (val === undefined || val === null) return false;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'object') return Object.keys(val).length > 0;
      return val !== '';
    }).length;
  }, [answers]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none">
      
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="font-bold text-slate-800 text-sm md:text-base">{examTitle}</h1>
          <span className="text-xs text-slate-400">Computer Based Test &bull; TKA Master</span>
        </div>

        {/* Timer Sisa Waktu */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm shadow-sm transition-all ${
            timeLeftSeconds < 300
              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
              : 'bg-emerald-50 text-[#23A68A] border border-emerald-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeLeftSeconds)}</span>
        </div>
      </header>

      {/* Main Grid: Kolom Soal (Kiri) & Kolom Navigasi (Kanan) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Soal (8 Kolom) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          {currentQ ? (
            <div>
              {/* Header Soal & Ragu-ragu */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#23A68A] bg-emerald-50 px-3 py-1 rounded-full">
                    Soal Nomor {currentIndex + 1} dari {questions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentQ.type === 'SINGLE_CHOICE' && 'Pilihan Ganda'}
                    {currentQ.type === 'COMPLEX_MULTIPLE_CHOICE' && 'Pilihan Ganda Kompleks'}
                    {currentQ.type === 'TRUE_FALSE' && 'Benar / Salah'}
                  </span>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-amber-600 bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-100 transition">
                  <input
                    type="checkbox"
                    checked={!!flagged[currentQ.id]}
                    onChange={() => toggleFlag(currentQ.id)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  Ragu-ragu
                </label>
              </div>

              {/* 1. STIMULUS / WACANA TEKS (JIKA ADA) */}
              {currentQ.stimulusText && (
                <div className="mb-6 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="text-[11px] font-bold text-[#23A68A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#23A68A]" />
                    Stimulus / Wacana Bacaan TKA
                  </div>
                  <div className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                    {currentQ.stimulusText}
                  </div>
                </div>
              )}

              {/* 2. GAMBAR PENDUKUNG (JIKA ADA) */}
              {currentQ.questionImage && (
                <div className="mb-6 max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-white p-2">
                  <img
                    src={currentQ.questionImage}
                    alt="Gambar Soal"
                    className="w-full h-auto object-contain rounded-xl"
                  />
                </div>
              )}

              {/* 3. PERTANYAAN INTI */}
              <div className="mb-6">
                <p className="text-slate-800 text-sm md:text-base leading-relaxed font-semibold whitespace-pre-line">
                  {currentQ.questionText}
                </p>
              </div>

              {/* Komponen Pilihan / Opsi Berdasarkan 3 Tipe Soal */}
              <QuestionRenderer
                question={currentQ}
                currentAnswer={answers[currentQ.id]}
                onAnswerChange={handleAnswerChange}
              />
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-sm">
              Memuat soal ujian...
            </div>
          )}

          {/* Tombol Navigasi Bawah */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#23A68A] hover:bg-[#1a8a72] rounded-full flex items-center gap-1.5 transition disabled:opacity-40"
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Navigasi Nomor Soal & Tombol Selesai (4 Kolom) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <QuestionNav
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            answers={answers}
            flagged={flagged}
            questionIds={questionIds}
          />

          {/* Tombol Kumpulkan Ujian Mandiri */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
              <span>Progres Terjawab:</span>
              <span className="font-bold text-slate-800">
                {totalAnswered} / {questions.length} Soal
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> SELESAIKAN UJIAN
            </button>
          </div>
        </div>

      </main>

      {/* Modal Konfirmasi Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Pengumpulan Ujian</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Anda telah menjawab <strong>{totalAnswered}</strong> dari total <strong>{questions.length}</strong> soal. Apakah Anda yakin ingin mengakhiri sesi ujian sekarang?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full text-xs transition"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmitExam(false);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-xs transition shadow-md disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Ya, Selesaikan!'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
