
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

// Keeping for legacy reference or defaults, but interfaces now use string
export const DEFAULT_CATEGORY_NAME = 'Food';

export enum RecurrenceFrequency {
  NONE = 'None',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO Date string
  type: TransactionType;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
  frequency: RecurrenceFrequency;
  startDate: string;
  nextDueDate: string;
}

export interface BudgetState {
  transactions: Transaction[];
  currency: string;
}

export interface BudgetLimit {
  category: string;
  limit: number;
}

export interface OverallBudget {
  daily: number;
  monthly: number;
  yearly: number;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  ADD = 'ADD',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  AI_ADVISOR = 'AI_ADVISOR',
  HISTORY = 'HISTORY',
  EDIT = 'EDIT',
  BUDGET = 'BUDGET'
}

export enum AnalyticsWidgetType {
  PROJECTIONS = 'PROJECTIONS',
  SPENDING_PIE = 'SPENDING_PIE',
  BUDGET_LIMITS = 'BUDGET_LIMITS',
  INCOME_VS_EXPENSE = 'INCOME_VS_EXPENSE',
  EXPENSE_TREND = 'EXPENSE_TREND'
}

export type Theme = 'light' | 'dark' | 'system';
