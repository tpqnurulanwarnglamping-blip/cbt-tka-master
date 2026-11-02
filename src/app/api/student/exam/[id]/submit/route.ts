import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateExamFinalScore } from '@/lib/scoring';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ message: 'Akses tidak sah.' }, { status: 401 });
    }

    const examId = params.id;
    const { answers, isAutoSubmit } = await request.json();

    // Dapatkan sesi ujian siswa
    const session = await prisma.examSession.findUnique({
      where: {
        examId_userId: {
          examId,
          userId: user.userId,
        },
      },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ message: 'Sesi ujian tidak ditemukan.' }, { status: 404 });
    }

    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json({ message: 'Ujian ini sudah dikumpulkan sebelumnya.' }, { status: 400 });
    }

    const now = new Date();
    // Toleransi waktu lag jaringan 15 detik
    const isLate = now.getTime() > new Date(session.expiresAt).getTime() + 15000;
    const finalStatus = isAutoSubmit || isLate ? 'TIMED_OUT' : 'SUBMITTED';

    // Ambil seluruh kunci jawaban dari server untuk dihitung
    const questionKeys = session.exam.questions.map((q) => ({
      id: q.id,
      type: q.type,
      correctAnswer: q.correctAnswer,
    }));

    // Hitung skor akhir menggunakan scoring engine
    const grading = calculateExamFinalScore(questionKeys, answers || {});

    // Simpan semua jawaban murid dan perbarui status sesi dalam transaksi Prisma
    await prisma.$transaction(async (tx) => {
      // Simpan rincian jawaban
      if (answers && typeof answers === 'object') {
        for (const [qId, ansVal] of Object.entries(answers)) {
          await tx.answer.upsert({
            where: {
              examSessionId_questionId: {
                examSessionId: session.id,
                questionId: qId,
              },
            },
            create: {
              examSessionId: session.id,
              questionId: qId,
              selectedAnswer: ansVal as any,
            },
            update: {
              selectedAnswer: ansVal as any,
            },
          });
        }
      }

      // Perbarui sesi dengan skor akhir
      await tx.examSession.update({
        where: { id: session.id },
        data: {
          status: finalStatus,
          submittedAt: now,
          score: grading.finalScore,
          totalCorrect: grading.totalCorrect,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Ujian berhasil dikumpulkan.',
      finalScore: grading.finalScore,
      totalCorrect: grading.totalCorrect,
      totalQuestions: grading.totalQuestions,
      status: finalStatus,
    });
  } catch (error: any) {
    console.error('Submit exam error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan sistem saat mengumpulkan ujian.' },
      { status: 500 }
    );
  }
}
