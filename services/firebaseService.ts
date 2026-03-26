import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  where,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Quiz, Result, QuizHistory, Mission, QuestionAnalytics } from '../types';

const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Functions
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncUserProfile(result.user);
  } catch (error) {
    console.error("Google login failed", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, username: string, role: 'Student' | 'Teacher', organization: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: username });
    
    const newUser: User = {
      _id: result.user.uid,
      username: username,
      email: email,
      role: email === 'iritvik3@gmail.com' ? 'Admin' : role,
      organization: organization,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
      totalScore: 0,
      badgesArray: [],
      streak: 0,
      accuracy: 0,
      quizzesCompleted: 0,
      history: [],
      categoryStats: [],
      dailyMissions: generateDailyMissions()
    };
    
    const userDocRef = doc(db, 'users', result.user.uid);
    await setDoc(userDocRef, { ...newUser, createdAt: serverTimestamp() });
    
    broadcastActivity({
      type: 'user_joined',
      user: newUser.username,
      timestamp: new Date()
    });

    return newUser;
  } catch (error) {
    console.error("Email registration failed", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await syncUserProfile(result.user);
  } catch (error) {
    console.error("Email login failed", error);
    throw error;
  }
};

export const loginAsGuest = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return await syncUserProfile(result.user);
  } catch (error) {
    console.error("Guest login failed", error);
    throw error;
  }
};

export const logout = async () => {
  const user = auth.currentUser;
  if (user && user.isAnonymous) {
    // Mark for deletion in 24 hours
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { 
      deleteAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) 
    }).catch(console.error);
  }
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset failed", error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await syncUserProfile(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};

const broadcastActivity = async (activity: any) => {
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
  } catch (error) {
    console.error('Failed to broadcast activity:', error);
  }
};

const syncUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      
      // Ensure daily missions exist for existing users
      if (!userData.dailyMissions) {
        userData.dailyMissions = generateDailyMissions();
        updateDoc(userDocRef, { dailyMissions: userData.dailyMissions }).catch(console.error);
      }

      if (firebaseUser.email === 'iritvik3@gmail.com' && userData.role !== 'Admin') {
        userData.role = 'Admin';
        // Non-blocking update to firestore
        updateDoc(userDocRef, { role: 'Admin' }).catch(console.error);
      }
      return { _id: firebaseUser.uid, ...userData } as User;
    } else {
      const newUser: User = {
        _id: firebaseUser.uid,
        username: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Explorer' : 'New User'),
        email: firebaseUser.email || 'guest@quizhub.com',
        role: firebaseUser.email === 'iritvik3@gmail.com' ? 'Admin' : (firebaseUser.isAnonymous ? 'Guest' : 'Student'),
        avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        totalScore: 0,
        badgesArray: [],
        streak: 0,
        accuracy: 0,
        quizzesCompleted: 0,
        history: [],
        categoryStats: [],
        dailyMissions: generateDailyMissions()
      };
      await setDoc(userDocRef, { ...newUser, createdAt: serverTimestamp() });
      
      // Broadcast join
      broadcastActivity({
        type: 'user_joined',
        user: newUser.username,
        timestamp: new Date()
      });

      return newUser;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
    throw error;
  }
};

// Quiz Functions
export const getQuizzes = async (): Promise<Quiz[]> => {
  const quizzesRef = collection(db, 'quizzes');
  try {
    const q = query(quizzesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as Quiz));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
    throw error;
  }
};

export const saveQuiz = async (quiz: Partial<Quiz>): Promise<string> => {
  const quizzesRef = collection(db, 'quizzes');
  try {
    const isNewQuiz = !quiz._id || quiz._id.startsWith('q_');
    
    if (!isNewQuiz && quiz._id) {
      const { _id, ...data } = quiz;
      await updateDoc(doc(db, 'quizzes', _id), { ...data, updatedAt: serverTimestamp() });
      return _id;
    } else {
      const { _id, ...dataToSave } = quiz;
      const docRef = await addDoc(quizzesRef, { 
        ...dataToSave, 
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid 
      });
      return docRef.id;
    }
  } catch (error) {
    const isNewQuiz = !quiz._id || quiz._id.startsWith('q_');
    handleFirestoreError(error, !isNewQuiz ? OperationType.UPDATE : OperationType.CREATE, 'quizzes');
    throw error;
  }
};

export const submitQuizResult = async (
  userId: string,
  quizId: string,
  answers: number[],
  duration: number,
  analytics: QuestionAnalytics[]
): Promise<{ result: Result, user: User }> => {
  try {
    // 1. Get Quiz and User
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!quizDoc.exists() || !userDoc.exists()) {
      throw new Error('Quiz or User not found');
    }

    const quiz = { _id: quizDoc.id, ...quizDoc.data() } as Quiz;
    const user = { _id: userDoc.id, ...userDoc.data() } as User;

    // 2. Calculate Score
    let score = 0;
    quiz.questionsArray.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        score += 10;
      }
    });

    const totalPossible = quiz.questionsArray.length * 10;
    const currentAccuracy = (score / totalPossible) * 100;

    // 3. Create Result
    const result: Result = {
      _id: '', // Will be set by Firestore
      userId,
      quizId,
      score,
      totalQuestions: quiz.questionsArray.length,
      timeTaken: duration,
      date: new Date().toISOString(),
    };

    const resultRef = await addDoc(collection(db, 'results'), {
      ...result,
      analytics, // Store analytics in Firestore but not in the Result type if it's not there
      createdAt: serverTimestamp()
    });
    result._id = resultRef.id;

    // 4. Update User Stats
    const updatedUser = { ...user };
    updatedUser.totalScore += score;
    updatedUser.quizzesCompleted = (updatedUser.quizzesCompleted || 0) + 1;
    updatedUser.accuracy = Math.round(((updatedUser.accuracy || 0) * (updatedUser.quizzesCompleted - 1) + currentAccuracy) / updatedUser.quizzesCompleted);
    updatedUser.streak = (updatedUser.streak || 0) + 1;

    // Update Missions
    if (updatedUser.dailyMissions) {
      updatedUser.dailyMissions = updatedUser.dailyMissions.map(m => {
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
    if (!updatedUser.history) updatedUser.history = [];
    const historyItem: QuizHistory = {
      quizId: quiz._id,
      quizTitle: quiz.title,
      score,
      total: totalPossible,
      date: new Date().toISOString(),
      category: quiz.category,
      analytics: analytics
    };
    updatedUser.history = [historyItem, ...updatedUser.history].slice(0, 10);

    // Update Category Stats
    if (!updatedUser.categoryStats) updatedUser.categoryStats = [];
    const catIndex = updatedUser.categoryStats.findIndex(c => c.name === quiz.category);
    if (catIndex !== -1) {
      updatedUser.categoryStats[catIndex].mastery = Math.round((updatedUser.categoryStats[catIndex].mastery + currentAccuracy) / 2);
    } else {
      updatedUser.categoryStats.push({ name: quiz.category, mastery: Math.round(currentAccuracy) });
    }

    // Save User Updates
    const { _id, ...userData } = updatedUser;
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    });

    // Broadcast completion
    broadcastActivity({
      type: 'quiz_completed',
      user: user.username,
      quizTitle: quiz.title,
      score: score,
      total: totalPossible,
      timestamp: new Date()
    });

    return { result, user: updatedUser };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'results/users');
    throw error;
  }
};

export const getLeaderboard = async (): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  try {
    const q = query(usersRef, orderBy('totalScore', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as User));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    const updatedDoc = await getDoc(userRef);
    return { _id: userId, ...updatedDoc.data() } as User;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    throw error;
  }
};

export const claimMissionReward = async (userId: string, missionId: string): Promise<User> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const user = { _id: userDoc.id, ...userDoc.data() } as User;
    
    if (!user.dailyMissions) {
      throw new Error('Missions not found');
    }

    const missionIndex = user.dailyMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      throw new Error('Mission not found');
    }

    const mission = user.dailyMissions[missionIndex];
    if (!mission.isCompleted || mission.isClaimed) {
      throw new Error('Mission not ready to be claimed');
    }

    // Update User
    const updatedUser = { ...user };
    updatedUser.dailyMissions = [...user.dailyMissions];
    updatedUser.dailyMissions[missionIndex] = { ...mission, isClaimed: true };
    updatedUser.totalScore += mission.xpReward;

    const { _id, ...userData } = updatedUser;
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });

    return updatedUser;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'users');
    throw error;
  }
};
export const subscribeToQuizzes = (callback: (quizzes: Quiz[]) => void) => {
  const quizzesRef = collection(db, 'quizzes');
  const q = query(quizzesRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const quizzes = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as Quiz));
    callback(quizzes);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
  });
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  console.log('Attempting to delete quiz:', quizId);
  try {
    await deleteDoc(doc(db, 'quizzes', quizId));
    console.log('Successfully deleted quiz:', quizId);
  } catch (error) {
    console.error('Failed to delete quiz in firebaseService:', error);
    handleFirestoreError(error, OperationType.DELETE, `quizzes/${quizId}`);
    throw error;
  }
};

export const subscribeToLeaderboard = (callback: (users: User[]) => void) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('totalScore', 'desc'), limit(10));
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as User));
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'users');
  });
};

// Helpers
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
