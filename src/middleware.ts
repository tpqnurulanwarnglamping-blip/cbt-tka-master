import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cbt-tka-master-super-secret-key-production-2026-safe-token'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('cbt_token')?.value;
  const { pathname } = request.nextUrl;

  // Izinkan akses rute publik & file statis
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Jika tidak ada token pada rute yang diproteksi, arahkan ke login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Proteksi Rute Guru/Admin
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // Proteksi Rute Murid/Peserta
    if (pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Token tidak valid atau kedaluwarsa
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('cbt_token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*'],
};
