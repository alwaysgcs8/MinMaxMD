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
          ? 'text-brand-500 scale-110' 
          : 'text-slate-400 dark:text-slate-500 hover:text-brand-400'
      }`}
    >
      <div className={`p-2 rounded-xl transition-all duration-300 ${currentView === view ? 'bg-brand-500/10' : ''}`}>
        <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      </div>
      {currentView === view && (
        <span className="absolute -bottom-1 w-1.5 h-1.5 bg-brand-500 rounded-full shadow-neon"></span>
      )}
    </button>
  );

  return (
    <div 
      className={`bottom-nav-container transition-all duration-500 ease-in-out pb-safe bg-transparent ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-lg mx-auto px-6 mb-4 sm:mb-6">
        <div className="relative glass-panel bg-white/70 dark:bg-slate-900/80 shadow-2xl rounded-[2.5rem] h-16 sm:h-20 px-4 flex items-center justify-between border-white/20">
            
            <div className="flex-1 flex justify-around items-center">
                <NavButton view={View.DASHBOARD} icon={Home} />
                <NavButton view={View.HISTORY} icon={History} />
            </div>

            <div className="w-16 sm:w-20"></div>

            <div className="flex-1 flex justify-around items-center">
                <NavButton view={View.SUBSCRIPTIONS} icon={Repeat} />
                <NavButton view={View.ANALYTICS} icon={PieChart} />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 -top-8 sm:-top-10">
                <button
                  onClick={() => onViewChange(View.ADD)}
                  className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-brand-500 text-white rounded-[1.8rem] shadow-xl shadow-brand-500/30 border-4 border-white dark:border-slate-900 transition-all active:scale-90 hover:scale-105"
                >
                  <Plus size={32} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};