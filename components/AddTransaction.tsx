import React, { useState } from 'react';
import { Category, Transaction, TransactionType, RecurrenceFrequency } from '../types';
import { Button } from './Button';
import { X, Repeat, Check } from 'lucide-react';

interface AddTransactionProps {
  onAdd: (data: { transaction: Omit<Transaction, 'id'>, frequency: RecurrenceFrequency }) => void;
  onCancel: () => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({ onAdd, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  
  // Set default to local today
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  });
  
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.NONE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const finalCategory = type === TransactionType.INCOME ? Category.INCOME : category;

    // Create date object at local noon to safely avoid timezone shifts when converting to ISO
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);

    onAdd({
      transaction: {
        amount: parseFloat(amount),
        description: description.trim() || finalCategory, // Default to category name if empty
        category: finalCategory,
        type,
        date: dateObj.toISOString(),
      },
      frequency
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/80 backdrop-blur-3xl animate-in slide-in-from-bottom duration-500 pt-safe-top">
      <div className="flex justify-between items-center p-8 pt-4">
        <h2 className="text-2xl font-bold text-slate-900">New Transaction</h2>
        <button onClick={onCancel} className="bg-slate-100/50 p-2 rounded-full hover:bg-slate-200/50 transition-colors">
          <X size={24} className="text-slate-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-32 space-y-8">
        {/* Type Toggle */}
        <div className="bg-slate-200/50 p-1.5 rounded-[1.2rem] flex backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
              type === TransactionType.EXPENSE ? 'bg-white text-slate-900 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType(TransactionType.INCOME);
              setCategory(Category.INCOME);
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
              type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Amount</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl group-focus-within:text-brand-500 transition-colors">$</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-6 py-6 text-4xl font-bold rounded-[1.5rem] border border-white/50 bg-white/40 focus:bg-white/80 backdrop-blur-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-300 text-slate-800 shadow-sm"
              required
            />
          </div>
        </div>

        {/* Category */}
        {type === TransactionType.EXPENSE && (
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(Category).filter(c => c !== Category.INCOME).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-3 px-2 text-xs font-bold rounded-2xl border transition-all duration-200 ${
                    category === cat
                      ? 'bg-brand-500 text-white border-brand-600 shadow-lg shadow-brand-500/30 transform scale-105'
                      : 'bg-white/40 border-white/60 text-slate-600 hover:bg-white/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
            Description <span className="text-slate-400 font-normal normal-case opacity-70">(Optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === TransactionType.INCOME ? Category.INCOME : category}
            className="w-full px-6 py-4 rounded-[1.2rem] border border-white/50 bg-white/40 focus:bg-white/80 backdrop-blur-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all"
          />
        </div>

        {/* Date & Frequency Row */}
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Date</label>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-4 rounded-[1.2rem] border border-white/50 bg-white/40 focus:bg-white/80 backdrop-blur-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all"
                required
            />
            </div>

            <div>
            <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Repeat</label>
            <div className="relative">
                <Repeat className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                className="w-full pl-10 pr-8 py-4 rounded-[1.2rem] border border-white/50 bg-white/40 focus:bg-white/80 backdrop-blur-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all appearance-none text-slate-700 font-medium"
                >
                {Object.entries(RecurrenceFrequency).map(([key, label]) => (
                    <option key={key} value={label}>
                    {label}
                    </option>
                ))}
                </select>
            </div>
            </div>
        </div>

        <div className="pt-8">
          <Button type="submit" fullWidth>
            <Check size={20} /> Save Transaction
          </Button>
        </div>
      </form>
    </div>
  );
};