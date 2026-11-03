-- =============================================================================
-- INISIALISASI & MIGRASI DATABASE CBT TKA MASTER DI NEON POSTGRESQL
-- =============================================================================

-- JIKA SUDAH PERNAH RUN SEBELUMNYA, CUKUP RUN 2 BARIS INI UNTUK UPDATE FITUR BARU:
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "classGrade" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "stimulusText" TEXT;

-- 1. Buat Tipe Enum
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'COMPLEX_MULTIPLE_CHOICE', 'TRUE_FALSE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Buat Tabel User
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'STUDENT',
  "classGrade" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buat Tabel Exam
CREATE TABLE IF NOT EXISTS "Exam" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "code" TEXT UNIQUE NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. Buat Tabel Question
CREATE TABLE IF NOT EXISTS "Question" (
  "id" TEXT PRIMARY KEY,
  "examId" TEXT NOT NULL,
  "orderNumber" INTEGER NOT NULL,
  "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
  "stimulusText" TEXT,
  "questionText" TEXT NOT NULL,
  "questionImage" TEXT,
  "options" JSONB NOT NULL,
  "correctAnswer" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Buat Tabel ExamSession
CREATE TABLE IF NOT EXISTS "ExamSession" (
  "id" TEXT PRIMARY KEY,
  "examId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "submittedAt" TIMESTAMP(3),
  "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalCorrect" INTEGER NOT NULL DEFAULT 0,
  UNIQUE("examId", "userId"),
  FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Buat Tabel Answer
CREATE TABLE IF NOT EXISTS "Answer" (
  "id" TEXT PRIMARY KEY,
  "examSessionId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "selectedAnswer" JSONB,
  "isFlagged" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("examSessionId", "questionId"),
  FOREIGN KEY ("examSessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
