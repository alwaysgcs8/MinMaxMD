import React, { useState } from 'react';
import { Transaction } from '../types';
import { getBudgetAnalysis } from '../services/geminiService';
import { Sparkles, RefreshCw, Bot } from 'lucide-react';

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

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const parseBold = (str: string) => {
        const parts = str.split('**');
        return parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="font-bold text-brand-700 dark:text-brand-300">{part}</strong> : part
        );
      };

      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-white">{parseBold(line.replace('### ', ''))}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-5 mb-3 text-slate-800 dark:text-white">{parseBold(line.replace('## ', ''))}</h2>;
      }
      
      if (line.startsWith('1. ')) {
        return (
          <div key={index} className="ml-4 mb-2 flex gap-2">
            <span className="font-bold text-brand-500">{line.split('. ')[0]}.</span>
            <span className="text-slate-700 dark:text-slate-300">{parseBold(line.substring(3))}</span>
          </div>
        );
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
            <div key={index} className="ml-4 mb-2 flex gap-2">
              <span className="text-brand-500">•</span>
              <span className="text-slate-700 dark:text-slate-300">{parseBold(line.replace(/^[\-\*] /, ''))}</span>
            </div>
        );
      }

      if (!line.trim()) {
        return <div key={index} className="h-2"></div>;
      }

      return <p key={index} className="mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">{parseBold(line)}</p>;
    });
  };

  return (
    <div className="flex flex-col min-h-[100svh]">
      <header className="px-6 pt-safe pb-4 bg-transparent border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-br from-brand-400 to-purple-500 p-2 rounded-xl text-white shadow-lg shadow-brand-500/30">
                <Bot size={24} />
            </div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">AI Advisor</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Smart insights for your wallet</p>
      </header>

      <main className="flex-1 overflow-y-auto scroll-y-only pb-12 pb-safe px-6">
        <div className="h-4"></div>

        {!hasFetched && !loading && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 opacity-80">
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
             <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-glass border border-white/60 dark:border-white/10 mb-10">
                {renderMarkdown(analysis)}
            </div>
        )}
      </main>

      <footer className="px-6 pt-4 pb-32 shrink-0">
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
      </footer>
    </div>
  );
};