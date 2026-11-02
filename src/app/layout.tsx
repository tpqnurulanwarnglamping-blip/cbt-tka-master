import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CBT TKA Master - Simulasi Ujian Kemampuan Akademik',
  description: 'Sistem Computer Based Test modern untuk persiapan Tes Kemampuan Akademik (TKA)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-[#23a68a] selection:text-white">
        {children}
      </body>
    </html>
  );
}
