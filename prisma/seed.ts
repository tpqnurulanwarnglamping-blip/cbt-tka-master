import { PrismaClient, Role, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Seeding Database CBT TKA Master ---');

  // 1. Bersihkan data lama jika ada
  await prisma.answer.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash Password
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedStudentPass = await bcrypt.hash('siswa123', 10);

  // 3. Buat Akun Guru (Admin)
  const admin = await prisma.user.create({
    data: {
      identifier: 'admin@sekolah.sch.id',
      name: 'Drs. Budi Santoso, M.Pd.',
      password: hashedAdminPass,
      role: Role.ADMIN,
    },
  });

  // 4. Buat Akun Murid (Siswa)
  const student1 = await prisma.user.create({
    data: {
      identifier: '1234567890',
      name: 'Ahmad Fauzi',
      password: hashedStudentPass,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      identifier: '1234567891',
      name: 'Bunga Citra Lestari',
      password: hashedStudentPass,
      role: Role.STUDENT,
    },
  });

  // 5. Buat Sesi Ujian TKA
  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const exam = await prisma.exam.create({
    data: {
      title: 'Simulasi Akbar TKA - Penalaran Matematika & Literasi',
      description: 'Latihan mandiri persiapan Tes Kemampuan Akademik berstandar nasional.',
      code: 'TKA-202611-001',
      token: 'TKA889',
      durationMinutes: 90,
      startTime: now,
      endTime: nextMonth,
      isActive: true,
      createdById: admin.id,
    },
  });

  // 6. Buat 3 Butir Soal Sampel Mewakili 3 Jenis Soal TKA
  
  // Soal 1: Pilihan Ganda (4 Opsi A-D, 1 Jawaban Benar)
  await prisma.question.create({
    data: {
      examId: exam.id,
      orderNumber: 1,
      type: QuestionType.SINGLE_CHOICE,
      questionText:
        'Jika x = 2y dan y = 3z, manakah pernyataan berikut yang paling tepat menyatakan hubungan matematis antara variabel x dan z?',
      options: [
        { id: 'A', text: 'x = 5z' },
        { id: 'B', text: 'x = 6z' },
        { id: 'C', text: 'x = 3z / 2' },
        { id: 'D', text: 'x = z + 6' },
      ],
      correctAnswer: 'B',
    },
  });

  // Soal 2: Pilihan Ganda Kompleks (3 Opsi Centang, Non-ABC, 2 Benar 1 Salah)
  await prisma.question.create({
    data: {
      examId: exam.id,
      orderNumber: 2,
      type: QuestionType.COMPLEX_MULTIPLE_CHOICE,
      questionText:
        'Diketahui sebuah deret geometri dengan suku pertama a = 3 dan rasio r = 2. Manakah 2 pernyataan berikut yang bernilai BENAR? (Pilihlah dengan mencentang kotak).',
      options: [
        { id: 'opt_1', text: 'Suku ke-3 dari deret geometri tersebut adalah 12.' },
        { id: 'opt_2', text: 'Suku ke-4 dari deret geometri tersebut adalah 24.' },
        { id: 'opt_3', text: 'Jumlah 3 suku pertama (S3) bernilai 25.' },
      ],
      correctAnswer: ['opt_1', 'opt_2'], // 2 Opsi Benar
    },
  });

  // Soal 3: Benar / Salah (3 Pernyataan Matriks Mandiri)
  await prisma.question.create({
    data: {
      examId: exam.id,
      orderNumber: 3,
      type: QuestionType.TRUE_FALSE,
      questionText:
        'Perhatikan pernyataan seputar logika proporsi dan statistik deskriptif berikut. Tentukan status kebenaran masing-masing pernyataan dengan memilih Benar atau Salah!',
      options: [
        { id: 's1', text: 'Nilai rata-rata (mean) dari data 4, 6, 8, 10 adalah 7.' },
        { id: 's2', text: 'Median selalu bernilai lebih besar daripada modus pada data terdistribusi normal.' },
        { id: 's3', text: 'Jika semua nilai data dikalikan konstanta k, maka standar deviasi data ikut terkalikan |k|.' },
      ],
      correctAnswer: {
        s1: true,
        s2: false,
        s3: true,
      },
    },
  });

  console.log('✅ Seeding berhasil diselesaikan!');
  console.log('Akun Guru: admin@sekolah.sch.id / admin123');
  console.log('Akun Siswa: 1234567890 / siswa123');
  console.log('Token Ujian: TKA889');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
