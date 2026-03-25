import { Quiz, User, Result, QuizHistory, CategoryStat, Badge, QuestionAnalytics, Mission } from '../types';

const generateDailyMissions = (): Mission[] => {
  return [
    {
      id: 'm1',
      title: 'Quiz Marathon',
      description: 'Complete 3 quizzes today',
      target: 3,
      current: 0,
      xpReward: 100,
      isCompleted: false,
      isClaimed: false,
      type: 'COMPLETION'
    },
    {
      id: 'm2',
      title: 'Precision Strike',
      description: 'Score 80% or higher on any quiz',
      target: 80,
      current: 0,
      xpReward: 150,
      isCompleted: false,
      isClaimed: false,
      type: 'ACCURACY'
    },
    {
      id: 'm3',
      title: 'Science Buff',
      description: 'Complete a Science category quiz',
      target: 1,
      current: 0,
      xpReward: 120,
      isCompleted: false,
      isClaimed: false,
      type: 'CATEGORY',
      category: 'Science'
    }
  ];
};

const INITIAL_HISTORY: QuizHistory[] = [
  { quizId: 'q1', quizTitle: 'React Fundamentals', score: 20, total: 30, date: new Date(Date.now() - 86400000).toISOString(), category: 'Programming', analytics: [] },
  { quizId: 'q2', quizTitle: 'General Science', score: 20, total: 20, date: new Date(Date.now() - 172800000).toISOString(), category: 'Science', analytics: [] },
];

const INITIAL_BADGES: Badge[] = [
  { id: 'b1', name: 'Veteran', description: 'Complete 10 quizzes', icon: '🎖️' },
  { id: 'b2', name: 'Fast Learner', description: 'Score 100% on a quiz', icon: '⚡' },
  { id: 'b3', name: 'Scientist', description: 'Complete 5 science quizzes', icon: '🔬' },
  { id: 'mission_master', name: 'Mission Master', description: 'Complete all daily missions', icon: '🎯' },
];

const INITIAL_STATS: CategoryStat[] = [
  { name: 'Programming', mastery: 85 },
  { name: 'Science', mastery: 62 },
  { name: 'History', mastery: 40 },
  { name: 'General', mastery: 75 },
];

// Mock Database
const USERS: User[] = [
  { _id: 'u1', username: 'QuizMaster99', email: 'qm@test.com', password: 'password', role: 'Teacher', organization: 'Tech University', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', totalScore: 1250, badgesArray: INITIAL_BADGES, streak: 5, accuracy: 88, quizzesCompleted: 12, history: INITIAL_HISTORY, categoryStats: INITIAL_STATS, isPremium: true, balance: 45.50, settings: { dyslexiaFont: false, reducedMotion: false } },
  { _id: 'u2', username: 'ReactNinja', email: 'rn@test.com', password: 'password', role: 'Student', organization: 'Code High', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', totalScore: 980, badgesArray: [], streak: 3, accuracy: 75, quizzesCompleted: 8, history: [], categoryStats: INITIAL_STATS, isPremium: false, balance: 0, settings: { dyslexiaFont: false, reducedMotion: false } },
];

let QUIZZES: Quiz[] = [
  {
    _id: 'q1',
    title: 'React Fundamentals',
    description: 'Test your knowledge of React hooks and components.',
    difficulty: 'Medium',
    category: 'Programming',
    questionsArray: [
      { questionText: 'Which hook is used to handle side effects?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctAnswerIndex: 1 },
      { questionText: 'What is the virtual DOM?', options: ['A direct copy of the HTML DOM', 'A lightweight copy of the DOM kept in memory', 'A browser extension', 'A database for React'], correctAnswerIndex: 1 },
      { questionText: 'How do you pass data to child components?', options: ['State', 'Props', 'Redux', 'Context'], correctAnswerIndex: 1 },
    ],
  },
  {
    _id: 'q2',
    title: 'General Science',
    description: 'Basic science questions for everyone.',
    difficulty: 'Easy',
    category: 'Science',
    questionsArray: [
      { questionText: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctAnswerIndex: 2 },
      { questionText: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswerIndex: 1 },
    ],
  },
];

const RESULTS: Result[] = [];
let currentUser: User | null = null;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800);
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('User not found');
  if (user.password !== password) throw new Error('Invalid credentials');
  currentUser = user;
  return user;
};

export const loginAsGuest = async (): Promise<User> => {
  await delay(600);
  const guestUser: User = {
    _id: `guest_${Date.now()}`,
    username: 'Guest Explorer',
    email: 'guest@quizhub.com',
    password: '',
    role: 'Guest',
    organization: 'Guest Session',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest_${Date.now()}`,
    totalScore: 0,
    badgesArray: [],
    streak: 0,
    accuracy: 0,
    quizzesCompleted: 0,
    history: [],
    categoryStats: []
  };
  currentUser = guestUser;
  return guestUser;
};

export const register = async (username: string, email: string, password: string, role: 'Student' | 'Teacher', organization: string): Promise<User> => {
  await delay(1000);
  if (USERS.find(u => u.email === email)) throw new Error('Email already registered');
  const newUser: User = {
    _id: `u_${Date.now()}`,
    username, email, password, role, organization,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    totalScore: 0,
    badgesArray: [],
    streak: 0, accuracy: 0, quizzesCompleted: 0, history: [], categoryStats: []
  };
  USERS.push(newUser);
  currentUser = newUser;
  return newUser;
};

export const logout = async (): Promise<void> => {
  await delay(200);
  currentUser = null;
};

export const checkSession = async (): Promise<User | null> => {
  await delay(400);
  return currentUser;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  await delay(600);
  const userIndex = USERS.findIndex(u => u._id === userId);
  if (currentUser && currentUser.role === 'Guest' && currentUser._id === userId) {
      currentUser = { ...currentUser, ...updates };
      return currentUser;
  }
  if (userIndex === -1) throw new Error("User not found");
  USERS[userIndex] = { ...USERS[userIndex], ...updates };
  currentUser = USERS[userIndex];
  return currentUser;
};

export const changePassword = async (userId: string, oldPass: string, newPass: string): Promise<void> => {
  await delay(1000);
  const user = USERS.find(u => u._id === userId);
  if (!user) throw new Error("User not found");
  if (user.password !== oldPass) throw new Error("Incorrect current password");
  user.password = newPass;
};

export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    const response = await fetch('/api/quizzes');
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    const data = await response.json();
    // Update local cache
    QUIZZES = data;
    return data;
  } catch (error) {
    console.error(error);
    return [...QUIZZES];
  }
};

export const getQuizzesSync = (): Quiz[] => {
  return [...QUIZZES];
};

export const getLeaderboard = async (): Promise<User[]> => {
  try {
    const response = await fetch('/api/users/leaderboard');
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    console.error(error);
    // Fallback to mock if API fails
    return [...USERS].sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
  }
};

export const submitQuiz = async (userId: string, quizId: string, userAnswers: number[], timeTaken: number, analytics?: QuestionAnalytics[]): Promise<{ result: Result, feedback: boolean[] }> => {
  const quiz = QUIZZES.find(q => q._id === quizId);
  if (!quiz) throw new Error('Quiz not found');

  let score = 0;
  const feedback: boolean[] = [];
  quiz.questionsArray.forEach((q, index) => {
    const isCorrect = userAnswers[index] === q.correctAnswerIndex;
    feedback.push(isCorrect);
    if (isCorrect) score += 10;
  });

  try {
    const response = await fetch('/api/quizzes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        quizId,
        score,
        totalQuestions: quiz.questionsArray.length,
        timeTaken,
        analytics
      })
    });
    
    if (!response.ok) throw new Error('Failed to submit quiz to server');
    const data = await response.json();
    
    // Update local user if needed
    if (currentUser && currentUser._id === userId) {
      currentUser = data.user;
    }

    return { result: data.result, feedback };
  } catch (error) {
    console.error('Real API submission failed, using mock logic', error);
    
    const result: Result = {
      _id: `r${Date.now()}`,
      userId, quizId, score,
      totalQuestions: quiz.questionsArray.length,
      timeTaken, date: new Date().toISOString(),
    };

    RESULTS.push(result);

    const updateStats = (user: User) => {
      user.totalScore += score;
      user.quizzesCompleted = (user.quizzesCompleted || 0) + 1;
      const currentAccuracy = (score / (quiz.questionsArray.length * 10)) * 100;
      user.accuracy = Math.round(((user.accuracy || 0) * (user.quizzesCompleted - 1) + currentAccuracy) / user.quizzesCompleted);
      user.streak = (user.streak || 0) + 1;
      
      // Update Missions
      if (user.dailyMissions) {
        user.dailyMissions = user.dailyMissions.map(m => {
          if (m.isCompleted) return m;
          let newCurrent = m.current;
          if (m.type === 'COMPLETION') newCurrent += 1;
          if (m.type === 'ACCURACY' && currentAccuracy >= m.target) newCurrent = m.target;
          if (m.type === 'CATEGORY' && quiz.category === m.category) newCurrent += 1;
          
          const isCompleted = newCurrent >= m.target;
          return { ...m, current: newCurrent, isCompleted };
        });
      }
      
      // Add to history
      if (!user.history) user.history = [];
      user.history = [{
        quizId: quiz._id,
        quizTitle: quiz.title,
        score,
        total: quiz.questionsArray.length * 10,
        date: new Date().toISOString(),
        category: quiz.category,
        analytics: analytics
      }, ...user.history].slice(0, 10);

      // Update Category Stats
      if (!user.categoryStats) user.categoryStats = [];
      const catIndex = user.categoryStats.findIndex(c => c.name === quiz.category);
      const quizPct = (score / (quiz.questionsArray.length * 10)) * 100;
      if (catIndex !== -1) {
        user.categoryStats[catIndex].mastery = Math.round((user.categoryStats[catIndex].mastery + quizPct) / 2);
      } else {
        user.categoryStats.push({ name: quiz.category, mastery: Math.round(quizPct) });
      }
    };

    const userIndex = USERS.findIndex(u => u._id === userId);
    if (userIndex !== -1) {
      updateStats(USERS[userIndex]);
    } else if (currentUser && currentUser.role === 'Guest') {
      updateStats(currentUser);
    }

    return { result, feedback };
  }
};

export const saveQuiz = (quiz: Quiz) => {
  const existingIndex = QUIZZES.findIndex(q => q._id === quiz._id);
  if (existingIndex !== -1) {
    QUIZZES[existingIndex] = quiz;
  } else {
    QUIZZES = [quiz, ...QUIZZES];
  }
};

export const getCurrentUser = (): User => {
  if (!currentUser) throw new Error("No session");
  return currentUser; 
};

export const claimMissionReward = async (userId: string, missionId: string): Promise<User> => {
  await delay(500);
  const user = USERS.find(u => u._id === userId) || (currentUser && currentUser._id === userId ? currentUser : null);
  if (!user) throw new Error('User not found');
  if (!user.dailyMissions) throw new Error('No missions found');
  
  const mission = user.dailyMissions.find(m => m.id === missionId);
  if (!mission) throw new Error('Mission not found');
  if (!mission.isCompleted) throw new Error('Mission not completed');
  if (mission.isClaimed) throw new Error('Reward already claimed');
  
  mission.isClaimed = true;
  user.totalScore += mission.xpReward;
  
  // Check if all missions are claimed to give a bonus badge
  const allClaimed = user.dailyMissions.every(m => m.isClaimed);
  if (allClaimed) {
    const masterBadge = INITIAL_BADGES.find(b => b.id === 'mission_master');
    if (masterBadge && !user.badgesArray.some(b => b.id === masterBadge.id)) {
      user.badgesArray.push({ ...masterBadge, unlockedAt: new Date().toISOString() });
    }
  }
  
  currentUser = user;
  return user;
};

export const refreshMissions = async (userId: string): Promise<User> => {
  await delay(300);
  let user = USERS.find(u => u._id === userId) || (currentUser && currentUser._id === userId ? currentUser : null);
  
  if (!user) {
    console.warn(`User ${userId} not found during mission refresh, attempting to use current session`);
    if (currentUser) {
      user = currentUser;
    } else {
      throw new Error('User not found');
    }
  }
  
  const today = new Date().toDateString();
  if (user.lastMissionUpdate !== today) {
    user.dailyMissions = generateDailyMissions();
    user.lastMissionUpdate = today;
  }
  
  currentUser = user;
  return user;
};
