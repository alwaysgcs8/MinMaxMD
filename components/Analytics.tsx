import React, { useMemo } from 'react';
import { Transaction, TransactionType, Category, BudgetLimit, View } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
  budgetLimits?: BudgetLimit[];
  onNavigate: (view: View) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ transactions, budgetLimits = [], onNavigate }) => {
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const summary: Record<string, number> = {};
    expenses.forEach(t => {
      summary[t.category] = (summary[t.category] || 0) + t.amount;
    });
    
    return Object.entries(summary)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Merge limits with actual spending
  const budgetStatus = useMemo(() => {
    if (!budgetLimits.length) return [];
    
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const spending: Record<string, number> = {};
    
    expenses.forEach(t => {
        const d = new Date(t.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        }
    });

    return budgetLimits.map(limit => ({
        category: limit.category,
        limit: limit.limit,
        spent: spending[limit.category] || 0,
        percentage: ((spending[limit.category] || 0) / limit.limit) * 100
    })).sort((a, b) => b.percentage - a.percentage);
  }, [transactions, budgetLimits]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const data: Record<string, { name: string; income: number; expense: number }> = {};
    
    for(let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        data[key] = {
            name: d.toLocaleString('default', { month: 'short' }),
            income: 0,
            expense: 0
        };
    }

    transactions.forEach(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (data[key]) {
            if (t.type === TransactionType.INCOME) data[key].income += t.amount;
            else data[key].expense += t.amount;
        }
    });

    return Object.values(data);
  }, [transactions]);

  const projections = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthProgress = Math.max(1, currentDay); 

    const startOfYear = new Date(currentYear, 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    const isLeap = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
    const daysInYear = isLeap ? 366 : 365;
    const yearProgress = Math.max(1, dayOfYear);

    let currentMonthExp = 0;
    let currentYearExp = 0;

    transactions.forEach(t => {
      if (t.type === TransactionType.EXPENSE) {
        const d = new Date(t.date);
        if (d.getFullYear() === currentYear) {
          currentYearExp += t.amount;
          if (d.getMonth() === currentMonth) {
            currentMonthExp += t.amount;
          }
        }
      }
    });

    const projectedMonth = (currentMonthExp / monthProgress) * daysInMonth;
    const projectedYear = (currentYearExp / yearProgress) * daysInYear;

    return {
      month: { current: currentMonthExp, projected: projectedMonth },
      year: { current: currentYearExp, projected: projectedYear }
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="pb-32 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-start px-6 pt-safe-top pb-4">
        <div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Financial Clarity</p>
        </div>
        <button 
            onClick={() => onNavigate(View.SETTINGS)}
            className="p-3 bg-white/50 dark:bg-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm border border-white/40 dark:border-white/5 text-slate-600 dark:text-slate-300"
        >
            <SettingsIcon size={22} />
        </button>
      </div>

      {/* Projections */}
      <div className="mx-6 grid grid-cols-2 gap-4">
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-[1.8rem] border border-white/50 dark:border-white/10 shadow-glass relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
             <div className="absolute -right-4 -top-4 p-3 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <Calendar size={80} className="text-brand-600 dark:text-cyan-400" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Month Projection</p>
             <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(projections.month.projected)}</h3>
             <div className="mt-4 flex items-center gap-1.5">
                <div className="h-2 flex-1 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden border border-white/20 dark:border-white/5">
                    <div 
                        className="h-full bg-brand-500 dark:bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)] dark:shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                        style={{ width: `${Math.min(100, (projections.month.current / projections.month.projected) * 100)}%`}}
                    ></div>
                </div>
             </div>
             <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex justify-between">
                <span>Current</span>
                <span className="text-brand-700 dark:text-cyan-300 font-bold">{formatCurrency(projections.month.current)}</span>
             </p>
        </div>

        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-[1.8rem] border border-white/50 dark:border-white/10 shadow-glass relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
             <div className="absolute -right-4 -top-4 p-3 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <TrendingUp size={80} className="text-purple-600 dark:text-purple-400" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Year Projection</p>
             <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(projections.year.projected)}</h3>
             <div className="mt-4 flex items-center gap-1.5">
                <div className="h-2 flex-1 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden border border-white/20 dark:border-white/5">
                    <div 
                        className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                        style={{ width: `${Math.min(100, (projections.year.current / projections.year.projected) * 100)}%`}}
                    ></div>
                </div>
             </div>
             <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex justify-between">
                <span>Current</span>
                <span className="text-purple-700 dark:text-purple-300 font-bold">{formatCurrency(projections.year.current)}</span>
             </p>
        </div>
      </div>

      {/* Budget Limits */}
      {budgetStatus.length > 0 && (
          <div className="mx-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Budget Limits</h3>
            <div className="space-y-4">
                {budgetStatus.map((status) => {
                    const isOverLimit = status.spent > status.limit;
                    const barColor = isOverLimit ? 'bg-red-500' : 'bg-brand-500 dark:bg-cyan-500';
                    const textColor = isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300';
                    
                    return (
                        <div key={status.category}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className={`font-semibold ${textColor} flex items-center gap-1`}>
                                    {status.category}
                                    {isOverLimit && <AlertTriangle size={12} className="text-red-500" />}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 text-xs">
                                    ${status.spent.toFixed(0)} / ${status.limit}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${barColor} ${isOverLimit ? 'shadow-[0_0_10px_rgba(239,68,68,0.6)]' : ''}`} 
                                    style={{ width: `${Math.min(100, status.percentage)}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
      )}

      {/* Expense Breakdown */}
      <div className="mx-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Spending Breakdown</h3>
        <div className="h-64 w-full">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={categoryData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={6}
                        dataKey="value"
                        cornerRadius={6}
                        stroke="none"
                    >
                        {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#cbd5e1'} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 30, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    No expense data yet
                </div>
            )}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.slice(0, 4).map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm bg-white/30 dark:bg-white/5 p-2 rounded-xl border border-white/20 dark:border-white/5">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[item.name as Category] }}></div>
                    <span className="text-slate-600 dark:text-slate-300 truncate flex-1 font-medium">{item.name}</span>
                    <span className="font-bold text-slate-800 dark:text-white">${item.value.toFixed(0)}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="mx-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Income vs Expense</h3>
        <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                         cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                         contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 30, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', color: '#fff' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 6, 6]} barSize={14} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 6, 6]} barSize={14} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};