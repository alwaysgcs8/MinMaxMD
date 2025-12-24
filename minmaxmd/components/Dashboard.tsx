import React, { useMemo, useState, useRef } from 'react';
import { Transaction, TransactionType, View } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { ArrowUpRight, ArrowDownRight, Wallet, Settings as SettingsIcon } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const { totalBalance, monthlyIncome, monthlyExpense } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let balance = 0;
    let mIncome = 0;
    let mExpense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const amount = t.amount;

      if (t.type === TransactionType.INCOME) {
        balance += amount;
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          mIncome += amount;
        }
      } else {
        balance -= amount;
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          mExpense += amount;
        }
      }
    });

    return { totalBalance: balance, monthlyIncome: mIncome, monthlyExpense: mExpense };
  }, [transactions]);

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (max 10 degrees)
    const xRot = ((y - rect.height / 2) / rect.height) * -10;
    const yRot = ((x - rect.width / 2) / rect.width) * 10;

    setTilt({ x: xRot, y: yRot });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-start px-6 pt-10 pb-4">
        <div>
            <h1 className="text-4xl font-light text-slate-800 dark:text-white tracking-tight">MinMax<span className="font-bold text-brand-600 dark:text-cyan-400">MD</span></h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Your financial flow</p>
        </div>
        <button 
            onClick={() => onNavigate(View.SETTINGS)}
            className="p-3 bg-white/50 dark:bg-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm border border-white/40 dark:border-white/5 text-slate-600 dark:text-slate-300"
        >
            <SettingsIcon size={22} />
        </button>
      </div>

      {/* Parallax Liquid Card */}
      <div 
        className="mx-6 perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
            ref={cardRef}
            className="p-1 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-800/60 dark:to-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass transition-transform duration-200 ease-out"
            style={{ 
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`,
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-purple-400/20 to-pink-400/20 dark:from-cyan-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-50"></div>
            {/* Gloss Line */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none mix-blend-overlay"></div>
            
            <div className="relative p-7 rounded-[2.2rem] bg-gradient-to-br from-white/60 to-white/10 dark:from-white/5 dark:to-transparent backdrop-blur-md">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-slate-500 dark:text-slate-300 text-sm font-semibold tracking-wide uppercase">Total Balance</p>
                        <h2 className="text-5xl font-bold text-slate-800 dark:text-white mt-2 tracking-tight">{formatCurrency(totalBalance)}</h2>
                    </div>
                    <div className="bg-white/50 dark:bg-white/10 p-3 rounded-2xl shadow-sm border border-white/60 dark:border-white/5 text-brand-600 dark:text-cyan-400">
                        <Wallet size={24} />
                    </div>
                </div>
                
                <div className="flex gap-4">
                <div className="flex-1 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1 text-emerald-700/70 dark:text-emerald-400/80 text-xs font-bold uppercase tracking-wider">
                    <div className="bg-emerald-500/20 p-1.5 rounded-full">
                        <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Income
                    </div>
                    <p className="font-bold text-xl text-emerald-900 dark:text-emerald-100 mt-1">{formatCurrency(monthlyIncome)}</p>
                </div>
                <div className="flex-1 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100/50 dark:border-rose-500/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1 text-rose-700/70 dark:text-rose-400/80 text-xs font-bold uppercase tracking-wider">
                    <div className="bg-rose-500/20 p-1.5 rounded-full">
                        <ArrowDownRight size={14} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    Expenses
                    </div>
                    <p className="font-bold text-xl text-rose-900 dark:text-rose-100 mt-1">{formatCurrency(monthlyExpense)}</p>
                </div>
                </div>
            </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center justify-between">
          Recent Flows
          <span className="text-xs font-semibold text-brand-700 dark:text-cyan-300 bg-brand-100/50 dark:bg-cyan-900/30 border border-brand-200/50 dark:border-cyan-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm">This Month</span>
        </h3>
        
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <p>No transactions yet.</p>
              <p className="text-sm">Start your journey today!</p>
            </div>
          ) : (
            recentTransactions.map(t => (
              <div key={t.id} className="group flex items-center p-4 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-white/5 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-glass-sm hover:scale-[1.01]">
                <div 
                  className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg transform transition-transform group-hover:rotate-6"
                  style={{ backgroundColor: CATEGORY_COLORS[t.category], opacity: 0.9 }}
                >
                  {t.category[0]}
                </div>
                <div className="ml-5 flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">{t.description}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className={`font-bold text-lg ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};