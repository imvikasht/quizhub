import React, { useState } from 'react';
import { Quiz, QuizHistory } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';

interface ReviewViewProps {
  quiz: Quiz;
  history: QuizHistory;
  onBack: () => void;
}

const ReviewView: React.FC<ReviewViewProps> = ({ quiz, history, onBack }) => {
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  const toggleBookmark = (index: number) => {
    setBookmarked(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06110f] p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-emerald-400 font-bold hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{quiz.title}</h1>
            <p className="text-slate-500 dark:text-emerald-400/60 text-sm font-bold uppercase tracking-widest">Review Mode</p>
          </div>
        </header>

        <div className="space-y-6">
          {quiz.questionsArray.map((question, idx) => {
            const analytic = history.analytics?.find(a => a.questionIndex === idx);
            const isCorrect = analytic?.isCorrect;
            const selectedIdx = analytic?.selectedOption ?? -1;

            return (
              <div key={idx} className="glass-panel rounded-[2rem] overflow-hidden border border-white/50 dark:border-white/5 shadow-xl">
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-black text-slate-400 dark:text-emerald-800 uppercase tracking-widest">
                      Question {idx + 1}
                    </span>
                    <div className="flex items-center gap-4">
                      {analytic && (
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-emerald-400/40 text-xs font-bold">
                          <Clock size={14} />
                          <span>{analytic.timeSpent}s</span>
                        </div>
                      )}
                      <button 
                        onClick={() => toggleBookmark(idx)}
                        className={`transition-colors ${bookmarked.includes(idx) ? 'text-emerald-500' : 'text-slate-300 dark:text-emerald-900'}`}
                      >
                        {bookmarked.includes(idx) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                    {question.questionText}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {question.options.map((option, optIdx) => {
                      let statusClass = "border-slate-200 dark:border-white/5 text-slate-600 dark:text-emerald-100/60";
                      let icon = null;

                      if (optIdx === question.correctAnswerIndex) {
                        statusClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold";
                        icon = <CheckCircle2 size={18} className="text-emerald-500" />;
                      } else if (optIdx === selectedIdx && !isCorrect) {
                        statusClass = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold";
                        icon = <XCircle size={18} className="text-rose-500" />;
                      }

                      return (
                        <div key={optIdx} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${statusClass}`}>
                          <span>{option}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="p-5 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-2xl border border-emerald-500/20">
                      <div className="flex items-start gap-3">
                        <Sparkles className="text-emerald-500 shrink-0 mt-1" size={18} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">AI Explanation</p>
                          <p className="text-sm text-slate-700 dark:text-emerald-100/80 leading-relaxed font-medium italic">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewView;
