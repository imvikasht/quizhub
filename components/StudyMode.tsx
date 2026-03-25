import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { generateStudyMaterials, StudyMaterials } from '../services/geminiService';
import { ArrowLeft, Sparkles, BookOpen, FileText, Download, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

interface StudyModeProps {
  quiz: Quiz;
  onBack: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ quiz, onBack }) => {
  const [materials, setMaterials] = useState<StudyMaterials | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await generateStudyMaterials(quiz);
        setMaterials(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadMaterials();
  }, [quiz]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#06110f] p-8">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-emerald-500/20 border-t-emerald-600"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 animate-pulse" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">AI is crafting your study guide...</h2>
        <p className="text-slate-500 dark:text-emerald-400/60 font-bold uppercase tracking-widest text-xs">Converting quiz data into flashcards & summary</p>
      </div>
    );
  }

  if (!materials) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06110f] p-4 md:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-emerald-400 font-bold hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Exit Study Mode
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{quiz.title}</h1>
            <p className="text-emerald-600 dark:text-emerald-500 text-xs font-black uppercase tracking-[0.3em]">AI Study Companion</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Flashcards Section */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-emerald-500" size={24} />
              <h2 className="text-xl font-black text-slate-800 dark:text-emerald-100 uppercase tracking-wider">Interactive Flashcards</h2>
            </div>

            <div className="relative h-[400px] perspective-1000">
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden glass-panel rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border-2 border-white/50 dark:border-white/5 shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-8">Question / Concept</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {materials.flashcards[cardIndex].front}
                  </h3>
                  <p className="mt-12 text-slate-400 dark:text-emerald-900 text-xs font-bold uppercase tracking-widest animate-bounce">Click to Flip</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border-2 border-emerald-500/30 bg-emerald-500/5 shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-8">Answer / Explanation</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {materials.flashcards[cardIndex].back}
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button 
                onClick={() => { setCardIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
                disabled={cardIndex === 0}
                className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 disabled:opacity-30 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-black text-slate-400 dark:text-emerald-900 tracking-widest uppercase text-sm">
                {cardIndex + 1} <span className="mx-2">/</span> {materials.flashcards.length}
              </span>
              <button 
                onClick={() => { setCardIndex(prev => Math.min(materials.flashcards.length - 1, prev + 1)); setIsFlipped(false); }}
                disabled={cardIndex === materials.flashcards.length - 1}
                className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 disabled:opacity-30 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="text-emerald-500" size={24} />
                <h2 className="text-xl font-black text-slate-800 dark:text-emerald-100 uppercase tracking-wider">Revision Summary</h2>
              </div>
              <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                <Download size={20} />
              </button>
            </div>

            <div className="glass-panel rounded-[2.5rem] p-8 border border-white/50 dark:border-white/5 shadow-xl h-[500px] overflow-y-auto custom-scrollbar">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-emerald-100/80 leading-relaxed font-medium whitespace-pre-wrap">
                  {materials.summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default StudyMode;
