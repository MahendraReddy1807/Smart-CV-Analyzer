/**
 * Design System Test Component
 * Verifies that the design system foundation is working correctly
 */

import { themeConfig, lightTheme, darkTheme } from '../config/theme.js';
import { getColor, getSpacing, getBorderRadius, getShadow } from '../utils/designTokens.js';

function DesignSystemTest() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-display font-semibold text-primary-800">
        Design System Foundation Test
      </h2>
      
      {/* Color Palette Test */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Color Palette</h3>
        <div className="grid grid-cols-5 gap-4">
          {/* Primary Colors */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Primary</h4>
            <div className="bg-primary-500 h-12 rounded-lg shadow-md"></div>
            <div className="bg-primary-700 h-8 rounded-md"></div>
            <div className="bg-primary-900 h-6 rounded"></div>
          </div>
          
          {/* Accent Colors */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Accent</h4>
            <div className="bg-accent-500 h-12 rounded-lg shadow-md"></div>
            <div className="bg-accent-600 h-8 rounded-md"></div>
            <div className="bg-accent-700 h-6 rounded"></div>
          </div>
          
          {/* Warning Colors */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Warning</h4>
            <div className="bg-warning-500 h-12 rounded-lg shadow-md"></div>
            <div className="bg-warning-600 h-8 rounded-md"></div>
            <div className="bg-warning-700 h-6 rounded"></div>
          </div>
          
          {/* Error Colors */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Error</h4>
            <div className="bg-error-500 h-12 rounded-lg shadow-md"></div>
            <div className="bg-error-600 h-8 rounded-md"></div>
            <div className="bg-error-700 h-6 rounded"></div>
          </div>
          
          {/* Dark Colors */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Dark</h4>
            <div className="bg-dark-500 h-12 rounded-lg shadow-md"></div>
            <div className="bg-dark-700 h-8 rounded-md"></div>
            <div className="bg-dark-900 h-6 rounded"></div>
          </div>
        </div>
      </section>
      
      {/* Typography Test */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Typography</h3>
        <div className="space-y-3">
          <p className="text-5xl font-display font-bold text-primary-800">Display Heading</p>
          <p className="text-3xl font-display font-semibold text-gray-800">Section Heading</p>
          <p className="text-xl font-sans font-medium text-gray-700">Subsection Heading</p>
          <p className="text-base font-sans font-normal text-gray-600">
            Body text using Inter font family. This demonstrates the regular weight and normal line height
            for readable content throughout the application.
          </p>
          <p className="text-sm font-sans font-medium text-gray-500">Small text for captions and labels</p>
        </div>
      </section>
      
      {/* Spacing and Layout Test */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Spacing System (8px Grid)</h3>
        <div className="space-y-4">
          <div className="bg-primary-100 p-2 rounded">8px padding (xs)</div>
          <div className="bg-primary-100 p-3 rounded">12px padding (sm)</div>
          <div className="bg-primary-100 p-4 rounded">16px padding (md)</div>
          <div className="bg-primary-100 p-6 rounded">24px padding (lg)</div>
          <div className="bg-primary-100 p-8 rounded">32px padding (xl)</div>
        </div>
      </section>
      
      {/* Card Variants Test */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Card System</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <h4 className="font-semibold text-gray-800 mb-2">Default Card</h4>
            <p className="text-gray-600">Rounded-xl corners with shadow-md effect</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h4 className="font-semibold text-gray-800 mb-2">Elevated Card</h4>
            <p className="text-gray-600">Enhanced shadow for prominence</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border-2 border-primary-200 hover:border-primary-300 transition-colors duration-300">
            <h4 className="font-semibold text-gray-800 mb-2">Outlined Card</h4>
            <p className="text-gray-600">Border variant for subtle emphasis</p>
          </div>
        </div>
      </section>
      
      {/* Animation Test */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Animation System</h3>
        <div className="flex space-x-4">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
            Hover Animation
          </button>
          <button className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 active:scale-95 transition-all duration-150 shadow-md">
            Click Animation
          </button>
        </div>
      </section>
      
      {/* Theme Configuration Display */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Theme Configuration</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="text-sm text-gray-700 overflow-x-auto">
            {JSON.stringify({
              primaryColor: getColor('primary', 600),
              spacing: {
                xs: getSpacing('xs'),
                md: getSpacing('md'),
                xl: getSpacing('xl')
              },
              borderRadius: getBorderRadius('xl'),
              shadow: getShadow('md')
            }, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}

export default DesignSystemTest;