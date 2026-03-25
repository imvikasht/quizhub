
// Simulating Mongoose Schemas as TypeScript Interfaces

export interface QuestionAnalytics {
  questionIndex: number;
  timeSpent: number;
  isCorrect: boolean;
  selectedOption: number;
}

export interface QuizHistory {
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  date: string;
  category: string;
  analytics?: QuestionAnalytics[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface CategoryStat {
  name: string;
  mastery: number; // 0 to 100
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  badgeReward?: string;
  isCompleted: boolean;
  isClaimed: boolean;
  type: 'COMPLETION' | 'ACCURACY' | 'STREAK' | 'CATEGORY';
  category?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  role?: 'Student' | 'Teacher' | 'Admin' | 'Guest';
  organization?: string;
  avatarUrl?: string;
  totalScore: number;
  badgesArray: Badge[];
  streak?: number;
  accuracy?: number;
  quizzesCompleted?: number;
  history?: QuizHistory[];
  categoryStats?: CategoryStat[];
  isPremium?: boolean;
  balance?: number;
  settings?: {
    dyslexiaFont: boolean;
    reducedMotion: boolean;
  };
  dailyMissions?: Mission[];
  lastMissionUpdate?: string;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  questionsArray: Question[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  duration?: number;
  creatorId?: string;
  createdBy?: string;
  isPremium?: boolean;
  qualityScore?: number;
  upvotes?: number;
}

export interface Result {
  _id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  date: string;
}

export type ViewState = 'LANDING' | 'HOME' | 'QUIZ' | 'LEADERBOARD' | 'RESULT' | 'CREATE_QUIZ' | 'CREATE_MANUAL' | 'PROFILE' | 'AUTH' | 'REVIEW' | 'STUDY' | 'ADMIN' | 'DUEL' | 'CLASSROOM' | 'EXAM' | 'ANALYTICS';

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: number[]; // user's selected indices
  isFinished: boolean;
  timeRemaining: number;
}
