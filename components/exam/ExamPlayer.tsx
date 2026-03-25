import React, { useState, useEffect } from 'react';
import { Quiz } from '../../types';
import { ExamAttempt } from '../../types/extensions';
import { submitExamAttempt, getExamRankPrediction } from '../../services/examService';
import ExamReport from './ExamReport';
import { Clock, LayoutGrid, CheckCircle, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';

interface Props {
  quiz: Quiz;
  userId: string;
  onExit: () => void;
}

const ExamPlayer: React.FC<Props> = ({ quiz, userId, onExit }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState((quiz.duration || 10) * 60);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Results state
  const [attemptData, setAttemptData] = useState<ExamAttempt | null>(null);
  const [rankData, setRankData] = useState<{ rank: number, percentile: number } | null>(null);

  useEffect(() => {
    if (isSubmitting || attemptData) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitting, attemptData]);

  const handleOptionSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleClearSelection = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentIndex];
    setAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    if (!window.confirm("Are you sure you want to submit the exam? Negative marking will be applied for incorrect answers.")) return;
    
    setIsSubmitting(true);
    try {
      const attempt = await submitExamAttempt(userId, quiz, answers, startTime);
      setAttemptData(attempt);
      
      const rankInfo = await getExamRankPrediction(quiz._id, attempt.finalScore);
      setRankData(rankInfo);
    } catch (e) {
      console.error(e);
      alert('Failed to submit exam!');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (attemptData && rankData) {
    return (
      <ExamReport 
        attempt={attemptData} 
        quiz={quiz} 
        rank={rankData.rank} 
        percentile={rankData.percentile} 
        onHome={onExit} 
      />
    );
  }

  const currentQuestion = quiz.questionsArray[currentIndex];
  // Calculate completion percentage based on time passed
  const totalSeconds = (quiz.duration || 10) * 60;
  const timeProgress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col lg:flex-row gap-8 text-white min-h-screen">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-20">
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-rose-600 rounded-full blur-[140px]"></div>
      </div>

      {/* Main Exam Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="bg-slate-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-between mb-8">
           <div>
             <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
               <ShieldAlert size={14} /> Competitive Mode Active
             </div>
             <h2 className="text-xl font-black text-white tracking-tighter">{quiz.title}</h2>
           </div>
           <div className="text-right">
             <div className="text-2xl font-black text-white font-mono flex items-center justify-end gap-3">
               <Clock size={20} className="text-rose-500 animate-pulse" />
               {formatTime(timeRemaining)}
             </div>
             <div className="w-32 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${timeProgress}%` }}></div>
             </div>
           </div>
        </div>

        {/* Question Panel */}
        <div className="flex-1 bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
           <div>
              <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                Question {currentIndex + 1} of {quiz.questionsArray.length}
              </div>
              <h3 className="text-2xl font-bold leading-relaxed mb-10">
                {currentQuestion?.questionText}
              </h3>
              
              <div className="space-y-4">
                {currentQuestion?.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(i)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-bold ${
                      answers[currentIndex] === i 
                      ? 'bg-rose-500/20 border-rose-500 text-white' 
                      : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="inline-block w-8 font-black opacity-50">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
           </div>

           <div className="mt-12 flex justify-between">
             <button 
               onClick={handleClearSelection}
               disabled={answers[currentIndex] === undefined}
               className="px-6 py-3 font-bold text-slate-400 hover:text-white uppercase tracking-widest text-xs transition-colors disabled:opacity-30 disabled:pointer-events-none"
             >
               Clear Selection
             </button>
             <div className="flex gap-4">
               <button 
                 onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                 disabled={currentIndex === 0}
                 className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30"
               >
                 <ChevronLeft />
               </button>
               <button 
                 onClick={() => setCurrentIndex(prev => Math.min(quiz.questionsArray.length - 1, prev + 1))}
                 disabled={currentIndex === quiz.questionsArray.length - 1}
                 className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30"
               >
                 <ChevronRight />
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* OMR Grid Sidebar */}
      <div className="w-full lg:w-80 bg-slate-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[max-content]">
        <div className="flex items-center gap-3 text-slate-300 font-black uppercase tracking-widest text-sm mb-8 pb-4 border-b border-white/10">
          <LayoutGrid size={18} className="text-indigo-400" /> OMR Navigation
        </div>
        
        <div className="grid grid-cols-5 gap-3 mb-8">
          {quiz.questionsArray.map((_, i) => {
            const isAns = answers[i] !== undefined;
            const isCurr = currentIndex === i;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-full aspect-square rounded-lg flex items-center justify-center font-black text-sm transition-all border-2 ${
                  isCurr 
                  ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/40 z-10 text-white ' + (isAns ? 'bg-emerald-500/30' : 'bg-slate-800')
                  : isAns 
                    ? 'border-transparent bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40' 
                    : 'border-transparent bg-white/5 text-slate-500 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <div className="space-y-3 mb-10">
           <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <div className="w-4 h-4 rounded bg-emerald-500/20 border-2 border-emerald-500/50"></div> Answered
           </div>
           <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <div className="w-4 h-4 rounded bg-white/5 border-2 border-transparent"></div> Unattempted
           </div>
        </div>

        <button 
          onClick={handleSubmitExam}
          disabled={isSubmitting}
          className="mt-auto w-full py-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
           {isSubmitting ? 'Processing...' : <><CheckCircle size={18} /> Submit Exam</>}
        </button>
      </div>

    </div>
  );
};

export default ExamPlayer;
