import { QuestionType } from '@/types/exam';

export interface QuestionGradingInput {
  type: QuestionType;
  studentAnswer: any;
  correctAnswer: any;
}

/**
 * Menghitung perolehan skor per butir soal (rentang 0.0 - 1.0)
 */
export function calculateQuestionScore(
  type: QuestionType,
  studentAnswer: any,
  correctAnswer: any
): number {
  if (studentAnswer === undefined || studentAnswer === null) {
    return 0;
  }

  // 1. Tipe: Pilihan Ganda (Single Choice)
  if (type === 'SINGLE_CHOICE') {
    return studentAnswer === correctAnswer ? 1.0 : 0;
  }

  // 2. Tipe: Pilihan Ganda Kompleks (Centang 2 dari 3 opsi)
  if (type === 'COMPLEX_MULTIPLE_CHOICE') {
    if (!Array.isArray(studentAnswer) || !Array.isArray(correctAnswer)) return 0;
    if (studentAnswer.length === 0) return 0;

    // Periksa apakah siswa mencentang opsi yang salah
    const hasIncorrectSelected = studentAnswer.some((id: string) => !correctAnswer.includes(id));
    if (hasIncorrectSelected) {
      return 0; // Memilih opsi salah menggugurkan poin
    }

    // Hitung berapa opsi benar yang dicentang
    const correctCount = studentAnswer.filter((id: string) => correctAnswer.includes(id)).length;
    if (correctCount === 2) return 1.0;
    if (correctCount === 1) return 0.5; // Penskoran proporsional
    return 0;
  }

  // 3. Tipe: Benar / Salah (3 Pernyataan Matriks)
  if (type === 'TRUE_FALSE') {
    if (typeof studentAnswer !== 'object' || typeof correctAnswer !== 'object') return 0;

    const statementKeys = Object.keys(correctAnswer);
    if (statementKeys.length === 0) return 0;

    let matchCount = 0;
    for (const key of statementKeys) {
      if (studentAnswer[key] === correctAnswer[key]) {
        matchCount++;
      }
    }

    // Proporsional (3 benar = 1.0, 2 benar = 0.67, 1 benar = 0.33)
    return Number((matchCount / statementKeys.length).toFixed(2));
  }

  return 0;
}

/**
 * Menghitung total skor ujian dalam skala 0 - 100
 */
export function calculateExamFinalScore(
  questions: { id: string; type: QuestionType; correctAnswer: any }[],
  studentAnswers: Record<string, any>
): {
  finalScore: number;
  totalCorrect: number;
  totalQuestions: number;
} {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) return { finalScore: 0, totalCorrect: 0, totalQuestions: 0 };

  let totalRawScore = 0;
  let fullCorrectCount = 0;

  for (const q of questions) {
    const sAns = studentAnswers[q.id];
    const score = calculateQuestionScore(q.type, sAns, q.correctAnswer);
    totalRawScore += score;
    if (score === 1.0) fullCorrectCount++;
  }

  const finalScore = Number(((totalRawScore / totalQuestions) * 100).toFixed(2));

  return {
    finalScore,
    totalCorrect: fullCorrectCount,
    totalQuestions,
  };
}
