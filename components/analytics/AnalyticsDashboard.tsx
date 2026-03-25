import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, Cell 
} from 'recharts';
import { User } from '../../types';
import { getUserAnalytics } from '../../services/analyticsService';
import { 
  BarChart2, TrendingUp, Target, Clock, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Sparkles, LayoutPanelLeft 
} from 'lucide-react';

interface Props {
  currentUser: User;
  onBack: () => void;
}

const AnalyticsDashboard: React.FC<Props> = ({ currentUser, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getUserAnalytics(currentUser._id);
        setData(stats);
      } catch (e) {
        console.error("Failed to load analytics:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Calibrating Analytics...</p>
    </div>
  );

  if (!data || data.performanceOverTime.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-fade-in p-8 glass-panel rounded-[3rem]">
      <BarChart2 size={64} className="text-slate-300 dark:text-emerald-500 opacity-20" />
      <div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Insufficient Data Logs</h3>
        <p className="text-slate-500 dark:text-emerald-400/60 max-w-sm font-medium">Play more quizzes to unlock your advanced performance charts and AI insights!</p>
      </div>
      <button 
        onClick={onBack}
        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
      >
        Go Play Now
      </button>
    </div>
  );

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in relative z-10 pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
        <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[15%] left-[5%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse-slow"></div>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-slate-600 dark:text-emerald-400 shadow-xl hover:-translate-y-1 transition-all border border-white/20"
          >
            <LayoutPanelLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Performance Hub</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-Time Growth Analytics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-lg">
           <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl border border-emerald-500/30" />
           <div className="pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase">Analyzing</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{currentUser.username}</p>
           </div>
        </div>
      </header>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {[
           { label: 'Avg Accuracy', value: `${data.avgAccuracy}%`, icon: Target, color: 'emerald' },
           { label: 'Total Mastery', value: data.totalXP.toLocaleString(), xp: true, icon: TrendingUp, color: 'indigo' },
           { label: 'Strong Area', value: data.strongTopic, icon: ArrowUpRight, color: 'sky' },
           { label: 'Requires Focus', value: data.weakTopic, icon: ArrowDownRight, color: 'rose' }
         ].map((stat, i) => (
           <div key={i} className="glass-panel p-6 rounded-[2.5rem] border border-white/20 hover:scale-105 transition-transform group">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 mb-4 group-hover:rotate-12 transition-transform`}>
                 <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate">{stat.value}</h4>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* CHART 1: Growth Path */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Growth Projection</h4>
                <p className="text-xs font-bold text-slate-500 dark:text-emerald-400/60">Accuracy trends over your last matches</p>
              </div>
              <Sparkles className="text-emerald-500 animate-bounce" size={20} />
           </div>
           
           <div className="h-[300px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.performanceOverTime}>
                 <defs>
                   <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                 <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                 <YAxis stroke="#64748b" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                   itemStyle={{ color: '#10b981', fontWeight: 800 }}
                 />
                 <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorAcc)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* CHART 2: Mastery Matrix */}
        <div className="glass-panel p-8 rounded-[3rem] border border-white/20 shadow-2xl">
           <div className="mb-8">
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Mastery Matrix</h4>
              <p className="text-xs font-bold text-slate-500 dark:text-indigo-400/60">Category-level proficiency</p>
           </div>

           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.categoryStats} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis 
                    dataKey="category" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontWeight={900} 
                    width={80}
                  />
                 <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px' }}
                 />
                 <Bar dataKey="accuracy" radius={[0, 10, 10, 0]} barSize={24}>
                    {data.categoryStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* AI Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-panel p-8 rounded-[3rem] border-2 border-emerald-500/20 shadow-xl bg-emerald-500/5 ring-4 ring-emerald-500/5">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
               <AlertCircle size={20} className="text-emerald-500" /> AI Growth Counsel
            </h4>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-white/10 dark:bg-white/5 rounded-xl border border-white/20 flex items-center justify-center text-emerald-500 font-black">?</div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Strongest Pillar</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-white/80 leading-relaxed">
                      You are naturally skilled in <span className="text-emerald-500 font-extrabold">{data.strongTopic}</span>. 
                      Your reasoning speed here is {data.avgAccuracy > 80 ? 'Elite' : 'Stable'}.
                    </p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-white/10 dark:bg-white/5 rounded-xl border border-white/20 flex items-center justify-center text-rose-500 font-black">!</div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Opportunity Gap</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-white/80 leading-relaxed">
                      Focused revision on <span className="text-rose-500 font-extrabold">{data.weakTopic}</span> could accelerate your progress to the next rank.
                    </p>
                  </div>
               </div>
            </div>
         </div>

         <div className="glass-panel p-8 rounded-[3rem] border border-white/20 shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Pace Breakdown</h4>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Thought Cycles per question</p>
            </div>
            
            <div className="flex items-center justify-center gap-8 py-4">
               <div className="text-center">
                  <Clock size={48} className="text-slate-400/20 mx-auto mb-2" />
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {Math.round(data.performanceOverTime.reduce((acc: number, cur: any) => acc + cur.responseTime, 0) / data.performanceOverTime.length)}s
                  </h2>
               </div>
               <div className="w-px h-16 bg-slate-100 dark:bg-white/5"></div>
               <div className="max-w-[150px]">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-bold text-slate-500 dark:text-white/60">Your response velocity is {data.avgAccuracy > 70 ? 'Calculated' : 'Fast, but risky'}.</p>
               </div>
            </div>

            <button 
              onClick={onBack}
              className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Back to Dashboard
            </button>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
