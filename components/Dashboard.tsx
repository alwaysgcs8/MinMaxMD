import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, TransactionType, View } from '../types';
import { getCategoryColor, getCategoryIcon, formatCurrency } from '../constants';
import { ArrowUpRight, ArrowDownRight, Settings as SettingsIcon, Target, ChevronRight, ChevronLeft } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: View) => void;
  onSelectTransaction: (t: Transaction) => void;
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface PeriodData {
  label: string;
  subLabel: string;
  startDate: Date;
  endDate: Date;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate, onSelectTransaction }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [selectedIndex, setSelectedIndex] = useState(12);
  
  const periods = useMemo((): PeriodData[] => {
    const list: PeriodData[] = [];
    const now = new Date();
    
    for (let i = 12; i >= 0; i--) {
      const start = new Date(now);
      const end = new Date(now);
      let label = '';
      let subLabel = '';

      if (timeframe === 'daily') {
        start.setDate(now.getDate() - i);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - i);
        end.setHours(23, 59, 59, 999);
        label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : start.toLocaleDateString(undefined, { weekday: 'long' });
        subLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else if (timeframe === 'weekly') {
        const day = now.getDay();
        start.setDate(now.getDate() - day - (i * 7));
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        label = i === 0 ? 'This Week' : `Week of ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        subLabel = `${start.getFullYear()}`;
      } else if (timeframe === 'monthly') {
        start.setMonth(now.getMonth() - i, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() - i + 1, 0);
        end.setHours(23, 59, 59, 999);
        label = i === 0 ? 'This Month' : start.toLocaleDateString(undefined, { month: 'long' });
        subLabel = start.getFullYear().toString();
      } else if (timeframe === 'yearly') {
        start.setFullYear(now.getFullYear() - i, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(now.getFullYear() - i, 11, 31);
        end.setHours(23, 59, 59, 999);
        label = start.getFullYear().toString();
        subLabel = i === 0 ? 'Current Year' : 'Previous Year';
      }

      list.push({ label, subLabel, startDate: start, endDate: end });
    }
    return list;
  }, [timeframe]);

  useEffect(() => {
    setSelectedIndex(periods.length - 1);
  }, [timeframe, periods.length]);

  const selectedPeriod = periods[selectedIndex];

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= selectedPeriod.startDate && tDate <= selectedPeriod.endDate) {
        if (t.type === TransactionType.INCOME) income += t.amount;
        else expense += t.amount;
      }
    });
    return { income, expense, balance: income - expense };
  }, [transactions, selectedPeriod]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= selectedPeriod.startDate && tDate <= selectedPeriod.endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedPeriod]);

  const navigatePeriod = (dir: number) => {
    const nextIdx = selectedIndex + dir;
    if (nextIdx >= 0 && nextIdx < periods.length) {
      setSelectedIndex(nextIdx);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-safe pb-4 flex justify-between items-center bg-transparent border-b border-white/10 shrink-0">
        <div className="flex items-center py-1.5">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            MinMax<span className="text-brand-500">MD</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate(View.BUDGET)} className="p-2.5 rounded-xl glass-panel text-slate-500 hover:text-brand-500 transition-colors">
            <Target size={20} />
          </button>
          <button onClick={() => onNavigate(View.SETTINGS)} className="p-2.5 rounded-xl glass-panel text-slate-500 hover:text-brand-500 transition-colors">
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto scroll-y-only px-6">
        <div className="h-4"></div>
        
        {/* Timeframe Selector */}
        <div className="pb-4">
          <div className="flex glass-panel p-1 rounded-2xl overflow-hidden shadow-sm border border-white/20">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  timeframe === tf ? 'bg-brand-500 text-white shadow-md scale-[1.02]' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Balance Card */}
        <div className="mb-8">
          <div className="bg-slate-900 dark:bg-slate-800/90 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/20 blur-[60px] rounded-full"></div>
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => navigatePeriod(-1)}
                    disabled={selectedIndex === 0}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full disabled:opacity-20 transition-all active:scale-90"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex flex-col ml-1">
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.1em] leading-none">{selectedPeriod.label}</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase mt-1 tracking-wider">{selectedPeriod.subLabel}</p>
                  </div>
                  <button 
                    onClick={() => navigatePeriod(1)}
                    disabled={selectedIndex === periods.length - 1}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full disabled:opacity-20 transition-all active:scale-90"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="bg-white/5 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
                </div>
              </div>

              <div className="py-2">
                <h2 className="text-5xl sm:text-6xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                  {formatCurrency(stats.balance)}
                </h2>
              </div>
              
              <div className="flex gap-3 mt-1">
                <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05] backdrop-blur-sm flex items-center justify-between group">
                  <div>
                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1 flex items-center gap-1">
                      <ArrowUpRight size={12} strokeWidth={3} /> In
                    </p>
                    <p className="text-lg font-bold text-white tracking-tight">{formatCurrency(stats.income)}</p>
                  </div>
                </div>
                <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05] backdrop-blur-sm flex items-center justify-between group">
                  <div>
                    <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1 flex items-center gap-1">
                      <ArrowDownRight size={12} strokeWidth={3} /> Out
                    </p>
                    <p className="text-lg font-bold text-white tracking-tight">{formatCurrency(stats.expense)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.15em]">Activity</h3>
            <button 
                onClick={() => onNavigate(View.HISTORY)}
                className="text-xs font-bold text-brand-500 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
                Timeline <ChevronRight size={14} />
            </button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/20 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10 shadow-inner">
              <p className="text-sm font-semibold tracking-wide">No transactions this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 8).map(t => {
                const Icon = getCategoryIcon(t.category);
                return (
                  <div 
                    key={t.id} 
                    onClick={() => onSelectTransaction(t)}
                    className="glass-panel p-4 rounded-[1.5rem] flex items-center gap-4 border-white/40 shadow-sm active:scale-[0.98] transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer"
                  >
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                      style={{ backgroundColor: getCategoryColor(t.category) }}
                    >
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] text-slate-900 dark:text-slate-100 truncate tracking-tight">{t.description}</p>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">
                        {t.category} • {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className={`font-black text-[15px] text-right ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{ height: `calc(8rem + env(safe-area-inset-bottom))` }} />
      </main>
    </div>
  );
};