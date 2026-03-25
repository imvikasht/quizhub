import { Quiz } from '../types';

// ==========================================
// FEATURE 1: MULTIPLAYER BATTLES
// ==========================================

export type MatchStatus = 'waiting' | 'starting' | 'active' | 'finished';

export interface PlayerMatchState {
  score: number;
  currentQuestionIndex: number;
  isFinished: boolean;
  powerUpsAvailable: string[];
  activePowerUps: string[]; // e.g. "frozen", "2x"
  avatarUrl?: string;
  username?: string;
}

export interface MultiplayerSession {
  _id: string;
  hostId: string;
  quizId: string;
  status: MatchStatus;
  players: Record<string, PlayerMatchState>;
  winnerId?: string;
  createdAt: any; // Firestore Timestamp
}

// ==========================================
// FEATURE 2: EXAM MODE
// ==========================================

export interface ExamAttempt {
  _id: string;
  userId: string;
  quizId: string;
  status: 'in_progress' | 'completed';
  startTime: any; // Firestore Timestamp
  endTime?: any; // Firestore Timestamp
  // Mapping of questionIndex to selectedOptionIndex
  answers: Record<number, number>;
  // Grading metrics
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  negativeMarksApplied: number;
  finalScore: number;
}

// ==========================================
// FEATURE 3: CLASSROOM & TEAMS
// ==========================================

export interface ClassAssignment {
  quizId: string;
  assignedAt: any;
  deadline?: any;
}

export interface Classroom {
  _id: string;
  code: string; // 6-digit unique join code
  name: string;
  teacherId: string;
  students: string[]; // Array of UIDs
  assignments: ClassAssignment[];
  createdAt: any;
}

// ==========================================
// FEATURE 4: ANALYTICS
// ==========================================

export interface AnalyticsLog {
  _id: string;
  userId: string;
  topic: string; // e.g., 'Science', 'Math'
  accuracyRate: number; // 0 to 100
  avgResponseTimeMs: number;
  timestamp: any;
}
