import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Circular Progress Indicator Component
 * AI-themed progress component with animations and color coding
 */
const CircularProgress = ({ 
  value = 0, 
  max = 100, 
  size = 'md', 
  color = 'primary',
  showLabel = true,
  animated = true,
  className = '',
  children,
  ...props 
}) => {
  const { colors } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);

  // Animate value changes
  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000; // 1 second animation
    const steps = 60; // 60fps
    const stepValue = (value - displayValue) / steps;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => prev + stepValue);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, animated, displayValue]);

  // Size configurations
  const sizeConfig = {
    sm: { size: 48, strokeWidth: 4, fontSize: 'text-xs' },
    md: { size: 64, strokeWidth: 6, fontSize: 'text-sm' },
    lg: { size: 96, strokeWidth: 8, fontSize: 'text-lg' },
    xl: { size: 128, strokeWidth: 10, fontSize: 'text-xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(displayValue / max, 0), 1);
  const strokeDashoffset = circumference - (percentage * circumference);

  // Color configurations
  const colorConfig = {
    primary: colors.primary,
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  };

  const strokeColor = colorConfig[color] || colorConfig.primary;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} {...props}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-dark-600"
        />
        
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(79, 70, 229, 0.3))'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showLabel && (
          <div className="text-center">
            <div className={`font-black text-black dark:text-white ${config.fontSize} drop-shadow-sm`}>
              {Math.round(displayValue)}
              {max === 100 && '%'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Linear Progress Indicator Component
 * Linear progress bar with AI-themed styling
 */
const LinearProgress = ({ 
  value = 0, 
  max = 100, 
  color = 'primary',
  height = 'md',
  showLabel = true,
  animated = true,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);

  // Animate value changes
  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value, animated]);

  // Height configurations
  const heightConfig = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const percentage = Math.min(Math.max(displayValue / max, 0), 1) * 100;

  // Color configurations
  const colorConfig = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const progressColor = colorConfig[color] || colorConfig.primary;

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {Math.round(displayValue)}{max === 100 ? '%' : `/${max}`}
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-dark-600 rounded-full ${heightConfig[height]}`}>
        <div
          className={`${progressColor} ${heightConfig[height]} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * AI Processing Indicator Component
 * Specialized indicator for AI processing with brain/neural network theme
 */
const AIProcessingIndicator = ({ 
  stage = 'processing',
  estimatedTime,
  className = '',
  ...props 
}) => {
  const [dots, setDots] = useState('');

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const stageConfig = {
    uploading: {
      icon: '📤',
      title: 'Uploading Resume',
      description: 'Securely transferring your document'
    },
    extracting: {
      icon: '🔍',
      title: 'Extracting Text',
      description: 'Reading and parsing document content'
    },
    processing: {
      icon: '🧠',
      title: 'AI Analysis',
      description: 'Analyzing content with advanced AI'
    },
    generating: {
      icon: '✨',
      title: 'Generating Insights',
      description: 'Creating personalized recommendations'
    },
    complete: {
      icon: '✅',
      title: 'Analysis Complete',
      description: 'Ready to view your results'
    }
  };

  const config = stageConfig[stage] || stageConfig.processing;

  return (
    <div className={`flex flex-col items-center text-center space-y-4 ${className}`} {...props}>
      {/* AI Brain Animation */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-2xl animate-pulse">
          {config.icon}
        </div>
        
        {/* Neural network dots */}
        <div className="absolute -inset-4">
          <div className="w-2 h-2 bg-primary-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 animate-ping" />
          <div className="w-2 h-2 bg-primary-400 rounded-full absolute bottom-0 right-0 animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="w-2 h-2 bg-primary-400 rounded-full absolute bottom-0 left-0 animate-ping" style={{ animationDelay: '1s' }} />
        </div>
      </div>
      
      {/* Status Text */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {config.title}{dots}
        </h3>
        <p className="text-sm text-gray-800 dark:text-gray-100 font-bold">
          {config.description}
        </p>
        
        {estimatedTime && (
          <p className="text-xs text-gray-800 dark:text-gray-100 font-bold">
            Estimated time: {estimatedTime}
          </p>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <LinearProgress 
          value={stage === 'complete' ? 100 : undefined}
          color="primary"
          height="sm"
          showLabel={false}
          animated={true}
        />
      </div>
    </div>
  );
};

/**
 * Score Progress Indicator Component
 * Specialized circular progress for displaying scores with color coding
 */
const ScoreProgress = ({ 
  score = 0,
  size = 'lg',
  showLabel = true,
  animated = true,
  className = '',
  ...props 
}) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`} {...props}>
      <CircularProgress
        value={score}
        max={100}
        size={size}
        color={color}
        showLabel={showLabel}
        animated={animated}
      />
      
      {showLabel && (
        <div className="text-center">
          <div className="text-sm font-black text-black dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
            {label}
          </div>
        </div>
      )}
    </div>
  );
};

// Export all components
export {
  CircularProgress,
  LinearProgress,
  AIProcessingIndicator,
  ScoreProgress
};

export default CircularProgress;