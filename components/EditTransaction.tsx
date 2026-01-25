import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Button } from './Button';
import { Trash2, Check, ArrowLeft, Tag, Calendar, DollarSign, Type } from 'lucide-react';

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
    if (!amount || !description) return;

    onUpdate({
      ...transaction,
      amount: parseFloat(amount),
      description,
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
    <div className="flex flex-col h-full overflow-hidden bg-transparent animate-in slide-in-from-right duration-300">
      <header className="shrink-0 px-6 pt-safe-top pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onCancel} className="p-2 bg-white/50 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-300">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Edit</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Refine transaction</p>
            </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-8 scroll-y-only px-6">
        {/* Type Toggle */}
        <div className="p-1.5 glass-panel rounded-3xl flex backdrop-blur-sm border-white/50">
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-500 ${
              type === TransactionType.EXPENSE ? 'bg-slate-800 text-white shadow-xl scale-[1.02]' : 'text-slate-500 dark:text-slate-400'
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
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-500 ${
              type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-[1.02]' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount Section */}
        <div className="text-center py-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 dark:border-white/10 shadow-glass">
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Transaction Amount</label>
          <div className="relative inline-block w-full">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full bg-transparent text-center text-7xl font-bold focus:outline-none transition-colors duration-500 
                ${type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}
              `}
              required
            />
            <div className="text-slate-400 font-bold text-2xl mt-2 opacity-50">$</div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="glass-panel p-6 rounded-[2.5rem] space-y-6 border-white/50 shadow-glass">
            <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    <Type size={12} /> Description
                </label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Transaction name"
                    className="w-full bg-white/50 dark:bg-slate-900/50 px-5 py-4 rounded-2xl border border-white/40 dark:border-white/10 outline-none text-lg font-bold text-slate-800 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                        <Calendar size={12} /> Transaction Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-900/50 px-5 py-4 rounded-2xl border border-white/40 dark:border-white/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                        required
                    />
                </div>
            </div>
        </div>

        {/* Category Selector */}
        {type === TransactionType.EXPENSE && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                <Tag size={12} /> Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-3 px-5 text-xs font-bold rounded-2xl border transition-all duration-300 ${
                    category === cat
                      ? 'bg-brand-500 text-white border-brand-600 shadow-lg scale-105'
                      : 'bg-white/40 dark:bg-white/5 border-transparent text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {!categories.includes(category) && category !== 'Income' && (
                  <button
                  type="button"
                  className="py-3 px-5 text-xs font-bold rounded-2xl bg-slate-400 text-white opacity-70"
                >
                  {category}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-4">
          <button 
            type="submit" 
            className="w-full py-5 rounded-3xl text-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 shadow-xl shadow-brand-500/30 transition-all active:scale-95"
          >
            <div className="flex items-center justify-center gap-2">
                <Check size={24} /> Save Changes
            </div>
          </button>
          
          <button 
            type="button" 
            onClick={handleDelete}
            className="w-full py-5 rounded-3xl text-lg font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 size={20} /> Delete Transaction
          </button>
        </div>
      </form>
    </div>
  );
};