import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { subscribeToLeaderboard } from '../services/firebaseService';
import { Trophy, Medal, Crown, ArrowLeft, Star } from 'lucide-react';

const Leaderboard: React.FC<{ onBack: () => void; currentUser: User | null }> = ({ onBack, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getAvatar = (user: User) => {
    return user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Global Leaderboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top 3 Podium Cards */}
        {!loading && users.length >= 3 && (
          <>
            {/* 2nd Place */}
            <div className="order-2 lg:order-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-b-4 border-slate-300 dark:border-slate-600 flex flex-col items-center transform lg:translate-y-4">
              <div className="relative mb-4">
                 <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-600 shadow-md flex items-center justify-center overflow-hidden">
                    <img src={getAvatar(users[1])} alt={users[1].username} className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold border-2 border-white dark:border-slate-800">2</div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{users[1].username}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-mono font-semibold">{users[1].totalScore.toLocaleString()} XP</p>
            </div>

            {/* 1st Place */}
            <div className="order-1 lg:order-2 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/30 dark:to-slate-800/90 rounded-2xl p-6 shadow-xl border-b-4 border-amber-400 dark:border-amber-600 flex flex-col items-center transform scale-105 z-10 relative">
               <div className="absolute -top-6 text-amber-400 drop-shadow-sm">
                 <Crown size={40} fill="currentColor" />
               </div>
               <div className="relative mb-4 mt-2">
                 <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/50 border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                    <img src={getAvatar(users[0])} alt={users[0].username} className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800">1</div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">{users[0].username}</h3>
              <p className="text-amber-600 dark:text-amber-400 font-mono font-bold text-lg">{users[0].totalScore.toLocaleString()} XP</p>
            </div>

            {/* 3rd Place */}
            <div className="order-3 lg:order-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-b-4 border-orange-300 dark:border-orange-700 flex flex-col items-center transform lg:translate-y-8">
              <div className="relative mb-4">
                 <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 border-4 border-white dark:border-slate-600 shadow-md flex items-center justify-center overflow-hidden">
                    <img src={getAvatar(users[2])} alt={users[2].username} className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-300 dark:bg-orange-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800">3</div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{users[2].username}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-mono font-semibold">{users[2].totalScore.toLocaleString()} XP</p>
            </div>
          </>
        )}
      </div>

      {/* List for the rest */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden animate-slide-up border border-transparent dark:border-slate-700">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading rankings...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-24">Rank</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Player</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.slice(3).map((user, index) => {
                const realRank = index + 4;
                const isMe = currentUser && user._id === currentUser._id;
                return (
                  <tr key={user._id} className={`transition-colors ${isMe ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-400 dark:text-slate-500 text-sm">#{realRank}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>
                           <img src={getAvatar(user)} alt={user.username} className="w-full h-full object-cover" />
                         </div>
                         <div>
                           <div className={`font-semibold text-sm ${isMe ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-200'}`}>
                             {user.username} {isMe && '(You)'}
                           </div>
                           <div className="flex gap-1 mt-1">
                             {user.badgesArray.map(badge => (
                               <span key={badge} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded border border-slate-200 dark:border-slate-600">
                                 <Star size={8} className="fill-slate-400 dark:fill-slate-500 text-slate-400 dark:text-slate-500" />
                                 {badge}
                               </span>
                             ))}
                           </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {user.totalScore.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;