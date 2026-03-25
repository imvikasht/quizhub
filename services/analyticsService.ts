import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

export interface PerformanceData {
  date: string;
  accuracy: number;
  xp: number;
  responseTime: number;
}

export interface CategoryPerformance {
  category: string;
  accuracy: number;
  totalQuizzes: number;
}

export const getUserAnalytics = async (userId: string) => {
  const q = query(
    collection(db, 'results'), 
    where('userId', '==', userId),
    orderBy('date', 'asc')
  );
  
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => doc.data());

  // Aggregate Performance Data (Over Time)
  const performanceOverTime: PerformanceData[] = results.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    accuracy: Math.round((r.score / r.totalQuestions) * 100),
    xp: r.score * 10,
    responseTime: r.timeTaken / (r.totalQuestions || 1)
  }));

  // Aggregate Category Data
  const categoryMap: Record<string, { totalScore: number, totalQuestions: number, count: number }> = {};
  
  results.forEach(r => {
    const cat = r.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { totalScore: 0, totalQuestions: 0, count: 0 };
    }
    categoryMap[cat].totalScore += r.score;
    categoryMap[cat].totalQuestions += r.totalQuestions;
    categoryMap[cat].count += 1;
  });

  const categoryStats: CategoryPerformance[] = Object.keys(categoryMap).map(cat => ({
    category: cat,
    accuracy: Math.round((categoryMap[cat].totalScore / categoryMap[cat].totalQuestions) * 100),
    totalQuizzes: categoryMap[cat].count
  }));

  // Identify Weak/Strong Topics
  const sortedStats = [...categoryStats].sort((a, b) => b.accuracy - a.accuracy);
  const strongTopic = sortedStats[0]?.category || 'N/A';
  const weakTopic = sortedStats[sortedStats.length - 1]?.category || 'N/A';

  return {
    performanceOverTime,
    categoryStats,
    strongTopic,
    weakTopic,
    totalXP: results.reduce((acc, r) => acc + (r.score * 10), 0),
    avgAccuracy: Math.round(results.reduce((acc, r) => acc + ((r.score / r.totalQuestions) * 100), 0) / (results.length || 1))
  };
};
