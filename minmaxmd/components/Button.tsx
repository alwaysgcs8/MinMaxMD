import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden inline-flex items-center justify-center px-6 py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-500 to-blue-600 text-white shadow-lg shadow-brand-500/30 border border-white/20 hover:shadow-brand-500/50",
    secondary: "bg-white/50 backdrop-blur-md text-slate-700 border border-white/60 hover:bg-white/70 shadow-sm",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30 border border-white/20",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100/30 hover:text-slate-900",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
        {/* Shine effect */}
      {variant === 'primary' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};