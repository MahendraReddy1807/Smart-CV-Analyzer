import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Enhanced UI Components with Better Text Visibility and Modern Design
 */

// Enhanced Button Component
export const EnhancedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg focus:ring-primary-500',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md focus:ring-gray-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-gray-900 focus:ring-primary-500',
    ghost: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Enhanced Card Component
export const EnhancedCard = ({ 
  children, 
  variant = 'default',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'
  };
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';
  
  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced Text Components
export const EnhancedHeading = ({ 
  level = 1, 
  children, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-bold text-gray-900 dark:text-white';
  
  const levels = {
    1: 'text-3xl sm:text-4xl lg:text-5xl',
    2: 'text-2xl sm:text-3xl lg:text-4xl',
    3: 'text-xl sm:text-2xl lg:text-3xl',
    4: 'text-lg sm:text-xl lg:text-2xl',
    5: 'text-base sm:text-lg lg:text-xl',
    6: 'text-sm sm:text-base lg:text-lg'
  };
  
  const Tag = `h${level}`;
  
  return (
    <Tag className={`${baseClasses} ${levels[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

export const EnhancedText = ({ 
  variant = 'body',
  children,
  className = '',
  ...props 
}) => {
  const variants = {
    body: 'text-gray-700 dark:text-gray-200 font-medium',
    secondary: 'text-gray-600 dark:text-gray-300 font-medium',
    caption: 'text-sm text-gray-600 dark:text-gray-300 font-medium',
    small: 'text-xs text-gray-600 dark:text-gray-300 font-medium',
    muted: 'text-gray-500 dark:text-gray-400 font-medium'
  };
  
  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

// Enhanced Input Component
export const EnhancedInput = ({ 
  label,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium ${
          error 
            ? 'border-red-500 dark:border-red-400' 
            : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};

// Enhanced Badge Component
export const EnhancedBadge = ({ 
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full';
  
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  return (
    <span
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Enhanced Alert Component
export const EnhancedAlert = ({ 
  children,
  variant = 'info',
  className = '',
  ...props 
}) => {
  const variants = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
  };
  
  return (
    <div
      className={`p-4 rounded-lg border font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced Loading Spinner
export const EnhancedSpinner = ({ 
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizes[size]} ${className}`}
      {...props}
    />
  );
};

export default {
  EnhancedButton,
  EnhancedCard,
  EnhancedHeading,
  EnhancedText,
  EnhancedInput,
  EnhancedBadge,
  EnhancedAlert,
  EnhancedSpinner
};