import React, { useState } from 'react';
import { Quiz, Question } from '../types';
import { Plus, Trash2, Save, X, CheckCircle, PenTool, Layers, Clock } from 'lucide-react';

interface ManualQuizCreatorProps {
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
  initialQuiz?: Quiz | null;
}

const ManualQuizCreator: React.FC<ManualQuizCreatorProps> = ({ onSave, onCancel, initialQuiz }) => {
  // Quiz Metadata State
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [category, setCategory] = useState(initialQuiz?.category || '');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(initialQuiz?.difficulty || 'Medium');
  const [duration, setDuration] = useState<number>(initialQuiz?.duration || 5);
  
  // Questions State
  const [questions, setQuestions] = useState<Question[]>(initialQuiz?.questionsArray || []);
  
  // Current Question Editing State
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [error, setError] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addQuestion = () => {
    if (!qText.trim()) {
      setError('Question text is required');
      return;
    }
    if (options.some(opt => !opt.trim())) {
      setError('All 4 options must be filled');
      return;
    }
    
    setQuestions([
      ...questions,
      {
        questionText: qText,
        options: [...options],
        correctAnswerIndex: correctIndex
      }
    ]);

    // Reset current question form
    setQText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setError('');
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveQuiz = () => {
    if (!title.trim() || !category.trim() || !description.trim()) {
      setError('Please fill in all quiz details (Title, Description, Category).');
      return;
    }
    if (questions.length === 0) {
      setError('Please add at least one question.');
      return;
    }

    const newQuiz: Quiz = {
      _id: initialQuiz ? initialQuiz._id : `q_manual_${Date.now()}`,
      title,
      description,
      category,
      difficulty,
      questionsArray: questions,
      duration
    };

    onSave(newQuiz);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 animate-slide-up">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <PenTool className="text-emerald-600" />
               {initialQuiz ? 'Review & Edit Quiz' : 'Quiz Builder'}
             </h1>
             <p className="text-slate-500 dark:text-slate-400 mt-1">
               {initialQuiz ? 'Customize the AI-generated content before publishing.' : 'Craft your own custom quiz from scratch.'}
             </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSaveQuiz}
              className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Publish Quiz
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Quiz Metadata & Question Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Metadata Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" />
                Quiz Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                  <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                    placeholder="e.g. Advanced JavaScript Trivia"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Category</label>
                    <input 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                      placeholder="e.g. Coding"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Difficulty</label>
                    <select 
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Duration (Minutes)</label>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <input 
                      type="number"
                      min="1"
                      max="60"
                      value={duration}
                      onChange={e => setDuration(parseInt(e.target.value) || 5)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                   <textarea 
                     value={description}
                     onChange={e => setDescription(e.target.value)}
                     className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none text-slate-900 dark:text-white"
                     placeholder="What is this quiz about?"
                   />
                </div>
              </div>
            </div>

            {/* Add Question Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-indigo-50 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-0.5 rounded" />
                Add New Question
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Question Text</label>
                  <input 
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg text-slate-900 dark:text-white"
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Answer Options <span className="text-xs font-normal text-slate-400 ml-1">(Select the radio button for the correct answer)</span>
                  </label>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="correctOption" 
                          checked={correctIndex === idx}
                          onChange={() => setCorrectIndex(idx)}
                          className="peer w-5 h-5 cursor-pointer accent-indigo-600"
                        />
                      </div>
                      <input 
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white ${correctIndex === idx ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20 dark:border-indigo-400' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'}`}
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button 
                    onClick={addQuestion}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Questions Preview */}
          <div className="lg:col-span-5">
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden sticky top-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Quiz Preview</h3>
                  <span className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-bold">{questions.length} Questions</span>
                </div>
                
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-4 space-y-3">
                  {questions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                      <p className="text-sm">No questions added yet.</p>
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all group relative">
                        <button 
                          onClick={() => removeQuestion(idx)}
                          className="absolute top-3 right-3 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 pr-6 mb-2 text-sm">
                          <span className="text-slate-400 dark:text-slate-500 mr-2">{idx + 1}.</span>
                          {q.questionText}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`text-xs px-2 py-1.5 rounded border ${optIdx === q.correctAnswerIndex ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium' : 'bg-white dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>
                               {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManualQuizCreator;