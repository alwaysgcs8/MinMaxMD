import React, { useState } from 'react';
import { Category, Transaction, TransactionType } from '../types';
import { Button } from './Button';
import { X, Trash2, Check, ArrowLeft } from 'lucide-react';

interface EditTransactionProps {
  transaction: Transaction;
  onUpdate: (updated: Transaction) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export const EditTransaction: React.FC<EditTransactionProps> = ({ transaction, onUpdate, onDelete, onCancel }) => {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState<Category>(transaction.category);
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [date, setDate] = useState(transaction.date.split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onUpdate({
      ...transaction,
      amount: parseFloat(amount),
      description,
      category: type === TransactionType.INCOME ? Category.INCOME : category,
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
    <div className="fixed inset-0 z-50 flex flex-col bg-white/80 backdrop-blur-3xl animate-in slide-in-from-right duration-300 pt-safe-top">
      <div className="flex justify-between items-center p-6">
        <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-slate-100/50 transition-colors text-slate-600 dark:text-slate-300">
            <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Transaction</h2>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-10 space-y-8">
        {/* Type Toggle */}
        <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[1.2rem] flex backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
              type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
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
              type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Amount</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl group-focus-within:text-brand-500 transition-colors">$</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-6 py-6 text-4xl font-bold rounded-[1.5rem] border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 focus:bg-white/80 dark:focus:bg-black/40 backdrop-blur-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-300 text-slate-800 dark:text-white shadow-sm"
              required
            />
          </div>
        </div>

        {/* Category */}
        {type === TransactionType.EXPENSE && (
          <div>
            <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(Category).filter(c => c !== Category.INCOME).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-3 px-2 text-xs font-bold rounded-2xl border transition-all duration-200 ${
                    category === cat
                      ? 'bg-brand-500 text-white border-brand-600 shadow-lg shadow-brand-500/30 transform scale-105'
                      : 'bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
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
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Coffee, Rent, etc."
            className="w-full px-6 py-4 rounded-[1.2rem] border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 focus:bg-white/80 dark:focus:bg-black/40 backdrop-blur-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all dark:text-white"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-4 rounded-[1.2rem] border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 focus:bg-white/80 dark:focus:bg-black/40 backdrop-blur-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all dark:text-white"
            required
          />
        </div>

        <div className="pt-8 space-y-4">
          <Button type="submit" fullWidth>
            <Check size={20} /> Update Transaction
          </Button>
          <Button type="button" variant="danger" fullWidth onClick={handleDelete}>
            <Trash2 size={20} /> Delete Transaction
          </Button>
        </div>
      </form>
    </div>
  );
};