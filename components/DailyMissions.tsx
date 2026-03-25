import React, { useState } from 'react';
import { Mission, User } from '../types';
import { claimMissionReward } from '../services/firebaseService';
import { Target, CheckCircle2, Gift, Zap, Loader2, Trophy } from 'lucide-react';

interface DailyMissionsProps {
  user: User;
  onUpdate: (user: User) => void;
}

const DailyMissions: React.FC<DailyMissionsProps> = ({ user, onUpdate }) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      const updatedUser = await claimMissionReward(user._id, missionId);
      onUpdate(updatedUser);
    } catch (error) {
      console.error("Failed to claim reward", error);
    } finally {
      setClaimingId(null);
    }
  };

  if (!user.dailyMissions || user.dailyMissions.length === 0) return null;

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/50 dark:border-white/5 shadow-xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Missions</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resetting every 24 hours</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <Trophy size={16} className="text-amber-500" />
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Bonus Badge at 3/3</span>
        </div>
      </div>

      <div className="space-y-4">
        {user.dailyMissions.map((mission) => {
          const progress = Math.min(100, (mission.current / mission.target) * 100);
          
          return (
            <div key={mission.id} className={`p-5 rounded-3xl border transition-all ${mission.isClaimed ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mission.isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    {mission.isCompleted ? <CheckCircle2 size={24} /> : <Zap size={24} />}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">{mission.title}</h4>
                    <p className="text-xs font-bold text-slate-500 dark:text-emerald-400/60">{mission.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {mission.isClaimed ? (
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Claimed</span>
                  ) : mission.isCompleted ? (
                    <button 
                      onClick={() => handleClaim(mission.id)}
                      disabled={claimingId !== null}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      {claimingId === mission.id ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
                      Claim {mission.xpReward} XP
                    </button>
                  ) : (
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{mission.current} / {mission.target}</span>
                  )}
                </div>
              </div>

              {!mission.isClaimed && (
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${mission.isCompleted ? 'bg-emerald-500' : 'bg-emerald-500/40'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMissions;
