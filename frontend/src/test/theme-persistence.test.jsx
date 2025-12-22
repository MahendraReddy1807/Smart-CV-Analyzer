import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext.jsx'

// Test component to access theme context
function TestComponent() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  return (
    <div>
      <span data-testid="theme-mode">{isDarkMode ? 'dark' : 'light'}</span>
      <button data-testid="toggle-theme" onClick={toggleDarkMode}>
        Toggle Theme
      </button>
    </div>
  )
}

describe('Theme Persistence Properties', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear()
    localStorage.getItem.mockClear()
    localStorage.setItem.mockClear()
  })

  /**
   * Property 7: Dark Mode Persistence
   * For any user session, the selected theme mode should persist across page refreshes and browser sessions
   * Validates: Requirements 5.4
   */
  it('Property 7: Dark Mode Persistence - theme preference persists across sessions', () => {
    // Test multiple theme preference values
    const themePreferences = ['light', 'dark']
    
    themePreferences.forEach(preference => {
      // Mock localStorage to return the preference
      localStorage.getItem.mockReturnValue(preference)
      
      const { getByTestId, unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      // Verify theme is loaded from localStorage
      const expectedMode = preference === 'dark' ? 'dark' : 'light'
      expect(getByTestId('theme-mode')).toHaveTextContent(expectedMode)
      
      // Verify localStorage was queried
      expect(localStorage.getItem).toHaveBeenCalledWith('theme-preference')
      
      unmount()
      localStorage.getItem.mockClear()
    })
  })

  it('Property 7: Dark Mode Persistence - theme changes are saved to localStorage', () => {
    // Start with light mode
    localStorage.getItem.mockReturnValue('light')
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Verify initial state
    expect(getByTestId('theme-mode')).toHaveTextContent('light')
    
    // Toggle theme
    act(() => {
      getByTestId('toggle-theme').click()
    })
    
    // Verify theme changed
    expect(getByTestId('theme-mode')).toHaveTextContent('dark')
    
    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark')
    
    // Toggle back
    act(() => {
      getByTestId('toggle-theme').click()
    })
    
    // Verify theme changed back
    expect(getByTestId('theme-mode')).toHaveTextContent('light')
    
    // Verify localStorage was updated again
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'light')
  })

  it('Property 7: Dark Mode Persistence - defaults to light mode when localStorage is empty', () => {
    // Mock localStorage to return null (no saved preference)
    localStorage.getItem.mockReturnValue(null)
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Should default to light mode
    expect(getByTestId('theme-mode')).toHaveTextContent('light')
    expect(localStorage.getItem).toHaveBeenCalledWith('theme-preference')
  })

  it('Property 7: Dark Mode Persistence - handles localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    localStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })
    
    // Should not throw and default to light mode
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(getByTestId('theme-mode')).toHaveTextContent('light')
    
    // Mock localStorage.setItem to throw an error
    localStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })
    
    // Should not throw when toggling theme
    expect(() => {
      act(() => {
        getByTestId('toggle-theme').click()
      })
    }).not.toThrow()
    
    // Theme should still change in memory
    expect(getByTestId('theme-mode')).toHaveTextContent('dark')
  })

  it('Property 7: Dark Mode Persistence - invalid localStorage values default to light mode', () => {
    // Test various invalid values
    const invalidValues = ['invalid', 'true', 'false', '1', '0', 'undefined', 'null']
    
    invalidValues.forEach(invalidValue => {
      localStorage.getItem.mockReturnValue(invalidValue)
      
      const { getByTestId, unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      // Should default to light mode for any invalid value
      expect(getByTestId('theme-mode')).toHaveTextContent('light')
      
      unmount()
      localStorage.getItem.mockClear()
    })
  })
})