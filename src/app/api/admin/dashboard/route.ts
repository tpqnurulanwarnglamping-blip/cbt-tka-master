import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    // 1. Hitung jumlah ujian aktif riil di database
    const activeExamsCount = await prisma.exam.count({
      where: { isActive: true },
    });

    // 2. Hitung jumlah total siswa riil di database
    const totalStudentsCount = await prisma.user.count({
      where: { role: 'STUDENT' },
    });

    // 3. Hitung rata-rata nilai riil dari sesi ujian yang telah diselesaikan
    const sessions = await prisma.examSession.findMany({
      where: {
        status: { in: ['SUBMITTED', 'TIMED_OUT'] },
      },
      select: { score: true },
    });

    let avgScore = 0;
    if (sessions.length > 0) {
      const sum = sessions.reduce((acc, s) => acc + s.score, 0);
      avgScore = Number((sum / sessions.length).toFixed(1));
    }

    // 4. Ambil daftar ujian riil beserta jumlah soalnya
    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        questions: { select: { id: true } },
      },
    });

    const formattedExams = exams.map((ex) => ({
      id: ex.id,
      code: ex.code,
      title: ex.title,
      durationMinutes: ex.durationMinutes,
      token: ex.token,
      totalQuestions: ex.questions.length,
      isActive: ex.isActive,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        activeExams: activeExamsCount,
        totalStudents: totalStudentsCount,
        averageScore: avgScore,
      },
      exams: formattedExams,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ message: 'Gagal mengambil data dashboard.' }, { status: 500 });
  }
}
