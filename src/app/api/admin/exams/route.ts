import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 1. GET: Ambil daftar seluruh ujian
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const exams = await prisma.exam.findMany({
      include: {
        questions: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = exams.map((ex) => ({
      id: ex.id,
      code: ex.code,
      title: ex.title,
      description: ex.description,
      token: ex.token,
      durationMinutes: ex.durationMinutes,
      startTime: ex.startTime.toISOString(),
      endTime: ex.endTime.toISOString(),
      isActive: ex.isActive,
      totalQuestions: ex.questions.length,
    }));

    return NextResponse.json({ success: true, exams: formatted });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ message: 'Gagal mengambil data ujian.' }, { status: 500 });
  }
}

// 2. POST: Buat Sesi Ujian Baru
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { title, durationMinutes, token, startTime, endTime } = await request.json();

    if (!title || !durationMinutes || !token) {
      return NextResponse.json({ message: 'Judul, durasi, dan token wajib diisi.' }, { status: 400 });
    }

    const count = await prisma.exam.count();
    const code = `TKA-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(count + 1).padStart(3, '0')}`;

    const newExam = await prisma.exam.create({
      data: {
        title: title.trim(),
        code,
        token: token.trim().toUpperCase(),
        durationMinutes: parseInt(durationMinutes, 10),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdById: user.userId,
      },
    });

    return NextResponse.json({ success: true, exam: newExam });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ message: 'Gagal membuat sesi ujian.' }, { status: 500 });
  }
}

// 3. PATCH: Edit Sesi Ujian (Durasi, Judul, Token, Status)
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { id, title, durationMinutes, token, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID ujian wajib disertakan.' }, { status: 400 });
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(durationMinutes !== undefined && { durationMinutes: parseInt(durationMinutes, 10) }),
        ...(token && { token: token.trim().toUpperCase() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, message: 'Sesi ujian berhasil diperbarui.', exam: updated });
  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json({ message: 'Gagal memperbarui sesi ujian.' }, { status: 500 });
  }
}
