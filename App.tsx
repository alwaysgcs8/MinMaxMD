import React, { useState, useEffect, useRef } from 'react';
import { View, Transaction, RecurrenceFrequency, RecurringTransaction, BudgetLimit, Theme, OverallBudget } from './types';
import { 
    getStoredTransactions, saveTransactions, 
    getStoredRecurringTransactions, saveRecurringTransactions,
    getBudgetLimits, saveBudgetLimits,
    getOverallBudget, saveOverallBudget,
    getStoredTheme, saveTheme,
    getStoredCategories, saveStoredCategories,
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
import { Budget } from './components/Budget';
import { Subscriptions } from './components/Subscriptions';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [overallBudget, setOverallBudget] = useState<OverallBudget>({ daily: 0, monthly: 0, yearly: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);

  // Scroll visibility logic
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Helper to process recurring transactions
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
    const initApp = async () => {
        if (navigator.storage && navigator.storage.persist) {
            try {
                await navigator.storage.persist();
            } catch (e) {
                console.warn("Could not request storage persistence", e);
            }
        }

        const storedTxs = getStoredTransactions();
        const storedRecurring = getStoredRecurringTransactions();
        const storedLimits = getBudgetLimits();
        const storedOverall = getOverallBudget();
        const storedCategories = getStoredCategories();
        const storedTheme = getStoredTheme();

        const result = processRecurringTransactions(storedTxs, storedRecurring);

        setTransactions(result.newTxs);
        setRecurringTransactions(result.updatedRecurring);
        setBudgetLimits(storedLimits);
        setOverallBudget(storedOverall);
        setCategories(storedCategories);
        setTheme(storedTheme);
        
        setIsLoaded(true);
    };

    initApp();
  }, []);

  // Auth & Cloud Sync Listener
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        
        if (currentUser && isLoaded) {
            console.log("Syncing from cloud...");
            const cloudData = await loadFromCloud(currentUser.uid);
            
            if (cloudData) {
                setTransactions(cloudData.transactions || []);
                setRecurringTransactions(cloudData.recurring || []);
                setBudgetLimits(cloudData.limits || []);
                if (cloudData.overallBudget) setOverallBudget(cloudData.overallBudget);
                if (cloudData.categories) setCategories(cloudData.categories);
                console.log("Data loaded from cloud.");
            } else {
                console.log("Cloud empty, uploading local data...");
                await saveToCloud(currentUser.uid, {
                    transactions,
                    recurring: recurringTransactions,
                    limits: budgetLimits,
                    overallBudget,
                    categories
                });
            }
        }
    });

    return () => unsubscribe();
  }, [isLoaded]);

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
      saveTransactions(transactions);
      saveRecurringTransactions(recurringTransactions);
      saveBudgetLimits(budgetLimits);
      saveOverallBudget(overallBudget);
      saveStoredCategories(categories);
      saveTheme(theme);

      if (user) {
         saveToCloud(user.uid, {
             transactions,
             recurring: recurringTransactions,
             limits: budgetLimits,
             overallBudget,
             categories
         });
      }
    }
  }, [transactions, recurringTransactions, budgetLimits, overallBudget, categories, theme, isLoaded, user]);

  // Handle window scrolling for Nav visibility
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
            setIsNavVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsNavVisible(false);
        }
        lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleDeleteRecurring = (id: string) => {
    setRecurringTransactions(prev => prev.filter(t => t.id !== id));
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
        return <AddTransaction 
            categories={categories} 
            onAdd={handleAddTransaction} 
            onCancel={() => setCurrentView(View.DASHBOARD)} 
            onNavigateSubscriptions={() => setCurrentView(View.SUBSCRIPTIONS)}
        />;
      case View.ANALYTICS:
        return <Analytics transactions={transactions} budgetLimits={budgetLimits} onNavigate={setCurrentView} />;
      case View.HISTORY:
        return <TransactionHistory transactions={transactions} onSelectTransaction={handleSelectTransaction} onNavigate={setCurrentView} />;
      case View.EDIT:
        if (!selectedTransaction) return <TransactionHistory transactions={transactions} onSelectTransaction={handleSelectTransaction} onNavigate={setCurrentView} />;
        return <EditTransaction 
            transaction={selectedTransaction} 
            categories={categories}
            onUpdate={handleUpdateTransaction} 
            onDelete={handleDeleteTransaction}
            onCancel={() => setCurrentView(View.HISTORY)} 
        />;
      case View.BUDGET:
        return <Budget 
            overallBudget={overallBudget}
            categoryLimits={budgetLimits}
            categories={categories}
            onSaveOverall={setOverallBudget}
            onSaveCategoryLimits={setBudgetLimits}
            onNavigate={setCurrentView}
        />;
      case View.SUBSCRIPTIONS:
        return <Subscriptions 
            recurringTransactions={recurringTransactions}
            onDelete={handleDeleteRecurring}
            onNavigate={setCurrentView}
        />;
      case View.AI_ADVISOR:
        return <AiAdvisor transactions={transactions} />;
      case View.SETTINGS:
        return <Settings 
            theme={theme} 
            onThemeChange={setTheme} 
            onBack={() => setCurrentView(View.DASHBOARD)}
            categories={categories}
            onUpdateCategories={setCategories}
        />;
      default:
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} />;
    }
  };

  if (!isLoaded) return null;

  return (
    // min-h-full ensures the app content stretches to fill the screen
    <div className="min-h-full w-full flex flex-col bg-transparent">
      {/* Main content expands to fill available space */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Navigation */}
      {currentView !== View.ADD && currentView !== View.SETTINGS && currentView !== View.EDIT && currentView !== View.BUDGET && (
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