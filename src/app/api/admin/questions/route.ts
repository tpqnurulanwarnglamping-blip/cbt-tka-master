import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 1. GET: Ambil daftar soal (Bisa difilter berdasarkan examId)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    const whereClause: any = {};
    if (examId && examId !== 'ALL') {
      whereClause.examId = examId;
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      orderBy: { orderNumber: 'asc' },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            code: true,
            token: true,
            durationMinutes: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ message: 'Gagal mengambil bank soal.' }, { status: 500 });
  }
}

// 2. POST: Buat butir soal baru (Single atau Massal dari Excel) ke Sesi Ujian yang dipilih
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json();

    // Mode Import Massal dari Excel
    if (body.bulk && Array.isArray(body.items)) {
      const targetExamId = body.examId;
      if (!targetExamId) {
        return NextResponse.json({ message: 'Silakan pilih Sesi Ujian tujuan impor.' }, { status: 400 });
      }

      let count = await prisma.question.count({ where: { examId: targetExamId } });
      const createdQuestions = [];

      for (const item of body.items) {
        count++;
        const q = await prisma.question.create({
          data: {
            examId: targetExamId,
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
        message: `${createdQuestions.length} butir soal berhasil dimasukkan ke sesi ujian terpilih!`,
        total: createdQuestions.length,
      });
    }

    // Mode Single Question
    const { examId, type, stimulusText, questionText, questionImage, options, correctAnswer } = body;

    if (!examId) {
      return NextResponse.json({ message: 'Sesi Ujian wajib dipilih.' }, { status: 400 });
    }

    if (!questionText || !options || correctAnswer === undefined) {
      return NextResponse.json({ message: 'Pertanyaan, pilihan, dan kunci jawaban wajib diisi.' }, { status: 400 });
    }

    const orderNumber = (await prisma.question.count({ where: { examId } })) + 1;

    const newQuestion = await prisma.question.create({
      data: {
        examId,
        orderNumber,
        type: type || 'SINGLE_CHOICE',
        stimulusText: stimulusText && stimulusText.trim() ? stimulusText.trim() : null,
        questionText: questionText.trim(),
        questionImage: questionImage || null,
        options,
        correctAnswer,
      },
      include: {
        exam: { select: { title: true, code: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Butir soal berhasil disimpan ke sesi ujian terpilih!',
      question: newQuestion,
    });
  } catch (error) {
    console.error('Error saving question:', error);
    return NextResponse.json({ message: 'Gagal menyimpan butir soal.' }, { status: 500 });
  }
}

// 3. PATCH: Edit butir soal yang sudah ada
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { id, examId, type, stimulusText, questionText, questionImage, options, correctAnswer, orderNumber } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID soal wajib disertakan.' }, { status: 400 });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        ...(examId && { examId }),
        ...(type && { type }),
        stimulusText: stimulusText !== undefined ? (stimulusText?.trim() || null) : undefined,
        ...(questionText && { questionText: questionText.trim() }),
        questionImage: questionImage !== undefined ? questionImage : undefined,
        ...(options && { options }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(orderNumber !== undefined && { orderNumber: parseInt(orderNumber, 10) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Soal berhasil diperbarui.',
      question: updated,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ message: 'Gagal memperbarui butir soal.' }, { status: 500 });
  }
}

// 4. DELETE: Hapus butir soal
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID soal wajib disertakan.' }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Butir soal berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ message: 'Gagal menghapus butir soal.' }, { status: 500 });
  }
}
