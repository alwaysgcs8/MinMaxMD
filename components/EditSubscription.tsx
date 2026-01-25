import React, { useState } from 'react';
import { RecurringTransaction, RecurrenceFrequency } from '../types';
import { Trash2, Check, ArrowLeft, Tag, Calendar, Clock, Type } from 'lucide-react';

interface EditSubscriptionProps {
  recurringTransaction: RecurringTransaction;
  categories: string[];
  onUpdate: (updated: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export const EditSubscription: React.FC<EditSubscriptionProps> = ({ recurringTransaction, categories, onUpdate, onDelete, onCancel }) => {
  const [amount, setAmount] = useState(recurringTransaction.amount.toString());
  const [description, setDescription] = useState(recurringTransaction.description);
  const [category, setCategory] = useState<string>(recurringTransaction.category);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(recurringTransaction.frequency);
  const [nextDueDate, setNextDueDate] = useState(recurringTransaction.nextDueDate.split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !description.trim()) return;

    onUpdate({
      ...recurringTransaction,
      amount: numAmount,
      description: description.trim(),
      category: category,
      frequency,
      nextDueDate: new Date(nextDueDate).toISOString(),
    });
  };

  const handleDelete = () => {
    if (confirm('Stop this subscription? It will no longer generate future transactions.')) {
        onDelete(recurringTransaction.id);
    }
  };

  const frequencyOptions = [
    { value: RecurrenceFrequency.DAILY, label: 'Daily' },
    { value: RecurrenceFrequency.WEEKLY, label: 'Weekly' },
    { value: RecurrenceFrequency.MONTHLY, label: 'Monthly' },
    { value: RecurrenceFrequency.YEARLY, label: 'Yearly' },
  ];

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
                <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Subscription</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Update recurring bill</p>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-y-only pb-32 pb-safe px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center py-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/60 dark:border-white/10 shadow-glass">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">Billing Amount</label>
            <div className="relative inline-block w-full">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-center text-6xl font-bold focus:outline-none transition-colors duration-500 text-vibrant-purple"
                required
              />
              <div className="text-slate-400 dark:text-slate-600 font-bold text-xl mt-4 opacity-50 uppercase tracking-widest">$ / {frequency.toLowerCase()}</div>
            </div>
          </div>

          <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Clock size={12} /> Cycle
              </label>
              <div className="grid grid-cols-4 gap-2">
                  {frequencyOptions.map((opt) => (
                      <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFrequency(opt.value)}
                          className={`py-3 rounded-xl text-[10px] font-bold transition-all border ${
                              frequency === opt.value
                                  ? 'bg-vibrant-purple border-vibrant-purple text-white shadow-lg scale-105'
                                  : 'bg-white/40 dark:bg-white/5 border-transparent text-slate-500'
                          }`}
                      >
                          {opt.label}
                      </button>
                  ))}
              </div>
          </div>

          <div className="glass-panel p-8 rounded-[3rem] space-y-8 border-white/60 dark:border-white/10 shadow-glass">
              <div className="w-full">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                      <Type size={12} /> Description
                  </label>
                  <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-900/50 px-6 py-5 rounded-2xl border border-white/40 dark:border-white/10 outline-none text-xl font-bold text-slate-800 dark:text-white"
                      required
                  />
              </div>

              <div className="w-full">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                      <Calendar size={12} /> Next Billing Date
                  </label>
                  <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-900/50 px-6 py-5 rounded-2xl border border-white/40 dark:border-white/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                      required
                  />
              </div>
          </div>

          <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                  <Tag size={12} /> Category
              </label>
              <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                  <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-4 px-6 text-xs font-bold rounded-2xl border transition-all duration-300 ${
                      category === cat
                          ? 'bg-vibrant-purple text-white border-vibrant-purple shadow-lg scale-105'
                          : 'bg-white/40 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400'
                      }`}
                  >
                      {cat}
                  </button>
                  ))}
              </div>
          </div>

          <div className="pt-6 space-y-4">
            <button 
              type="submit" 
              className="w-full py-6 rounded-[2.2rem] text-xl font-bold text-white bg-vibrant-purple shadow-xl shadow-purple-500/30 active:scale-95 transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                  <Check size={24} /> Save Subscription
              </div>
            </button>
            
            <button 
              type="button" 
              onClick={handleDelete}
              className="w-full py-6 rounded-[2.2rem] text-lg font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={20} /> Stop Subscription
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};