import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, View } from '../types';
import { getCategoryColor, getCategoryIcon } from '../constants';
import { ArrowUpRight, ArrowDownRight, Settings as SettingsIcon, Target } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: View) => void;
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');

  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    const currentDayOfWeek = now.getDay();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(currentDate - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let calculatedIncome = 0;
    let calculatedExpense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const tDateNormalized = new Date(tDate);
      tDateNormalized.setHours(0, 0, 0, 0);

      let include = false;

      switch (timeframe) {
        case 'daily':
          if (tDateNormalized.getTime() === now.getTime()) include = true;
          break;
        case 'weekly':
          if (tDate >= startOfWeek && tDate <= endOfWeek) include = true;
          break;
        case 'monthly':
          if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) include = true;
          break;
        case 'yearly':
          if (tDate.getFullYear() === currentYear) include = true;
          break;
      }

      if (include) {
        if (t.type === TransactionType.INCOME) calculatedIncome += t.amount;
        else calculatedExpense += t.amount;
      }
    });

    return { 
      income: calculatedIncome,
      expense: calculatedExpense,
      balance: calculatedIncome - calculatedExpense
    };
  }, [transactions, timeframe]);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'daily': return "Today's";
      case 'weekly': return "This Week's";
      case 'monthly': return "Monthly";
      case 'yearly': return "Yearly";
    }
  };

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-start px-6 pt-safe-top pb-2">
        <div>
            <h1 className="text-4xl font-light text-slate-800 dark:text-white tracking-tight">
                <span className="bg-gradient-to-br from-brand-600 to-vibrant-purple bg-clip-text text-transparent font-bold">MinMax</span>
                <span className="font-bold text-slate-400">MD</span>
            </h1>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => onNavigate(View.BUDGET)}
                className="p-3 glass-panel rounded-2xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all shadow-sm text-slate-600 dark:text-slate-300"
            >
                <Target size={22} />
            </button>
            <button 
                onClick={() => onNavigate(View.SETTINGS)}
                className="p-3 glass-panel rounded-2xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all shadow-sm text-slate-600 dark:text-slate-300"
            >
                <SettingsIcon size={22} />
            </button>
        </div>
      </div>

      {/* Timeframe Toggles */}
      <div className="px-6">
        <div className="flex glass-panel p-1.5 rounded-[1.5rem]">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
                <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 capitalize ${
                        timeframe === tf 
                        ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-neon-blue scale-[1.05] z-10' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {tf}
                </button>
            ))}
        </div>
      </div>

      {/* Liquid Card (Dynamic Balance) */}
      <div className="mx-6">
        <div 
            className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-brand-600 to-indigo-700 p-[1.5px] shadow-2xl shadow-brand-500/30"
        >
            <div className="relative p-8 rounded-[2.7rem] bg-white/5 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden">
                {/* Colorful accents */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-vibrant-cyan/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-vibrant-pink/20 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <p className="text-white/70 text-sm font-semibold tracking-wide uppercase flex items-center gap-2">
                               {getTimeframeLabel()} Balance
                            </p>
                            <h2 className="text-5xl font-bold mt-2 tracking-tight text-white">
                                {formatCurrency(stats.balance)}
                            </h2>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        {/* Income */}
                        <div className="flex-1 bg-white/10 dark:bg-emerald-500/10 border border-white/20 dark:border-emerald-500/20 rounded-3xl p-4 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                <ArrowUpRight size={14} className="animate-bounce-slow" /> Income
                            </div>
                            <p className="font-bold text-xl text-white mt-1">{formatCurrency(stats.income)}</p>
                        </div>

                        {/* Expense */}
                        <div className="flex-1 bg-white/10 dark:bg-rose-500/10 border border-white/20 dark:border-rose-500/20 rounded-3xl p-4 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                                <ArrowDownRight size={14} /> Expense
                            </div>
                            <p className="font-bold text-xl text-white mt-1">{formatCurrency(stats.expense)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
            <span 
                onClick={() => onNavigate(View.HISTORY)}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full cursor-pointer active:scale-95"
            >
                See All
            </span>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 glass-panel rounded-3xl border-dashed">
              <p>No transactions found.</p>
            </div>
          ) : (
            recentTransactions.map(t => {
              const CategoryIcon = getCategoryIcon(t.category);
              return (
                <div key={t.id} className="group flex items-center p-4 rounded-[2rem] glass-panel border shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg transform transition-transform group-hover:rotate-6"
                    style={{ backgroundColor: getCategoryColor(t.category) }}
                  >
                    <CategoryIcon size={24} />
                  </div>
                  <div className="ml-5 flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">{t.description}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {t.category} • {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className={`font-bold text-lg ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};