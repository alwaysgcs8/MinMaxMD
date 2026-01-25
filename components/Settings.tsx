import React, { useRef, useState } from 'react';
import { Theme } from '../types';
import { Moon, Sun, Download, Upload, ArrowLeft, Monitor, Save, Plus, X, Tag } from 'lucide-react';
import { exportData, importData } from '../services/storageService';
import { getCategoryColor } from '../constants';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onBack: () => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange, onBack, categories, onUpdateCategories }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) return;
    onUpdateCategories([...categories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Remove "${cat}" from list?`)) {
        onUpdateCategories(categories.filter(c => c !== cat));
    }
  };

  const handleExport = () => {
    const dataStr = exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `backup_${new Date().toISOString().slice(0,10)}.json`);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
            if (importData(e.target.result as string)) {
                alert("Imported! Reloading...");
                window.location.reload();
            }
        }
      };
    }
  };

  return (
    <div className="flex flex-col min-h-[100svh]">
      <header className="px-6 pt-safe pb-4 flex items-center gap-4 bg-transparent border-b border-white/10 shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 bg-white/50 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-300 active:scale-95 transition-all">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Customize your experience</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-y-only pb-32 pb-safe">
        <div className="h-4"></div>

        {/* Categories */}
        <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Tag size={20} className="text-brand-500" /> Edit Categories
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(cat => (
                  <div key={cat} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/10 shadow-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }}></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat}</span>
                      <button onClick={() => handleDeleteCategory(cat)} className="ml-1 text-slate-400 hover:text-red-500">
                          <X size={14} />
                      </button>
                  </div>
              ))}
          </div>
          <div className="flex gap-2">
              <input 
                  type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category"
                  className="flex-1 px-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/40 dark:border-white/10 outline-none text-slate-900 dark:text-white text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button onClick={handleAddCategory} className="p-3 bg-brand-500 text-white rounded-xl shadow-lg hover:bg-brand-600 transition-colors">
                  <Plus size={20} />
              </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Appearance</h3>
          <div className="flex bg-white/50 dark:bg-black/20 p-1.5 rounded-2xl border border-white/20">
              {(['light', 'system', 'dark'] as Theme[]).map((t) => (
                <button
                    key={t} onClick={() => onThemeChange(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${theme === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    {t === 'light' ? <Sun size={18} /> : t === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Data Management</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-1.5"><Save size={12} className="text-emerald-500" /> Local Storage Active</p>
          <div className="grid grid-cols-2 gap-4">
              <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-white/5 active:scale-95 group">
                  <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Download size={24} className="text-brand-600 dark:text-brand-400" /></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Export</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-white/5 active:scale-95 group">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Upload size={24} className="text-purple-600 dark:text-purple-400" /></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Restore</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>
        </div>
      </main>
    </div>
  );
};