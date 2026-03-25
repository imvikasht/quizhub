import React, { useState, useMemo } from 'react';
import { User, QuizHistory } from '../types';
import { updateUserProfile } from '../services/firebaseService';
import { 
  ArrowLeft, Mail, Building2, User as UserIcon, 
  Award, Star, Edit2, Save, X, Camera, 
  Target, Flame, CheckCircle2, Loader2, 
  History, TrendingUp, Share2, ShieldCheck, 
  Trophy, Zap, Medal, Lock, ShieldAlert,
  ChevronDown, ChevronUp, FastForward, FlaskConical, Terminal
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onBack: () => void;
  onUpdate: (user: User) => void;
  onReviewQuiz?: (history: QuizHistory) => void;
  onStudyQuiz?: (history: QuizHistory) => void;
}

const BADGE_MAP: Record<string, { icon: any, color: string, description: string, bg: string }> = {
  'Veteran': { 
    icon: Award, 
    color: 'text-amber-500', 
    bg: 'bg-amber-500/10',
    description: 'Awarded for completing over 10 quizzes. A true master of persistence.' 
  },
  'Fast Learner': { 
    icon: FastForward, 
    color: 'text-sky-500', 
    bg: 'bg-sky-500/10',
    description: 'Completed a quiz in record time. Your reflexes are sharp!' 
  },
  'Scientist': { 
    icon: FlaskConical, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10',
    description: 'Demonstrated exceptional knowledge in the Science category.' 
  },
  'Code Breaker': { 
    icon: Terminal, 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-500/10',
    description: 'Programming wizard! You have mastered logic and syntax.' 
  },
  'Speedster': { 
    icon: Zap, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/10',
    description: 'Lightning fast responses across multiple challenges.' 
  },
  'Sharpshooter': { 
    icon: Target, 
    color: 'text-rose-500', 
    bg: 'bg-rose-500/10',
    description: 'Maintained 90%+ accuracy across all your attempts.' 
  }
};

const Profile: React.FC<ProfileProps> = ({ user, onBack, onUpdate, onReviewQuiz, onStudyQuiz }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Edit Profile State
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [organization, setOrganization] = useState(user.organization || '');
  const [role, setRole] = useState(user.role || 'Student');
  const [avatarSeed, setAvatarSeed] = useState(user.username);

  // Change Password State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const levelInfo = useMemo(() => {
    const level = Math.floor(user.totalScore / 500) + 1;
    const progress = (user.totalScore % 500) / 5; // 0 to 100
    const titles = ["Novice", "Scholar", "Expert", "Elite", "Grandmaster", "Legend", "Immortal"];
    return {
      level,
      progress,
      title: titles[Math.min(level - 1, titles.length - 1)],
      xpToNext: 500 - (user.totalScore % 500)
    };
  }, [user.totalScore]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
      const updatedUser = await updateUserProfile(user._id, {
        username, email, organization, role, avatarUrl
      });
      onUpdate(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePassChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('Password change is managed by your identity provider (Google).');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleShare = () => {
    alert("Profile card image generated! Copying link to clipboard... (Mock)");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 animate-slide-up relative z-10 pb-24">
      
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-40">
        <div className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[140px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] left-[-15%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[140px] animate-pulse"></div>
      </div>

      {/* Hero Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-slate-600 dark:text-emerald-400 shadow-xl hover:shadow-emerald-500/20 transition-all border border-white/20 active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
              Player HQ
              {user.role === 'Teacher' && <ShieldCheck className="text-indigo-500" size={28} />}
            </h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">Command & Analytics Center</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-white/5 text-slate-700 dark:text-emerald-100 rounded-2xl font-black shadow-lg border border-white/20 hover:-translate-y-1 transition-all active:scale-95 text-sm uppercase tracking-widest"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Share Card</span>
          </button>

          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-500/20 hover:-translate-y-1 transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              <Edit2 size={18} />
              <span>Modify</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                title="Cancel"
              >
                <X size={20} />
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-500/40 hover:-translate-y-1 transition-all active:scale-95 text-sm uppercase tracking-widest"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Sync</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* PLAYER CARD (Sidebar) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white dark:border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-500 to-violet-500 opacity-20"></div>
             
             <div className="relative mt-4 mb-8">
               <div className="w-48 h-48 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-violet-500/20 p-1.5 border-[6px] border-white dark:border-slate-800 shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-700 relative z-10">
                  <img 
                    src={isEditing ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}` : (user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
               </div>
               {isEditing && (
                 <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800 z-20 cursor-pointer animate-bounce">
                   <Camera size={20} />
                 </div>
               )}
             </div>

             <div className="relative z-10 w-full">
               {isEditing ? (
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] block mb-2 text-left ml-2 text-xs">Avatar DNA</label>
                     <input 
                       value={avatarSeed}
                       onChange={(e) => setAvatarSeed(e.target.value)}
                       className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-emerald-950/20 rounded-2xl border border-slate-200 dark:border-emerald-800/30 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                       placeholder="Mutation string..."
                     />
                   </div>
                 </div>
               ) : (
                 <>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{user.username}</h3>
                   <div className="flex flex-wrap justify-center gap-2 mb-8">
                      <span className="bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 flex items-center gap-2">
                        <Star size={12} fill="currentColor" />
                        {user.role}
                      </span>
                      <span className="bg-violet-500/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-violet-500/10">
                        {levelInfo.title}
                      </span>
                   </div>
                   
                   <div className="bg-slate-50/50 dark:bg-white/5 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5">
                     <div className="flex justify-between items-end mb-3">
                        <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Rank Progression</p>
                          <p className="text-xl font-black text-slate-900 dark:text-white leading-none">Level {levelInfo.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-none">{Math.round(levelInfo.progress)}%</p>
                        </div>
                     </div>
                     <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${levelInfo.progress}%` }}
                        ></div>
                     </div>
                     <p className="text-[9px] font-bold text-slate-500 dark:text-emerald-400/50 uppercase tracking-[0.1em]">{levelInfo.xpToNext} XP to Rank {levelInfo.level + 1}</p>
                   </div>
                 </>
               )}
             </div>
          </div>

          {/* Skill Mastery */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white dark:border-white/5 shadow-sm">
             <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
               <TrendingUp size={20} className="text-emerald-500" />
               Category Proficiency
             </h4>
             <div className="space-y-6">
                {(user.categoryStats && user.categoryStats.length > 0) ? user.categoryStats.map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black text-slate-500 dark:text-emerald-100 uppercase tracking-widest">{stat.name}</span>
                       <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{stat.mastery}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
                         style={{ width: `${stat.mastery}%` }}
                       ></div>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 font-bold italic py-4 text-center">Complete quizzes to analyze mastery.</p>
                )}
             </div>
          </div>
        </div>

        {/* MAIN ANALYTICS */}
        <div className="lg:col-span-8 space-y-10">
           
           {/* Top Stats Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-panel p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 text-center group hover:scale-105 transition-transform duration-500">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                    <Target size={24} />
                 </div>
                 <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{user.accuracy || 0}%</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
              </div>
              <div className="glass-panel p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 text-center group hover:scale-105 transition-transform duration-500">
                 <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto mb-4 group-hover:bg-violet-500 group-hover:text-white transition-all shadow-lg shadow-violet-500/10">
                    <CheckCircle2 size={24} />
                 </div>
                 <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{user.quizzesCompleted || 0}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solved</p>
              </div>
              <div className="glass-panel p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 text-center group hover:scale-105 transition-transform duration-500">
                 <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg shadow-orange-500/10">
                    <Flame size={24} fill="currentColor" />
                 </div>
                 <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{user.streak || 0}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streak</p>
              </div>
              <div className="glass-panel p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 text-center group hover:scale-105 transition-transform duration-500">
                 <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-lg shadow-amber-500/10">
                    <Trophy size={24} />
                 </div>
                 <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">Elite</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Player Rank</p>
              </div>
           </div>

           {/* Credentials Section */}
           <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-12 border border-white dark:border-white/5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-40 bg-emerald-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-12 flex items-center gap-4 relative z-10">
                <div className="p-3.5 bg-emerald-500/10 rounded-[1.25rem] text-emerald-600">
                  <UserIcon size={24} />
                </div>
                Player Credentials
              </h3>

              <div className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-4 ml-1">Identity Handle</label>
                    {isEditing ? (
                      <input 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-6 py-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-slate-200 dark:border-emerald-800/30 font-black text-lg focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                      />
                    ) : (
                      <div className="font-black text-slate-900 dark:text-white text-3xl px-1 tracking-tight">{user.username}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-4 ml-1">Encrypted Mail</label>
                    {isEditing ? (
                      <input 
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-6 py-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-slate-200 dark:border-emerald-800/30 font-black text-lg focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                      />
                    ) : (
                      <div className="flex items-center gap-4 text-slate-800 dark:text-emerald-50 font-black bg-slate-100/50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/5">
                        <Mail size={18} className="text-emerald-500" />
                        <span className="truncate">{user.email || "No email linked"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div>
                    <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-4 ml-1">Affiliated Organization</label>
                     {isEditing ? (
                      <input 
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        className="w-full px-6 py-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-slate-200 dark:border-emerald-800/30 font-black text-lg focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                        placeholder="Institute name..."
                      />
                    ) : (
                      <div className="flex items-center gap-4 font-black text-slate-800 dark:text-white text-xl px-1 tracking-tight">
                        <Building2 size={24} className="text-indigo-500" />
                        {user.organization || 'Independent operative'}
                      </div>
                    )}
                   </div>
                   <div>
                    <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-4 ml-1">Operative Rank</label>
                    {isEditing ? (
                       <select 
                         value={role}
                         onChange={e => setRole(e.target.value as any)}
                         className="w-full px-6 py-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-slate-200 dark:border-emerald-800/30 font-black text-lg focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                       >
                         <option value="Student">Cadet (Student)</option>
                         <option value="Teacher">Overseer (Teacher)</option>
                         <option value="Admin">Architect (Admin)</option>
                       </select>
                    ) : (
                      <div className="font-black text-slate-800 dark:text-white text-xl px-1 flex items-center gap-4 tracking-tight">
                         <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-md">
                           <Zap size={20} fill="currentColor" />
                         </div>
                         {user.role}
                      </div>
                    )}
                   </div>
                </div>
              </div>
           </div>

           {/* Security Settings (Change Password) - Hidden for Firebase Auth */}
           {false && (
             <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-12 border border-white dark:border-white/5 shadow-sm relative overflow-hidden">
              <button 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="w-full flex items-center justify-between group"
              >
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4 relative z-10">
                  <div className="p-3.5 bg-rose-500/10 rounded-[1.25rem] text-rose-600">
                    <Lock size={24} />
                  </div>
                  Security Protocol
                </h3>
                {showPasswordChange ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
              </button>

              {showPasswordChange && (
                <div className="mt-12 animate-fade-in relative z-10">
                  <div className="bg-rose-500/5 rounded-3xl p-8 border border-rose-500/10">
                    <div className="flex items-center gap-3 mb-8 text-rose-600 dark:text-rose-400">
                      <ShieldAlert size={20} />
                      <p className="text-sm font-bold uppercase tracking-widest">Update Authorization Key</p>
                    </div>

                    <form onSubmit={handlePassChange} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Current Pass</label>
                          <input 
                            type="password"
                            required
                            value={passForm.current}
                            onChange={e => setPassForm({...passForm, current: e.target.value})}
                            className="w-full px-6 py-4 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/10 font-bold focus:ring-4 focus:ring-rose-500/10 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">New Pass</label>
                          <input 
                            type="password"
                            required
                            value={passForm.new}
                            onChange={e => setPassForm({...passForm, new: e.target.value})}
                            className="w-full px-6 py-4 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/10 font-bold focus:ring-4 focus:ring-rose-500/10 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Confirm New</label>
                          <input 
                            type="password"
                            required
                            value={passForm.confirm}
                            onChange={e => setPassForm({...passForm, confirm: e.target.value})}
                            className="w-full px-6 py-4 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/10 font-bold focus:ring-4 focus:ring-rose-500/10 outline-none"
                          />
                        </div>
                      </div>

                      {passError && <p className="text-rose-600 text-xs font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{passError}</p>}
                      {passSuccess && <p className="text-emerald-600 text-xs font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">{passSuccess}</p>}

                      <div className="flex justify-end">
                        <button 
                          type="submit"
                          disabled={passLoading}
                          className="px-10 py-4 bg-slate-900 dark:bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {passLoading ? <Loader2 className="animate-spin" /> : 'Commit Password Change'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
           </div>
          )}

           {/* TROPHY CASE (Upgraded visuals and Tooltips) */}
           <div className="bg-slate-950 dark:bg-black rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-40 bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-all duration-700"></div>
              
              <h3 className="text-2xl font-black text-white mb-12 flex items-center gap-4 relative z-10">
                <div className="p-3.5 bg-amber-500/20 rounded-[1.25rem] text-amber-400">
                  <Award size={26} />
                </div>
                Decorations & Achievements
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
                 {user.badgesArray.length > 0 ? user.badgesArray.map((badgeName, i) => {
                   const config = BADGE_MAP[badgeName] || { icon: Star, color: 'text-slate-400', bg: 'bg-slate-400/10', description: 'A mysterious mark of honor.' };
                   const BadgeIcon = config.icon;

                   return (
                     <div key={i} className="group relative flex flex-col items-center gap-4 cursor-help">
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full mb-4 w-48 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 scale-90 group-hover:scale-100 z-50 border border-slate-100 dark:border-white/10">
                           <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">{badgeName}</p>
                           <p className="text-[10px] text-slate-500 dark:text-slate-300 leading-relaxed font-medium">{config.description}</p>
                           <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 rotate-45 -mt-2 border-r border-b border-slate-100 dark:border-white/10"></div>
                        </div>

                        <div className={`w-24 h-24 rounded-[2rem] ${config.bg} border border-white/5 flex items-center justify-center shadow-2xl transition-all duration-500 relative group-hover:scale-110 group-hover:-rotate-6 overflow-hidden`}>
                           <div className={`absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                           <BadgeIcon size={48} className={`${config.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
                        </div>
                        <span className={`text-[11px] font-black text-white/60 group-hover:text-white uppercase tracking-widest text-center transition-colors`}>{badgeName}</span>
                     </div>
                   );
                 }) : (
                   <div className="col-span-full py-10 text-center text-slate-500 font-black italic tracking-widest opacity-60">
                      NO DECORATIONS EARNED. COMPLETE CHALLENGES TO UNLOCK.
                   </div>
                 )}
                 {/* Locked Slots */}
                 {[...Array(Math.max(0, 8 - user.badgesArray.length))].map((_, i) => (
                    <div key={`lock-${i}`} className="flex flex-col items-center gap-4 opacity-10">
                      <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                        <ShieldCheck size={32} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Locked</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Mastery Log Section */}
           <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] p-12 border border-white dark:border-white/5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4">
                <div className="p-3.5 bg-violet-500/10 rounded-[1.25rem] text-violet-600">
                  <History size={26} />
                </div>
                Mastery Log
              </h3>
              
              <div className="space-y-6">
                 {user.history && user.history.length > 0 ? user.history.map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${log.score / log.total >= 0.8 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                           {log.score / log.total >= 0.8 ? <Zap size={24} fill="currentColor" /> : <Medal size={24} />}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{log.quizTitle}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{log.category}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(log.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="text-right mr-4">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{log.score}<span className="text-sm text-slate-400 ml-1">/ {log.total}</span></p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${log.score / log.total >= 0.8 ? 'text-emerald-500' : 'text-slate-400'}`}>
                               {log.score / log.total >= 0.8 ? 'Mastered' : 'Completed'}
                            </p>
                         </div>
                         <div className="flex flex-col gap-2">
                           <button 
                             onClick={() => onReviewQuiz?.(log)}
                             className="px-4 py-2 bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                           >
                             Review
                           </button>
                           <button 
                             onClick={() => onStudyQuiz?.(log)}
                             className="px-4 py-2 bg-violet-600/10 text-violet-600 hover:bg-violet-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                           >
                             Study
                           </button>
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-16 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-slate-300 dark:border-emerald-900/40">
                      <History size={48} className="mx-auto text-slate-300 dark:text-emerald-900/20 mb-4" />
                      <p className="text-slate-500 dark:text-emerald-400/50 font-black uppercase tracking-widest">No activity recorded</p>
                   </div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;