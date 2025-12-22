import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Enhanced Card Component
 * Provides consistent card-based layout with hover animations and variants
 */
const Card = ({ 
  children, 
  variant = 'default', 
  hover = true, 
  className = '',
  onClick,
  ...props 
}) => {
  const { animation } = useTheme();

  // Base card styles
  const baseStyles = 'rounded-xl transition-all duration-300 ease-out';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-dark-800 shadow-md border border-gray-200 dark:border-dark-700',
    elevated: 'bg-white dark:bg-dark-800 shadow-lg border border-gray-100 dark:border-dark-600',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-dark-600 shadow-sm'
  };

  // Hover styles (only applied if hover is enabled)
  const hoverStyles = hover ? {
    default: 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
    elevated: 'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1',
    outlined: 'hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 hover:border-primary-400 dark:hover:border-primary-500'
  } : {};

  // Interactive styles for clickable cards
  const interactiveStyles = onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900' : '';

  // Combine all styles
  const cardClasses = [
    baseStyles,
    variantStyles[variant],
    hover ? hoverStyles[variant] : '',
    interactiveStyles,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header Component
 * Provides consistent header styling within cards
 */
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-6 py-4 border-b border-gray-200 dark:border-dark-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Content Component
 * Provides consistent content padding within cards
 */
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 * Provides consistent footer styling within cards
 */
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-6 py-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 rounded-b-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Title Component
 * Provides consistent title styling within card headers
 */
export const CardTitle = ({ children, className = '', level = 2, ...props }) => {
  const Tag = `h${level}`;
  
  return (
    <Tag 
      className={`text-lg font-bold text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

/**
 * Card Description Component
 * Provides consistent description styling within cards
 */
export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p 
      className={`text-sm text-gray-700 dark:text-gray-200 mt-1 font-medium ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export default Card;