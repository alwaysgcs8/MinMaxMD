import React from 'react';
import { Home, PieChart, Plus, History, Repeat } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isVisible: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange, isVisible }) => {
  const NavButton = ({ view, icon: Icon }: { view: View; icon: any }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
        currentView === view
          ? 'text-brand-600 dark:text-vibrant-cyan scale-110' 
          : 'text-slate-400 dark:text-slate-500 hover:text-brand-400'
      }`}
    >
      <div className={`p-2 rounded-xl transition-all duration-300 ${currentView === view ? 'bg-brand-500/10 dark:bg-vibrant-cyan/10' : ''}`}>
        <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      </div>
      {currentView === view && (
        <span className="absolute -bottom-1 w-1.5 h-1.5 bg-brand-600 dark:bg-vibrant-cyan rounded-full shadow-neon-blue"></span>
      )}
    </button>
  );

  return (
    <div 
      className={`fixed left-0 right-0 px-6 z-50 pointer-events-none transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-[250%]'
      }`}
      style={{
        bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 20px))'
      }}
    >
      <div className="max-w-[22rem] mx-auto pointer-events-auto">
        <div className="relative glass-panel bg-white/70 dark:bg-slate-900/60 shadow-2xl rounded-[2.5rem] h-20 px-3 flex items-center justify-between border-white/40">
            
            {/* Left Group */}
            <div className="flex-1 flex justify-around items-center">
                <NavButton view={View.DASHBOARD} icon={Home} />
                <NavButton view={View.HISTORY} icon={History} />
            </div>

            {/* Center Spacer for Add Button */}
            <div className="w-16"></div>

            {/* Right Group */}
            <div className="flex-1 flex justify-around items-center">
                <NavButton view={View.SUBSCRIPTIONS} icon={Repeat} />
                <NavButton view={View.ANALYTICS} icon={PieChart} />
            </div>

            {/* Floating Add Button (Absolute) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-10">
                <button
                onClick={() => onViewChange(View.ADD)}
                className="group flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 via-vibrant-purple to-vibrant-pink rounded-[2rem] text-white shadow-2xl shadow-vibrant-purple/40 border-[6px] border-white dark:border-[#020617] transition-all active:scale-90 hover:scale-105 duration-300"
                >
                <Plus size={36} className="group-hover:rotate-90 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};