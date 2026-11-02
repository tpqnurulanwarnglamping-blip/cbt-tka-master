'use client';

import React from 'react';

interface QuestionNavProps {
  totalQuestions: number;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  answers: Record<string, any>;
  flagged: Record<string, boolean>;
  questionIds: string[];
}

export default function QuestionNav({
  totalQuestions,
  currentIndex,
  onSelectIndex,
  answers,
  flagged,
  questionIds,
}: QuestionNavProps) {
  // Cek apakah suatu pertanyaan sudah terisi
  const checkAnswered = (qId: string) => {
    const ans = answers[qId];
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    return ans !== '';
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h3 className="font-bold text-slate-800 text-sm mb-4">Navigasi Nomor Soal</h3>

        <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const qId = questionIds[idx] || `q-${idx}`;
            const isCurrent = currentIndex === idx;
            const isFlagged = !!flagged[qId];
            const isAnswered = checkAnswered(qId);

            let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
            if (isFlagged) {
              bgClass = 'bg-amber-400 text-white shadow-sm';
            } else if (isAnswered) {
              bgClass = 'bg-[#23A68A] text-white shadow-sm';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${bgClass} ${
                  isCurrent ? 'ring-2 ring-offset-2 ring-slate-900 scale-105 z-10' : ''
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Keterangan Warna */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#23A68A]" />
            <span>Sudah Dijawab</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
            <span>Ragu-ragu</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-200" />
            <span>Belum Dijawab</span>
          </div>
        </div>
      </div>
    </div>
  );
}
