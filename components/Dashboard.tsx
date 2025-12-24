import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, View } from '../types';
import { getCategoryColor } from '../constants';
import { ArrowUpRight, ArrowDownRight, Settings as SettingsIcon } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: View) => void;
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');

  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize today to midnight
    
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday

    // Calculate start/end dates for the week (Sunday to Saturday)
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
      // Normalize transaction date to midnight for day comparison
      const tDateNormalized = new Date(tDate);
      tDateNormalized.setHours(0, 0, 0, 0);

      let include = false;

      switch (timeframe) {
        case 'daily':
          if (tDateNormalized.getTime() === now.getTime()) {
            include = true;
          }
          break;
        case 'weekly':
          if (tDate >= startOfWeek && tDate <= endOfWeek) {
            include = true;
          }
          break;
        case 'monthly':
          if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            include = true;
          }
          break;
        case 'yearly':
          if (tDate.getFullYear() === currentYear) {
            include = true;
          }
          break;
      }

      if (include) {
        if (t.type === TransactionType.INCOME) {
          calculatedIncome += t.amount;
        } else {
          calculatedExpense += t.amount;
        }
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

  const getTimeframeShortLabel = () => {
    switch (timeframe) {
      case 'daily': return "Today";
      case 'weekly': return "Week";
      case 'monthly': return "Month";
      case 'yearly': return "Year";
    }
  };

  return (
    <div className="space-y-6 pb-40 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-start px-6 pt-safe-top pb-2">
        <div>
            <h1 className="text-4xl font-light text-slate-800 dark:text-white tracking-tight">MinMax<span className="font-bold text-brand-600 dark:text-cyan-400">MD</span></h1>
        </div>
        <button 
            onClick={() => onNavigate(View.SETTINGS)}
            className="p-3 bg-white/50 dark:bg-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm border border-white/40 dark:border-white/5 text-slate-600 dark:text-slate-300"
        >
            <SettingsIcon size={22} />
        </button>
      </div>

      {/* Timeframe Toggles */}
      <div className="px-6">
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-[1.2rem] backdrop-blur-sm">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
                <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 capitalize ${
                        timeframe === tf 
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm scale-[1.02]' 
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
            className="p-1 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-800/60 dark:to-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass transition-all duration-500"
        >
            <div className="absolute inset-0 bg-gradient-to-br opacity-50 from-emerald-400/20 via-teal-400/20 to-brand-400/20 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10"></div>
            {/* Gloss Line */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none mix-blend-overlay"></div>
            
            <div className="relative p-7 rounded-[2.2rem] bg-gradient-to-br from-white/60 to-white/10 dark:from-white/5 dark:to-transparent backdrop-blur-md">
                
                {/* Main Number */}
                <div className="flex justify-between items-start mb-8 min-h-[5rem]">
                    <div>
                        <p className="text-slate-500 dark:text-slate-300 text-sm font-semibold tracking-wide uppercase flex items-center gap-2 transition-all">
                           {getTimeframeLabel()} Balance
                        </p>
                        <h2 className="text-5xl font-bold mt-2 tracking-tight text-slate-900 dark:text-white transition-all duration-300">
                            {formatCurrency(stats.balance)}
                        </h2>
                    </div>
                </div>
                
                {/* Metrics Row */}
                <div className="flex gap-4">
                    {/* Income */}
                    <div className="flex-1 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm animate-in zoom-in duration-300">
                        <div className="flex items-center gap-2 mb-1 text-emerald-700/70 dark:text-emerald-400/80 text-xs font-bold uppercase tracking-wider">
                        <div className="bg-emerald-500/20 p-1.5 rounded-full">
                            <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Income <span className="opacity-60 hidden sm:inline">({getTimeframeShortLabel()})</span>
                        </div>
                        <p className="font-bold text-xl text-emerald-900 dark:text-emerald-100 mt-1">{formatCurrency(stats.income)}</p>
                    </div>

                    {/* Expense */}
                    <div className="flex-1 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100/50 dark:border-rose-500/20 rounded-2xl p-4 backdrop-blur-sm animate-in zoom-in duration-300 delay-75">
                        <div className="flex items-center gap-2 mb-1 text-rose-700/70 dark:text-rose-400/80 text-xs font-bold uppercase tracking-wider">
                        <div className="bg-rose-500/20 p-1.5 rounded-full">
                            <ArrowDownRight size={14} className="text-rose-600 dark:text-rose-400" />
                        </div>
                        Expense <span className="opacity-60 hidden sm:inline">({getTimeframeShortLabel()})</span>
                        </div>
                        <p className="font-bold text-xl text-rose-900 dark:text-rose-100 mt-1">{formatCurrency(stats.expense)}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center justify-between">
          Recent Transactions
        </h3>
        
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <p>No transactions found.</p>
              <p className="text-sm mt-1">Start by adding a new record.</p>
            </div>
          ) : (
            recentTransactions.map(t => (
              <div key={t.id} className="group flex items-center p-4 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-white/5 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-glass-sm hover:scale-[1.01]">
                <div 
                  className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg transform transition-transform group-hover:rotate-6"
                  style={{ backgroundColor: getCategoryColor(t.category), opacity: 0.9 }}
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