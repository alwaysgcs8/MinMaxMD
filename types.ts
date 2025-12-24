export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Category {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  HOUSING = 'Housing',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  INCOME = 'Income',
  OTHER = 'Other'
}

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
  category: Category;
  description: string;
  date: string; // ISO Date string
  type: TransactionType;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: Category;
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
  category: Category;
  limit: number;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  ADD = 'ADD',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  AI_ADVISOR = 'AI_ADVISOR',
  HISTORY = 'HISTORY',
  EDIT = 'EDIT'
}

export type Theme = 'light' | 'dark' | 'system';