import { Transaction, RecurringTransaction, BudgetLimit, Theme } from '../types';
import { INITIAL_TRANSACTIONS } from '../constants';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'budget_wise_v2_transactions';
const RECURRING_KEY = 'budget_wise_v2_recurring';
const LIMITS_KEY = 'budget_wise_v2_limits';
const THEME_KEY = 'budget_wise_v2_theme';

export const getStoredTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse stored transactions', error);
  }
  return INITIAL_TRANSACTIONS;
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save transactions', error);
  }
};

export const getStoredRecurringTransactions = (): RecurringTransaction[] => {
  try {
    const stored = localStorage.getItem(RECURRING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse stored recurring transactions', error);
  }
  return [];
};

export const saveRecurringTransactions = (transactions: RecurringTransaction[]): void => {
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save recurring transactions', error);
  }
};

export const getBudgetLimits = (): BudgetLimit[] => {
  try {
    const stored = localStorage.getItem(LIMITS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse budget limits', error);
  }
  return [];
};

export const saveBudgetLimits = (limits: BudgetLimit[]): void => {
  try {
    localStorage.setItem(LIMITS_KEY, JSON.stringify(limits));
  } catch (error) {
    console.error('Failed to save budget limits', error);
  }
};

export const getStoredTheme = (): Theme => {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'light';
};

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const exportData = (): string => {
  const data = {
    transactions: getStoredTransactions(),
    recurring: getStoredRecurringTransactions(),
    limits: getBudgetLimits(),
    version: 1,
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.transactions && Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    if (data.recurring && Array.isArray(data.recurring)) {
      saveRecurringTransactions(data.recurring);
    }
    if (data.limits && Array.isArray(data.limits)) {
      saveBudgetLimits(data.limits);
    }
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

// --- Cloud Sync Logic ---

interface UserData {
    transactions: Transaction[];
    recurring: RecurringTransaction[];
    limits: BudgetLimit[];
    lastUpdated: string;
}

export const saveToCloud = async (uid: string, data: Partial<UserData>) => {
    if (!db) return;
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            ...data,
            lastUpdated: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.error("Cloud save failed:", e);
    }
};

export const loadFromCloud = async (uid: string): Promise<UserData | null> => {
    if (!db) return null;
    try {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            return docSnap.data() as UserData;
        }
    } catch (e) {
        console.error("Cloud load failed:", e);
    }
    return null;
};