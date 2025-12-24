import React from 'react';
import { Home, PieChart, Plus, History, Target } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isVisible: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, isVisible }) => {
  const NavButton = ({ view, icon: Icon, label }: { view: View; icon: any; label?: string }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
        currentView === view
          ? 'text-brand-600 dark:text-cyan-400 bg-white dark:bg-white/10 shadow-sm scale-110' 
          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'
      }`}
    >
      <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      {currentView === view && <span className="absolute -bottom-2 w-1 h-1 bg-brand-600 dark:bg-cyan-400 rounded-full"></span>}
    </button>
  );

  return (
    <div 
      className={`fixed left-0 right-0 px-6 z-50 pointer-events-none transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-[200%]'
      }`}
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 20px))'
      }}
    >
      <div className="max-w-[20rem] mx-auto pointer-events-auto">
        <div className="relative bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-glass rounded-[2rem] h-20 px-2 grid grid-cols-5 items-center">
            
            {/* Left Group */}
            <div className="col-span-2 flex justify-evenly items-center pr-2 gap-1">
                <NavButton view={View.DASHBOARD} icon={Home} />
                <NavButton view={View.HISTORY} icon={History} />
            </div>

            {/* Center Spacer for Add Button */}
            <div className="col-span-1"></div>

            {/* Right Group */}
            <div className="col-span-2 flex justify-evenly items-center pl-2">
                <NavButton view={View.BUDGET} icon={Target} />
                <NavButton view={View.ANALYTICS} icon={PieChart} />
            </div>

            {/* Floating Add Button (Absolute) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                <button
                onClick={() => onViewChange(View.ADD)}
                className="group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 dark:from-cyan-500 dark:to-purple-600 rounded-[1.5rem] text-white shadow-neon dark:shadow-neon-dark border-4 border-[#f0f2f5] dark:border-[#020617] transition-all active:scale-95 hover:scale-105 hover:rotate-90 duration-500"
                >
                <Plus size={32} />
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};