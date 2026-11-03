import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 1. GET: Ambil daftar soal
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const questions = await prisma.question.findMany({
      orderBy: { orderNumber: 'asc' },
      include: {
        exam: { select: { title: true, code: true } },
      },
    });

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ message: 'Gagal mengambil bank soal.' }, { status: 500 });
  }
}

// 2. POST: Buat butir soal baru (Single atau Massal dari Excel)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json();

    // Mode Import Massal
    if (body.bulk && Array.isArray(body.items)) {
      const activeExam = await prisma.exam.findFirst({ where: { isActive: true } });
      if (!activeExam) {
        return NextResponse.json({ message: 'Tidak ada sesi ujian aktif untuk ditautkan.' }, { status: 400 });
      }

      let count = await prisma.question.count({ where: { examId: activeExam.id } });
      const createdQuestions = [];

      for (const item of body.items) {
        count++;
        const q = await prisma.question.create({
          data: {
            examId: activeExam.id,
            orderNumber: count,
            type: item.type || 'SINGLE_CHOICE',
            stimulusText: item.stimulusText || null,
            questionText: item.questionText,
            questionImage: item.questionImage || null,
            options: item.options,
            correctAnswer: item.correctAnswer,
          },
        });
        createdQuestions.push(q);
      }

      return NextResponse.json({
        success: true,
        message: `${createdQuestions.length} butir soal berhasil diimpor dari Excel!`,
        total: createdQuestions.length,
      });
    }

    // Mode Single Question
    const { examId, type, stimulusText, questionText, questionImage, options, correctAnswer } = body;

    if (!questionText || !options || correctAnswer === undefined) {
      return NextResponse.json({ message: 'Pertanyaan, pilihan, dan kunci jawaban wajib diisi.' }, { status: 400 });
    }

    // Cari ujian target
    let targetExamId = examId;
    if (!targetExamId) {
      const firstExam = await prisma.exam.findFirst();
      if (!firstExam) return NextResponse.json({ message: 'Belum ada sesi ujian.' }, { status: 400 });
      targetExamId = firstExam.id;
    }

    const orderNumber = (await prisma.question.count({ where: { examId: targetExamId } })) + 1;

    const newQuestion = await prisma.question.create({
      data: {
        examId: targetExamId,
        orderNumber,
        type: type || 'SINGLE_CHOICE',
        stimulusText: stimulusText && stimulusText.trim() ? stimulusText.trim() : null,
        questionText: questionText.trim(),
        questionImage: questionImage || null,
        options,
        correctAnswer,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Butir soal berhasil disimpan ke Bank Soal!',
      question: newQuestion,
    });
  } catch (error) {
    console.error('Error saving question:', error);
    return NextResponse.json({ message: 'Gagal menyimpan butir soal.' }, { status: 500 });
  }
}
