import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, resetPassword } from '../services/firebaseService';
import { User } from '../types';
import { Zap, Mail, Lock, User as UserIcon, Building2, GraduationCap, ArrowRight, Loader2, Globe, ArrowLeft, Send } from 'lucide-react';

interface AuthProps {
  onSuccess: (user: User) => void;
  onCancel?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'Student' | 'Teacher'>('Student');
  const [organization, setOrganization] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const user = await loginAsGuest();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await resetPassword(email);
      setSuccess('Password reset link sent to your email!');
      setTimeout(() => setIsForgotPassword(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Please enter email and password');
        }
        const user = await loginWithEmail(email, password);
        onSuccess(user);
      } else {
        if (!email || !password || !username) {
          throw new Error('Please fill in all required fields');
        }
        const user = await registerWithEmail(email, password, username, role, organization);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800/30 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-emerald-50 transition-all placeholder:text-slate-400 dark:placeholder:text-emerald-700 shadow-inner";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl shadow-2xl overflow-hidden animate-slide-up relative border border-white/10">
        
        {(onCancel || isForgotPassword) && (
          <button 
            onClick={isForgotPassword ? () => setIsForgotPassword(false) : onCancel}
            className="absolute top-4 left-4 z-20 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Header */}
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Zap className="text-emerald-600" size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">QuizHub</h1>
            <p className="text-emerald-100 mt-2 text-sm font-medium">
              {isForgotPassword ? 'Reset your password' : (isLogin ? 'Power up your knowledge!' : 'Ignite your learning journey.')}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 text-sm rounded-xl border border-rose-100 dark:border-rose-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 text-sm rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                   {success}
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-emerald-700" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputStyles}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Send size={16} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 text-sm rounded-xl border border-rose-100 dark:border-rose-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-4 animate-fade-in">
                   <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 text-slate-400 dark:text-emerald-700" size={18} />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className={inputStyles}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('Student')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${role === 'Student' ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-emerald-900/10 border-slate-200 dark:border-emerald-800/20 text-slate-500 dark:text-emerald-600'}`}
                    >
                      <GraduationCap size={18} />
                      <span className="text-sm font-semibold">Student</span>
                    </button>
                     <button
                      type="button"
                      onClick={() => setRole('Teacher')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${role === 'Teacher' ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-emerald-900/10 border-slate-200 dark:border-emerald-800/20 text-slate-500 dark:text-emerald-600'}`}
                    >
                      <UserIcon size={18} />
                      <span className="text-sm font-semibold">Teacher</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Building2 className="absolute left-4 top-3.5 text-slate-400 dark:text-emerald-700" size={18} />
                    <input 
                      type="text" 
                      placeholder="School / Organization Name"
                      value={organization}
                      onChange={e => setOrganization(e.target.value)}
                      className={inputStyles}
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-emerald-700" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputStyles}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-emerald-700" size={18} />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputStyles}
                />
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-emerald-800/30"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#06110f] px-2 text-slate-400 dark:text-emerald-700 font-black tracking-widest">Or</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 mt-2 border border-slate-200 dark:border-white/10"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
              <p className="text-slate-500 dark:text-emerald-500 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); setError(''); setSuccess(''); }}
                  className="ml-2 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isLogin ? 'Register Now' : 'Sign In'}
                </button>
              </p>
            </div>
          
          {isLogin && !isForgotPassword && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-emerald-800/30 text-center">
               <button 
                 onClick={handleGuestLogin} 
                 disabled={loading}
                 className="px-6 py-2 bg-slate-100 dark:bg-emerald-900/20 text-slate-600 dark:text-emerald-200 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-emerald-900 transition-colors border border-slate-200 dark:border-emerald-800/30 flex items-center justify-center gap-2 mx-auto w-full"
               >
                 <Globe size={16} />
                 Continue as Guest
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
