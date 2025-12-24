import { Category, Transaction, TransactionType } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#f59e0b', // Amber
  [Category.TRANSPORT]: '#3b82f6', // Blue
  [Category.HOUSING]: '#6366f1', // Indigo
  [Category.UTILITIES]: '#0ea5e9', // Sky
  [Category.ENTERTAINMENT]: '#ec4899', // Pink
  [Category.SHOPPING]: '#8b5cf6', // Violet
  [Category.HEALTH]: '#10b981', // Emerald
  [Category.INCOME]: '#22c55e', // Green
  [Category.OTHER]: '#64748b', // Slate
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    category: Category.INCOME,
    description: 'Monthly Salary',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    type: TransactionType.INCOME
  },
  {
    id: '2',
    amount: 65,
    category: Category.FOOD,
    description: 'Grocery Run',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 3).toISOString(),
    type: TransactionType.EXPENSE
  },
  {
    id: '3',
    amount: 1200,
    category: Category.HOUSING,
    description: 'Rent',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    type: TransactionType.EXPENSE
  }
];
