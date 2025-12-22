import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme, themeConfig } from '../config/theme.js';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme-preference');
      return savedTheme === 'dark';
    } catch (error) {
      console.warn('Failed to read theme preference from localStorage:', error);
      return false; // Default to light mode
    }
  });

  // Get current theme colors based on mode
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      try {
        localStorage.setItem('theme-preference', newMode ? 'dark' : 'light');
      } catch (error) {
        console.warn('Failed to save theme preference to localStorage:', error);
      }
      return newMode;
    });
  };

  // Apply theme to document root for CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS custom properties for theme colors
    root.style.setProperty('--color-primary', currentTheme.colors.primary);
    root.style.setProperty('--color-accent', currentTheme.colors.accent);
    root.style.setProperty('--color-warning', currentTheme.colors.warning);
    root.style.setProperty('--color-error', currentTheme.colors.error);
    root.style.setProperty('--color-background', currentTheme.colors.background);
    root.style.setProperty('--color-surface', currentTheme.colors.surface);
    root.style.setProperty('--color-text-primary', currentTheme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', currentTheme.colors.text.secondary);
    root.style.setProperty('--color-text-disabled', currentTheme.colors.text.disabled);
    root.style.setProperty('--color-border', currentTheme.colors.border);
    
    // Add/remove dark class for Tailwind CSS dark mode
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode, currentTheme]);

  // Context value
  const value = {
    isDarkMode,
    toggleDarkMode,
    colors: currentTheme.colors,
    spacing: themeConfig.spacing,
    typography: themeConfig.typography,
    borderRadius: themeConfig.borderRadius,
    shadows: themeConfig.shadows,
    animation: themeConfig.animation,
    canvas: themeConfig.canvas,
    theme: currentTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;