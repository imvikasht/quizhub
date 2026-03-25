
import React, { useState, useEffect } from 'react';
import { Quiz, ViewState, User, QuizHistory } from './types';
import DailyMissions from './components/DailyMissions';
import { getQuizzes, onAuthChange, logout, saveQuiz, submitQuizResult, getLeaderboard, subscribeToQuizzes, loginAsGuest, deleteQuiz } from './services/firebaseService';
import QuizPlayer from './components/QuizPlayer';
import Leaderboard from './components/Leaderboard';
import ManualQuizCreator from './components/ManualQuizCreator';
import CreateQuizModal from './components/CreateQuizModal';
import ResultView from './components/ResultView';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Landing from './components/Landing';
import ClassDashboard from './components/classroom/ClassDashboard';
import ExamPlayer from './components/exam/ExamPlayer';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
// Added HelpCircle to the imports
import { 
  Play, Trophy, Sparkles, Zap, 
  LogOut, LogIn, LayoutGrid, Clock, ChevronRight, 
  User as UserIcon, PenTool, Moon, Sun, Edit3, Share2, Target, Flame, CheckCircle2, HelpCircle, Trash2, Users, ShieldAlert, BarChart2
} from 'lucide-react';

const CATEGORIES = ['All', 'Programming', 'Science', 'History', 'AI Generated', 'Trivia'];

// Dashboard component for the main application view
const Dashboard: React.FC<{
  onSelectQuiz: (quiz: Quiz) => void;
  onExamQuiz: (quiz: Quiz) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quiz: Quiz) => void;
  onShareQuiz: (quiz: Quiz) => void;
  onViewLeaderboard: () => void;
  onViewClassroom: () => void;
  onViewAnalytics: () => void;
  onCreateQuizAI: () => void;
  onCreateQuizManual: () => void;
  onViewProfile: () => void;
  onAuthAction: () => void;
  onReviewQuiz: (history: QuizHistory) => void;
  onStudyQuiz: (history: QuizHistory) => void;
  onUpdateUser: (user: User) => void;
  currentUser: User;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  lastUpdate: number;
  quizzes: Quiz[];
  loading: boolean;
}> = ({ 
  onSelectQuiz, onExamQuiz, onEditQuiz, onDeleteQuiz, onShareQuiz, onViewLeaderboard, onViewClassroom, onViewAnalytics,
  onCreateQuizAI, onCreateQuizManual, onViewProfile, 
  onAuthAction, onReviewQuiz, onStudyQuiz, onUpdateUser, currentUser, isDarkMode, toggleDarkMode, lastUpdate, quizzes, loading
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const isGuest = currentUser.role === 'Guest';

  const filteredQuizzes = activeCategory === 'All' 
    ? quizzes 
    : quizzes.filter(q => q.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-fade-in relative z-10">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-50 dark:opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-400 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-400 rounded-full blur-[140px] animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="py-8 flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.location.reload()}>
           <div className="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform">
             <Zap className="text-white" size={32} fill="currentColor" />
           </div>
           <div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">QuizHub</h1>
             <p className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">Master Anything</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Profile Summary Button */}
           <button 
            onClick={onViewProfile}
            className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 hover:shadow-xl transition-all border border-white/40 dark:border-white/10 group"
           >
             <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500 group-hover:scale-105 transition-transform">
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div className="text-left hidden sm:block">
               <span className="text-slate-900 dark:text-white font-black text-sm block leading-none mb-1">{currentUser.username}</span>
               <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">{currentUser.role || 'Guest'}</span>
             </div>
           </button>

           <button 
             onClick={onViewLeaderboard}
             className="p-3.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-2xl backdrop-blur-md transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-90"
             title="Global Leaderboard"
           >
             <Trophy size={20} className="text-amber-500" />
           </button>
           
           {!isGuest && (
             <button 
               onClick={onViewClassroom}
               className="p-3.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-2xl backdrop-blur-md transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-90"
               title="Classrooms & Teams"
             >
               <Users size={20} className="text-sky-500" />
             </button>
           )}

           {!isGuest && (
             <button 
               onClick={onViewAnalytics}
               className="p-3.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-2xl backdrop-blur-md transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-90"
               title="Performance Analytics"
             >
               <BarChart2 size={20} className="text-indigo-400" />
             </button>
           )}
           
           <button 
             onClick={toggleDarkMode}
             className="p-3.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-2xl backdrop-blur-md transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-90"
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
           
           <button
             onClick={onAuthAction}
             className="p-3.5 rounded-2xl backdrop-blur-md transition-all border shadow-sm active:scale-90 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-500/20"
             title="Log Out"
           >
             <LogOut size={20} />
           </button>
        </div>
      </header>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
         <div className="glass-panel p-6 rounded-[2rem] border border-white/50 dark:border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
            <div>
               <p className="text-slate-500 dark:text-emerald-400/60 text-xs font-black uppercase tracking-widest mb-1">Avg. Accuracy</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white">{currentUser.accuracy || 0}%</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
               <Target size={28} />
            </div>
         </div>
         <div className="glass-panel p-6 rounded-[2rem] border border-white/50 dark:border-white/5 flex items-center justify-between group hover:border-orange-500/30 transition-all">
            <div>
               <p className="text-slate-500 dark:text-emerald-400/60 text-xs font-black uppercase tracking-widest mb-1">Daily Streak</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white">{currentUser.streak || 0} Days</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
               <Flame size={28} fill="currentColor" />
            </div>
         </div>
         <button 
           onClick={onViewLeaderboard}
           className="glass-panel p-6 rounded-[2rem] border border-white/50 dark:border-white/5 flex items-center justify-between group hover:border-violet-500/30 transition-all text-left"
         >
            <div>
               <p className="text-slate-500 dark:text-emerald-400/60 text-xs font-black uppercase tracking-widest mb-1">Total XP</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white">{currentUser.totalScore.toLocaleString()}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
               <Trophy size={28} />
            </div>
         </button>
      </div>

      {/* Primary Creation Cards */}
      <div className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <button 
            onClick={onCreateQuizAI}
            className="group relative flex flex-col items-start justify-between p-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] shadow-2xl shadow-emerald-900/20 hover:shadow-emerald-500/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden text-left border border-white/20"
          >
            <div className="absolute top-[-10%] right-[-10%] p-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 w-full">
              <div className="flex justify-between items-start w-full mb-6">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:rotate-6 transition-transform">
                   <Sparkles className="text-white" size={32} />
                 </div>
                 <div className="px-4 py-1.5 bg-white/20 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                   AI Powered
                 </div>
              </div>
              <h3 className="text-3xl font-black text-white mb-2 leading-tight">Instant Generation</h3>
              <p className="text-emerald-50 text-sm font-medium opacity-80 max-w-[80%]">Define any topic and Gemini will craft a professional challenge for you in seconds.</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all bg-white/10 px-6 py-3 rounded-2xl border border-white/5">
              <span>Start Generator</span>
              <ChevronRight size={18} />
            </div>
          </button>

          <button
            onClick={onCreateQuizManual}
            className="group relative flex flex-col items-start justify-between p-10 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] shadow-2xl shadow-black/30 hover:shadow-black/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden text-left border border-white/5"
          >
            <div className="absolute top-[-10%] right-[-10%] p-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 w-full">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform border border-white/10">
                 <PenTool className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-black text-white mb-2 leading-tight">Expert Builder</h3>
              <p className="text-slate-400 text-sm font-medium max-w-[80%]">Hand-craft precise questions with rich formatting for your specific curriculum.</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
              <span>Enter Builder</span>
              <ChevronRight size={18} />
            </div>
          </button>
      </div>

      {/* Recent Activity Section */}
      {currentUser.history && currentUser.history.length > 0 && (
        <div className="mb-14 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-emerald-100 uppercase tracking-wider flex items-center gap-3">
                <Clock size={20} className="text-emerald-500" />
                Recent Activity
              </h3>
              <button onClick={onViewProfile} className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline">View All History</button>
            </div>
            
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 flex flex-col items-center justify-between gap-6 h-full">
              <div className="flex items-center gap-6 w-full">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Challenge</p>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentUser.history[0].quizTitle}</h4>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Score: {currentUser.history[0].score} / {currentUser.history[0].total}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => onReviewQuiz(currentUser.history![0])}
                  className="flex-1 px-8 py-4 bg-emerald-600/10 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 hover:text-white transition-all"
                >
                  Review Quiz
                </button>
                <button 
                  onClick={() => onStudyQuiz(currentUser.history![0])}
                  className="flex-1 px-8 py-4 bg-violet-600/10 text-violet-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-violet-600 hover:text-white transition-all"
                >
                  Study Mode
                </button>
              </div>
            </div>
          </div>

          <DailyMissions user={currentUser} onUpdate={onUpdateUser} />
        </div>
      )}

      {/* Explore Section */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <h3 className="text-2xl font-black text-slate-800 dark:text-emerald-100 tracking-tight flex items-center gap-3">
            <LayoutGrid size={24} className="text-emerald-500" />
            Explore Challenges
          </h3>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-emerald-400/60 border-slate-200 dark:border-white/10 hover:border-emerald-500/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-[320px] bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-[2rem] animate-pulse border border-white/20"></div>
            ))
          ) : filteredQuizzes.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-panel rounded-[2.5rem] border border-dashed border-slate-300 dark:border-emerald-900/40">
               <HelpCircle className="mx-auto text-slate-300 dark:text-emerald-900 mb-4" size={48} />
               <p className="text-slate-500 dark:text-emerald-400/60 font-bold">No quizzes found in this category.</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz, idx) => (
              <div 
                key={quiz._id} 
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:border-emerald-500/30 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full min-h-[320px] relative overflow-hidden"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                 <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                 
                 <div className="flex justify-between items-start mb-6 relative z-10">
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                        quiz.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 
                        quiz.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : 
                        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                      }`}>
                        {quiz.difficulty}
                   </span>
                   <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-emerald-400/40 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                      <LayoutGrid size={18} />
                   </div>
                 </div>
                 
                 <div className="mb-auto relative z-10">
                   <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2">{quiz.category}</div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{quiz.title}</h3>
                   <p className="text-slate-500 dark:text-emerald-200/60 text-sm line-clamp-3 leading-relaxed font-medium">{quiz.description}</p>
                 </div>

                 <div className="pt-8 mt-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 relative z-10">
                   <div className="flex items-center gap-1.5 text-slate-400 dark:text-emerald-400/40 text-xs font-black uppercase tracking-widest whitespace-nowrap shrink-0">
                     <Clock size={14} />
                     <span>{quiz.duration || 5} Min</span>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => onShareQuiz(quiz)}
                         className="flex items-center justify-center p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-all"
                         title="Share Challenge"
                       >
                         <Share2 size={18} />
                       </button>
                       {(currentUser?.role === 'Admin' || quiz.createdBy === currentUser?._id) && (
                         <>
                           <button 
                             onClick={() => onEditQuiz(quiz)}
                             className="flex items-center justify-center p-2.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-xl transition-all"
                             title="Edit Challenge"
                           >
                             <Edit3 size={18} />
                           </button>
                           <button 
                             onClick={() => onDeleteQuiz(quiz)}
                             className="flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/5 rounded-xl transition-all"
                             title="Delete Challenge"
                           >
                             <Trash2 size={18} />
                           </button>
                         </>
                       )}
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => onExamQuiz(quiz)}
                         title="Competitive Exam Mode"
                         className="px-6 py-3 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-rose-500/20 text-xs font-black uppercase tracking-widest rounded-[1.25rem] shadow-sm hover:border-rose-500 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all flex items-center gap-2 transform active:scale-95"
                       >
                         <ShieldAlert size={16} /> Exam
                       </button>
                       <button 
                        onClick={() => onSelectQuiz(quiz)}
                        className="px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 transform active:scale-90"
                       >
                         <Play size={16} fill="currentColor" /> Play
                       </button>
                     </div>
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import ReviewView from './components/ReviewView';
import StudyMode from './components/StudyMode';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeHistory, setActiveHistory] = useState<QuizHistory | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [resultData, setResultData] = useState<{score: number, total: number, id: string} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [lastQuizUpdate, setLastQuizUpdate] = useState(Date.now());
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedQuizId = urlParams.get('quizId');
    if (sharedQuizId && quizzes.length > 0 && currentUser && view === 'HOME') {
      const quizToPlay = quizzes.find(q => q._id === sharedQuizId);
      if (quizToPlay) {
        setActiveQuiz(quizToPlay);
        setView('QUIZ');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [quizzes, currentUser, view]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        setView('HOME');
      } else {
        setView('LANDING');
      }
      setLoadingSession(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoadingQuizzes(true);
    const unsubscribe = subscribeToQuizzes((data) => {
      setQuizzes(data);
      setLoadingQuizzes(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setView('HOME');
  };

  const handleGuestLogin = async () => {
    try {
      const user = await loginAsGuest();
      handleLoginSuccess(user);
    } catch (error) {
      console.error("Guest login failed", error);
    }
  };

  const handleAuthAction = async () => {
    await logout();
    setCurrentUser(null);
    setView('LANDING');
  };

  const handleAuthCancel = () => {
    if (currentUser) {
      setView('HOME');
    } else {
      setView('LANDING');
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#06110f]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-600"></div>
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 animate-pulse" size={24} fill="currentColor" />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'LANDING':
        return <Landing onGetStarted={() => setView('AUTH')} onGuestLogin={handleGuestLogin} />;
      case 'AUTH':
        return <Auth onSuccess={handleLoginSuccess} onCancel={handleAuthCancel} />;
      case 'HOME':
        if (!currentUser) return <Landing onGetStarted={() => setView('AUTH')} onGuestLogin={handleGuestLogin} />;
        return (
          <>
            <Dashboard 
              onSelectQuiz={(q) => { setActiveQuiz(q); setView('QUIZ'); }}
              onExamQuiz={(q) => { setActiveQuiz(q); setView('EXAM'); }}
              onEditQuiz={(q) => { setEditingQuiz(q); setView('CREATE_MANUAL'); }}
              onDeleteQuiz={async (q) => {
                if (window.confirm('Are you sure you want to delete this quiz?')) {
                  try {
                    console.log('Deleting quiz:', q._id);
                    await deleteQuiz(q._id);
                    setLastQuizUpdate(Date.now());
                  } catch (error) {
                    console.error('Failed to delete quiz:', error);
                    alert('Failed to delete quiz. Please try again.');
                  }
                }
              }}
              onShareQuiz={(q) => {
                 const link = `${window.location.origin}/?quizId=${q._id}`;
                 navigator.clipboard.writeText(link).then(() => {
                   alert('Challenge link copied to clipboard! Share it with your friends.');
                 }).catch(err => {
                   console.error('Failed to copy link', err);
                   alert(`Share this link: ${link}`);
                 });
              }}
              onViewLeaderboard={() => setView('LEADERBOARD')}
              onViewClassroom={() => setView('CLASSROOM')}
              onViewAnalytics={() => setView('ANALYTICS')}
              onCreateQuizAI={() => setShowAIModal(true)}
              onCreateQuizManual={() => { setEditingQuiz(null); setView('CREATE_MANUAL'); }}
              onViewProfile={() => setView('PROFILE')}
              onAuthAction={handleAuthAction}
              onReviewQuiz={(history) => {
                const quiz = quizzes.find(q => q._id === history.quizId);
                if (quiz) {
                  setActiveQuiz(quiz);
                  setActiveHistory(history);
                  setView('REVIEW');
                }
              }}
              onStudyQuiz={(history) => {
                const quiz = quizzes.find(q => q._id === history.quizId);
                if (quiz) {
                  setActiveQuiz(quiz);
                  setView('STUDY');
                }
              }}
              onUpdateUser={(user) => setCurrentUser(user)}
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              quizzes={quizzes}
              loading={loadingQuizzes}
              lastUpdate={lastQuizUpdate}
            />
            {showAIModal && (
              <CreateQuizModal 
                onCancel={() => setShowAIModal(false)}
                onSuccess={async (quiz) => {
                  await saveQuiz(quiz);
                  setShowAIModal(false);
                  setLastQuizUpdate(Date.now());
                }}
              />
            )}
          </>
        );
      case 'QUIZ':
        if (!activeQuiz) return <div>No quiz selected</div>;
        return (
          <QuizPlayer 
            quiz={activeQuiz} 
            onComplete={(id, score, total) => {
              setResultData({ id, score, total });
              setView('RESULT');
            }}
            onExit={() => setView('HOME')}
          />
        );
      case 'EXAM':
        if (!activeQuiz || !currentUser) return <div>Invalid state</div>;
        return (
          <ExamPlayer 
            quiz={activeQuiz} 
            userId={currentUser._id} 
            onExit={() => { setView('HOME'); }}
          />
        );
      case 'RESULT':
        if (!activeQuiz || !resultData) return null;
        return (
          <ResultView 
            score={resultData.score} 
            total={resultData.total} 
            title={activeQuiz.title} 
            onHome={() => { 
              setActiveQuiz(null); 
              setLastQuizUpdate(Date.now()); // Refresh stats on home
              setView('HOME'); 
            }} 
            onReview={() => {
              const history = currentUser?.history?.find(h => h.quizId === activeQuiz._id);
              if (history) {
                setActiveHistory(history);
                setView('REVIEW');
              } else {
                setView('HOME');
              }
            }}
            onStudy={() => setView('STUDY')}
          />
        );
      case 'LEADERBOARD':
        return <Leaderboard onBack={() => setView('HOME')} currentUser={currentUser} />;
      case 'CLASSROOM':
        if (!currentUser) return null;
        return (
          <ClassDashboard 
            currentUser={currentUser} 
            onBack={() => setView('HOME')} 
            onSelectQuiz={(quizId) => {
              const quiz = quizzes.find(q => q._id === quizId);
              if (quiz) {
                setActiveQuiz(quiz);
                setView('QUIZ');
              }
            }}
            allQuizzes={quizzes}
          />
        );
      case 'ANALYTICS':
        if (!currentUser) return null;
        return <AnalyticsDashboard currentUser={currentUser} onBack={() => setView('HOME')} />;
      case 'PROFILE':
        if (!currentUser) return null;
        return (
          <Profile 
            user={currentUser} 
            onBack={() => setView('HOME')}
            onUpdate={(updatedUser) => setCurrentUser(updatedUser)} 
            onReviewQuiz={(history) => {
              const quiz = quizzes.find(q => q._id === history.quizId);
              if (quiz) {
                setActiveQuiz(quiz);
                setActiveHistory(history);
                setView('REVIEW');
              }
            }}
            onStudyQuiz={(history) => {
              const quiz = quizzes.find(q => q._id === history.quizId);
              if (quiz) {
                setActiveQuiz(quiz);
                setView('STUDY');
              }
            }}
          />
        );

      case 'REVIEW':
        if (!activeQuiz || !activeHistory) return null;
        return (
          <ReviewView 
            quiz={activeQuiz} 
            history={activeHistory} 
            onBack={() => setView('HOME')} 
          />
        );

      case 'STUDY':
        if (!activeQuiz) return null;
        return (
          <StudyMode 
            quiz={activeQuiz} 
            onBack={() => setView('HOME')} 
          />
        );
      case 'CREATE_MANUAL':
        return (
          <ManualQuizCreator 
            initialQuiz={editingQuiz}
            onCancel={() => setView('HOME')}
            onSave={async (quiz) => {
              await saveQuiz(quiz);
              setLastQuizUpdate(Date.now());
              setView('HOME');
            }}
          />
        );
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark bg-[#06110f]' : 'bg-slate-50'}`}>
       {renderContent()}
    </div>
  );
};

export default App;
