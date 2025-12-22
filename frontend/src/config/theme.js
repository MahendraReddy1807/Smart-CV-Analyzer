/**
 * Theme Configuration for Smart CV Analyzer
 * Defines the design system foundation with Indigo color palette
 */

export const themeConfig = {
  colors: {
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
      950: '#1E1B4B',
    },
    accent: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    dark: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    strong: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  animation: {
    duration: {
      fast: 150,    // 150ms
      normal: 300,  // 300ms
      slow: 500,    // 500ms
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  
  // Canvas background configuration
  canvas: {
    particleCount: 60,
    speed: 0.5,
    opacity: 0.15,
    connectionDistance: 150,
    colors: {
      light: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC'],
      dark: ['#4F46E5', '#6366F1', '#818CF8', '#64748B'],
    }
  }
};

// Light theme configuration - High contrast for maximum readability
export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#1e40af',        // Blue-800 - High contrast
    accent: '#059669',         // Emerald-600 - High contrast
    warning: '#d97706',        // Amber-600 - High contrast
    error: '#dc2626',          // Red-600 - High contrast
    background: '#ffffff',     // Pure white
    surface: '#f9fafb',        // Gray-50
    text: {
      primary: '#111827',      // Gray-900 - Maximum contrast
      secondary: '#374151',    // Gray-700 - High readability
      disabled: '#6b7280',     // Gray-500 - Still readable
    },
    border: '#d1d5db',         // Gray-300 - More visible
    overlay: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  }
};

// Dark theme configuration - High contrast for maximum readability
export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#3b82f6',        // Blue-500 - High contrast on dark
    accent: '#10b981',         // Emerald-500 - High contrast on dark
    warning: '#f59e0b',        // Amber-500 - High contrast on dark
    error: '#ef4444',          // Red-500 - High contrast on dark
    background: '#111827',     // Gray-900 - Deep dark
    surface: '#1f2937',        // Gray-800 - Elevated surface
    text: {
      primary: '#ffffff',      // Pure white - Maximum contrast
      secondary: '#f3f4f6',    // Gray-100 - Excellent readability
      disabled: '#9ca3af',     // Gray-400 - Still visible
    },
    border: '#4b5563',         // Gray-600 - More visible
    overlay: 'rgba(0, 0, 0, 0.8)', // Darker overlay for dark mode
  }
};

export default themeConfig;