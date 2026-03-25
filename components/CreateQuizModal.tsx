import React, { useState, useRef } from 'react';
import { Sparkles, X, Image as ImageIcon, Trash2, Camera } from 'lucide-react';
import { Quiz } from '../types';
import { generateQuizWithAI, generateQuizFromImage } from '../services/geminiService';

interface CreateQuizModalProps {
  onCancel: () => void;
  onSuccess: (quiz: Quiz) => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ onCancel, onSuccess }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [numQuestions, setNumQuestions] = useState<number | 'custom'>(5);
  const [customNumQuestions, setCustomNumQuestions] = useState('5');
  const [duration, setDuration] = useState<number | 'custom'>(5);
  const [customDuration, setCustomDuration] = useState('5');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState<{ base64: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be smaller than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImage({ base64, mimeType: file.type });
      if (!topic) setTopic(`Quiz from ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !image) return;
    
    const finalNumQuestions = numQuestions === 'custom' ? parseInt(customNumQuestions) : numQuestions;
    const finalDuration = duration === 'custom' ? parseInt(customDuration) : duration;

    if (isNaN(finalNumQuestions) || finalNumQuestions <= 0) {
      setError('Please enter a valid number of questions.');
      return;
    }
    if (isNaN(finalDuration) || finalDuration <= 0) {
      setError('Please enter a valid duration.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let quiz;
      if (image) {
        quiz = await generateQuizFromImage(image.base64, image.mimeType, difficulty, finalNumQuestions, finalDuration, language);
      } else {
        quiz = await generateQuizWithAI(topic, difficulty, finalNumQuestions, finalDuration, description, language);
      }
      onSuccess(quiz);
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic', 'Hindi'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-emerald-800/50 max-h-[90vh] overflow-y-auto">
          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 p-16 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
             <h2 className="text-2xl font-bold text-white relative z-10 flex items-center gap-2">
               <Sparkles size={24} />
               AI Quiz Generator
             </h2>
             <p className="text-emerald-100 text-sm mt-1 relative z-10">Powered by Google Gemini</p>
             <button onClick={onCancel} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
               <X size={18} />
             </button>
          </div>
          
          <div className="p-8 space-y-6">
             {error && (
               <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 rounded-xl text-sm font-medium border border-rose-100 dark:border-rose-800">
                 {error}
               </div>
             )}

             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-emerald-300 mb-2">Quiz Topic or Upload Image</label>
               <input 
                 autoFocus
                 value={topic}
                 onChange={e => setTopic(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-emerald-50"
                 placeholder="e.g. Ancient Rome..."
                />
                
                <div className="relative mt-3">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {!image ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-emerald-800/50 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-emerald-900/10 transition-colors"
                    >
                      <Camera size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Snap or Upload Study Material</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                          <ImageIcon size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Image Ready</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">AI will analyze your visual notes</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setImage(null)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
             </div>

             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-emerald-300 mb-2">Language</label>
               <select 
                 value={language}
                 onChange={e => setLanguage(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-emerald-50 text-sm"
               >
                 {LANGUAGES.map(lang => (
                   <option key={lang} value={lang}>{lang}</option>
                 ))}
               </select>
             </div>
             
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-emerald-300 mb-2">Instructions / Context (Optional)</label>
               <textarea 
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-emerald-50 resize-none h-24 text-sm"
                 placeholder="e.g. Focus on specific historical dates, or make it funny..."
               />
             </div>
             
             <div className="grid grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-emerald-300 mb-2">Difficulty</label>
                 <select 
                   value={difficulty}
                   onChange={e => setDifficulty(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-emerald-50 text-sm"
                 >
                   <option value="Easy">Easy</option>
                   <option value="Medium">Medium</option>
                   <option value="Hard">Hard</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-emerald-300 mb-2">Questions</label>
                 <select 
                   value={numQuestions}
                   onChange={e => setNumQuestions(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-emerald-50 text-sm mb-2"
                 >
                   <option value={5}>5 Qs</option>
                   <option value={10}>10 Qs</option>
                   <option value={15}>15 Qs</option>
                   <option value={20}>20 Qs</option>
                   <option value={30}>30 Qs</option>
                   <option value={40}>40 Qs</option>
                   <option value={50}>50 Qs</option>
                   <option value="custom">Custom...</option>
                 </select>
                 {numQuestions === 'custom' && (
                   <input 
                     type="number"
                     value={customNumQuestions}
                     onChange={e => setCustomNumQuestions(e.target.value)}
                     className="w-full px-3 py-2 bg-white dark:bg-emerald-900/10 border border-emerald-500/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                     placeholder="Enter Qs"
                   />
                 )}
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-emerald-300 mb-2">Duration</label>
                 <select 
                   value={duration}
                   onChange={e => setDuration(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-emerald-50 text-sm mb-2"
                 >
                   <option value={5}>5 min</option>
                   <option value={10}>10 min</option>
                   <option value={15}>15 min</option>
                   <option value={20}>20 min</option>
                   <option value={30}>30 min</option>
                   <option value={45}>45 min</option>
                   <option value={60}>1 hour</option>
                   <option value="custom">Custom...</option>
                 </select>
                 {duration === 'custom' && (
                   <input 
                     type="number"
                     value={customDuration}
                     onChange={e => setCustomDuration(e.target.value)}
                     className="w-full px-3 py-2 bg-white dark:bg-emerald-900/10 border border-emerald-500/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                     placeholder="Enter min"
                   />
                 )}
               </div>
             </div>

             <button 
               onClick={handleGenerate}
               disabled={loading || (!topic && !image)}
               className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${loading || (!topic && !image) ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500 dark:text-emerald-800 shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5'}`}
             >
               {loading ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>Generating Magic...</span>
                 </>
               ) : (
                 <>
                   <Sparkles size={20} />
                   <span>Generate Quiz</span>
                 </>
               )}
             </button>
          </div>
       </div>
    </div>
  );
};

export default CreateQuizModal;