'use client';

import React from 'react';
import { Check, CheckCircle2, XCircle } from 'lucide-react';
import { QuestionType } from '@/types/exam';

interface QuestionProps {
  question: {
    id: string;
    orderNumber: number;
    type: QuestionType;
    questionText: string;
    questionImage?: string | null;
    options: any;
  };
  currentAnswer: any;
  onAnswerChange: (val: any) => void;
}

export default function QuestionRenderer({
  question,
  currentAnswer,
  onAnswerChange,
}: QuestionProps) {
  
  // =========================================================================
  // 1. TIPE: PILIHAN GANDA BIASA (4 Opsi: A, B, C, D - 1 Jawaban Benar)
  // =========================================================================
  if (question.type === 'SINGLE_CHOICE') {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500 font-medium mb-3">
          Petunjuk: Pilihlah tepat satu jawaban yang paling benar.
        </p>

        {Array.isArray(question.options) &&
          question.options.map((opt: { id: string; text: string }) => {
            const isSelected = currentAnswer === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAnswerChange(opt.id)}
                className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-[#23A68A] bg-emerald-50/70 text-slate-900 font-semibold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isSelected ? 'bg-[#23A68A] text-white shadow' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.id}
                </span>
                <span className="flex-1 leading-relaxed">{opt.text}</span>
              </button>
            );
          })}
      </div>
    );
  }

  // =========================================================================
  // 2. TIPE: PILIHAN GANDA KOMPLEKS (3 Opsi Centang, Non-ABC, 2 Benar 1 Salah)
  // =========================================================================
  if (question.type === 'COMPLEX_MULTIPLE_CHOICE') {
    const selectedList: string[] = Array.isArray(currentAnswer) ? currentAnswer : [];

    const toggleCheckbox = (optId: string) => {
      let updated: string[];
      if (selectedList.includes(optId)) {
        updated = selectedList.filter((id) => id !== optId);
      } else {
        updated = [...selectedList, optId];
      }
      onAnswerChange(updated);
    };

    return (
      <div className="space-y-3">
        <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-2xl text-xs text-[#23A68A] font-medium flex items-center gap-2 mb-3">
          <Check className="w-4 h-4 text-[#23A68A] shrink-0" />
          <span>Petunjuk: Beri centang pada 2 pilihan pernyataan yang Anda anggap BENAR.</span>
        </div>

        {Array.isArray(question.options) &&
          question.options.map((opt: { id: string; text: string }) => {
            const isChecked = selectedList.includes(opt.id);
            return (
              <div
                key={opt.id}
                onClick={() => toggleCheckbox(opt.id)}
                className={`cursor-pointer p-4 rounded-2xl border text-sm transition-all flex items-start gap-3.5 select-none ${
                  isChecked
                    ? 'border-[#23A68A] bg-emerald-50/70 text-slate-900 font-semibold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Kotak Centang Bersudut Halus (Tanpa Label Huruf ABC) */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-[#23A68A] border-[#23A68A] text-white shadow'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="flex-1 leading-relaxed">{opt.text}</span>
              </div>
            );
          })}
      </div>
    );
  }

  // =========================================================================
  // 3. TIPE: BENAR / SALAH (3 Pernyataan Matriks dengan Centang Mandiri)
  // =========================================================================
  if (question.type === 'TRUE_FALSE') {
    const stateMap: Record<string, boolean | null> =
      currentAnswer && typeof currentAnswer === 'object' ? currentAnswer : {};

    const handleSelect = (statementId: string, val: boolean) => {
      onAnswerChange({
        ...stateMap,
        [statementId]: val,
      });
    };

    return (
      <div className="space-y-4">
        <p className="text-xs text-slate-500 font-medium mb-2">
          Petunjuk: Tentukan status <strong>Benar</strong> atau <strong>Salah</strong> untuk setiap pernyataan di bawah ini dengan menekan tombol centang.
        </p>

        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header Tabel Matriks */}
          <div className="bg-slate-100/90 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200">
            <span className="flex-1">Pernyataan TKA</span>
            <div className="flex items-center gap-4 pr-1">
              <span className="w-16 text-center text-emerald-700">Benar</span>
              <span className="w-16 text-center text-red-600">Salah</span>
            </div>
          </div>

          {/* Baris 3 Pernyataan */}
          <div className="divide-y divide-slate-100 bg-white">
            {Array.isArray(question.options) &&
              question.options.map((stmt: { id: string; text: string }, idx: number) => {
                const currentVal = stateMap[stmt.id];

                return (
                  <div
                    key={stmt.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex-1 text-sm text-slate-800 pr-4 leading-relaxed">
                      <span className="font-semibold text-slate-400 mr-2">{idx + 1}.</span>
                      {stmt.text}
                    </div>

                    {/* Tombol Opsi Centang Benar & Salah */}
                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      {/* Tombol Centang BENAR */}
                      <button
                        type="button"
                        onClick={() => handleSelect(stmt.id, true)}
                        className={`w-18 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          currentVal === true
                            ? 'bg-[#23A68A] text-white border-[#23A68A] shadow'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Benar
                      </button>

                      {/* Tombol Centang SALAH */}
                      <button
                        type="button"
                        onClick={() => handleSelect(stmt.id, false)}
                        className={`w-18 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          currentVal === false
                            ? 'bg-[#EA5455] text-white border-[#EA5455] shadow'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Salah
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
