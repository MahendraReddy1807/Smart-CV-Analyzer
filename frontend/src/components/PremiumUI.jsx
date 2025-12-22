import { useState, useEffect, useRef } from 'react';

/**
 * Premium UI Components - Advanced Design System
 * Cutting-edge components with glassmorphism, advanced animations, and modern aesthetics
 */

// Premium Hero Section
export const PremiumHero = ({ 
  title, 
  subtitle, 
  children, 
  backgroundImage,
  className = '' 
}) => {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/20"></div>
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        )}
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-premium-display text-white mb-6 animate-slide-in-up">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium animate-slide-in-up" 
             style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>
        )}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          {children}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Premium Glass Card
export const PremiumCard = ({ 
  children, 
  hover = true, 
  glow = false,
  className = '',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`glass-premium ${hover ? 'cursor-pointer' : ''} ${glow ? 'animate-pulse-glow' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: hover && isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Premium Button with Advanced Effects
export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  ripple = true,
  className = '',
  onClick,
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  
  const handleClick = (e) => {
    if (ripple) {
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const newRipple = {
        x,
        y,
        size,
        id: Date.now()
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    if (onClick) onClick(e);
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };
  
  const variantClasses = {
    primary: 'btn-premium bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl hover:shadow-2xl',
    glass: 'btn-premium btn-premium-glass',
    gradient: 'btn-premium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl animate-gradient'
  };
  
  return (
    <button
      ref={buttonRef}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} relative overflow-hidden`}
      onClick={handleClick}
      disabled={loading}
      {...props}
    >
      {/* Ripple Effect */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '0.6s'
          }}
        />
      ))}
      
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Content */}
      <div className={`flex items-center justify-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && <span>{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span>{icon}</span>}
      </div>
    </button>
  );
};

// Premium Input with Floating Label
export const PremiumInput = ({ 
  label, 
  error, 
  icon,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (props.onChange) props.onChange(e);
  };
  
  return (
    <div className={`input-premium ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        
        <input
          {...props}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${icon ? 'pl-12' : ''} peer`}
          placeholder=" "
        />
        
        {label && (
          <label className={`
            absolute left-4 transition-all duration-300 pointer-events-none
            ${icon ? 'left-12' : 'left-4'}
            ${focused || hasValue 
              ? 'top-2 text-xs text-blue-600 dark:text-blue-400 font-bold' 
              : 'top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 font-semibold'
            }
          `}>
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium animate-slide-in-up">
          {error}
        </p>
      )}
    </div>
  );
};

// Premium Progress Bar
export const PremiumProgress = ({ 
  value = 0, 
  max = 100, 
  label,
  showValue = true,
  animated = true,
  gradient = true,
  className = '' 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>}
          {showValue && <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`
            h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
            ${gradient 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
              : 'bg-blue-600'
            }
          `}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

// Premium Modal
export const PremiumModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  className = '' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-scale-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative glass-premium p-6 w-full ${sizeClasses[size]} ${className}
        animate-scale-in
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-premium-heading">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

// Premium Notification Toast
export const PremiumToast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose,
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) return null;
  
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`
        glass-premium p-4 rounded-lg shadow-lg min-w-[300px] flex items-center space-x-3
        ${typeStyles[type]}
      `}>
        <span className="text-xl">{icons[type]}</span>
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Premium Stats Card
export const PremiumStatsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'up',
  className = '' 
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };
  
  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };
  
  return (
    <PremiumCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm font-medium flex items-center mt-2 ${trendColors[trend]}`}>
              <span className="mr-1">{trendIcons[trend]}</span>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <div className="text-indigo-600 dark:text-indigo-400 text-2xl">
              {icon}
            </div>
          </div>
        )}
      </div>
    </PremiumCard>
  );
};

// Premium Loading Skeleton
export const PremiumSkeleton = ({ 
  width = '100%', 
  height = '20px', 
  className = '',
  animated = true 
}) => {
  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 rounded-lg
        ${animated ? 'loading-premium' : ''}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

export default {
  PremiumHero,
  PremiumCard,
  PremiumButton,
  PremiumInput,
  PremiumProgress,
  PremiumModal,
  PremiumToast,
  PremiumStatsCard,
  PremiumSkeleton
};