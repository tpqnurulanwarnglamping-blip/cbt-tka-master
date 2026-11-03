import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ message: 'Akses tidak sah.' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ message: 'Token ujian wajib diisi.' }, { status: 400 });
    }

    // Cari ujian berdasarkan token
    const exam = await prisma.exam.findUnique({
      where: { token: token.trim().toUpperCase() },
      include: {
        questions: {
          orderBy: { orderNumber: 'asc' },
          select: {
            id: true,
            orderNumber: true,
            type: true,
            stimulusText: true,
            questionText: true,
            questionImage: true,
            options: true,
            // PENTING: correctAnswer TIDAK disertakan demi keamanan!
          },
        },
      },
    });

    if (!exam || !exam.isActive) {
      return NextResponse.json(
        { message: 'Token ujian tidak valid atau ujian sudah tidak aktif.' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now < exam.startTime) {
      return NextResponse.json(
        { message: 'Ujian belum dimulai sesuai jadwal.' },
        { status: 400 }
      );
    }

    if (now > exam.endTime) {
      return NextResponse.json(
        { message: 'Jadwal pelaksanaan ujian telah berakhir.' },
        { status: 400 }
      );
    }

    // Cek atau buat sesi ujian siswa
    let session = await prisma.examSession.findUnique({
      where: {
        examId_userId: {
          examId: exam.id,
          userId: user.userId,
        },
      },
    });

    if (session && session.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { message: 'Anda sudah menyelesaikan sesi ujian ini.' },
        { status: 400 }
      );
    }

    if (!session) {
      const expiresAt = new Date(now.getTime() + exam.durationMinutes * 60 * 1000);
      session = await prisma.examSession.create({
        data: {
          examId: exam.id,
          userId: user.userId,
          startedAt: now,
          expiresAt: expiresAt,
          status: 'IN_PROGRESS',
        },
      });
    }

    // Hitung sisa waktu dalam detik berdasarkan server expiresAt
    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
    );

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.questions.length,
      },
      sessionId: session.id,
      expiresAt: session.expiresAt,
      remainingSeconds,
      questions: exam.questions,
    });
  } catch (error: any) {
    console.error('Start exam error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memulai ujian.' },
      { status: 500 }
    );
  }
}
