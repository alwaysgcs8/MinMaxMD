import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, TransactionType, BudgetLimit, View, AnalyticsWidgetType } from '../types';
import { getCategoryColor } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, Settings as SettingsIcon, Layout, X, Check } from 'lucide-react';
import { getStoredWidgets, saveStoredWidgets } from '../services/storageService';

interface AnalyticsProps {
  transactions: Transaction[];
  budgetLimits?: BudgetLimit[];
  onNavigate: (view: View) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ transactions, budgetLimits = [], onNavigate }) => {
  const [activeWidgets, setActiveWidgets] = useState<AnalyticsWidgetType[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [trendTimeframe, setTrendTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('day');

  useEffect(() => {
    const loaded = getStoredWidgets();
    setActiveWidgets(loaded);
  }, []);

  const toggleWidget = (type: AnalyticsWidgetType) => {
    const newWidgets = activeWidgets.includes(type)
        ? activeWidgets.filter(w => w !== type)
        : [...activeWidgets, type];
    
    setActiveWidgets(newWidgets);
    saveStoredWidgets(newWidgets);
  };

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

  const trendData = useMemo(() => {
    const data: Record<string, { date: string; amount: number; displayDate: string }> = {};
    const now = new Date();
    const toDateKey = (d: Date) => {
        const n = new Date(d);
        n.setHours(0,0,0,0);
        return n.toISOString().split('T')[0];
    };

    if (trendTimeframe === 'day') {
        for(let i=29; i>=0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = toDateKey(d);
            data[key] = {
                date: key,
                displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                amount: 0
            };
        }
    } else if (trendTimeframe === 'week') {
        const currentDay = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay);
        for(let i=11; i>=0; i--) {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() - (i * 7));
            const key = toDateKey(d);
            data[key] = {
                date: key,
                displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                amount: 0
            };
        }
    } else if (trendTimeframe === 'month') {
        for(let i=11; i>=0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            data[key] = {
                date: key,
                displayDate: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
                amount: 0
            };
        }
    } else if (trendTimeframe === 'year') {
        for(let i=4; i>=0; i--) {
            const d = new Date(now.getFullYear() - i, 0, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            data[key] = {
                date: key,
                displayDate: key,
                amount: 0
            };
        }
    }

    transactions.forEach(t => {
        if(t.type === TransactionType.EXPENSE) {
            const d = new Date(t.date);
            let key = '';
            if (trendTimeframe === 'day') key = toDateKey(d);
            else if (trendTimeframe === 'week') {
                const day = d.getDay();
                const start = new Date(d);
                start.setDate(d.getDate() - day);
                key = toDateKey(start);
            } else if (trendTimeframe === 'month') key = `${d.getFullYear()}-${d.getMonth()}`;
            else if (trendTimeframe === 'year') key = `${d.getFullYear()}`;
            if(data[key]) data[key].amount += t.amount;
        }
    });

    return Object.values(data);
  }, [transactions, trendTimeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getAxisInterval = () => {
    switch (trendTimeframe) {
        case 'day': return 5;
        case 'week': return 1;
        case 'month': return 1;
        case 'year': return 0;
        default: return 0;
    }
  };

  const renderProjections = () => (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-[1.8rem] border border-white/50 dark:border-white/10 shadow-glass relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 p-3 opacity-10 rotate-12">
                <Calendar size={80} className="text-brand-600 dark:text-cyan-400" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Month Projection</p>
             <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(projections.month.projected)}</h3>
             <div className="mt-4 flex items-center gap-1.5">
                <div className="h-2 flex-1 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden border border-white/20 dark:border-white/5">
                    <div 
                        className="h-full bg-brand-500 dark:bg-cyan-500 rounded-full" 
                        style={{ width: `${Math.min(100, (projections.month.current / projections.month.projected) * 100)}%`}}
                    ></div>
                </div>
             </div>
             <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex justify-between">
                <span>Current</span>
                <span className="text-brand-700 dark:text-cyan-300 font-bold">{formatCurrency(projections.month.current)}</span>
             </p>
        </div>

        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-5 rounded-[1.8rem] border border-white/50 dark:border-white/10 shadow-glass relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 p-3 opacity-10 rotate-12">
                <TrendingUp size={80} className="text-purple-600 dark:text-purple-400" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Year Projection</p>
             <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(projections.year.projected)}</h3>
             <div className="mt-4 flex items-center gap-1.5">
                <div className="h-2 flex-1 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden border border-white/20 dark:border-white/5">
                    <div 
                        className="h-full bg-purple-500 rounded-full" 
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
  );

  const renderBudgetLimits = () => (
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Budget Limits</h3>
        {budgetStatus.length > 0 ? (
            <div className="space-y-4">
                {budgetStatus.map((status) => {
                    const isOverLimit = status.spent > status.limit;
                    return (
                        <div key={status.category}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className={`font-semibold flex items-center gap-1 ${isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {status.category}
                                    {isOverLimit && <AlertTriangle size={12} className="text-red-500" />}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 text-xs">
                                    ${status.spent.toFixed(0)} / ${status.limit}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isOverLimit ? 'bg-red-500' : 'bg-brand-500 dark:bg-cyan-500'}`} 
                                    style={{ width: `${Math.min(100, status.percentage)}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <p className="text-slate-400 text-sm text-center py-4">No budget limits set.</p>
        )}
      </div>
  );

  const renderSpendingPie = () => (
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
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
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name) || '#cbd5e1'} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 30, 0.8)', backdropFilter: 'blur(10px)', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No expense data yet</div>
            )}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.slice(0, 4).map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm bg-white/30 dark:bg-white/5 p-2 rounded-xl border border-white/20 dark:border-white/5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(item.name) }}></div>
                    <span className="text-slate-600 dark:text-slate-300 truncate flex-1 font-medium">{item.name}</span>
                    <span className="font-bold text-slate-800 dark:text-white">${item.value.toFixed(0)}</span>
                </div>
            ))}
        </div>
      </div>
  );

  const renderIncomeVsExpense = () => (
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Income vs Expense</h3>
        <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                         cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                         contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 30, 0.8)', backdropFilter: 'blur(10px)', color: '#fff' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 6, 6]} barSize={14} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 6, 6]} barSize={14} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
  );

  const renderExpenseTrend = () => (
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Expense Trend</h3>
        <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl mb-4">
            {(['day', 'week', 'month', 'year'] as const).map((tf) => (
                <button
                    key={tf}
                    onClick={() => setTrendTimeframe(tf)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        trendTimeframe === tf 
                        ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
            ))}
        </div>

        <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.1)" />
                    <XAxis 
                        dataKey="displayDate" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11 }} 
                        dy={10} 
                        interval={getAxisInterval()}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                         contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 30, 0.8)', backdropFilter: 'blur(10px)', color: '#fff' }}
                         labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent animate-in fade-in duration-700">
      <div className="shrink-0 flex justify-between items-start px-6 pt-safe-top pb-4">
        <div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Financial Clarity</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsCustomizing(true)}
                className="p-3 bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center"
            >
                <Layout size={22} />
            </button>
            <button 
                onClick={() => onNavigate(View.SETTINGS)}
                className="p-3 bg-white/50 dark:bg-white/10 rounded-full border border-white/40 dark:border-white/5 text-slate-600 dark:text-slate-300"
            >
                <SettingsIcon size={22} />
            </button>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-6 pb-32 scroll-y-only no-scrollbar">
        {activeWidgets.length === 0 && (
             <div className="text-center py-12 text-slate-400 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <p>No widgets active.</p>
                <button onClick={() => setIsCustomizing(true)} className="mt-2 text-brand-500 font-bold hover:underline">Customize Dashboard</button>
             </div>
        )}
        {activeWidgets.includes(AnalyticsWidgetType.PROJECTIONS) && renderProjections()}
        {activeWidgets.includes(AnalyticsWidgetType.EXPENSE_TREND) && renderExpenseTrend()}
        {activeWidgets.includes(AnalyticsWidgetType.SPENDING_PIE) && renderSpendingPie()}
        {activeWidgets.includes(AnalyticsWidgetType.INCOME_VS_EXPENSE) && renderIncomeVsExpense()}
        {activeWidgets.includes(AnalyticsWidgetType.BUDGET_LIMITS) && renderBudgetLimits()}
      </div>

      {isCustomizing && (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsCustomizing(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 z-[70] rounded-t-[2.5rem] p-6 pb-safe-bottom shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layout className="text-brand-500" /> Customize Dashboard
                    </h3>
                    <button onClick={() => setIsCustomizing(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pb-6">
                    {[
                        { type: AnalyticsWidgetType.PROJECTIONS, label: "Projections", desc: "Monthly & Yearly linear forecast", icon: Calendar },
                        { type: AnalyticsWidgetType.EXPENSE_TREND, label: "Expense Trend", desc: "Interactive spending timeline", icon: TrendingUp },
                        { type: AnalyticsWidgetType.SPENDING_PIE, label: "Category Breakdown", desc: "Pie chart of expenses", icon: PieChart },
                        { type: AnalyticsWidgetType.INCOME_VS_EXPENSE, label: "Income vs Expense", desc: "Monthly bar chart comparison", icon: BarChart },
                        { type: AnalyticsWidgetType.BUDGET_LIMITS, label: "Budget Limits", desc: "Progress bars for category limits", icon: AlertTriangle },
                    ].map((widget) => (
                        <button 
                            key={widget.type}
                            onClick={() => toggleWidget(widget.type)}
                            className={`w-full flex items-center p-4 rounded-2xl border transition-all ${activeWidgets.includes(widget.type) ? 'bg-brand-500/10 border-brand-500' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent'}`}
                        >
                            <div className={`p-3 rounded-xl mr-4 ${activeWidgets.includes(widget.type) ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                <widget.icon size={20} />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className={`font-bold ${activeWidgets.includes(widget.type) ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>{widget.label}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{widget.desc}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${activeWidgets.includes(widget.type) ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                {activeWidgets.includes(widget.type) && <Check size={14} className="text-white" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
};