import React from 'react';

/**
 * Skeleton Loading Component
 * Provides skeleton screens matching final layouts with pulse/wave animations
 */
const Skeleton = ({ 
  variant = 'rectangular', 
  width = '100%', 
  height = '1rem',
  animation = 'pulse',
  className = '',
  ...props 
}) => {
  // Base skeleton styles
  const baseStyles = 'bg-gray-200 dark:bg-dark-700';
  
  // Animation styles
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse-soft', // Custom wave animation
    none: ''
  };

  // Variant styles
  const variantStyles = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  // Combine styles
  const skeletonClasses = [
    baseStyles,
    animationStyles[animation],
    variantStyles[variant],
    className
  ].filter(Boolean).join(' ');

  // Convert width and height to CSS values
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...props.style
  };

  return (
    <div
      className={skeletonClasses}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * Skeleton Text Component
 * Specialized skeleton for text content
 */
export const SkeletonText = ({ 
  lines = 1, 
  width = '100%',
  className = '',
  ...props 
}) => {
  if (lines === 1) {
    return (
      <Skeleton 
        variant="text" 
        width={width} 
        height="1rem"
        className={className}
        {...props} 
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '75%' : '100%'} // Last line is shorter
          height="1rem"
          {...props}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Avatar Component
 * Specialized skeleton for profile pictures/avatars
 */
export const SkeletonAvatar = ({ 
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton Card Component
 * Skeleton for card-based layouts
 */
export const SkeletonCard = ({ 
  hasHeader = true,
  hasFooter = false,
  contentLines = 3,
  className = '',
  ...props 
}) => {
  return (
    <div className={`bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 p-6 ${className}`} {...props}>
      {hasHeader && (
        <div className="mb-4">
          <Skeleton width="60%" height="1.5rem" className="mb-2" />
          <Skeleton width="40%" height="1rem" />
        </div>
      )}
      
      <div className="space-y-3">
        <SkeletonText lines={contentLines} />
      </div>
      
      {hasFooter && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-700">
          <div className="flex justify-between items-center">
            <Skeleton width="30%" height="2rem" />
            <Skeleton width="20%" height="2rem" />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton List Component
 * Skeleton for list-based layouts
 */
export const SkeletonList = ({ 
  items = 3,
  hasAvatar = false,
  hasActions = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
          {hasAvatar && <SkeletonAvatar size="md" />}
          
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height="1.25rem" />
            <Skeleton width="50%" height="1rem" />
          </div>
          
          {hasActions && (
            <div className="flex space-x-2">
              <Skeleton width="4rem" height="2rem" />
              <Skeleton width="4rem" height="2rem" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton Table Component
 * Skeleton for table layouts
 */
export const SkeletonTable = ({ 
  rows = 5,
  columns = 4,
  hasHeader = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={`bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden ${className}`} {...props}>
      {hasHeader && (
        <div className="border-b border-gray-200 dark:border-dark-700 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, index) => (
              <Skeleton key={index} width="80%" height="1.25rem" />
            ))}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200 dark:divide-dark-700">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <Skeleton key={colIndex} width="90%" height="1rem" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton Dashboard Component
 * Specialized skeleton for dashboard layouts
 */
export const SkeletonDashboard = ({ className = '', ...props }) => {
  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton width="300px" height="2rem" />
          <Skeleton width="200px" height="1rem" />
        </div>
        <Skeleton width="120px" height="2.5rem" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonCard key={index} hasHeader={false} contentLines={2} />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard hasHeader={true} contentLines={4} />
        <SkeletonList items={4} hasAvatar={true} />
      </div>
    </div>
  );
};

/**
 * Skeleton Analysis Results Component
 * Specialized skeleton for analysis results page
 */
export const SkeletonAnalysisResults = ({ className = '', ...props }) => {
  return (
    <div className={`space-y-8 ${className}`} {...props}>
      {/* Header */}
      <div className="space-y-4">
        <Skeleton width="400px" height="2.5rem" />
        <Skeleton width="300px" height="1.25rem" />
      </div>
      
      {/* Score Overview */}
      <SkeletonCard hasHeader={true} hasFooter={false} contentLines={1}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="text-center space-y-2">
              <Skeleton width="3rem" height="3rem" className="mx-auto" />
              <Skeleton width="100%" height="1rem" />
              <Skeleton width="100%" height="0.5rem" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="border-b border-gray-200 dark:border-dark-700 p-6">
          <div className="flex space-x-8">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} width="80px" height="1.5rem" />
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <SkeletonText lines={6} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;