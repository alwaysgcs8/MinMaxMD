
import React, { useRef, useState } from 'react';
import { Theme } from '../types';
import { Moon, Sun, Download, Upload, ArrowLeft, Monitor, Save, Plus, X, Tag, Cloud, LogIn, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { exportData, importData } from '../services/storageService';
import { getCategoryColor } from '../constants';
import { signInWithGoogle, logout } from '../services/firebase';
// Fix: Import User from firebase/auth to resolve module export error
import { User } from 'firebase/auth';

interface SettingsProps {
  user: User | null;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onBack: () => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, theme, onThemeChange, onBack, categories, onUpdateCategories }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCategory, setNewCategory] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
        await signInWithGoogle();
    } catch (e: any) {
        console.error("Login failed", e);
        if (e.message?.includes("not initialized")) {
            setAuthError("Configuration Error: Firebase keys are missing in .env");
        } else if (e.code === 'auth/popup-blocked') {
            setAuthError("Popup blocked! Please allow popups for this site.");
        } else if (e.code === 'auth/unauthorized-domain') {
            setAuthError("This domain is not authorized in Firebase Console.");
        } else {
            setAuthError(e.message || "Failed to sign in. Please try again.");
        }
    } finally {
        setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Sign out of cloud sync? Data stays on this device.")) {
        await logout();
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
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
        if (e.target?.result && importData(e.target.result as string)) {
            alert("Imported! Reloading...");
            window.location.reload();
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

      <main className="flex-1 min-h-0 overflow-y-auto scroll-y-only px-6 no-scrollbar">
        <div className="h-4"></div>

        {/* Cloud Sync Account */}
        <div className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Cloud size={20} className="text-brand-500" /> Cloud Sync
            </h3>
            
            {authError && (
                <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400 leading-relaxed">{authError}</p>
                </div>
            )}

            {user ? (
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-brand-500" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xl">
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                            <ShieldCheck size={10} /> Account Linked
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Link your Google account to sync your budget, transactions, and categories across all your devices securely.
                    </p>
                    <button 
                        onClick={handleLogin}
                        disabled={isAuthLoading}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-brand-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        {isAuthLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent animate-spin rounded-full"></div>
                                <span className="text-slate-400 font-bold">Connecting...</span>
                            </div>
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                <span className="text-slate-700 dark:text-slate-200 font-bold">Sign in with Google</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>

        {/* Categories */}
        <div className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass mb-8">
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
        <div className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass mb-8">
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
        <div className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-glass mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Backup & Restore</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-1.5"><Save size={12} className="text-emerald-500" /> Offline Backups</p>
          <div className="grid grid-cols-2 gap-4">
              <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-white/5 active:scale-95 group">
                  <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Download size={24} className="text-brand-600 dark:text-brand-400" /></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Export JSON</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-white/5 active:scale-95 group">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Upload size={24} className="text-purple-600 dark:text-purple-400" /></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Import JSON</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>
        </div>
        <div style={{ height: `calc(8rem + env(safe-area-inset-bottom))` }} />
      </main>
    </div>
  );
};
