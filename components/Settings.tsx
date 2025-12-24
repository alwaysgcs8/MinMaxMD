import React, { useRef, useState, useEffect } from 'react';
import { View, Category, BudgetLimit, Theme } from '../types';
import { Button } from './Button';
import { Moon, Sun, Download, Upload, AlertTriangle, ArrowLeft, Monitor, Cloud, LogOut, Check } from 'lucide-react';
import { exportData, importData } from '../services/storageService';
import { signInWithGoogle, logout, auth } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  budgetLimits: BudgetLimit[];
  onSaveLimits: (limits: BudgetLimit[]) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange, budgetLimits, onSaveLimits, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
        await signInWithGoogle();
        // Sync logic is handled in App.tsx via auth listener
    } catch (error) {
        alert("Failed to sign in. Please check your internet connection.");
    } finally {
        setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleExport = () => {
    const dataStr = exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `budget_wise_backup_${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
            const success = importData(e.target.result as string);
            if (success) {
                alert("Data imported successfully! The app will reload.");
                window.location.reload();
            } else {
                alert("Failed to import data. Please check the file format.");
            }
        }
      };
    }
  };

  const handleLimitChange = (category: Category, value: string) => {
    const numValue = parseFloat(value);
    const newLimits = [...budgetLimits];
    const index = newLimits.findIndex(l => l.category === category);
    
    if (index >= 0) {
        if (!value) {
             newLimits.splice(index, 1);
        } else {
             newLimits[index].limit = numValue;
        }
    } else if (value) {
        newLimits.push({ category, limit: numValue });
    }
    onSaveLimits(newLimits);
  };

  const getLimit = (category: Category) => {
    return budgetLimits.find(l => l.category === category)?.limit || '';
  };

  return (
    <div className="pb-32 animate-in fade-in duration-500 space-y-8">
      <header className="px-6 pt-safe-top pb-4 flex items-center gap-4">
        <button 
            onClick={onBack}
            className="p-2 bg-white/50 dark:bg-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all text-slate-600 dark:text-slate-300"
        >
            <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Customize your experience</p>
        </div>
      </header>
      
      {/* Cloud Sync Account */}
      <div className="mx-6 p-6 bg-gradient-to-br from-blue-500 to-brand-600 dark:from-blue-900 dark:to-slate-900 rounded-[2rem] shadow-lg text-white">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Cloud size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold">Cloud Sync</h3>
        </div>
        
        {user ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white/50" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center font-bold text-lg">
                            {user.displayName ? user.displayName[0] : 'U'}
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="font-bold truncate">{user.displayName}</p>
                        <p className="text-xs text-blue-100 truncate">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-100 mb-4 bg-black/20 p-2 rounded-lg">
                    <Check size={12} className="text-green-300" />
                    Data automatically syncing
                </div>
                <button 
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        ) : (
            <div>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                    Sign in with Google to securely backup your data and sync across devices.
                </p>
                <button 
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-3 bg-white text-brand-600 rounded-xl font-bold shadow-md hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {authLoading ? (
                        "Connecting..."
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Connect Google Account
                        </>
                    )}
                </button>
            </div>
        )}
      </div>

      {/* Theme */}
      <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Appearance</h3>
        <div className="flex bg-white/50 dark:bg-black/20 p-1.5 rounded-2xl border border-white/20">
            <button
                onClick={() => onThemeChange('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${theme === 'light' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <Sun size={18} /> Light
            </button>
            <button
                onClick={() => onThemeChange('system')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <Monitor size={18} /> System
            </button>
            <button
                onClick={() => onThemeChange('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 text-cyan-400 shadow-sm shadow-cyan-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <Moon size={18} /> Night
            </button>
        </div>
      </div>

      {/* Data */}
      <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Data Management</h3>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/80 transition-all active:scale-95 group">
                <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    <Download size={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Export JSON</span>
            </button>
            
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/80 transition-all active:scale-95 group">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Import JSON</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
            />
        </div>
      </div>

      {/* Budget Limits */}
      <div className="mx-6 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            Monthly Limits <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-white/5 px-2 py-0.5 rounded-full">Optional</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Set spending goals for each category.</p>
        
        <div className="space-y-4">
            {Object.values(Category).filter(c => c !== Category.INCOME).map((cat) => (
                <div key={cat} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-semibold text-slate-600 dark:text-slate-300">{cat}</label>
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input
                            type="number"
                            placeholder="No limit"
                            value={getLimit(cat)}
                            onChange={(e) => handleLimitChange(cat, e.target.value)}
                            className="w-full pl-7 pr-4 py-2 text-sm rounded-xl bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all dark:text-white"
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};