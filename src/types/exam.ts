export type Role = 'ADMIN' | 'STUDENT';

export type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT';

export type QuestionType = 'SINGLE_CHOICE' | 'COMPLEX_MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface SingleChoiceOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ComplexOption {
  id: string; // e.g. "opt_1", "opt_2", "opt_3"
  text: string;
}

export interface TrueFalseStatement {
  id: string; // e.g. "s1", "s2", "s3"
  text: string;
}

export interface QuestionData {
  id: string;
  orderNumber: number;
  type: QuestionType;
  stimulusText?: string | null;
  questionText: string;
  questionImage?: string | null;
  options: any; // SingleChoiceOption[] | ComplexOption[] | TrueFalseStatement[]
}

export interface ClientQuestionPayload {
  id: string;
  orderNumber: number;
  type: QuestionType;
  stimulusText?: string | null;
  questionText: string;
  questionImage?: string | null;
  options: any;
  // NOTE: correctAnswer is deliberately omitted for security!
}

export interface StudentItem {
  id: string;
  identifier: string; // NISN
  name: string;
  classGrade?: string | null;
  role: Role;
  createdAt: string;
}

export interface ExamDetail {
  id: string;
  title: string;
  description?: string | null;
  code: string;
  token: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  totalQuestions: number;
}
