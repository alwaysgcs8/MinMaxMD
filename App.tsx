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
import { EditSubscription } from './components/EditSubscription';
import { Budget } from './components/Budget';
import { Subscriptions } from './components/Subscriptions';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [returnView, setReturnView] = useState<View>(View.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [overallBudget, setOverallBudget] = useState<OverallBudget>({ daily: 0, monthly: 0, yearly: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedRecurringTransaction, setSelectedRecurringTransaction] = useState<RecurringTransaction | null>(null);
  
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Swipe back logic
  const touchStart = useRef({ x: 0, y: 0 });
  const isSwiping = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        // Only trigger swipe back if starting from the left edge (first 40px)
        isSwiping.current = touchStart.current.x < 40;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!isSwiping.current) return;
        const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
        const deltaY = Math.abs(e.changedTouches[0].clientY - touchStart.current.y);

        // Required distance for back swipe: 100px, and horizontal (deltaY < 50px)
        if (deltaX > 100 && deltaY < 50) {
            handleBack();
        }
        isSwiping.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentView, returnView]);

  const handleBack = () => {
    if (currentView === View.EDIT || currentView === View.EDIT_SUBSCRIPTION) {
        setCurrentView(returnView);
    } else if (currentView === View.ADD || currentView === View.SETTINGS || currentView === View.BUDGET) {
        setCurrentView(View.DASHBOARD);
    }
  };
  
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
          case RecurrenceFrequency.DAILY: nextDate.setDate(nextDate.getDate() + 1); break;
          case RecurrenceFrequency.WEEKLY: nextDate.setDate(nextDate.getDate() + 7); break;
          case RecurrenceFrequency.MONTHLY: nextDate.setMonth(nextDate.getMonth() + 1); break;
          case RecurrenceFrequency.YEARLY: nextDate.setFullYear(nextDate.getFullYear() + 1); break;
          default: nextDate.setDate(nextDate.getDate() + 1);
        }
        r.nextDueDate = nextDate.toISOString();
      }
    });
    return { newTxs: [...currentTxs, ...generatedTxs], updatedRecurring, hasChanges };
  };

  useEffect(() => {
    const initApp = async () => {
        if (navigator.storage && navigator.storage.persist) {
            try { await navigator.storage.persist(); } catch (e) {}
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

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser && isLoaded) {
            const cloudData = await loadFromCloud(currentUser.uid);
            if (cloudData) {
                setTransactions(cloudData.transactions || []);
                setRecurringTransactions(cloudData.recurring || []);
                setBudgetLimits(cloudData.limits || []);
                if (cloudData.overallBudget) setOverallBudget(cloudData.overallBudget);
                if (cloudData.categories) setCategories(cloudData.categories);
            } else {
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

  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    applyTheme();
  }, [theme]);

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

  useEffect(() => {
    const handleScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.classList || !target.classList.contains('scroll-y-only')) return;
        const currentScrollY = target.scrollTop;
        const delta = currentScrollY - lastScrollY.current;
        if (currentScrollY < 10) setIsNavVisible(true);
        else if (delta > 5 && currentScrollY > 50) setIsNavVisible(false);
        else if (delta < -10) setIsNavVisible(true);
        lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  const handleAddTransaction = (data: { transaction: Omit<Transaction, 'id'>, frequency: RecurrenceFrequency }) => {
    const { transaction: txData, frequency } = data;
    const newTx: Transaction = { ...txData, id: crypto.randomUUID() };
    setTransactions(prev => [...prev, newTx]);
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
    setIsAddingSubscription(false);
    setCurrentView(View.DASHBOARD);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    setSelectedTransaction(null);
    setCurrentView(returnView);
  };

  const handleUpdateRecurring = (updatedRT: RecurringTransaction) => {
    setRecurringTransactions(prev => prev.map(rt => rt.id === updatedRT.id ? updatedRT : rt));
    setSelectedRecurringTransaction(null);
    setCurrentView(View.SUBSCRIPTIONS);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setSelectedTransaction(null);
    setCurrentView(returnView);
  };

  const handleDeleteRecurring = (id: string) => {
    setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));
    if (selectedRecurringTransaction?.id === id) {
        setSelectedRecurringTransaction(null);
        setCurrentView(View.SUBSCRIPTIONS);
    }
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setReturnView(currentView);
    setCurrentView(View.EDIT);
  };

  const handleSelectRecurring = (rt: RecurringTransaction) => {
    setSelectedRecurringTransaction(rt);
    setReturnView(currentView);
    setCurrentView(View.EDIT_SUBSCRIPTION);
  };

  const navigateToAdd = (forceSub = false) => {
    setIsAddingSubscription(forceSub);
    setCurrentView(View.ADD);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} onSelectTransaction={handleSelectTransaction} />;
      case View.ADD:
        return <AddTransaction categories={categories} onAdd={handleAddTransaction} onCancel={() => { setIsAddingSubscription(false); setCurrentView(View.DASHBOARD); }} forceRecurring={isAddingSubscription} />;
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
            onCancel={() => setCurrentView(returnView)} 
        />;
      case View.EDIT_SUBSCRIPTION:
        if (!selectedRecurringTransaction) return <Subscriptions recurringTransactions={recurringTransactions} onDelete={handleDeleteRecurring} onEdit={handleSelectRecurring} onNavigate={setCurrentView} onAddClick={() => navigateToAdd(true)} />;
        return <EditSubscription 
            recurringTransaction={selectedRecurringTransaction} 
            categories={categories}
            onUpdate={handleUpdateRecurring} 
            onDelete={handleDeleteRecurring}
            onCancel={() => setCurrentView(View.SUBSCRIPTIONS)} 
        />;
      case View.BUDGET:
        return <Budget overallBudget={overallBudget} categoryLimits={budgetLimits} categories={categories} onSaveOverall={setOverallBudget} onSaveCategoryLimits={setBudgetLimits} onNavigate={setCurrentView} />;
      case View.SUBSCRIPTIONS:
        return <Subscriptions recurringTransactions={recurringTransactions} onDelete={handleDeleteRecurring} onEdit={handleSelectRecurring} onNavigate={setCurrentView} onAddClick={() => navigateToAdd(true)} />;
      case View.AI_ADVISOR:
        return <AiAdvisor transactions={transactions} />;
      case View.SETTINGS:
        return <Settings theme={theme} onThemeChange={setTheme} onBack={() => setCurrentView(View.DASHBOARD)} categories={categories} onUpdateCategories={setCategories} />;
      default:
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} onSelectTransaction={handleSelectTransaction} />;
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="flex-1 w-full flex flex-col bg-transparent overflow-hidden">
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
      {currentView !== View.ADD && currentView !== View.SETTINGS && currentView !== View.EDIT && currentView !== View.EDIT_SUBSCRIPTION && currentView !== View.BUDGET && (
        <BottomNav currentView={currentView} onViewChange={setCurrentView} isVisible={isNavVisible} />
      )}
    </div>
  );
};

export default App;