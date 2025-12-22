import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext.jsx'
import Card, { CardContent, CardHeader, CardTitle } from '../components/Card.jsx'

describe('Hover Animation Consistency Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 5: Hover Animation Consistency
   * For any interactive element, hovering should trigger consistent scale and shadow animations within 300ms
   * Validates: Requirements 4.1, 4.4
   */
  it('Property 5: Hover Animation Consistency - Card components have consistent hover classes', () => {
    const variants = ['default', 'elevated', 'outlined']
    
    variants.forEach(variant => {
      const { container, unmount } = render(
        <ThemeProvider>
          <Card variant={variant} hover={true}>
            <CardContent>Test content</CardContent>
          </Card>
        </ThemeProvider>
      )

      const card = container.firstChild
      expect(card).toBeTruthy()
      
      // Check for hover animation classes
      const classList = Array.from(card.classList)
      
      // All cards should have transition classes
      expect(classList).toContain('transition-all')
      expect(classList).toContain('duration-300')
      expect(classList).toContain('ease-out')
      
      // All cards should have hover scale and transform classes
      const hasHoverScale = classList.some(cls => cls.includes('hover:scale-'))
      const hasHoverTransform = classList.some(cls => cls.includes('hover:-translate-y-'))
      const hasHoverShadow = classList.some(cls => cls.includes('hover:shadow-'))
      
      expect(hasHoverScale).toBe(true)
      expect(hasHoverTransform).toBe(true)
      expect(hasHoverShadow).toBe(true)
      
      unmount()
    })
  })

  it('Property 5: Hover Animation Consistency - hover disabled cards do not have hover classes', () => {
    const { container } = render(
      <ThemeProvider>
        <Card variant="default" hover={false}>
          <CardContent>Test content</CardContent>
        </Card>
      </ThemeProvider>
    )

    const card = container.firstChild
    const classList = Array.from(card.classList)
    
    // Should still have transition classes for other state changes
    expect(classList).toContain('transition-all')
    expect(classList).toContain('duration-300')
    
    // Should NOT have hover animation classes
    const hasHoverScale = classList.some(cls => cls.includes('hover:scale-'))
    const hasHoverTransform = classList.some(cls => cls.includes('hover:-translate-y-'))
    const hasHoverShadow = classList.some(cls => cls.includes('hover:shadow-'))
    
    expect(hasHoverScale).toBe(false)
    expect(hasHoverTransform).toBe(false)
    expect(hasHoverShadow).toBe(false)
  })

  it('Property 5: Hover Animation Consistency - animation duration is 300ms', () => {
    const { container } = render(
      <ThemeProvider>
        <Card hover={true}>
          <CardContent>Test content</CardContent>
        </Card>
      </ThemeProvider>
    )

    const card = container.firstChild
    const classList = Array.from(card.classList)
    
    // Check for 300ms duration class (duration-300)
    expect(classList).toContain('duration-300')
    
    // Verify it's not using other durations
    const hasFastDuration = classList.some(cls => cls.includes('duration-150'))
    const hasSlowDuration = classList.some(cls => cls.includes('duration-500'))
    
    expect(hasFastDuration).toBe(false)
    expect(hasSlowDuration).toBe(false)
  })

  it('Property 5: Hover Animation Consistency - clickable cards have focus states', () => {
    const mockOnClick = vi.fn()
    
    const { container } = render(
      <ThemeProvider>
        <Card hover={true} onClick={mockOnClick}>
          <CardContent>Clickable content</CardContent>
        </Card>
      </ThemeProvider>
    )

    const card = container.firstChild
    const classList = Array.from(card.classList)
    
    // Should have focus ring classes for accessibility
    expect(classList).toContain('focus:outline-none')
    expect(classList).toContain('focus:ring-2')
    expect(classList).toContain('focus:ring-primary-500')
    expect(classList).toContain('focus:ring-offset-2')
    
    // Should be keyboard accessible
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('role', 'button')
  })

  it('Property 5: Hover Animation Consistency - keyboard interaction works', () => {
    const mockOnClick = vi.fn()
    
    const { container } = render(
      <ThemeProvider>
        <Card hover={true} onClick={mockOnClick}>
          <CardContent>Clickable content</CardContent>
        </Card>
      </ThemeProvider>
    )

    const card = container.firstChild
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(mockOnClick).toHaveBeenCalledTimes(1)
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ' })
    expect(mockOnClick).toHaveBeenCalledTimes(2)
    
    // Test other keys (should not trigger)
    fireEvent.keyDown(card, { key: 'Tab' })
    expect(mockOnClick).toHaveBeenCalledTimes(2)
  })

  it('Property 5: Hover Animation Consistency - all variants use consistent scale values', () => {
    const variants = ['default', 'elevated', 'outlined']
    
    variants.forEach(variant => {
      const { container, unmount } = render(
        <ThemeProvider>
          <Card variant={variant} hover={true}>
            <CardContent>Test content</CardContent>
          </Card>
        </ThemeProvider>
      )

      const card = container.firstChild
      const classList = Array.from(card.classList)
      
      // All variants should use the same scale value for consistency
      const scaleClass = classList.find(cls => cls.includes('hover:scale-'))
      expect(scaleClass).toBe('hover:scale-[1.02]')
      
      // All variants should use the same transform value
      const transformClass = classList.find(cls => cls.includes('hover:-translate-y-'))
      expect(transformClass).toBe('hover:-translate-y-1')
      
      unmount()
    })
  })

  it('Property 5: Hover Animation Consistency - transition easing is consistent', () => {
    const { container } = render(
      <ThemeProvider>
        <Card hover={true}>
          <CardContent>Test content</CardContent>
        </Card>
      </ThemeProvider>
    )

    const card = container.firstChild
    const classList = Array.from(card.classList)
    
    // Should use ease-out for smooth hover animations
    expect(classList).toContain('ease-out')
    
    // Should not use other easing functions
    const hasEaseIn = classList.some(cls => cls.includes('ease-in'))
    const hasEaseInOut = classList.some(cls => cls.includes('ease-in-out'))
    
    expect(hasEaseIn).toBe(false)
    expect(hasEaseInOut).toBe(false)
  })

  it('Property 5: Hover Animation Consistency - shadow progression is logical', () => {
    const variants = [
      { variant: 'default', baseShadow: 'shadow-md', hoverShadow: 'hover:shadow-lg' },
      { variant: 'elevated', baseShadow: 'shadow-lg', hoverShadow: 'hover:shadow-xl' },
      { variant: 'outlined', baseShadow: 'shadow-sm', hoverShadow: 'hover:shadow-md' }
    ]
    
    variants.forEach(({ variant, baseShadow, hoverShadow }) => {
      const { container, unmount } = render(
        <ThemeProvider>
          <Card variant={variant} hover={true}>
            <CardContent>Test content</CardContent>
          </Card>
        </ThemeProvider>
      )

      const card = container.firstChild
      const classList = Array.from(card.classList)
      
      // Check base shadow
      expect(classList).toContain(baseShadow)
      
      // Check hover shadow progression
      expect(classList).toContain(hoverShadow)
      
      unmount()
    })
  })

  it('Property 5: Hover Animation Consistency - non-interactive cards maintain visual consistency', () => {
    const { container } = render(
      <ThemeProvider>
        <Card hover={false}>
          <CardContent>Non-interactive content</CardContent>
        </Card>
      </ThemeProvider>
    )

    const card = container.firstChild
    
    // Should not have interactive attributes
    expect(card).not.toHaveAttribute('tabIndex')
    expect(card).not.toHaveAttribute('role', 'button')
    expect(card).not.toHaveAttribute('onClick')
    
    // Should still have base styling but no hover effects
    const classList = Array.from(card.classList)
    expect(classList).toContain('rounded-xl')
    expect(classList).toContain('transition-all')
    
    // Should not have hover animation classes
    const hasHoverEffects = classList.some(cls => 
      cls.includes('hover:scale-') || 
      cls.includes('hover:-translate-y-') || 
      cls.includes('hover:shadow-')
    )
    expect(hasHoverEffects).toBe(false)
  })
})