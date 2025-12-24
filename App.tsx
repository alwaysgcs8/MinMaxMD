import React, { useState, useEffect, useRef } from 'react';
import { View, Transaction, RecurrenceFrequency, RecurringTransaction, BudgetLimit, Theme } from './types';
import { 
    getStoredTransactions, saveTransactions, 
    getStoredRecurringTransactions, saveRecurringTransactions,
    getBudgetLimits, saveBudgetLimits,
    getStoredTheme, saveTheme,
    saveToCloud, loadFromCloud
} from './services/storageService';
import { auth } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Dashboard } from './components/Dashboard';
import { BottomNav } from './components/BottomNav';
import { AddTransaction } from './components/AddTransaction';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { AiAdvisor } from './components/AiAdvisor';
import { TransactionHistory } from './components/TransactionHistory';
import { EditTransaction } from './components/EditTransaction';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);

  // Scroll visibility logic
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to process recurring rules
  const processRecurringTransactions = (
    currentTxs: Transaction[],
    currentRecurring: RecurringTransaction[]
  ): { newTxs: Transaction[], updatedRecurring: RecurringTransaction[], hasChanges: boolean } => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let generatedTxs: Transaction[] = [];
    let updatedRecurring = currentRecurring.map(r => ({ ...r }));
    let hasChanges = false;

    updatedRecurring.forEach(r => {
      let nextDate = new Date(r.nextDueDate);

      while (nextDate <= today) {
        hasChanges = true;
        
        generatedTxs.push({
          id: crypto.randomUUID(),
          amount: r.amount,
          category: r.category,
          description: r.description,
          type: r.type,
          date: nextDate.toISOString()
        });

        switch(r.frequency) {
          case RecurrenceFrequency.DAILY: 
            nextDate.setDate(nextDate.getDate() + 1); 
            break;
          case RecurrenceFrequency.WEEKLY: 
            nextDate.setDate(nextDate.getDate() + 7); 
            break;
          case RecurrenceFrequency.MONTHLY: 
            nextDate.setMonth(nextDate.getMonth() + 1); 
            break;
          case RecurrenceFrequency.YEARLY: 
            nextDate.setFullYear(nextDate.getFullYear() + 1); 
            break;
          default:
            nextDate.setDate(nextDate.getDate() + 1);
        }
        
        r.nextDueDate = nextDate.toISOString();
      }
    });

    return { 
        newTxs: [...currentTxs, ...generatedTxs], 
        updatedRecurring, 
        hasChanges 
    };
  };

  // Initial Load from LocalStorage
  useEffect(() => {
    const storedTxs = getStoredTransactions();
    const storedRecurring = getStoredRecurringTransactions();
    const storedLimits = getBudgetLimits();
    const storedTheme = getStoredTheme();

    const result = processRecurringTransactions(storedTxs, storedRecurring);

    setTransactions(result.newTxs);
    setRecurringTransactions(result.updatedRecurring);
    setBudgetLimits(storedLimits);
    setTheme(storedTheme);
    
    setIsLoaded(true);
  }, []);

  // Auth & Cloud Sync Listener
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        
        if (currentUser && isLoaded) {
            // User just logged in or app refreshed with active user
            console.log("Syncing from cloud...");
            const cloudData = await loadFromCloud(currentUser.uid);
            
            if (cloudData) {
                // If cloud has data, prioritize it (simple sync strategy)
                // In a production app, you might want more complex merge logic
                setTransactions(cloudData.transactions || []);
                setRecurringTransactions(cloudData.recurring || []);
                setBudgetLimits(cloudData.limits || []);
                console.log("Data loaded from cloud.");
            } else {
                // First time sync or empty cloud: Upload local data
                console.log("Cloud empty, uploading local data...");
                await saveToCloud(currentUser.uid, {
                    transactions,
                    recurring: recurringTransactions,
                    limits: budgetLimits
                });
            }
        }
    });

    return () => unsubscribe();
  }, [isLoaded]); // Depend on isLoaded to ensure local data is ready before decision making

  // Theme Logic
  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme();
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // Persist State (Local + Cloud)
  useEffect(() => {
    if (isLoaded) {
      // 1. Save to LocalStorage (Always acts as offline cache)
      saveTransactions(transactions);
      saveRecurringTransactions(recurringTransactions);
      saveBudgetLimits(budgetLimits);
      saveTheme(theme);

      // 2. Save to Cloud (If logged in)
      if (user) {
         // Debounce could be added here for performance, but for MVP direct save is okay
         saveToCloud(user.uid, {
             transactions,
             recurring: recurringTransactions,
             limits: budgetLimits
         });
      }
    }
  }, [transactions, recurringTransactions, budgetLimits, theme, isLoaded, user]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const currentScrollY = scrollContainerRef.current.scrollTop;
        
        // Show if scrolling up or at the very top
        if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
            setIsNavVisible(true);
        } 
        // Hide if scrolling down and not at top
        else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsNavVisible(false);
        }
        
        lastScrollY.current = currentScrollY;
    }
  };

  const handleAddTransaction = (data: { transaction: Omit<Transaction, 'id'>, frequency: RecurrenceFrequency }) => {
    const { transaction: txData, frequency } = data;
    
    const newTx: Transaction = {
      ...txData,
      id: crypto.randomUUID(),
    };
    
    const updatedTxs = [...transactions, newTx];
    setTransactions(updatedTxs);

    if (frequency !== RecurrenceFrequency.NONE) {
        const nextDate = new Date(txData.date);
        switch(frequency) {
          case RecurrenceFrequency.DAILY: nextDate.setDate(nextDate.getDate() + 1); break;
          case RecurrenceFrequency.WEEKLY: nextDate.setDate(nextDate.getDate() + 7); break;
          case RecurrenceFrequency.MONTHLY: nextDate.setMonth(nextDate.getMonth() + 1); break;
          case RecurrenceFrequency.YEARLY: nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        }

        const newRecurring: RecurringTransaction = {
            id: crypto.randomUUID(),
            amount: txData.amount,
            category: txData.category,
            description: txData.description,
            type: txData.type,
            frequency: frequency,
            startDate: txData.date,
            nextDueDate: nextDate.toISOString()
        };

        setRecurringTransactions(prev => [...prev, newRecurring]);
    }

    setCurrentView(View.DASHBOARD);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    setSelectedTransaction(null);
    setCurrentView(View.HISTORY);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setSelectedTransaction(null);
    setCurrentView(View.HISTORY);
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setCurrentView(View.EDIT);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} />;
      case View.ADD:
        return <AddTransaction onAdd={handleAddTransaction} onCancel={() => setCurrentView(View.DASHBOARD)} />;
      case View.ANALYTICS:
        return <Analytics transactions={transactions} budgetLimits={budgetLimits} onNavigate={setCurrentView} />;
      case View.HISTORY:
        return <TransactionHistory transactions={transactions} onSelectTransaction={handleSelectTransaction} onNavigate={setCurrentView} />;
      case View.EDIT:
        if (!selectedTransaction) return <TransactionHistory transactions={transactions} onSelectTransaction={handleSelectTransaction} onNavigate={setCurrentView} />;
        return <EditTransaction 
            transaction={selectedTransaction} 
            onUpdate={handleUpdateTransaction} 
            onDelete={handleDeleteTransaction}
            onCancel={() => setCurrentView(View.HISTORY)} 
        />;
      case View.AI_ADVISOR:
        return <AiAdvisor transactions={transactions} />;
      case View.SETTINGS:
        return <Settings 
            theme={theme} 
            onThemeChange={setTheme} 
            budgetLimits={budgetLimits}
            onSaveLimits={setBudgetLimits}
            onBack={() => setCurrentView(View.DASHBOARD)}
        />;
      default:
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} />;
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="h-full w-full relative flex flex-col bg-transparent">
      {/* Content Area - Added Ref and onScroll handler */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
      >
        {renderView()}
      </main>

      {/* Navigation - Hide when in ADD, SETTINGS or EDIT views */}
      {currentView !== View.ADD && currentView !== View.SETTINGS && currentView !== View.EDIT && (
        <BottomNav 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            isVisible={isNavVisible}
        />
      )}
    </div>
  );
};

export default App;