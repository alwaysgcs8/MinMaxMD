import React, { useState } from 'react';
import { Transaction, TransactionType, RecurrenceFrequency, View } from '../types';
import { Button } from './Button';
import { X, Repeat, Check, Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '../constants';

interface AddTransactionProps {
  categories: string[];
  onAdd: (data: { transaction: Omit<Transaction, 'id'>, frequency: RecurrenceFrequency }) => void;
  onCancel: () => void;
  onNavigateSubscriptions?: () => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({ categories, onAdd, onCancel, onNavigateSubscriptions }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(categories[0] || 'Other');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [isRecurring, setIsRecurring] = useState(false);
  
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  });
  
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.MONTHLY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const finalCategory = type === TransactionType.INCOME ? 'Income' : category;
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);

    onAdd({
      transaction: {
        amount: parseFloat(amount),
        description: description.trim() || finalCategory,
        category: finalCategory,
        type,
        date: dateObj.toISOString(),
      },
      frequency: isRecurring ? frequency : RecurrenceFrequency.NONE
    });
  };

  const frequencyOptions = [
    { value: RecurrenceFrequency.DAILY, label: 'Daily' },
    { value: RecurrenceFrequency.WEEKLY, label: 'Weekly' },
    { value: RecurrenceFrequency.MONTHLY, label: 'Monthly' },
    { value: RecurrenceFrequency.YEARLY, label: 'Yearly' },
  ];

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col transition-colors duration-700 pt-safe-top overflow-hidden
      ${type === TransactionType.INCOME 
        ? 'bg-emerald-500/10' 
        : (isRecurring ? 'bg-vibrant-purple/10' : 'bg-rose-500/10')}
    `}>
      <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-[100px] z-0"></div>
      
      <div className={`absolute top-0 right-0 w-80 h-80 blur-[100px] opacity-30 rounded-full transition-all duration-700 -translate-y-1/2 translate-x-1/2
        ${type === TransactionType.INCOME 
            ? 'bg-emerald-500' 
            : (isRecurring ? 'bg-vibrant-purple shadow-[0_0_100px_rgba(168,85,247,0.5)]' : 'bg-rose-500')}
      `}></div>

      <div className="relative z-10 flex justify-between items-center p-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {isRecurring ? 'New Subscription' : 'New Record'}
            </h2>
            <p className="text-slate-500 font-medium">
                {isRecurring ? 'Set up recurring billing' : `Capture your ${type.toLowerCase()} details`}
            </p>
        </div>
        <button onClick={onCancel} className="bg-slate-200/50 dark:bg-white/10 p-3 rounded-2xl hover:bg-slate-300 dark:hover:bg-white/20 transition-all active:scale-90">
          <X size={24} className="text-slate-800 dark:text-slate-200" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto px-8 pb-32 space-y-8 no-scrollbar">
        <div className="space-y-4">
            <div className="glass-panel p-1.5 rounded-[1.8rem] flex relative overflow-hidden">
                <button
                    type="button"
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500 z-10 ${
                    type === TransactionType.EXPENSE ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500'
                    }`}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setType(TransactionType.INCOME);
                        setCategory('Income');
                        setIsRecurring(false);
                    }}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500 z-10 ${
                    type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 'text-slate-500'
                    }`}
                >
                    Income
                </button>
            </div>

            {type === TransactionType.EXPENSE && (
                <div className="glass-panel p-1.5 rounded-[1.8rem] flex relative overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setIsRecurring(false)}
                        className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-2xl transition-all duration-500 z-10 ${
                        !isRecurring ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'
                        }`}
                    >
                        One-Time
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsRecurring(true)}
                        className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-2xl transition-all duration-500 z-10 ${
                        isRecurring ? 'bg-vibrant-purple text-white shadow-lg' : 'text-slate-400'
                        }`}
                    >
                        Recurring
                    </button>
                </div>
            )}
        </div>

        <div className="text-center py-4">
          <div className="relative inline-block w-full">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full bg-transparent text-center text-7xl font-bold focus:outline-none transition-colors duration-500 placeholder:text-slate-200 dark:placeholder:text-slate-800
                ${type === TransactionType.INCOME 
                    ? 'text-emerald-500' 
                    : (isRecurring ? 'text-vibrant-purple' : 'text-rose-500')}
              `}
              required
              autoFocus
            />
            <div className="text-slate-400 font-bold text-3xl mt-2 opacity-50">$</div>
          </div>
        </div>

        {isRecurring && type === TransactionType.EXPENSE && (
            <div className="space-y-4 animate-in slide-in-from-top duration-500">
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
        )}

        {type === TransactionType.EXPENSE && (
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-4 px-2 text-[10px] font-bold rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                      category === cat
                        ? 'bg-white dark:bg-slate-800 border-brand-500 shadow-xl scale-105 text-brand-600'
                        : 'bg-white/20 dark:bg-white/5 border-transparent text-slate-500'
                    }`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${category === cat ? 'scale-110 shadow-md' : 'opacity-60 grayscale'}`}
                      style={{ backgroundColor: getCategoryColor(cat) }}
                    >
                      <Icon size={16} />
                    </div>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass-panel p-6 rounded-[2rem] space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isRecurring ? 'Subscription name' : 'What was it for?'}
                    className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-2 focus:border-brand-500 outline-none transition-colors text-lg font-medium text-slate-800 dark:text-white"
                />
            </div>

            <div className="pt-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {isRecurring ? 'Next Bill' : 'Date'}
                </label>
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex-1 bg-transparent text-slate-700 dark:text-slate-200 font-bold outline-none"
                        required
                    />
                </div>
            </div>
        </div>

        <div className="pt-4 space-y-4">
          <Button 
            type="submit" 
            fullWidth 
            className={`py-6 rounded-3xl text-xl shadow-2xl
                ${type === TransactionType.INCOME 
                    ? 'from-emerald-500 to-teal-600' 
                    : (isRecurring ? 'from-indigo-600 to-vibrant-purple' : 'from-rose-500 to-pink-600')}
            `}
          >
            <Check size={24} /> {isRecurring ? 'Add Subscription' : 'Add Record'}
          </Button>
        </div>
      </form>
    </div>
  );
};