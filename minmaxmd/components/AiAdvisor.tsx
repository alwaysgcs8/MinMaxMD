import React, { useState } from 'react';
import { Transaction } from '../types';
import { getBudgetAnalysis } from '../services/geminiService';
import { Sparkles, RefreshCw, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAdvisorProps {
  transactions: Transaction[];
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ transactions }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    setAnalysis('');
    
    // Artificial minimum load time for better UX feel
    const startTime = Date.now();
    const result = await getBudgetAnalysis(transactions);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    if (duration < 1500) {
        await new Promise(r => setTimeout(r, 1500 - duration));
    }

    setAnalysis(result);
    setLoading(false);
    setHasFetched(true);
  };

  return (
    <div className="h-full flex flex-col pb-32 animate-in fade-in duration-700">
       <header className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-brand-400 to-purple-500 p-2 rounded-xl text-white shadow-lg shadow-brand-500/30">
                <Bot size={24} />
            </div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">AI Advisor</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Smart insights for your wallet</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-4 no-scrollbar">
        {!hasFetched && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80">
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-400 blur-2xl opacity-20 rounded-full animate-pulse-slow"></div>
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-glass border border-white/60 dark:border-white/10 relative">
                        <Sparkles size={48} className="text-brand-500 dark:text-brand-400" />
                    </div>
                </div>
                <div className="max-w-xs space-y-2">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ready to analyze?</h3>
                    <p className="text-slate-600 dark:text-slate-400">I can review your spending patterns and create a personalized plan.</p>
                </div>
            </div>
        )}

        {loading && (
            <div className="space-y-4 p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-white/10 shadow-glass">
                <div className="h-4 bg-white/50 dark:bg-white/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/50 dark:bg-white/10 rounded w-1/2 animate-pulse"></div>
                <div className="h-32 bg-white/50 dark:bg-white/10 rounded-2xl w-full animate-pulse mt-4"></div>
                <div className="h-4 bg-white/50 dark:bg-white/10 rounded w-5/6 animate-pulse"></div>
            </div>
        )}

        {analysis && !loading && (
             <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-glass border border-white/60 dark:border-white/10">
                <div className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-strong:text-brand-700 dark:prose-strong:text-brand-300 max-w-none">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>

      <div className="px-6 pt-6">
        <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="group w-full relative overflow-hidden bg-gradient-to-r from-brand-500 to-purple-600 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-brand-500/50"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-2xl"></div>
            <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                    <>
                        <RefreshCw size={22} className="animate-spin" /> Analyzing...
                    </>
                ) : (
                    <>
                        {hasFetched ? <RefreshCw size={22} /> : <Sparkles size={22} />}
                        {hasFetched ? 'Update Analysis' : 'Generate Insights'}
                    </>
                )}
            </span>
        </button>
      </div>
    </div>
  );
};