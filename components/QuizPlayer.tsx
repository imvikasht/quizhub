
import React, { useState, useEffect } from 'react';
import { Quiz, Question, QuestionAnalytics, User } from '../types';
import { submitQuizResult } from '../services/firebaseService';
import { auth } from '../firebase';
import { getAIExplanation } from '../services/geminiService';
import { Timer, CheckCircle, XCircle, ArrowRight, AlertCircle, LogOut, HelpCircle, Sparkles, Loader2 } from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (resultId: string, score: number, total: number, user: User) => void;
  onExit: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState((quiz.duration || 5) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Explanation State
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    if (isSubmitting) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitting]);

  const currentQuestion: Question = quiz.questionsArray[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 10);
    }

    setQuestionAnalytics(prev => [...prev, {
      questionIndex: currentIndex,
      timeSpent,
      isCorrect,
      selectedOption: index
    }]);
  };

  const fetchExplanation = async () => {
    if (loadingExplanation || explanation) return;
    setLoadingExplanation(true);
    try {
      const exp = await getAIExplanation(currentQuestion.questionText, currentQuestion.options, currentQuestion.correctAnswerIndex);
      setExplanation(exp);
    } catch (e) {
      setExplanation("Could not load AI insight at this time.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleNext = () => {
    if (selectedOption === null) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      setAnswers((prev) => [...prev, -1]);
      setQuestionAnalytics(prev => [...prev, {
        questionIndex: currentIndex,
        timeSpent,
        isCorrect: false,
        selectedOption: -1
      }]);
    } else {
      setAnswers((prev) => [...prev, selectedOption]);
    }

    if (currentIndex < quiz.questionsArray.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setExplanation(null);
      setQuestionStartTime(Date.now());
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError("You must be logged in to submit.");
      setIsSubmitting(false);
      return;
    }

    const totalDuration = (quiz.duration || 5) * 60;

    try {
      const response = await submitQuizResult(
        userId,
        quiz._id,
        answers,
        totalDuration - timeRemaining,
        questionAnalytics
      );
      onComplete(response.result._id, response.result.score, quiz.questionsArray.length * 10, response.user);
    } catch (error) {
      console.error("Failed to submit", error);
      alert("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex) / quiz.questionsArray.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* Top Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-2 relative z-10">
        <button 
          onClick={onExit} 
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 dark:text-emerald-100/80 dark:hover:text-emerald-400 transition-colors font-semibold bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Quit Session</span>
        </button>
        
        <div className="bg-white/70 border border-slate-200 text-slate-900 shadow-xl dark:bg-emerald-950/40 dark:backdrop-blur-xl dark:border-emerald-800/30 px-6 py-2.5 rounded-2xl flex items-center gap-3">
          <Timer className="text-emerald-600 dark:text-emerald-400 animate-pulse" size={20} />
          <span className="font-mono font-bold text-slate-900 dark:text-emerald-50 tracking-widest text-lg">{formatTime(timeRemaining)}</span>
        </div>

        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-slate-600 dark:text-emerald-100/80 font-bold">
          <span className="text-emerald-600 dark:text-emerald-400">Q</span> {currentIndex + 1} <span className="text-slate-300 dark:text-emerald-900 mx-1">/</span> {quiz.questionsArray.length}
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-up flex flex-col md:flex-row min-h-[550px] border border-white dark:border-emerald-900/20 relative z-10">
        
        {/* Left Side: Question Context */}
        <div className="w-full md:w-5/12 bg-slate-50/50 dark:bg-emerald-950/10 p-8 md:p-10 border-r border-slate-100 dark:border-emerald-900/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-200 dark:bg-emerald-900/20">
             <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/30 rounded-full text-xs font-black text-slate-500 dark:text-emerald-400 uppercase tracking-[0.2em] mb-8 shadow-sm">
              <Sparkles size={14} className="text-emerald-500" />
              {quiz.category}
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-emerald-50 leading-tight mb-6">
              {currentQuestion.questionText}
            </h2>
            <p className="text-slate-500 dark:text-emerald-400/70 text-base font-medium">Select the most accurate option below.</p>
          </div>

          <div className="mt-8">
            {isAnswered && explanation ? (
              <div className="p-5 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-2xl border border-emerald-500/30 animate-fade-in">
                 <div className="flex items-start gap-3">
                   <Sparkles className="text-emerald-500 shrink-0 mt-1" size={18} />
                   <div>
                     <p className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">AI Insight</p>
                     <p className="text-sm text-slate-800 dark:text-emerald-100 leading-relaxed font-medium italic">
                       "{explanation}"
                     </p>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                 <div className="flex items-start gap-3">
                   <HelpCircle className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-1" size={20} />
                   <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed font-semibold">
                     {isAnswered ? "Curious about the result?" : "Analyze the question context carefully before deciding."}
                   </p>
                 </div>
                 {isAnswered && !explanation && (
                   <button 
                     onClick={fetchExplanation}
                     disabled={loadingExplanation}
                     className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20"
                   >
                     {loadingExplanation ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                     Explain with Gemini AI
                   </button>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Options */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white/40 dark:bg-slate-900/40">
           <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              let optionClass = "w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden ";
              let icon = <span className="w-8 h-8 rounded-xl border-2 border-slate-200 dark:border-emerald-800/50 text-slate-400 dark:text-emerald-700 text-sm font-black flex items-center justify-center group-hover:border-emerald-500 dark:group-hover:border-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all bg-slate-50/50 dark:bg-emerald-950/20">{(idx + 10).toString(36).toUpperCase()}</span>;
              
              if (isAnswered) {
                if (idx === currentQuestion.correctAnswerIndex) {
                  optionClass += "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.3)] z-10 scale-[1.02]";
                  icon = <CheckCircle className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900" size={32} />;
                } else if (idx === selectedOption) {
                  optionClass += "border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 text-rose-900 dark:text-rose-100 shadow-[0_10px_20px_-10px_rgba(244,63,94,0.3)]";
                  icon = <XCircle className="text-rose-500 fill-rose-100 dark:fill-rose-900" size={32} />;
                } else {
                  optionClass += "border-slate-100 dark:border-emerald-950/20 text-slate-400 dark:text-emerald-950 opacity-40 grayscale blur-[1px]";
                }
              } else {
                optionClass += "border-slate-200/60 dark:border-emerald-900/30 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={optionClass}
                >
                  <span className={`font-bold text-lg ${isAnswered ? '' : 'text-slate-700 dark:text-emerald-100 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{option}</span>
                  <div className="shrink-0 ml-4">
                    {icon}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex justify-between items-center h-14">
            <div>
              {!isAnswered && (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-500 dark:text-emerald-100/40 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 group border border-slate-200 dark:border-white/5 hover:border-rose-200 dark:hover:border-rose-500/20"
                >
                  <XCircle size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span>Skip Question</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isAnswered ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-500 dark:hover:bg-emerald-500 text-white pl-8 pr-6 py-4 rounded-2xl font-black shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 transition-all flex items-center gap-3 animate-fade-in transform active:scale-95 group"
                >
                  <span>{currentIndex === quiz.questionsArray.length - 1 ? 'Finish Challenge' : 'Next Question'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="flex items-center gap-3 text-slate-400 dark:text-emerald-800 text-sm font-black uppercase tracking-widest animate-pulse">
                  <AlertCircle size={18} />
                  <span>Select an answer</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizPlayer;
