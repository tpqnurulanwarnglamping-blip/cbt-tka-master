import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, password, role } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Identifier (Email/NISN) dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { identifier: identifier.trim() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Akun tidak ditemukan. Silakan periksa kembali NISN atau Email Anda.' },
        { status: 401 }
      );
    }

    // Validasi kesesuaian role
    if (role && user.role !== role) {
      return NextResponse.json(
        { message: `Akun ini terdaftar sebagai ${user.role}, bukan ${role}. Silakan ganti tab login.` },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Kata sandi salah. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    // Generate JWT Session Token
    const token = await createSessionToken({
      userId: user.id,
      identifier: user.identifier,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
      },
    });

    // Simpan ke HTTP-Only Cookie
    response.cookies.set({
      name: 'cbt_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 Jam
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan sistem saat memproses login.' },
      { status: 500 }
    );
  }
}
