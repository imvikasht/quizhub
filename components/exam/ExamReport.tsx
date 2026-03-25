import React, { useRef } from 'react';
import { ExamAttempt } from '../../types/extensions';
import { Quiz } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Target, XCircle, Slash, TrendingUp, CheckCircle, Medal } from 'lucide-react';

interface Props {
  attempt: ExamAttempt;
  quiz: Quiz;
  rank: number;
  percentile: number;
  onHome: () => void;
}

const ExamReport: React.FC<Props> = ({ attempt, quiz, rank, percentile, onHome }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Exam_Report_${quiz.title.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const totalQuestions = quiz.questionsArray.length;
  const maxPossibleScore = totalQuestions * 4;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-slide-up relative z-10 pb-24">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onHome} 
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-slate-600 dark:text-rose-400 shadow-xl hover:scale-105 transition-transform border border-white/20 active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleDownloadReport}
          disabled={downloading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50"
        >
          <Download size={18} />
          {downloading ? 'Processing...' : 'Export PDF'}
        </button>
      </div>

      {/* Downloadable Wrapper */}
      <div ref={reportRef} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-40 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <p className="text-rose-500 font-black uppercase tracking-[0.3em] text-xs mb-2">Detailed Performance Analysis</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{quiz.title}</h1>
          <p className="text-slate-500 font-bold max-w-xl mx-auto">{quiz.description}</p>
        </div>

        {/* Master Score Banner */}
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 mb-12 relative z-10 overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
             <div>
               <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Final Scaled Score</p>
               <div className="flex items-baseline gap-2">
                 <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{attempt.finalScore}</h2>
                 <span className="text-2xl font-bold text-slate-400">/ {maxPossibleScore}</span>
               </div>
             </div>
             
             <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2 relative group-hover:scale-110 transition-transform">
                     <Medal size={28} />
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Rank</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">#{rank}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2 relative group-hover:scale-110 transition-transform">
                     <TrendingUp size={28} />
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Growth</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{percentile} <span className="text-sm">PR</span></p>
                </div>
             </div>
           </div>
        </div>

        {/* Granular Breakdown Grid */}
        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6">Metrics Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 relative z-10">
           
           <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
             <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3">
               <CheckCircle size={16} /> Correct (+4)
             </div>
             <p className="text-3xl font-black text-slate-900 dark:text-white">{attempt.correctAnswers}</p>
             <p className="text-xs font-bold text-emerald-600/60 mt-1">+{attempt.correctAnswers * 4} pts</p>
           </div>
           
           <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
             <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-widest mb-3">
               <XCircle size={16} /> Incorrect (-1)
             </div>
             <p className="text-3xl font-black text-slate-900 dark:text-white">{attempt.wrongAnswers}</p>
             <p className="text-xs font-bold text-rose-600/60 mt-1">-{attempt.negativeMarksApplied} pts</p>
           </div>
           
           <div className="p-6 bg-slate-500/5 border border-slate-500/20 rounded-2xl">
             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-3">
               <Slash size={16} /> Skipped (0)
             </div>
             <p className="text-3xl font-black text-slate-900 dark:text-white">{attempt.skippedAnswers}</p>
             <p className="text-xs font-bold text-slate-500/60 mt-1">Unattempted</p>
           </div>

           <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-3">
               <Target size={16} /> Accuracy
             </div>
             <p className="text-3xl font-black text-slate-900 dark:text-white">
                {Math.round((attempt.correctAnswers / (attempt.correctAnswers + attempt.wrongAnswers || 1)) * 100)}%
             </p>
             <p className="text-xs font-bold text-indigo-500/60 mt-1">Of Attempted</p>
           </div>

        </div>
        
        {/* Footnote */}
        <div className="text-center border-t border-slate-100 dark:border-white/5 pt-8 relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Generated via QuizHub Autonomous Testing Protocol<br/>
            Timestamp: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamReport;
