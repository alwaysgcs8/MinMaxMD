
import { Transaction, RecurringTransaction, BudgetLimit, Theme, OverallBudget, AnalyticsWidgetType } from '../types';
import { INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES } from '../constants';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEY = 'budget_wise_v2_transactions';
const RECURRING_KEY = 'budget_wise_v2_recurring';
const LIMITS_KEY = 'budget_wise_v2_limits';
const OVERALL_BUDGET_KEY = 'budget_wise_v2_overall_budget';
const CATEGORIES_KEY = 'budget_wise_v2_categories';
const WIDGETS_KEY = 'budget_wise_v2_analytics_widgets';
const THEME_KEY = 'budget_wise_v2_theme';

export const getStoredTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) { console.error('Failed to parse transactions', error); }
  return INITIAL_TRANSACTIONS;
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const getStoredRecurringTransactions = (): RecurringTransaction[] => {
  try {
    const stored = localStorage.getItem(RECURRING_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) { console.error('Failed to parse recurring transactions', error); }
  return [];
};

export const saveRecurringTransactions = (transactions: RecurringTransaction[]): void => {
  localStorage.setItem(RECURRING_KEY, JSON.stringify(transactions));
};

export const getBudgetLimits = (): BudgetLimit[] => {
  try {
    const stored = localStorage.getItem(LIMITS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) { console.error('Failed to parse limits', error); }
  return [];
};

export const saveBudgetLimits = (limits: BudgetLimit[]): void => {
  localStorage.setItem(LIMITS_KEY, JSON.stringify(limits));
};

export const getOverallBudget = (): OverallBudget => {
  try {
    const stored = localStorage.getItem(OVERALL_BUDGET_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) { console.error('Failed to parse overall budget', error); }
  return { daily: 0, monthly: 0, yearly: 0 };
};

export const saveOverallBudget = (budget: OverallBudget): void => {
  localStorage.setItem(OVERALL_BUDGET_KEY, JSON.stringify(budget));
};

export const getStoredCategories = (): string[] => {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) { console.error('Failed to parse categories', error); }
  return DEFAULT_CATEGORIES;
};

export const saveStoredCategories = (categories: string[]): void => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

// Fix: Added missing getStoredWidgets function
export const getStoredWidgets = (): AnalyticsWidgetType[] => {
  try {
    const stored = localStorage.getItem(WIDGETS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) { console.error('Failed to parse widgets', error); }
  // Return default visible widgets if none are stored
  return [
    AnalyticsWidgetType.PROJECTIONS,
    AnalyticsWidgetType.EXPENSE_TREND,
    AnalyticsWidgetType.SPENDING_PIE,
    AnalyticsWidgetType.INCOME_VS_EXPENSE,
    AnalyticsWidgetType.BUDGET_LIMITS
  ];
};

// Fix: Added missing saveStoredWidgets function
export const saveStoredWidgets = (widgets: AnalyticsWidgetType[]): void => {
  localStorage.setItem(WIDGETS_KEY, JSON.stringify(widgets));
};

export const getStoredTheme = (): Theme => {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'light';
};

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

// --- Cloud Sync Logic ---

export const pushToCloud = async (userId: string) => {
  if (!db) return;
  const data = {
    transactions: getStoredTransactions(),
    recurring: getStoredRecurringTransactions(),
    limits: getBudgetLimits(),
    overallBudget: getOverallBudget(),
    categories: getStoredCategories(),
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, "users", userId), data);
    console.log("Cloud push successful");
  } catch (e) {
    console.error("Cloud push failed", e);
  }
};

export const pullFromCloud = async (userId: string) => {
  if (!db) return null;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.transactions) saveTransactions(data.transactions);
      if (data.recurring) saveRecurringTransactions(data.recurring);
      if (data.limits) saveBudgetLimits(data.limits);
      if (data.overallBudget) saveOverallBudget(data.overallBudget);
      if (data.categories) saveStoredCategories(data.categories);
      return data;
    }
  } catch (e) {
    console.error("Cloud pull failed", e);
  }
  return null;
};

export const exportData = (): string => {
  const data = {
    transactions: getStoredTransactions(),
    recurring: getStoredRecurringTransactions(),
    limits: getBudgetLimits(),
    overallBudget: getOverallBudget(),
    categories: getStoredCategories(),
    version: 1,
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.transactions) saveTransactions(data.transactions);
    if (data.recurring) saveRecurringTransactions(data.recurring);
    if (data.limits) saveBudgetLimits(data.limits);
    if (data.overallBudget) saveOverallBudget(data.overallBudget);
    if (data.categories) saveStoredCategories(data.categories);
    return true;
  } catch (e) {
    return false;
  }
};
