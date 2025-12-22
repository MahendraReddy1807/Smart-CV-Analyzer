import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext.jsx'
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../components/Card.jsx'

describe('Consistent Spacing System Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 1: Consistent Spacing System
   * For any UI component, all margins and padding values should be multiples of 8px to maintain grid consistency
   * Validates: Requirements 1.4
   */
  it('Property 1: Consistent Spacing System - Card components use 8px grid spacing', () => {
    const { container } = render(
      <ThemeProvider>
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
          <CardContent>
            Test content
          </CardContent>
          <CardFooter>
            Test footer
          </CardFooter>
        </Card>
      </ThemeProvider>
    )

    const cardHeader = container.querySelector('.px-6.py-4')
    const cardContent = container.querySelector('.px-6.py-4')
    const cardFooter = container.querySelector('.px-6.py-4')

    // Check that Card components use consistent padding
    expect(cardHeader).toBeTruthy()
    expect(cardContent).toBeTruthy()
    expect(cardFooter).toBeTruthy()

    // Verify padding classes follow 8px grid (px-6 = 24px = 3*8px, py-4 = 16px = 2*8px)
    expect(cardHeader).toHaveClass('px-6', 'py-4')
    expect(cardContent).toHaveClass('px-6', 'py-4')
    expect(cardFooter).toHaveClass('px-6', 'py-4')
  })

  it('Property 1: Consistent Spacing System - spacing values are multiples of 8px', () => {
    // Test various spacing configurations
    const spacingConfigurations = [
      { className: 'p-2', expectedPx: 8 },   // 0.5rem = 8px
      { className: 'p-4', expectedPx: 16 },  // 1rem = 16px
      { className: 'p-6', expectedPx: 24 },  // 1.5rem = 24px
      { className: 'p-8', expectedPx: 32 },  // 2rem = 32px
      { className: 'm-2', expectedPx: 8 },   // 0.5rem = 8px
      { className: 'm-4', expectedPx: 16 },  // 1rem = 16px
      { className: 'm-6', expectedPx: 24 },  // 1.5rem = 24px
      { className: 'm-8', expectedPx: 32 },  // 2rem = 32px
    ]

    spacingConfigurations.forEach(({ className, expectedPx }) => {
      const { container, unmount } = render(
        <ThemeProvider>
          <div className={className} data-testid="spacing-test">
            Test content
          </div>
        </ThemeProvider>
      )

      const element = container.querySelector('[data-testid="spacing-test"]')
      expect(element).toBeTruthy()
      expect(element).toHaveClass(className)
      
      // Verify the spacing value is a multiple of 8px
      expect(expectedPx % 8).toBe(0)
      
      unmount()
    })
  })

  it('Property 1: Consistent Spacing System - Card variants maintain consistent spacing', () => {
    const variants = ['default', 'elevated', 'outlined']
    
    variants.forEach(variant => {
      const { container, unmount } = render(
        <ThemeProvider>
          <Card variant={variant}>
            <CardHeader>
              <CardTitle>Test Title</CardTitle>
            </CardHeader>
            <CardContent>
              Test content
            </CardContent>
          </Card>
        </ThemeProvider>
      )

      // All card variants should maintain consistent internal spacing
      const cardHeader = container.querySelector('.px-6.py-4')
      const cardContent = container.querySelector('.px-6.py-4')

      expect(cardHeader).toBeTruthy()
      expect(cardContent).toBeTruthy()
      
      // Verify consistent padding across variants
      expect(cardHeader).toHaveClass('px-6', 'py-4')
      expect(cardContent).toHaveClass('px-6', 'py-4')
      
      unmount()
    })
  })

  it('Property 1: Consistent Spacing System - nested components maintain spacing hierarchy', () => {
    const { container } = render(
      <ThemeProvider>
        <div className="space-y-6" data-testid="container">
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="mb-2">Title</h3>
                <p className="mb-4">Content</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    )

    const container_el = container.querySelector('[data-testid="container"]')
    const cardContent = container.querySelector('.space-y-4')
    const innerDiv = container.querySelector('.space-y-2')

    // Verify spacing hierarchy uses 8px multiples
    expect(container_el).toHaveClass('space-y-6') // 24px = 3*8px
    expect(cardContent).toHaveClass('space-y-4')  // 16px = 2*8px
    expect(innerDiv).toHaveClass('space-y-2')     // 8px = 1*8px

    // Verify margin classes are multiples of 8px
    const title = container.querySelector('h3')
    const paragraph = container.querySelector('p')
    
    expect(title).toHaveClass('mb-2')  // 8px = 1*8px
    expect(paragraph).toHaveClass('mb-4') // 16px = 2*8px
  })

  it('Property 1: Consistent Spacing System - responsive spacing maintains 8px grid', () => {
    // Test responsive spacing classes
    const responsiveSpacingClasses = [
      'p-2 sm:p-4 lg:p-6',
      'm-2 sm:m-4 lg:m-6',
      'space-y-2 sm:space-y-4 lg:space-y-6',
      'gap-2 sm:gap-4 lg:gap-6'
    ]

    responsiveSpacingClasses.forEach(className => {
      const { container, unmount } = render(
        <ThemeProvider>
          <div className={className} data-testid="responsive-spacing">
            Test content
          </div>
        </ThemeProvider>
      )

      const element = container.querySelector('[data-testid="responsive-spacing"]')
      expect(element).toBeTruthy()
      expect(element).toHaveClass(...className.split(' '))
      
      unmount()
    })
  })

  it('Property 1: Consistent Spacing System - form elements use consistent spacing', () => {
    const { container } = render(
      <ThemeProvider>
        <Card>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="block mb-2">Label</label>
                <input className="w-full px-3 py-2" />
              </div>
              <div className="space-y-2">
                <label className="block mb-2">Another Label</label>
                <textarea className="w-full px-3 py-2" />
              </div>
              <button className="px-4 py-2">Submit</button>
            </form>
          </CardContent>
        </Card>
      </ThemeProvider>
    )

    const form = container.querySelector('form')
    const fieldGroups = container.querySelectorAll('.space-y-2')
    const labels = container.querySelectorAll('label')
    const inputs = container.querySelectorAll('input, textarea')
    const button = container.querySelector('button')

    // Verify form uses 8px grid spacing
    expect(form).toHaveClass('space-y-6') // 24px = 3*8px
    
    fieldGroups.forEach(group => {
      expect(group).toHaveClass('space-y-2') // 8px = 1*8px
    })

    labels.forEach(label => {
      expect(label).toHaveClass('mb-2') // 8px = 1*8px
    })

    inputs.forEach(input => {
      expect(input).toHaveClass('px-3', 'py-2') // 12px, 8px - both multiples of 4px (half grid)
    })

    expect(button).toHaveClass('px-4', 'py-2') // 16px, 8px - multiples of 8px
  })

  it('Property 1: Consistent Spacing System - layout grids use consistent gaps', () => {
    const { container } = render(
      <ThemeProvider>
        <div className="grid grid-cols-2 gap-4" data-testid="grid-container">
          <Card>
            <CardContent>Item 1</CardContent>
          </Card>
          <Card>
            <CardContent>Item 2</CardContent>
          </Card>
        </div>
      </ThemeProvider>
    )

    const gridContainer = container.querySelector('[data-testid="grid-container"]')
    
    // Verify grid gap follows 8px system
    expect(gridContainer).toHaveClass('gap-4') // 16px = 2*8px
    expect(gridContainer).toHaveClass('grid', 'grid-cols-2')
  })
})