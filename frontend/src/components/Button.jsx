import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Enhanced Button Component
 * Provides consistent button styling with micro-interactions and animations
 */
const Button = ({ 
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}) => {
  const { animation } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // Size configurations
  const sizeConfig = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      base: 'bg-primary-600 text-white border-primary-600',
      hover: 'hover:bg-primary-700 hover:border-primary-700',
      active: 'active:bg-primary-800 active:border-primary-800',
      focus: 'focus:ring-primary-500',
      disabled: 'disabled:bg-primary-300 disabled:border-primary-300'
    },
    secondary: {
      base: 'bg-gray-600 text-white border-gray-600',
      hover: 'hover:bg-gray-700 hover:border-gray-700',
      active: 'active:bg-gray-800 active:border-gray-800',
      focus: 'focus:ring-gray-500',
      disabled: 'disabled:bg-gray-300 disabled:border-gray-300'
    },
    outline: {
      base: 'bg-transparent text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400',
      hover: 'hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-300',
      active: 'active:bg-primary-100 dark:active:bg-primary-900/40',
      focus: 'focus:ring-primary-500',
      disabled: 'disabled:text-primary-300 disabled:border-primary-300 dark:disabled:text-primary-600 dark:disabled:border-primary-600'
    },
    ghost: {
      base: 'bg-transparent text-gray-700 border-transparent dark:text-gray-300',
      hover: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
      active: 'active:bg-gray-200 dark:active:bg-gray-700',
      focus: 'focus:ring-gray-500',
      disabled: 'disabled:text-gray-400 dark:disabled:text-gray-600'
    },
    success: {
      base: 'bg-green-600 text-white border-green-600',
      hover: 'hover:bg-green-700 hover:border-green-700',
      active: 'active:bg-green-800 active:border-green-800',
      focus: 'focus:ring-green-500',
      disabled: 'disabled:bg-green-300 disabled:border-green-300'
    },
    warning: {
      base: 'bg-yellow-600 text-white border-yellow-600',
      hover: 'hover:bg-yellow-700 hover:border-yellow-700',
      active: 'active:bg-yellow-800 active:border-yellow-800',
      focus: 'focus:ring-yellow-500',
      disabled: 'disabled:bg-yellow-300 disabled:border-yellow-300'
    },
    danger: {
      base: 'bg-red-600 text-white border-red-600',
      hover: 'hover:bg-red-700 hover:border-red-700',
      active: 'active:bg-red-800 active:border-red-800',
      focus: 'focus:ring-red-500',
      disabled: 'disabled:bg-red-300 disabled:border-red-300'
    }
  };

  const config = variantConfig[variant] || variantConfig.primary;

  // Handle click with animation
  const handleClick = (e) => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) {
      onClick(e);
    }
  };

  // Handle key press for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // Combine all classes
  const buttonClasses = [
    // Base styles
    'inline-flex items-center justify-center font-semibold rounded-lg border transition-all duration-300 ease-out btn-enhanced',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-900',
    
    // Size
    sizeConfig[size],
    
    // Variant styles
    config.base,
    !disabled && !loading && config.hover,
    !disabled && !loading && config.active,
    config.focus,
    (disabled || loading) && config.disabled,
    
    // Width
    fullWidth && 'w-full',
    
    // Animation states
    !disabled && !loading && 'hover:scale-105 hover:-translate-y-0.5',
    isPressed && 'scale-95 translate-y-0',
    
    // Disabled state
    (disabled || loading) && 'cursor-not-allowed opacity-60',
    
    // Custom classes
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      
      {/* Left icon */}
      {icon && iconPosition === 'left' && !loading && (
        <span className={`${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      
      {/* Button text */}
      {children}
      
      {/* Right icon */}
      {icon && iconPosition === 'right' && !loading && (
        <span className={`${children ? 'ml-2' : ''}`}>
          {icon}
        </span>
      )}
    </button>
  );
};

/**
 * Icon Button Component
 * Specialized button for icon-only interactions
 */
export const IconButton = ({ 
  icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props 
}) => {
  const sizeConfig = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      variant={variant}
      className={`${sizeConfig[size]} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
};

/**
 * Button Group Component
 * Groups related buttons together
 */
export const ButtonGroup = ({ 
  children,
  orientation = 'horizontal',
  className = '',
  ...props 
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col'
  };

  return (
    <div 
      className={`${orientationClasses[orientation]} ${className}`}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          let additionalClasses = '';
          
          if (orientation === 'horizontal') {
            if (!isFirst && !isLast) {
              additionalClasses = 'rounded-none border-l-0';
            } else if (isFirst) {
              additionalClasses = 'rounded-r-none';
            } else if (isLast) {
              additionalClasses = 'rounded-l-none border-l-0';
            }
          } else {
            if (!isFirst && !isLast) {
              additionalClasses = 'rounded-none border-t-0';
            } else if (isFirst) {
              additionalClasses = 'rounded-b-none';
            } else if (isLast) {
              additionalClasses = 'rounded-t-none border-t-0';
            }
          }
          
          return React.cloneElement(child, {
            className: `${child.props.className || ''} ${additionalClasses}`.trim()
          });
        }
        return child;
      })}
    </div>
  );
};

/**
 * Floating Action Button Component
 * Prominent circular button for primary actions
 */
export const FloatingActionButton = ({ 
  icon,
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeConfig = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <Button
      variant="primary"
      className={`rounded-full shadow-lg hover:shadow-xl ${sizeConfig[size]} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
};

export default Button;