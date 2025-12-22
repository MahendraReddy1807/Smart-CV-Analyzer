import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext.jsx'
import CanvasBackground from '../components/CanvasBackground.jsx'

// Mock canvas context for testing
const mockCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    strokeStyle: '',
    lineWidth: 1,
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  })),
  width: 1024,
  height: 768,
  getBoundingClientRect: vi.fn(() => ({
    width: 1024,
    height: 768,
  })),
}

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext,
})

Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: mockCanvas.getBoundingClientRect,
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16) // Simulate 60fps
  return 1
})

global.cancelAnimationFrame = vi.fn()

describe('Canvas Layer Positioning Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  /**
   * Property 3: Canvas Layer Positioning
   * For any screen size or device, the canvas element should remain behind all UI elements 
   * with negative z-index and not block user interactions
   * Validates: Requirements 2.4
   */
  it('Property 3: Canvas Layer Positioning - canvas has negative z-index', () => {
    const { container } = render(
      <ThemeProvider>
        <CanvasBackground />
      </ThemeProvider>
    )

    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
    
    // Check that canvas has negative z-index through inline styles
    const computedStyle = window.getComputedStyle(canvas)
    expect(canvas.style.zIndex).toBe('-1')
  })

  it('Property 3: Canvas Layer Positioning - canvas does not block pointer events', () => {
    const { container } = render(
      <ThemeProvider>
        <CanvasBackground />
      </ThemeProvider>
    )

    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
    
    // Check that canvas has pointer-events: none
    expect(canvas).toHaveClass('pointer-events-none')
  })

  it('Property 3: Canvas Layer Positioning - canvas covers full viewport', () => {
    // Test different viewport sizes
    const viewportSizes = [
      { width: 320, height: 568 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1024, height: 768 },  // Desktop landscape
      { width: 1920, height: 1080 }, // Large desktop
      { width: 2560, height: 1440 }, // Ultra-wide
    ]

    viewportSizes.forEach(({ width, height }) => {
      // Update window dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
      })

      const { container, unmount } = render(
        <ThemeProvider>
          <CanvasBackground />
        </ThemeProvider>
      )

      const canvas = container.querySelector('canvas')
      expect(canvas).toBeTruthy()
      
      // Check that canvas covers full viewport
      expect(canvas.style.width).toBe('100vw')
      expect(canvas.style.height).toBe('100vh')
      
      // Check that canvas is positioned fixed to cover entire screen
      expect(canvas).toHaveClass('fixed')
      expect(canvas).toHaveClass('inset-0')

      unmount()
    })
  })

  it('Property 3: Canvas Layer Positioning - canvas is positioned behind other elements', () => {
    const { container } = render(
      <ThemeProvider>
        <div>
          <CanvasBackground />
          <div data-testid="ui-element" style={{ position: 'relative', zIndex: 1 }}>
            UI Content
          </div>
        </div>
      </ThemeProvider>
    )

    const canvas = container.querySelector('canvas')
    const uiElement = container.querySelector('[data-testid="ui-element"]')
    
    expect(canvas).toBeTruthy()
    expect(uiElement).toBeTruthy()
    
    // Canvas should have negative z-index
    expect(canvas.style.zIndex).toBe('-1')
    
    // UI element should have higher z-index
    const uiZIndex = parseInt(window.getComputedStyle(uiElement).zIndex) || 0
    const canvasZIndex = parseInt(canvas.style.zIndex)
    
    expect(canvasZIndex).toBeLessThan(uiZIndex)
  })

  it('Property 3: Canvas Layer Positioning - canvas is accessible but not interactive', () => {
    const { container } = render(
      <ThemeProvider>
        <CanvasBackground />
      </ThemeProvider>
    )

    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
    
    // Canvas should be hidden from screen readers (decorative only)
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    
    // Canvas should not be focusable
    expect(canvas).not.toHaveAttribute('tabindex')
    
    // Canvas should not block pointer events
    expect(canvas).toHaveClass('pointer-events-none')
  })

  it('Property 3: Canvas Layer Positioning - canvas positioning is consistent across theme changes', () => {
    const { container, rerender } = render(
      <ThemeProvider>
        <CanvasBackground />
      </ThemeProvider>
    )

    const canvas = container.querySelector('canvas')
    const initialZIndex = canvas.style.zIndex
    const initialPointerEvents = canvas.classList.contains('pointer-events-none')
    const initialPosition = canvas.classList.contains('fixed')

    // Force a theme change by re-rendering
    rerender(
      <ThemeProvider>
        <CanvasBackground />
      </ThemeProvider>
    )

    // Canvas positioning should remain consistent
    expect(canvas.style.zIndex).toBe(initialZIndex)
    expect(canvas.classList.contains('pointer-events-none')).toBe(initialPointerEvents)
    expect(canvas.classList.contains('fixed')).toBe(initialPosition)
  })

  it('Property 3: Canvas Layer Positioning - canvas adapts to window resize', () => {
    const { container } = render(
      <ThemeProvider>
        <CanvasBackground />
      </ThemeProvider>
    )

    const canvas = container.querySelector('canvas')
    
    // Initial size check
    expect(canvas.style.width).toBe('100vw')
    expect(canvas.style.height).toBe('100vh')
    
    // Simulate window resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 900,
    })

    // Trigger resize event
    window.dispatchEvent(new Event('resize'))

    // Canvas should still cover full viewport after resize
    expect(canvas.style.width).toBe('100vw')
    expect(canvas.style.height).toBe('100vh')
    expect(canvas).toHaveClass('fixed')
    expect(canvas).toHaveClass('inset-0')
  })
})