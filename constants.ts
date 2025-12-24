
import { Transaction, TransactionType } from './types';

export const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Other'
];

const FIXED_COLORS: Record<string, string> = {
  'Food': '#f59e0b', // Amber
  'Transport': '#3b82f6', // Blue
  'Housing': '#6366f1', // Indigo
  'Utilities': '#0ea5e9', // Sky
  'Entertainment': '#ec4899', // Pink
  'Shopping': '#8b5cf6', // Violet
  'Health': '#10b981', // Emerald
  'Income': '#22c55e', // Green
  'Other': '#64748b', // Slate
};

const PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export const getCategoryColor = (category: string): string => {
  if (FIXED_COLORS[category]) return FIXED_COLORS[category];
  
  // Hash string to pick from palette
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];
