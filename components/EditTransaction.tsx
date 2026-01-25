import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2, Check, ArrowLeft, Tag, Calendar, Type } from 'lucide-react';

interface EditTransactionProps {
  transaction: Transaction;
  categories: string[];
  onUpdate: (updated: Transaction) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export const EditTransaction: React.FC<EditTransactionProps> = ({ transaction, categories, onUpdate, onDelete, onCancel }) => {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState<string>(transaction.category);
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [date, setDate] = useState(transaction.date.split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !description.trim()) return;

    onUpdate({
      ...transaction,
      amount: numAmount,
      description: description.trim(),
      category: type === TransactionType.INCOME ? 'Income' : category,
      type,
      date: new Date(date).toISOString(),
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
        onDelete(transaction.id);
    }
  };

  return (
    <div className="flex flex-col min-h-[100svh]">
      <header className="px-6 pt-safe pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={onCancel} 
              className="p-3 bg-white/50 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/5 shadow-sm active:scale-90 transition-all"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Edit</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Update your record</p>
            </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto scroll-y-only px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Toggle Container */}
          <div className="p-1.5 glass-panel rounded-[2rem] flex backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass overflow-hidden">
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 ${
                type === TransactionType.EXPENSE ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType(TransactionType.INCOME);
                setCategory('Income');
              }}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 ${
                type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-[1.02]' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="text-center py-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/60 dark:border-white/10 shadow-glass overflow-hidden">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">Transaction Amount</label>
            <div className="relative inline-block w-full">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full bg-transparent text-center text-6xl sm:text-7xl font-bold focus:outline-none transition-colors duration-500 
                  ${type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}
                `}
                required
              />
              <div className="text-slate-400 dark:text-slate-600 font-bold text-xl mt-4 opacity-50 uppercase tracking-widest">$</div>
            </div>
          </div>

          {/* Form Fields Panel */}
          <div className="glass-panel p-8 rounded-[3rem] space-y-8 border-white/60 dark:border-white/10 shadow-glass overflow-hidden">
              <div className="w-full">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                      <Type size={12} /> Description
                  </label>
                  <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="E.g. Coffee, rent, etc."
                      className="w-full bg-white/50 dark:bg-slate-900/50 px-6 py-5 rounded-2xl border border-white/40 dark:border-white/10 outline-none text-xl font-bold text-slate-800 dark:text-white transition-all focus:border-brand-500/50"
                      required
                  />
              </div>

              <div className="w-full">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                      <Calendar size={12} /> Date
                  </label>
                  <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-900/50 px-6 py-5 rounded-2xl border border-white/40 dark:border-white/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                      required
                  />
              </div>
          </div>

          {/* Category Selector */}
          {type === TransactionType.EXPENSE && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                  <Tag size={12} /> Category
              </label>
              <div className="flex flex-wrap gap-2.5 pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-4 px-6 text-xs font-bold rounded-2xl border transition-all duration-300 ${
                      category === cat
                        ? 'bg-brand-500 text-white border-brand-600 shadow-lg scale-105'
                        : 'bg-white/40 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions Group */}
          <div className="pt-6 space-y-4">
            <button 
              type="submit" 
              className="w-full py-6 rounded-[2.2rem] text-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 shadow-xl shadow-brand-500/30 active:scale-95 transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                  <Check size={24} /> Save Changes
              </div>
            </button>
            
            <button 
              type="button" 
              onClick={handleDelete}
              className="w-full py-6 rounded-[2.2rem] text-lg font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={20} /> Delete Record
            </button>
          </div>
        </form>
        <div style={{ height: `calc(8rem + env(safe-area-inset-bottom))` }} />
      </main>
    </div>
  );
};