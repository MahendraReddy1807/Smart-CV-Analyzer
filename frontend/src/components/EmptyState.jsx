import React from 'react';
import Card, { CardContent } from './Card';

/**
 * Empty State Component
 * Provides helpful empty states with icons and guidance for different scenarios
 */
const EmptyState = ({ 
  icon = '📄',
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  action,
  actionText = 'Get Started',
  onAction,
  variant = 'default',
  className = '',
  ...props 
}) => {
  // Variant configurations
  const variantConfig = {
    default: {
      iconSize: 'text-6xl',
      titleColor: 'text-gray-600 dark:text-gray-400',
      descriptionColor: 'text-gray-500 dark:text-gray-500'
    },
    error: {
      iconSize: 'text-6xl',
      titleColor: 'text-red-600 dark:text-red-400',
      descriptionColor: 'text-red-500 dark:text-red-500'
    },
    success: {
      iconSize: 'text-6xl',
      titleColor: 'text-green-600 dark:text-green-400',
      descriptionColor: 'text-green-500 dark:text-green-500'
    },
    info: {
      iconSize: 'text-6xl',
      titleColor: 'text-blue-600 dark:text-blue-400',
      descriptionColor: 'text-blue-500 dark:text-blue-500'
    }
  };

  const config = variantConfig[variant] || variantConfig.default;

  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      <div className={`${config.iconSize} mb-4 opacity-50`}>
        {icon}
      </div>
      
      <h3 className={`text-xl font-medium mb-2 ${config.titleColor}`}>
        {title}
      </h3>
      
      <p className={`mb-6 max-w-md mx-auto ${config.descriptionColor}`}>
        {description}
      </p>
      
      {(action || onAction) && (
        <div className="flex justify-center">
          {action || (
            <button
              onClick={onAction}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * No Analyses Empty State
 * Specialized empty state for when user has no resume analyses
 */
export const NoAnalysesEmptyState = ({ onUpload, className = '', ...props }) => {
  return (
    <EmptyState
      icon="🎯"
      title="No analyses yet"
      description="Upload your first resume to get started with AI-powered analysis and personalized recommendations."
      actionText="Upload Resume"
      onAction={onUpload}
      className={className}
      {...props}
    />
  );
};

/**
 * Search Results Empty State
 * Specialized empty state for when search returns no results
 */
export const SearchEmptyState = ({ searchTerm, onClearSearch, className = '', ...props }) => {
  return (
    <EmptyState
      icon="🔍"
      title="No matching results"
      description={`We couldn't find any analyses matching "${searchTerm}". Try adjusting your search terms or browse all analyses.`}
      actionText="Clear Search"
      onAction={onClearSearch}
      className={className}
      {...props}
    />
  );
};

/**
 * Loading Failed Empty State
 * Specialized empty state for when data loading fails
 */
export const LoadingFailedEmptyState = ({ onRetry, errorMessage, className = '', ...props }) => {
  return (
    <EmptyState
      icon="⚠️"
      title="Failed to load data"
      description={errorMessage || "Something went wrong while loading your data. Please try again."}
      actionText="Try Again"
      onAction={onRetry}
      variant="error"
      className={className}
      {...props}
    />
  );
};

/**
 * Network Error Empty State
 * Specialized empty state for network connectivity issues
 */
export const NetworkErrorEmptyState = ({ onRetry, className = '', ...props }) => {
  return (
    <EmptyState
      icon="🌐"
      title="Connection problem"
      description="Unable to connect to our servers. Please check your internet connection and try again."
      actionText="Retry"
      onAction={onRetry}
      variant="error"
      className={className}
      {...props}
    />
  );
};

/**
 * Analysis Not Found Empty State
 * Specialized empty state for when a specific analysis cannot be found
 */
export const AnalysisNotFoundEmptyState = ({ onGoHome, className = '', ...props }) => {
  return (
    <EmptyState
      icon="🔍"
      title="Analysis not found"
      description="The analysis you're looking for doesn't exist or may have been deleted. It's possible the link is invalid or expired."
      actionText="Go to Dashboard"
      onAction={onGoHome}
      variant="error"
      className={className}
      {...props}
    />
  );
};

/**
 * No Enhancements Empty State
 * Specialized empty state for when no content enhancements are available
 */
export const NoEnhancementsEmptyState = ({ className = '', ...props }) => {
  return (
    <EmptyState
      icon="✨"
      title="No enhancements available"
      description="Your content is already well-written! Our AI couldn't find any significant improvements to suggest at this time."
      variant="success"
      className={className}
      {...props}
    />
  );
};

/**
 * Processing Empty State
 * Specialized empty state shown during AI processing
 */
export const ProcessingEmptyState = ({ stage = 'processing', className = '', ...props }) => {
  const stageConfig = {
    uploading: {
      icon: '📤',
      title: 'Uploading your resume...',
      description: 'Please wait while we securely upload and process your document.'
    },
    processing: {
      icon: '🧠',
      title: 'AI is analyzing your resume...',
      description: 'Our advanced AI is reviewing your content and generating personalized insights.'
    },
    generating: {
      icon: '✨',
      title: 'Generating recommendations...',
      description: 'Creating tailored suggestions to help improve your resume.'
    }
  };

  const config = stageConfig[stage] || stageConfig.processing;

  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      variant="info"
      className={className}
      {...props}
    />
  );
};

/**
 * Maintenance Empty State
 * Specialized empty state for when service is under maintenance
 */
export const MaintenanceEmptyState = ({ className = '', ...props }) => {
  return (
    <EmptyState
      icon="🔧"
      title="Service temporarily unavailable"
      description="We're performing scheduled maintenance to improve your experience. Please check back in a few minutes."
      variant="info"
      className={className}
      {...props}
    />
  );
};

/**
 * Feature Coming Soon Empty State
 * Specialized empty state for features that are not yet available
 */
export const ComingSoonEmptyState = ({ featureName = 'This feature', className = '', ...props }) => {
  return (
    <EmptyState
      icon="🚀"
      title={`${featureName} coming soon`}
      description="We're working hard to bring you this feature. Stay tuned for updates!"
      variant="info"
      className={className}
      {...props}
    />
  );
};

/**
 * Empty State Card Wrapper
 * Wraps empty states in a card for consistent styling
 */
export const EmptyStateCard = ({ children, className = '', ...props }) => {
  return (
    <Card variant="default" className={className} {...props}>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

/**
 * Contextual Empty State
 * Automatically selects appropriate empty state based on context
 */
export const ContextualEmptyState = ({ 
  context = 'default',
  searchTerm,
  error,
  isLoading,
  onRetry,
  onAction,
  className = '',
  ...props 
}) => {
  // Loading state
  if (isLoading) {
    return <ProcessingEmptyState className={className} {...props} />;
  }

  // Error states
  if (error) {
    if (error.includes('network') || error.includes('connection')) {
      return <NetworkErrorEmptyState onRetry={onRetry} className={className} {...props} />;
    }
    if (error.includes('not found') || error.includes('404')) {
      return <AnalysisNotFoundEmptyState onGoHome={onAction} className={className} {...props} />;
    }
    return <LoadingFailedEmptyState onRetry={onRetry} errorMessage={error} className={className} {...props} />;
  }

  // Search context
  if (context === 'search' && searchTerm) {
    return <SearchEmptyState searchTerm={searchTerm} onClearSearch={onAction} className={className} {...props} />;
  }

  // Specific contexts
  switch (context) {
    case 'analyses':
      return <NoAnalysesEmptyState onUpload={onAction} className={className} {...props} />;
    case 'enhancements':
      return <NoEnhancementsEmptyState className={className} {...props} />;
    case 'maintenance':
      return <MaintenanceEmptyState className={className} {...props} />;
    case 'coming-soon':
      return <ComingSoonEmptyState className={className} {...props} />;
    default:
      return <EmptyState onAction={onAction} className={className} {...props} />;
  }
};

export default EmptyState;