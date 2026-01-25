import React, { useMemo } from 'react';
import { RecurringTransaction, RecurrenceFrequency, TransactionType, View } from '../types';
import { getCategoryColor, getCategoryIcon } from '../constants';
import { Repeat, Calendar, Trash2, CreditCard, Bell, TrendingDown } from 'lucide-react';

interface SubscriptionsProps {
  recurringTransactions: RecurringTransaction[];
  onDelete: (id: string) => void;
  onNavigate: (view: View) => void;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({ recurringTransactions, onDelete, onNavigate }) => {
  const expenseSubs = useMemo(() => 
    recurringTransactions.filter(t => t.type === TransactionType.EXPENSE),
  [recurringTransactions]);

  const stats = useMemo(() => {
    let monthly = 0;
    let yearly = 0;

    expenseSubs.forEach(s => {
      let m = 0;
      switch (s.frequency) {
        case RecurrenceFrequency.DAILY: m = s.amount * 30.42; break;
        case RecurrenceFrequency.WEEKLY: m = s.amount * 4.34; break;
        case RecurrenceFrequency.MONTHLY: m = s.amount; break;
        case RecurrenceFrequency.YEARLY: m = s.amount / 12; break;
      }
      monthly += m;
      yearly += (m * 12);
    });

    return { monthly, yearly };
  }, [expenseSubs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="px-6 pt-safe-top pb-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-500 to-vibrant-purple p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                <Repeat size={24} />
            </div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Subscriptions</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your recurring billing</p>
      </header>

      {/* Pulse Card */}
      <div className="px-6 mb-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-indigo-950 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-vibrant-purple/20 blur-[60px] rounded-full"></div>
            <div className="relative z-10 flex flex-col gap-6">
                <div>
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Monthly Commitment</p>
                    <h2 className="text-4xl font-bold text-white">{formatCurrency(stats.monthly)}</h2>
                </div>
                
                <div className="flex gap-8 border-t border-white/10 pt-6">
                    <div>
                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1">Annual Burn</p>
                        <p className="text-lg font-bold text-indigo-100">{formatCurrency(stats.yearly)}</p>
                    </div>
                    <div>
                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1">Active Plans</p>
                        <p className="text-lg font-bold text-indigo-100">{expenseSubs.length}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* List */}
      <div className="px-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Active Recurrences</h3>
        
        {expenseSubs.length === 0 ? (
            <div className="glass-panel p-12 rounded-[2rem] text-center space-y-4 border-dashed">
                <div className="bg-slate-100 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <CreditCard size={32} />
                </div>
                <p className="text-slate-400 font-medium">No recurring expenses tracked yet.</p>
                <button 
                    onClick={() => onNavigate(View.ADD)}
                    className="text-brand-500 font-bold text-sm"
                >
                    + Add First Subscription
                </button>
            </div>
        ) : (
            expenseSubs.map(sub => {
                const daysLeft = getDaysUntil(sub.nextDueDate);
                const CategoryIcon = getCategoryIcon(sub.category);
                return (
                    <div key={sub.id} className="group glass-panel p-5 rounded-[2.2rem] flex items-center gap-4 transition-all hover:scale-[1.02] border-white/40 shadow-sm relative overflow-hidden">
                        <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                            style={{ backgroundColor: getCategoryColor(sub.category) }}
                        >
                            <CategoryIcon size={24} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-bold text-slate-800 dark:text-white truncate">{sub.description}</h4>
                                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-indigo-500/10">
                                    {sub.frequency}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {formatCurrency(sub.amount)} / cycle
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <div className={`text-[10px] font-black uppercase mb-1 flex items-center justify-end gap-1 ${daysLeft <= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                <Bell size={10} /> {daysLeft === 0 ? 'Today' : `In ${daysLeft} days`}
                            </div>
                            <button 
                                onClick={() => {
                                    if(confirm('Stop this recurring payment? This won\'t delete previous transactions.')) {
                                        onDelete(sub.id);
                                    }
                                }}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Info Section */}
      <div className="mx-6 mt-8 p-6 bg-brand-500/5 rounded-[2rem] border border-brand-500/10">
        <div className="flex gap-3">
            <TrendingDown size={20} className="text-brand-500 shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                MinMaxMD automatically converts these subscriptions into transactions on their due dates. Check your history to see past payments.
            </p>
        </div>
      </div>
    </div>
  );
};