import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Transaction, TransactionType, View } from '../types';
import { getCategoryColor, getCategoryIcon } from '../constants';
import { ArrowUpRight, ArrowDownRight, Settings as SettingsIcon, Target } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: View) => void;
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface PeriodData {
  label: string;
  subLabel: string;
  startDate: Date;
  endDate: Date;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [selectedIndex, setSelectedIndex] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        subLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
    setSelectedIndex(12);
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      }, 0);
    }
  }, [timeframe]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);
    
    if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < periods.length) {
      setSelectedIndex(newIndex);
    }
  };

  const selectedPeriod = periods[selectedIndex];

  const allPeriodStats = useMemo(() => {
    return periods.map(p => {
      let income = 0;
      let expense = 0;
      transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (tDate >= p.startDate && tDate <= p.endDate) {
          if (t.type === TransactionType.INCOME) income += t.amount;
          else expense += t.amount;
        }
      });
      return { income, expense, balance: income - expense };
    });
  }, [transactions, periods]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= selectedPeriod.startDate && tDate <= selectedPeriod.endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Header */}
      <div className="shrink-0 flex justify-between items-center px-6 pt-safe-top pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            MinMax<span className="text-brand-500 font-black">MD</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate(View.BUDGET)}
            className="p-2.5 glass-panel rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300"
          >
            <Target size={22} />
          </button>
          <button 
            onClick={() => onNavigate(View.SETTINGS)}
            className="p-2.5 glass-panel rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300"
          >
            <SettingsIcon size={22} />
          </button>
        </div>
      </div>

      {/* Main vertical scroll area - Locking horizontal jitter */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 scroll-y-only">
        
        {/* Timeframe Tab Selector */}
        <div className="px-6 py-4">
          <div className="flex glass-panel p-1 rounded-2xl border border-white/40 dark:border-white/5 relative overflow-hidden">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all duration-300 relative z-10 ${
                  timeframe === tf 
                  ? 'text-white' 
                  : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tf}
                {timeframe === tf && (
                  <div className="absolute inset-0 bg-brand-500 -z-10 rounded-xl shadow-lg"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Swipeable Summary - Explicitly locked to horizontal only */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex no-scrollbar w-full h-auto scroll-x-only snap-x snap-mandatory"
        >
          {periods.map((p, idx) => {
            const stats = allPeriodStats[idx];
            const isCurrent = idx === 12;
            const historyLabel = isCurrent ? 'Current' : `-${12 - idx} ${timeframe.replace('ly', '')}${12-idx > 1 ? 's' : ''}`;
            
            return (
              <div 
                key={idx}
                className="flex-none w-full snap-start px-6"
              >
                <div className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-brand-600 to-indigo-950 p-[1.5px] shadow-2xl shadow-brand-500/20 transition-transform duration-300">
                  <div className="relative p-8 rounded-[2.7rem] bg-slate-900/10 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden min-h-[240px]">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-400/10 rounded-full blur-[70px]"></div>
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-vibrant-purple/10 rounded-full blur-[70px]"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="max-w-[70%]">
                          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                            {p.label} Balance
                          </p>
                          <h2 className="text-4xl font-bold tracking-tighter text-white break-words">
                            {formatCurrency(stats.balance)}
                          </h2>
                          <p className="text-white/40 text-[11px] font-bold mt-2">
                            {p.subLabel}
                          </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                            <div className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white/90 border border-white/20 backdrop-blur-sm">
                                {historyLabel}
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-8">
                        <div className="flex-1 bg-white/10 rounded-[1.8rem] p-4 border border-white/10 backdrop-blur-md">
                          <p className="text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1 mb-1">
                            <ArrowUpRight size={12} /> Income
                          </p>
                          <p className="font-bold text-lg text-white">{formatCurrency(stats.income)}</p>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-[1.8rem] p-4 border border-white/10 backdrop-blur-md">
                          <p className="text-[9px] font-black uppercase text-rose-400 flex items-center gap-1 mb-1">
                            <ArrowDownRight size={12} /> Expense
                          </p>
                          <p className="font-bold text-lg text-white">{formatCurrency(stats.expense)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-1.5 mt-6 mb-10">
          {periods.slice(7).map((_, i) => {
            const actualIdx = i + 7;
            return (
              <div 
                key={actualIdx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${selectedIndex === actualIdx ? 'w-6 bg-brand-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700/50'}`}
              />
            );
          })}
        </div>

        {/* Activity Section */}
        <div className="px-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Activity</h3>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {selectedIndex === 12 ? 'Latest' : selectedPeriod.label}
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-slate-400 glass-panel rounded-[2.5rem] border-dashed border-2 border-slate-100 dark:border-white/5 flex flex-col items-center justify-center">
              <p className="font-semibold text-sm">No activity recorded for this period.</p>
              <button 
                onClick={() => onNavigate(View.ADD)} 
                className="mt-4 text-brand-500 font-bold text-xs bg-brand-500/10 px-4 py-2 rounded-full"
              >
                Log a Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map(t => {
                const Icon = getCategoryIcon(t.category);
                return (
                  <div 
                    key={t.id} 
                    className="group flex items-center p-4 rounded-[1.8rem] glass-panel border border-white/40 dark:border-white/5 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                      style={{ backgroundColor: getCategoryColor(t.category) }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{t.description}</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wide">
                        {t.category} • {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className={`font-bold shrink-0 ml-2 ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};