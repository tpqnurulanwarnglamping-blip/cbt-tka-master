import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 1. GET: Ambil seluruh hasil ujian siswa
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const sessions = await prisma.examSession.findMany({
      include: {
        user: {
          select: {
            name: true,
            identifier: true,
            classGrade: true,
          },
        },
        exam: {
          select: {
            title: true,
            questions: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const results = sessions.map((s) => ({
      id: s.id,
      nisn: s.user.identifier,
      name: s.user.name,
      classGrade: s.user.classGrade,
      examTitle: s.exam.title,
      score: s.score,
      totalCorrect: s.totalCorrect,
      totalQuestions: s.exam.questions.length,
      status: s.status,
      submittedAt: s.submittedAt ? s.submittedAt.toISOString().slice(0, 16).replace('T', ' ') : '-',
    }));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Gagal mengambil data laporan.' }, { status: 500 });
  }
}

// 2. PATCH: Edit Skor Siswa Manual oleh Guru
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { sessionId, newScore, reason } = await request.json();

    if (!sessionId || newScore === undefined) {
      return NextResponse.json({ message: 'Sesi ID dan Skor baru wajib diisi.' }, { status: 400 });
    }

    const updated = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        score: parseFloat(newScore),
      },
    });

    console.log(`[AUDIT] Guru ${user.name} mengubah skor sesi ${sessionId} menjadi ${newScore}. Alasan: ${reason || 'Tidak ada'}`);

    return NextResponse.json({
      success: true,
      message: 'Skor siswa berhasil diperbarui.',
      updated,
    });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json({ message: 'Gagal mengubah skor siswa.' }, { status: 500 });
  }
}
