import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Page Transition Component
 * Provides smooth transitions between views with loading state animations
 */
const PageTransition = ({ 
  children,
  duration = 300,
  type = 'fade',
  className = '',
  ...props 
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  // Transition types
  const transitionTypes = {
    fade: {
      enter: 'opacity-0',
      enterActive: 'opacity-100 transition-opacity duration-300 ease-out',
      exit: 'opacity-100',
      exitActive: 'opacity-0 transition-opacity duration-300 ease-in'
    },
    slideUp: {
      enter: 'opacity-0 translate-y-4',
      enterActive: 'opacity-100 translate-y-0 transition-all duration-300 ease-out',
      exit: 'opacity-100 translate-y-0',
      exitActive: 'opacity-0 -translate-y-4 transition-all duration-300 ease-in'
    },
    slideRight: {
      enter: 'opacity-0 -translate-x-4',
      enterActive: 'opacity-100 translate-x-0 transition-all duration-300 ease-out',
      exit: 'opacity-100 translate-x-0',
      exitActive: 'opacity-0 translate-x-4 transition-all duration-300 ease-in'
    },
    scale: {
      enter: 'opacity-0 scale-95',
      enterActive: 'opacity-100 scale-100 transition-all duration-300 ease-out',
      exit: 'opacity-100 scale-100',
      exitActive: 'opacity-0 scale-105 transition-all duration-300 ease-in'
    }
  };

  const transition = transitionTypes[type] || transitionTypes.fade;

  useEffect(() => {
    if (location !== displayLocation) {
      // Start exit animation
      setIsVisible(false);
      
      // After exit animation, update location and start enter animation
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsVisible(true);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation, duration]);

  useEffect(() => {
    // Initial mount animation
    setIsVisible(true);
  }, []);

  const transitionClasses = isVisible 
    ? `${transition.enter} ${transition.enterActive}`
    : `${transition.exit} ${transition.exitActive}`;

  return (
    <div 
      className={`${transitionClasses} ${className}`}
      {...props}
    >
      {React.cloneElement(children, { key: displayLocation.pathname })}
    </div>
  );
};

/**
 * Loading Transition Component
 * Shows loading animation during page transitions
 */
export const LoadingTransition = ({ 
  isLoading,
  children,
  loadingComponent,
  className = '',
  ...props 
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else {
      // Delay hiding loading to allow for smooth transition
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className={className} {...props}>
      {showLoading ? (
        <div className="animate-fade-in">
          {loadingComponent || defaultLoadingComponent}
        </div>
      ) : (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Staggered Animation Component
 * Animates children with staggered delays
 */
export const StaggeredAnimation = ({ 
  children,
  delay = 100,
  duration = 300,
  type = 'slideUp',
  className = '',
  ...props 
}) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    
    childrenArray.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * delay);

      return () => clearTimeout(timer);
    });
  }, [children, delay]);

  const animationClasses = {
    slideUp: 'translate-y-4 opacity-0',
    slideUpActive: 'translate-y-0 opacity-100',
    fade: 'opacity-0',
    fadeActive: 'opacity-100',
    scale: 'scale-95 opacity-0',
    scaleActive: 'scale-100 opacity-100'
  };

  return (
    <div className={className} {...props}>
      {React.Children.map(children, (child, index) => {
        const isVisible = visibleItems.has(index);
        const baseClass = animationClasses[type] || animationClasses.slideUp;
        const activeClass = animationClasses[`${type}Active`] || animationClasses.slideUpActive;
        
        return (
          <div
            className={`transition-all duration-${duration} ease-out ${
              isVisible ? activeClass : baseClass
            }`}
            style={{ transitionDelay: `${index * delay}ms` }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Route Transition Wrapper
 * Wraps route components with transition animations
 */
export const RouteTransition = ({ children, ...props }) => {
  return (
    <PageTransition type="slideUp" duration={300} {...props}>
      <div className="min-h-screen">
        {children}
      </div>
    </PageTransition>
  );
};

export default PageTransition;