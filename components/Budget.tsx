import React, { useState, useEffect } from 'react';
import { OverallBudget, BudgetLimit, View } from '../types';
import { ArrowLeft, Target, Save, Check } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '../constants';

interface BudgetProps {
  overallBudget: OverallBudget;
  categoryLimits: BudgetLimit[];
  categories: string[];
  onSaveOverall: (budget: OverallBudget) => void;
  onSaveCategoryLimits: (limits: BudgetLimit[]) => void;
  onNavigate: (view: View) => void;
}

export const Budget: React.FC<BudgetProps> = ({ overallBudget, categoryLimits, categories, onSaveOverall, onSaveCategoryLimits, onNavigate }) => {
  const [localOverall, setLocalOverall] = useState<OverallBudget>(overallBudget);
  const [localLimits, setLocalLimits] = useState<BudgetLimit[]>(categoryLimits);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalOverall(overallBudget);
    setLocalLimits(categoryLimits);
  }, [overallBudget, categoryLimits]);

  const handleLimitChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newLimits = localLimits.filter(l => l.category !== category);
    if (numValue > 0) newLimits.push({ category, limit: numValue });
    setLocalLimits(newLimits);
  };

  const getLimit = (category: string) => {
    return localLimits.find(l => l.category === category)?.limit || '';
  };

  const handleSave = () => {
    onSaveOverall(localOverall);
    onSaveCategoryLimits(localLimits);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent animate-in fade-in duration-500">
      <header className="shrink-0 px-6 pt-safe-top pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(View.DASHBOARD)} className="p-2 bg-white/50 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-300">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Budget</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Set your goals</p>
            </div>
        </div>
        <button 
            onClick={handleSave}
            className={`p-3 rounded-xl transition-all shadow-md flex items-center gap-2 font-bold ${isSaved ? 'bg-green-500 text-white' : 'bg-brand-600 text-white'}`}
        >
            {isSaved ? <Check size={20} /> : <Save size={20} />}
            {isSaved ? 'Saved' : 'Save'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-6 scroll-y-only">
        <div className="mx-6">
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg"><Target size={24} /></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Overall Targets</h3>
              </div>
              <div className="grid gap-5">
                  <div className="relative">
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Monthly Limit</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input
                              type="number" value={localOverall.monthly || ''}
                              onChange={e => setLocalOverall({...localOverall, monthly: parseFloat(e.target.value) || 0})}
                              className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold"
                              placeholder="0.00"
                          />
                       </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Daily Goal</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                              <input
                                  type="number" value={localOverall.daily || ''}
                                  onChange={e => setLocalOverall({...localOverall, daily: parseFloat(e.target.value) || 0})}
                                  className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold"
                                  placeholder="0.00"
                              />
                          </div>
                      </div>
                       <div className="relative">
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Yearly Goal</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                              <input
                                  type="number" value={localOverall.yearly || ''}
                                  onChange={e => setLocalOverall({...localOverall, yearly: parseFloat(e.target.value) || 0})}
                                  className="w-full pl-8 pr-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-bold"
                                  placeholder="0.00"
                              />
                          </div>
                      </div>
                  </div>
              </div>
            </div>
        </div>

        <div className="mx-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 pl-1">Category Limits</h3>
          <div className="grid gap-3">
              {categories.map((cat) => {
                  const CategoryIcon = getCategoryIcon(cat);
                  return (
                      <div key={cat} className="flex items-center gap-3 p-3 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/50 dark:border-white/10">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: getCategoryColor(cat) }}><CategoryIcon size={18} /></div>
                          <div className="flex-1"><p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{cat}</p></div>
                          <div className="relative w-28">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                              <input
                                  type="number" value={getLimit(cat)} onChange={(e) => handleLimitChange(cat, e.target.value)}
                                  className="w-full pl-6 pr-3 py-2 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 rounded-lg outline-none text-slate-900 dark:text-white font-bold text-right text-sm"
                                  placeholder="Limit"
                              />
                          </div>
                      </div>
                  );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};