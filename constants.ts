import { 
  Utensils, 
  Car, 
  Home, 
  Zap, 
  Gamepad2, 
  ShoppingBag, 
  HeartPulse, 
  Layers, 
  TrendingUp,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { Transaction } from './types';

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
  'Food': '#ff9f1c', // Bright Orange
  'Transport': '#4cc9f0', // Cyan
  'Housing': '#4361ee', // Electric Blue
  'Utilities': '#4895ef', // Azure
  'Entertainment': '#f72585', // Vivid Pink
  'Shopping': '#7209b7', // Deep Purple
  'Health': '#38b000', // Neon Green
  'Income': '#10b981', // Emerald
  'Other': '#64748b', // Slate
};

const ICON_MAP: Record<string, LucideIcon> = {
  'Food': Utensils,
  'Transport': Car,
  'Housing': Home,
  'Utilities': Zap,
  'Entertainment': Gamepad2,
  'Shopping': ShoppingBag,
  'Health': HeartPulse,
  'Income': TrendingUp,
  'Other': Layers,
};

export const getCategoryColor = (category: string): string => {
  if (FIXED_COLORS[category]) return FIXED_COLORS[category];
  
  // Hash string to pick from palette
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const PALETTE = [
    '#f94144', '#f3722c', '#f8961e', '#f9c74f', 
    '#90be6d', '#43aa8b', '#577590', '#227c9d', '#ffcb77'
  ];
  
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export const getCategoryIcon = (category: string): LucideIcon => {
  return ICON_MAP[category] || MoreHorizontal;
};

export const formatCurrency = (amount: number, maximumFractionDigits: number = 0) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits 
  }).format(amount);
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];