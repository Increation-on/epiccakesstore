import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '', 
  ...props 
}: ButtonProps) => {
  
  const variantClasses = {
  primary: 'bg-[var(--pink)] text-gray-800 hover:bg-[var(--pink-dark)]',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  outline: 'border border-[var(--border)] hover:bg-[var(--mint)] text-gray-700',
  ghost: 'text-gray-300 border border-[var(--border)] hover:bg-[var(--mint)] hover:text-gray-700'
};

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`cursor-pointer rounded transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};