import React from 'react';
import { Trophy, Medal, BookOpen, Search, ArrowRight } from 'lucide-react';

interface ResultViewProps {
  score: number;
  total: number;
  title: string;
  onHome: () => void;
  onReview?: () => void;
  onStudy?: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ score, total, title, onHome, onReview, onStudy }) => {
  const percentage = Math.round((score / total) * 100);
  let message = "Good effort!";
  let icon = <Trophy size={48} className="text-slate-400" />;
  
  if (percentage >= 90) {
    message = "Outstanding!";
    icon = <Trophy size={48} className="text-amber-500" />;
  } else if (percentage >= 70) {
    message = "Great Job!";
    icon = <Medal size={48} className="text-slate-400" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-100 dark:border-emerald-900/30">
        <div className="flex justify-center mb-6">
           <div className="p-4 bg-slate-50 dark:bg-emerald-950/20 rounded-full shadow-inner">
             {icon}
           </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{message}</h2>
        <p className="text-slate-500 dark:text-emerald-400 mb-6">You completed <strong>{title}</strong></p>
        
        <div className="bg-slate-50 dark:bg-emerald-950/30 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-emerald-900/30">
           <div className="text-sm text-slate-400 dark:text-emerald-600 uppercase font-bold tracking-wider mb-1">Your Score</div>
           <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 mb-2">{score}</div>
           <div className="text-slate-400 dark:text-emerald-500 font-medium">out of {total} points</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={onReview}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
          >
            <Search size={18} />
            Review
          </button>
          <button 
            onClick={onStudy}
            className="flex items-center justify-center gap-2 py-3 bg-violet-500/10 text-violet-600 font-bold rounded-xl hover:bg-violet-500 hover:text-white transition-all border border-violet-500/20"
          >
            <BookOpen size={18} />
            Study
          </button>
        </div>

        <button 
          onClick={onHome}
          className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          Back to Dashboard
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ResultView;