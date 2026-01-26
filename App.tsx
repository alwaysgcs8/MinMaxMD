
import React, { useState, useEffect, useRef } from 'react';
import { View, Transaction, RecurrenceFrequency, RecurringTransaction, BudgetLimit, Theme, OverallBudget } from './types';
import { 
    getStoredTransactions, saveTransactions, 
    getStoredRecurringTransactions, saveRecurringTransactions,
    getBudgetLimits, saveBudgetLimits,
    getOverallBudget, saveOverallBudget,
    getStoredTheme, saveTheme,
    getStoredCategories, saveStoredCategories,
    pushToCloud, pullFromCloud
} from './services/storageService';
import { subscribeToAuthChanges } from './services/firebase';
// Fix: Use 'import type' for User interface to resolve module export error
import type { User } from 'firebase/auth';
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
  const [user, setUser] = useState<User | null>(null);
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedRecurringTransaction, setSelectedRecurringTransaction] = useState<RecurringTransaction | null>(null);
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isModalView = (view: View) => [
    View.ADD, View.SETTINGS, View.EDIT, View.EDIT_SUBSCRIPTION, View.BUDGET
  ].includes(view);

  const navigateTo = (view: View) => {
    if (isModalView(view) && !isModalView(currentView)) {
      setReturnView(currentView);
    }
    setCurrentView(view);
  };

  // Auth & Sync Logic
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Logged in: Try to pull from cloud
        const cloudData = await pullFromCloud(currentUser.uid);
        if (cloudData) {
            setTransactions(cloudData.transactions || []);
            setRecurringTransactions(cloudData.recurring || []);
            setBudgetLimits(cloudData.limits || []);
            setOverallBudget(cloudData.overallBudget || { daily: 0, monthly: 0, yearly: 0 });
            setCategories(cloudData.categories || []);
        } else {
            // First time login: Push local data to initialize cloud
            await pushToCloud(currentUser.uid);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync back to cloud on local changes if user is present
  useEffect(() => {
    if (user && isLoaded) {
      const timer = setTimeout(() => {
        pushToCloud(user.uid);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transactions, recurringTransactions, budgetLimits, overallBudget, categories, user, isLoaded]);

  // Swipe back logic
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const isEligibleSwipe = useRef(false);

  useEffect(() => {
    const canSwipeBack = isModalView(currentView);
    if (!canSwipeBack) {
      setSwipeOffset(0);
      setIsDragging(false);
      isEligibleSwipe.current = false;
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        touchStart.current = { x, y };
        isEligibleSwipe.current = x < 40;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isEligibleSwipe.current) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStart.current.x;
        const deltaY = Math.abs(currentY - touchStart.current.y);
        if (!isDragging && deltaY > deltaX && deltaY > 10) { isEligibleSwipe.current = false; return; }
        if (!isDragging && deltaX > 15 && deltaX > deltaY) { setIsDragging(true); }
        if (isDragging) { if (e.cancelable) e.preventDefault(); setSwipeOffset(Math.max(0, deltaX)); }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!isDragging) { isEligibleSwipe.current = false; return; }
        const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
        const threshold = window.innerWidth * 0.25;
        if (deltaX > threshold) {
            setSwipeOffset(window.innerWidth);
            setTimeout(() => { handleBack(); setSwipeOffset(0); setIsDragging(false); }, 250);
        } else { setSwipeOffset(0); setIsDragging(false); }
        isEligibleSwipe.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentView, isDragging]);

  const handleBack = () => {
    setCurrentView(returnView);
  };
  
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
    if (isLoaded) {
      saveTransactions(transactions);
      saveRecurringTransactions(recurringTransactions);
      saveBudgetLimits(budgetLimits);
      saveOverallBudget(overallBudget);
      saveStoredCategories(categories);
      saveTheme(theme);
    }
  }, [transactions, recurringTransactions, budgetLimits, overallBudget, categories, theme, isLoaded]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.classList || !target.classList.contains('scroll-y-only')) return;
        const currentScrollY = target.scrollTop;
        const delta = currentScrollY - lastScrollY.current;
        if (currentScrollY < 20) setIsNavVisible(true);
        else if (delta > 8 && currentScrollY > 60) setIsNavVisible(false);
        else if (delta < -12) setIsNavVisible(true);
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
    setCurrentView(returnView);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    setSelectedTransaction(null);
    setCurrentView(returnView);
  };

  const handleUpdateRecurring = (updatedRT: RecurringTransaction) => {
    setRecurringTransactions(prev => prev.map(rt => rt.id === updatedRT.id ? updatedRT : rt));
    setSelectedRecurringTransaction(null);
    setCurrentView(returnView);
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
        setCurrentView(returnView);
    }
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    navigateTo(View.EDIT);
  };

  const handleSelectRecurring = (rt: RecurringTransaction) => {
    setSelectedRecurringTransaction(rt);
    navigateTo(View.EDIT_SUBSCRIPTION);
  };

  const navigateToAdd = (forceSub = false) => {
    setIsAddingSubscription(forceSub);
    navigateTo(View.ADD);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard transactions={transactions} onNavigate={navigateTo} onSelectTransaction={handleSelectTransaction} />;
      case View.ADD:
        return <AddTransaction categories={categories} onAdd={handleAddTransaction} onCancel={handleBack} forceRecurring={isAddingSubscription} />;
      case View.ANALYTICS:
        return <Analytics transactions={transactions} budgetLimits={budgetLimits} onNavigate={navigateTo} />;
      case View.HISTORY:
        return <TransactionHistory transactions={transactions} onSelectTransaction={handleSelectTransaction} onNavigate={navigateTo} />;
      case View.EDIT:
        if (!selectedTransaction) return <TransactionHistory transactions={transactions} onSelectTransaction={handleSelectTransaction} onNavigate={navigateTo} />;
        return <EditTransaction transaction={selectedTransaction} categories={categories} onUpdate={handleUpdateTransaction} onDelete={handleDeleteTransaction} onCancel={handleBack} />;
      case View.EDIT_SUBSCRIPTION:
        if (!selectedRecurringTransaction) return <Subscriptions recurringTransactions={recurringTransactions} onDelete={handleDeleteRecurring} onEdit={handleSelectRecurring} onNavigate={navigateTo} onAddClick={() => navigateToAdd(true)} />;
        return <EditSubscription recurringTransaction={selectedRecurringTransaction} categories={categories} onUpdate={handleUpdateRecurring} onDelete={handleDeleteRecurring} onCancel={handleBack} />;
      case View.BUDGET:
        return <Budget overallBudget={overallBudget} categoryLimits={budgetLimits} categories={categories} onSaveOverall={setOverallBudget} onSaveCategoryLimits={setBudgetLimits} onNavigate={handleBack} />;
      case View.SUBSCRIPTIONS:
        return <Subscriptions recurringTransactions={recurringTransactions} onDelete={handleDeleteRecurring} onEdit={handleSelectRecurring} onNavigate={navigateTo} onAddClick={() => navigateToAdd(true)} />;
      case View.AI_ADVISOR:
        return <AiAdvisor transactions={transactions} />;
      case View.SETTINGS:
        return <Settings user={user} theme={theme} onThemeChange={setTheme} onBack={handleBack} categories={categories} onUpdateCategories={setCategories} />;
      default:
        return <Dashboard transactions={transactions} onNavigate={navigateTo} onSelectTransaction={handleSelectTransaction} />;
    }
  };

  if (!isLoaded) return null;
  const hideNav = isModalView(currentView);

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden relative">
      <main className="flex-1 flex flex-col overflow-hidden w-full h-full relative">
        {isDragging && swipeOffset > 10 && <div className="fixed inset-y-0 left-0 w-1 bg-brand-500/30 blur-sm pointer-events-none z-[150]" />}
        <div className="flex-1 flex flex-col w-full h-full" style={{ transform: `translateX(${swipeOffset}px)`, transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.1, 0.7, 0.1, 1)' }}>
          {renderView()}
        </div>
      </main>
      {!hideNav && <BottomNav currentView={currentView} onViewChange={navigateTo} isVisible={isNavVisible} />}
    </div>
  );
};

export default App;
