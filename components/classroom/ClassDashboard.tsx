import React, { useState, useEffect } from 'react';
import { User, Quiz } from '../../types';
import { Classroom } from '../../types/extensions';
import { 
  createClassroom, 
  getClassroomsForTeacher, 
  getClassroomsForStudent, 
  joinClassroom,
  assignQuizToClassroom
} from '../../services/classroomService';
import { Users, Plus, Key, Copy, Target, Hash, Play, AlertCircle, ArrowLeft } from 'lucide-react';

interface Props {
  currentUser: User;
  onBack: () => void;
  onSelectQuiz: (quizId: string) => void;
  allQuizzes: Quiz[];
}

const ClassDashboard: React.FC<Props> = ({ currentUser, onBack, onSelectQuiz, allQuizzes }) => {
  const isTeacher = currentUser.role === 'Teacher' || currentUser.role === 'Admin';
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  // Modals / Dropdowns
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<string | null>(null);

  useEffect(() => {
    loadClassrooms();
  }, [currentUser]);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      if (isTeacher) {
        const data = await getClassroomsForTeacher(currentUser._id);
        setClassrooms(data);
      } else {
        const data = await getClassroomsForStudent(currentUser._id);
        setClassrooms(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      setLoading(true);
      await createClassroom(newClassName, currentUser._id);
      setNewClassName('');
      await loadClassrooms();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      setLoading(true);
      setError('');
      await joinClassroom(joinCode, currentUser._id);
      setJoinCode('');
      await loadClassrooms();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Class code copied to clipboard!');
  };

  const assignQuiz = async (classroomId: string, quizId: string) => {
    try {
      await assignQuizToClassroom(classroomId, quizId);
      alert('Quiz successfully assigned to class!');
      setSelectedClassForAssignment(null);
      loadClassrooms();
    } catch (e) {
      console.error("Assignment fail", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in relative z-10 pb-24">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[140px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={onBack} 
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-slate-600 dark:text-sky-400 shadow-xl hover:shadow-sky-500/20 transition-all border border-white/20 active:scale-90"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <Users className="text-sky-500" size={32} />
            {isTeacher ? "Teacher Portal" : "My Classrooms"}
          </h2>
          <p className="text-sky-600 dark:text-sky-400 font-black uppercase tracking-[0.2em] text-[10px]">
            {isTeacher ? "Manage your rosters and assignments" : "Access assigned course material"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* TOP SECTION: Quick Actions */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl border border-white dark:border-white/5 mb-10">
        {isTeacher ? (
          <form onSubmit={handleCreateClass} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest block mb-2 ml-1">New Roster Name</label>
              <input
                type="text"
                placeholder="e.g. CS101 Fundamentals"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/10 font-bold focus:ring-4 focus:ring-sky-500/20 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !newClassName.trim()}
              className="px-8 py-4 bg-sky-600 text-white rounded-2xl font-black shadow-xl shadow-sky-500/30 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={20} />
              Create Class
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinClass} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest block mb-2 ml-1">Class Invite Code</label>
              <div className="relative">
                <Hash className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter 6-digit code..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/10 font-bold text-lg uppercase tracking-widest focus:ring-4 focus:ring-sky-500/20 outline-none transition-all"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading || joinCode.length < 5}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Key size={20} />
              Join Class
            </button>
          </form>
        )}
      </div>

      {/* CLASSROOMS LIST */}
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-widest">Active Rosters</h3>
      
      {loading && classrooms.length === 0 ? (
        <div className="text-center py-10 opacity-50 font-bold animate-pulse">Synchronizing Network...</div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-white/5 rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10">
          <Users size={48} className="mx-auto text-slate-300 dark:text-white/20 mb-4" />
          <p className="text-slate-500 dark:text-white/40 font-black uppercase tracking-widest">No Classrooms Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classrooms.map(cls => (
            <div key={cls._id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] p-8 border border-white dark:border-white/5 shadow-xl relative group">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{cls.name}</h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                    {cls.students.length} Student{cls.students.length !== 1 && 's'} Enrolled
                  </p>
                </div>
                {isTeacher && (
                  <button 
                    onClick={() => handleCopyCode(cls.code)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-sky-50 dark:hover:bg-sky-500/20 text-slate-600 dark:text-sky-400 rounded-xl transition-all cursor-pointer font-black text-xs uppercase tracking-widest border border-transparent hover:border-sky-500/30"
                    title="Copy Join Code"
                  >
                    <span className="text-lg">{cls.code}</span>
                    <Copy size={14} />
                  </button>
                )}
              </div>

              {/* Assignment Display */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5 pb-2">Active Assignments</p>
                
                {cls.assignments.length === 0 ? (
                  <p className="text-sm font-bold text-slate-400 italic">No assigned tasks.</p>
                ) : (
                  cls.assignments.map((assignment, i) => {
                    const quizDetails = allQuizzes.find(q => q._id === assignment.quizId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-sky-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
                            <Target size={16} />
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {quizDetails ? quizDetails.title : "Unknown Assignment"}
                          </span>
                        </div>
                        {!isTeacher && quizDetails && (
                          <button 
                            onClick={() => onSelectQuiz(assignment.quizId)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                          >
                            <Play size={12} fill="currentColor" /> Play
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Teacher Assignment Controls */}
              {isTeacher && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                  {selectedClassForAssignment === cls._id ? (
                    <div className="animate-fade-in space-y-3">
                       <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Select Quiz to Assign</label>
                       <select 
                         className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                         onChange={(e) => {
                           if (e.target.value) assignQuiz(cls._id, e.target.value);
                         }}
                         defaultValue=""
                       >
                         <option value="" disabled>-- Choose a Quiz --</option>
                         {allQuizzes.map(q => (
                           <option key={q._id} value={q._id}>{q.title}</option>
                         ))}
                       </select>
                       <button 
                         onClick={() => setSelectedClassForAssignment(null)}
                         className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white py-2"
                       >
                         Cancel
                       </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSelectedClassForAssignment(cls._id)}
                      className="w-full py-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                    >
                       <Plus size={16} /> Assign New Quiz
                    </button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ClassDashboard;
