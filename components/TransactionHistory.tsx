import React, { useState, useMemo } from 'react';
import { Transaction, View } from '../types';
import { getCategoryColor, getCategoryIcon, formatCurrency } from '../constants';
import { Search, Filter, Settings as SettingsIcon, Calendar, DollarSign, ArrowDown } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onSelectTransaction: (t: Transaction) => void;
  onNavigate: (view: View) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onSelectTransaction, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: 'date' | 'amount') => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;
        if (sortKey === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else {
          comparison = a.amount - b.amount;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [transactions, searchTerm, sortKey, sortDirection]);

  const groupedTransactions: Record<string, Transaction[]> = useMemo(() => {
    if (sortKey === 'amount') {
        return { 'All Transactions': filteredTransactions };
    }

    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [filteredTransactions, sortKey]);

  return (
    <div className="flex flex-col min-h-[100svh]">
      <header className="px-6 pt-safe pb-4 flex justify-between items-start bg-transparent border-b border-white/10 shrink-0">
        <div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">History</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Your spending timeline</p>
        </div>
        <button 
            onClick={() => onNavigate(View.SETTINGS)}
            className="p-3 bg-white/50 dark:bg-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm border border-white/40 dark:border-white/5 text-slate-600 dark:text-slate-300 active:scale-95 mt-1"
        >
            <SettingsIcon size={22} />
        </button>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto scroll-y-only px-6">
        <div className="h-4"></div>

        <div className="space-y-3 shrink-0">
          <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/10 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
          </div>

          <div className="flex gap-3">
              <button
                onClick={() => handleSort('date')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  sortKey === 'date'
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Calendar size={16} />
                Date
                {sortKey === 'date' && (
                    <div className={`transition-transform duration-300 ${sortDirection === 'asc' ? 'rotate-180' : ''}`}>
                        <ArrowDown size={16} />
                    </div>
                )}
              </button>
              <button
                onClick={() => handleSort('amount')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  sortKey === 'amount'
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <DollarSign size={16} />
                Amount
                {sortKey === 'amount' && (
                    <div className={`transition-transform duration-300 ${sortDirection === 'asc' ? 'rotate-180' : ''}`}>
                        <ArrowDown size={16} />
                    </div>
                )}
              </button>
          </div>
        </div>

        <div className="h-6"></div>

        {Object.keys(groupedTransactions).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Filter size={48} className="mb-4 opacity-20" />
                <p>No transactions found</p>
            </div>
        ) : (
            Object.entries(groupedTransactions).map(([groupTitle, txs]) => (
                <div key={groupTitle} className="space-y-3 mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] sticky top-0 bg-transparent backdrop-blur-sm py-2 z-10">
                        {groupTitle}
                    </h3>
                    {txs.map(t => {
                        const Icon = getCategoryIcon(t.category);
                        return (
                            <div 
                                key={t.id} 
                                onClick={() => onSelectTransaction(t)}
                                className="group flex items-center p-4 rounded-3xl glass-panel border border-white/60 dark:border-white/5 shadow-sm transition-all active:scale-95 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60"
                            >
                                <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                                    style={{ backgroundColor: getCategoryColor(t.category) }}
                                >
                                    <Icon size={20} />
                                </div>
                                <div className="ml-4 flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{t.description}</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                        {new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className={`font-bold shrink-0 ml-2 ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800 dark:text-white'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, 2)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))
        )}
        <div style={{ height: `calc(8rem + env(safe-area-inset-bottom))` }} />
      </main>
    </div>
  );
};