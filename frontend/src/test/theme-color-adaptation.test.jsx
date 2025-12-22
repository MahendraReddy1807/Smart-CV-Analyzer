import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext.jsx'

// Test component to access theme context and display colors
function TestComponent() {
  const { isDarkMode, toggleDarkMode, colors, canvas } = useTheme()
  return (
    <div>
      <span data-testid="theme-mode">{isDarkMode ? 'dark' : 'light'}</span>
      <span data-testid="background-color">{colors.background}</span>
      <span data-testid="surface-color">{colors.surface}</span>
      <span data-testid="text-primary-color">{colors.text.primary}</span>
      <span data-testid="canvas-colors">{JSON.stringify(canvas.colors[isDarkMode ? 'dark' : 'light'])}</span>
      <button data-testid="toggle-theme" onClick={toggleDarkMode}>
        Toggle Theme
      </button>
    </div>
  )
}

describe('Theme Color Adaptation Properties', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear()
    localStorage.getItem.mockClear()
    localStorage.setItem.mockClear()
  })

  /**
   * Property 4: Theme Color Adaptation
   * For any theme mode (light/dark), the canvas background should use appropriate colors with 5-10% opacity
   * Validates: Requirements 2.3, 2.5
   */
  it('Property 4: Theme Color Adaptation - canvas colors adapt to theme mode', () => {
    // Start with light mode
    localStorage.getItem.mockReturnValue('light')
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Verify light mode canvas colors
    expect(getByTestId('theme-mode')).toHaveTextContent('light')
    const lightCanvasColors = JSON.parse(getByTestId('canvas-colors').textContent)
    expect(lightCanvasColors).toEqual(['#4F46E5', '#6366F1', '#818CF8', '#CBD5E1'])
    
    // Toggle to dark mode
    act(() => {
      getByTestId('toggle-theme').click()
    })
    
    // Verify dark mode canvas colors
    expect(getByTestId('theme-mode')).toHaveTextContent('dark')
    const darkCanvasColors = JSON.parse(getByTestId('canvas-colors').textContent)
    expect(darkCanvasColors).toEqual(['#4F46E5', '#6366F1', '#818CF8', '#64748B'])
    
    // Verify colors are different between modes
    expect(lightCanvasColors).not.toEqual(darkCanvasColors)
  })

  it('Property 4: Theme Color Adaptation - background colors adapt correctly', () => {
    // Test light mode
    localStorage.getItem.mockReturnValue('light')
    
    const { getByTestId, rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Verify light mode colors (high contrast)
    expect(getByTestId('background-color')).toHaveTextContent('#ffffff')
    expect(getByTestId('surface-color')).toHaveTextContent('#f9fafb')
    expect(getByTestId('text-primary-color')).toHaveTextContent('#111827')
    
    // Toggle to dark mode
    act(() => {
      getByTestId('toggle-theme').click()
    })
    
    // Verify dark mode colors (high contrast)
    expect(getByTestId('background-color')).toHaveTextContent('#111827')
    expect(getByTestId('surface-color')).toHaveTextContent('#1f2937')
    expect(getByTestId('text-primary-color')).toHaveTextContent('#ffffff')
  })

  it('Property 4: Theme Color Adaptation - colors maintain proper contrast ratios', () => {
    const themePreferences = ['light', 'dark']
    
    themePreferences.forEach(preference => {
      localStorage.getItem.mockReturnValue(preference)
      
      const { getByTestId, unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      const backgroundColor = getByTestId('background-color').textContent
      const textColor = getByTestId('text-primary-color').textContent
      
      // Verify colors are different (ensuring contrast)
      expect(backgroundColor).not.toBe(textColor)
      
      // Verify expected color patterns
      if (preference === 'light') {
        expect(backgroundColor).toMatch(/^#[fF]/) // Light backgrounds start with f or F
        expect(textColor).toMatch(/^#1/) // Dark text starts with 1
      } else {
        expect(backgroundColor).toMatch(/^#1/) // Dark backgrounds start with 1 (gray-900)
        expect(textColor).toMatch(/^#[fF]/) // Light text starts with f or F
      }
      
      unmount()
      localStorage.getItem.mockClear()
    })
  })

  it('Property 4: Theme Color Adaptation - canvas opacity configuration is consistent', () => {
    localStorage.getItem.mockReturnValue('light')
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Access canvas configuration through theme context
    const TestCanvasComponent = () => {
      const { canvas } = useTheme()
      return (
        <div>
          <span data-testid="canvas-opacity">{canvas.opacity}</span>
          <span data-testid="canvas-particle-count">{canvas.particleCount}</span>
        </div>
      )
    }
    
    const { getByTestId: getCanvasTestId } = render(
      <ThemeProvider>
        <TestCanvasComponent />
      </ThemeProvider>
    )
    
    // Verify opacity is within 5-10% range (0.05-0.1)
    const opacity = parseFloat(getCanvasTestId('canvas-opacity').textContent)
    expect(opacity).toBeGreaterThanOrEqual(0.05)
    expect(opacity).toBeLessThanOrEqual(0.1)
    
    // Verify particle count is reasonable
    const particleCount = parseInt(getCanvasTestId('canvas-particle-count').textContent)
    expect(particleCount).toBeGreaterThan(0)
    expect(particleCount).toBeLessThan(200) // Reasonable upper limit
  })

  it('Property 4: Theme Color Adaptation - CSS custom properties are set correctly', () => {
    // Mock document.documentElement.style.setProperty
    const setPropertySpy = vi.fn()
    const mockRoot = {
      style: { setProperty: setPropertySpy },
      classList: { add: vi.fn(), remove: vi.fn() }
    }
    
    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: mockRoot,
      writable: true
    })
    
    localStorage.getItem.mockReturnValue('light')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Verify CSS custom properties are set
    expect(setPropertySpy).toHaveBeenCalledWith('--color-primary', expect.any(String))
    expect(setPropertySpy).toHaveBeenCalledWith('--color-background', expect.any(String))
    expect(setPropertySpy).toHaveBeenCalledWith('--color-surface', expect.any(String))
    expect(setPropertySpy).toHaveBeenCalledWith('--color-text-primary', expect.any(String))
    
    // Verify dark class management
    expect(mockRoot.classList.remove).toHaveBeenCalledWith('dark')
  })

  it('Property 4: Theme Color Adaptation - all canvas colors are valid hex colors', () => {
    const hexColorRegex = /^#[0-9A-F]{6}$/i
    
    localStorage.getItem.mockReturnValue('light')
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Test light mode canvas colors
    const lightCanvasColors = JSON.parse(getByTestId('canvas-colors').textContent)
    lightCanvasColors.forEach(color => {
      expect(color).toMatch(hexColorRegex)
    })
    
    // Toggle to dark mode
    act(() => {
      getByTestId('toggle-theme').click()
    })
    
    // Test dark mode canvas colors
    const darkCanvasColors = JSON.parse(getByTestId('canvas-colors').textContent)
    darkCanvasColors.forEach(color => {
      expect(color).toMatch(hexColorRegex)
    })
  })
})