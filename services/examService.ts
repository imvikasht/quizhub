import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ExamAttempt } from '../types/extensions';
import { Quiz } from '../types';

export const submitExamAttempt = async (
  userId: string,
  quiz: Quiz,
  answers: Record<number, number>,
  startTime: number
): Promise<ExamAttempt> => {
  
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  
  quiz.questionsArray.forEach((q, index) => {
    const userAnswer = answers[index];
    if (userAnswer === undefined || userAnswer === null || userAnswer === -1) {
      skipped++;
    } else if (userAnswer === q.correctAnswerIndex) {
      correct++;
    } else {
      wrong++;
    }
  });

  // Negative Marking System: +4 for correct, -1 for wrong
  const SCORE_PER_CORRECT = 4;
  const PENALTY_PER_WRONG = 1;
  const negativeMarksApplied = wrong * PENALTY_PER_WRONG;
  const finalScore = Math.max(0, (correct * SCORE_PER_CORRECT) - negativeMarksApplied); // Floor at 0 generally for strict competitive

  const newAttemptId = `exam_${Date.now()}_${userId}`;
  
  const attempt: ExamAttempt = {
    _id: newAttemptId,
    userId,
    quizId: quiz._id,
    status: 'completed',
    startTime: new Date(startTime),
    endTime: serverTimestamp(),
    answers,
    correctAnswers: correct,
    wrongAnswers: wrong,
    skippedAnswers: skipped,
    negativeMarksApplied,
    finalScore
  };

  await setDoc(doc(db, 'exam_attempts', newAttemptId), attempt);
  return attempt;
};

// Predicts Rank Based on History of this Quiz
export const getExamRankPrediction = async (quizId: string, userScore: number): Promise<{ rank: number, percentile: number }> => {
  // Pull previous exam attempts for this quiz
  const q = query(
    collection(db, 'exam_attempts'), 
    where('quizId', '==', quizId),
    limit(100)
  );
  
  const snapshot = await getDocs(q);
  // Sort in memory to avoid needing a Firestore composite index locally
  const scores = snapshot.docs
    .map(d => d.data().finalScore as number)
    .sort((a, b) => b - a);
  
  if (scores.length === 0) return { rank: 1, percentile: 99.9 };

  // Calculate rank (how many scored strictly higher + 1)
  let rank = 1;
  scores.forEach(s => {
    if (s > userScore) rank++;
  });

  const totalParticipants = scores.length + 1; // plus current user
  const percentile = ((totalParticipants - rank) / totalParticipants) * 100;

  return { rank, percentile: Math.round(percentile * 10) / 10 };
};
