
import { Transaction, RecurringTransaction, BudgetLimit, Theme, OverallBudget, AnalyticsWidgetType } from '../types';
import { INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES } from '../constants';

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

export const getOverallBudget = (): OverallBudget => {
  try {
    const stored = localStorage.getItem(OVERALL_BUDGET_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse overall budget', error);
  }
  return { daily: 0, monthly: 0, yearly: 0 };
};

export const saveOverallBudget = (budget: OverallBudget): void => {
  try {
    localStorage.setItem(OVERALL_BUDGET_KEY, JSON.stringify(budget));
  } catch (error) {
    console.error('Failed to save overall budget', error);
  }
};

export const getStoredCategories = (): string[] => {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse categories', error);
  }
  return DEFAULT_CATEGORIES;
};

export const saveStoredCategories = (categories: string[]): void => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories', error);
  }
};

export const getStoredWidgets = (): AnalyticsWidgetType[] => {
  try {
    const stored = localStorage.getItem(WIDGETS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse widgets', error);
  }
  // Default widgets
  return [
    AnalyticsWidgetType.PROJECTIONS,
    AnalyticsWidgetType.SPENDING_PIE,
    AnalyticsWidgetType.BUDGET_LIMITS,
    AnalyticsWidgetType.EXPENSE_TREND,
    AnalyticsWidgetType.INCOME_VS_EXPENSE
  ];
};

export const saveStoredWidgets = (widgets: AnalyticsWidgetType[]): void => {
  try {
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(widgets));
  } catch (error) {
    console.error('Failed to save widgets', error);
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
    overallBudget: getOverallBudget(),
    categories: getStoredCategories(),
    widgets: getStoredWidgets(),
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
    if (data.overallBudget) {
      saveOverallBudget(data.overallBudget);
    }
    if (data.categories && Array.isArray(data.categories)) {
      saveStoredCategories(data.categories);
    }
    if (data.widgets && Array.isArray(data.widgets)) {
      saveStoredWidgets(data.widgets);
    }
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};
