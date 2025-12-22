/**
 * Design Tokens Utility
 * Provides consistent access to design system values
 */

import { themeConfig } from '../config/theme.js';

/**
 * Get spacing value based on 8px grid system
 * @param {string} size - Size key (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
 * @returns {string} CSS spacing value
 */
export const getSpacing = (size) => {
  return themeConfig.spacing[size] || size;
};

/**
 * Get color value from theme palette
 * @param {string} color - Color name (primary, accent, warning, error, dark)
 * @param {number} shade - Color shade (50-950)
 * @returns {string} CSS color value
 */
export const getColor = (color, shade = 500) => {
  return themeConfig.colors[color]?.[shade] || color;
};

/**
 * Get typography values
 * @param {string} property - Typography property (fontSize, fontWeight, lineHeight)
 * @param {string} value - Value key
 * @returns {string|number} CSS value
 */
export const getTypography = (property, value) => {
  return themeConfig.typography[property]?.[value] || value;
};

/**
 * Get border radius value
 * @param {string} size - Size key (sm, md, lg, xl, 2xl, 3xl)
 * @returns {string} CSS border-radius value
 */
export const getBorderRadius = (size) => {
  return themeConfig.borderRadius[size] || size;
};

/**
 * Get box shadow value
 * @param {string} size - Shadow size (sm, md, lg, xl, soft, medium, strong)
 * @returns {string} CSS box-shadow value
 */
export const getShadow = (size) => {
  return themeConfig.shadows[size] || size;
};

/**
 * Get animation duration
 * @param {string} speed - Animation speed (fast, normal, slow)
 * @returns {number} Duration in milliseconds
 */
export const getAnimationDuration = (speed) => {
  return themeConfig.animation.duration[speed] || 300;
};

/**
 * Get animation easing
 * @param {string} type - Easing type (easeIn, easeOut, easeInOut)
 * @returns {string} CSS easing function
 */
export const getAnimationEasing = (type) => {
  return themeConfig.animation.easing[type] || 'ease';
};

/**
 * Validate spacing values are multiples of 8px
 * @param {string} value - CSS value to validate
 * @returns {boolean} True if valid spacing
 */
export const isValidSpacing = (value) => {
  // Convert rem to px (assuming 1rem = 16px)
  const pxValue = parseFloat(value) * (value.includes('rem') ? 16 : 1);
  return pxValue % 8 === 0;
};

/**
 * Generate consistent class names for components
 * @param {string} base - Base class name
 * @param {Object} modifiers - Modifier object with boolean values
 * @returns {string} Combined class names
 */
export const classNames = (base, modifiers = {}) => {
  const classes = [base];
  
  Object.entries(modifiers).forEach(([key, value]) => {
    if (value) {
      classes.push(key);
    }
  });
  
  return classes.join(' ');
};

export default {
  getSpacing,
  getColor,
  getTypography,
  getBorderRadius,
  getShadow,
  getAnimationDuration,
  getAnimationEasing,
  isValidSpacing,
  classNames,
};