import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

// 1. GET: Ambil daftar seluruh siswa
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        identifier: true,
        name: true,
        classGrade: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ message: 'Gagal mengambil data siswa.' }, { status: 500 });
  }
}

// 2. POST: Tambah siswa baru (Username: NISN, Password bcrypt)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { name, nisn, password, classGrade } = await request.json();

    if (!name || !nisn) {
      return NextResponse.json({ message: 'Nama dan NISN wajib diisi.' }, { status: 400 });
    }

    // Cek duplikasi NISN
    const existing = await prisma.user.findUnique({
      where: { identifier: nisn.trim() },
    });

    if (existing) {
      return NextResponse.json({ message: `Siswa dengan NISN ${nisn} sudah terdaftar.` }, { status: 400 });
    }

    // Hash password (default jika kosong: "siswa123")
    const plainPass = password && password.trim() ? password.trim() : 'siswa123';
    const hashedPassword = await hashPassword(plainPass);

    const newStudent = await prisma.user.create({
      data: {
        name: name.trim(),
        identifier: nisn.trim(),
        password: hashedPassword,
        classGrade: classGrade ? classGrade.trim() : null,
        role: 'STUDENT',
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        classGrade: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Siswa berhasil ditambahkan.',
      student: newStudent,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ message: 'Gagal menambahkan data siswa.' }, { status: 500 });
  }
}

// 3. DELETE: Hapus akun siswa
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID siswa wajib disertakan.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Data siswa berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ message: 'Gagal menghapus data siswa.' }, { status: 500 });
  }
}

// 4. PATCH: Reset password siswa
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { id, newPassword } = await request.json();

    if (!id || !newPassword) {
      return NextResponse.json({ message: 'ID dan kata sandi baru wajib diisi.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword.trim());

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Kata sandi siswa berhasil direset.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ message: 'Gagal mereset kata sandi siswa.' }, { status: 500 });
  }
}
