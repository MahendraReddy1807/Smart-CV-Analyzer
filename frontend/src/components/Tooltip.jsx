import React, { useState, useRef, useEffect } from 'react';

/**
 * Tooltip Component
 * Provides interactive tooltips with detailed explanations
 */
const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  trigger = 'hover',
  delay = 300,
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Position configurations
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  // Show tooltip
  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Check if tooltip fits in viewport and adjust position if needed
      if (tooltipRef.current && triggerRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        let newPosition = position;

        // Check if tooltip goes outside viewport and adjust
        if (position === 'top' && tooltipRect.top < 0) {
          newPosition = 'bottom';
        } else if (position === 'bottom' && tooltipRect.bottom > viewport.height) {
          newPosition = 'top';
        } else if (position === 'left' && tooltipRect.left < 0) {
          newPosition = 'right';
        } else if (position === 'right' && tooltipRect.right > viewport.width) {
          newPosition = 'left';
        }

        setActualPosition(newPosition);
      }
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close tooltip on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {/* Trigger element */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="cursor-help"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg max-w-xs whitespace-normal animate-fade-in ${positionClasses[actualPosition]}`}
          role="tooltip"
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[actualPosition]}`}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Score Tooltip Component
 * Specialized tooltip for score explanations
 */
export const ScoreTooltip = ({ score, category, children, ...props }) => {
  const getScoreExplanation = (score, category) => {
    const baseExplanations = {
      contactScore: 'Contact information completeness and formatting',
      contentScore: 'Overall content quality and relevance',
      skillsScore: 'Skills section completeness and relevance',
      structureScore: 'Resume structure and organization',
      atsCompatibility: 'Applicant Tracking System compatibility'
    };

    const scoreRanges = {
      excellent: 'Excellent (80-100): Outstanding quality, minimal improvements needed',
      good: 'Good (60-79): Solid quality with room for enhancement',
      fair: 'Fair (40-59): Adequate but needs significant improvement',
      poor: 'Poor (0-39): Requires major improvements'
    };

    let range = 'poor';
    if (score >= 80) range = 'excellent';
    else if (score >= 60) range = 'good';
    else if (score >= 40) range = 'fair';

    const baseExplanation = baseExplanations[category] || 'Score explanation';
    const rangeExplanation = scoreRanges[range];

    return `${baseExplanation}. ${rangeExplanation}`;
  };

  return (
    <Tooltip
      content={getScoreExplanation(score, category)}
      position="top"
      {...props}
    >
      {children}
    </Tooltip>
  );
};

/**
 * Info Tooltip Component
 * Simple info tooltip with question mark icon
 */
export const InfoTooltip = ({ content, ...props }) => {
  return (
    <Tooltip content={content} position="top" {...props}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-full cursor-help hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold">
        ?
      </span>
    </Tooltip>
  );
};

/**
 * Feature Tooltip Component
 * Tooltip for explaining features or UI elements
 */
export const FeatureTooltip = ({ title, description, children, ...props }) => {
  const content = (
    <div>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{description}</div>
    </div>
  );

  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  );
};

export default Tooltip;