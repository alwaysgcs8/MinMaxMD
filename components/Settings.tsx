
import React, { useRef, useState, useEffect } from 'react';
import { Theme } from '../types';
import { Moon, Sun, Download, Upload, ArrowLeft, Monitor, Cloud, LogOut, Check, Save, Plus, X, Tag } from 'lucide-react';
import { exportData, importData } from '../services/storageService';
import { signInWithGoogle, logout, auth } from '../services/firebase';
// Fix: Import onAuthStateChanged and use type for User
import { onAuthStateChanged, type User } from 'firebase/auth';
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try { await signInWithGoogle(); } catch (error) { console.error("Sign in error:", error); } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => { await logout(); };

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
    <div className="flex flex-col h-full overflow-hidden bg-transparent animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-8 scroll-y-only">
        <header className="px-6 pt-safe pb-4 flex items-center gap-4 bg-transparent border-b border-white/10 shadow-sm">
          <button onClick={onBack} className="p-2 bg-white/50 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-300 active:scale-95 transition-all">
              <ArrowLeft size={24} />
          </button>
          <div>
              <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Customize your experience</p>
          </div>
        </header>

        <div className="h-4"></div>

        {/* Categories */}
        <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass">
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
        <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass">
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

        {/* Cloud Sync */}
        <div className="mx-6 p-6 bg-gradient-to-br from-blue-500 to-brand-600 dark:from-blue-900 dark:to-slate-900 rounded-[2.5rem] shadow-lg text-white">
          <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><Cloud size={24} className="text-white" /></div>
              <h3 className="text-lg font-bold">Cloud Sync</h3>
          </div>
          {auth && user ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                      {user.photoURL ? <img src={user.photoURL} alt="P" className="w-10 h-10 rounded-full border-2 border-white/50" /> : <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center font-bold text-lg">{user.displayName?.[0] || 'U'}</div>}
                      <div className="overflow-hidden"><p className="font-bold truncate">{user.displayName}</p><p className="text-xs text-blue-100 truncate">{user.email}</p></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-100 mb-4 bg-black/20 p-2 rounded-lg"><Check size={12} className="text-green-300" /> Active</div>
                  <button onClick={handleLogout} className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><LogOut size={16} /> Sign Out</button>
              </div>
          ) : (
              <div>
                  <p className="text-blue-100 text-sm mb-4 leading-relaxed">Backup your data and sync across devices.</p>
                  <button onClick={handleGoogleSignIn} disabled={authLoading} className="w-full py-3 bg-white text-brand-600 rounded-xl font-bold shadow-md hover:bg-blue-50 flex items-center justify-center gap-2 disabled:opacity-70">
                    Connect Account
                  </button>
              </div>
          )}
        </div>

        {/* Data Management */}
        <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass">
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
      </div>
    </div>
  );
};
