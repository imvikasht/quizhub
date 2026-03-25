import React from 'react';
import { Zap, BrainCircuit, Trophy, Users, ArrowRight, Sparkles, Globe, Shield } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onGuestLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onGuestLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06110f] overflow-hidden relative selection:bg-emerald-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-400/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-400/40 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-rose-400/30 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">QuizHub</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onGuestLogin}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-white transition-colors"
          >
            <Globe size={16} />
            Explore as Guest
          </button>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:shadow-emerald-500/40 transition-all active:scale-95"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md mb-8 animate-fade-in">
          <Sparkles className="text-emerald-500" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-emerald-200">AI-Powered Learning Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[1.1] animate-slide-up" style={{ animationDelay: '100ms' }}>
          Master Anything with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-violet-500">Intelligent Quizzes</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
          Generate custom quizzes instantly using AI, track your progress, compete on the global leaderboard, and accelerate your learning journey.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            Start Learning Now
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={onGuestLogin}
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <Globe size={18} />
            Try as Guest
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-panel p-8 rounded-[2rem] border border-white/50 dark:border-white/5 hover:border-emerald-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">AI Generation</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Instantly create comprehensive quizzes on any topic using advanced AI. Just type what you want to learn.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-[2rem] border border-white/50 dark:border-white/5 hover:border-violet-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <Trophy size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Global Leaderboard</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Compete with learners worldwide. Earn XP, build your streak, and climb the ranks to prove your mastery.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-[2rem] border border-white/50 dark:border-white/5 hover:border-rose-500/30 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 group-hover:scale-110 transition-transform">
              <Shield size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Smart Analytics</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Track your accuracy across different categories. Review past quizzes and focus on areas that need improvement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
