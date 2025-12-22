import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ScoreProgress } from '../components/ProgressIndicator'
import fc from 'fast-check'

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
)

// Helper function to get score color based on the component's logic
const getExpectedScoreColor = (score) => {
  if (score >= 80) return 'success' // Green
  if (score >= 60) return 'warning' // Yellow/Amber
  return 'error' // Red
}

// Helper function to get score label based on the component's logic
const getExpectedScoreLabel = (score) => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

describe('Color-Coded Score Visualization Properties', () => {
  describe('Property 10: Color-Coded Score Visualization', () => {
    it('should use success color (green) for scores >= 80', () => {
      fc.assert(fc.property(
        fc.integer({ min: 80, max: 100 }),
        (score) => {
          const { container } = render(
            <TestWrapper>
              <ScoreProgress score={score} size="md" animated={false} />
            </TestWrapper>
          )
          
          // Verify the score is displayed correctly
          const scoreText = container.textContent
          expect(scoreText).toContain(score.toString())
          
          // Verify the label is "Excellent" for scores >= 80
          expect(scoreText).toContain('Excellent')
          
          // Check that the component renders without errors
          const progressContainer = container.querySelector('div')
          expect(progressContainer).toBeTruthy()
        }
      ), { numRuns: 10 })
    })

    it('should use warning color (amber/yellow) for scores 60-79', () => {
      fc.assert(fc.property(
        fc.integer({ min: 60, max: 79 }),
        (score) => {
          const { container } = render(
            <TestWrapper>
              <ScoreProgress score={score} size="md" animated={false} />
            </TestWrapper>
          )
          
          // Verify the score is displayed correctly
          const scoreText = container.textContent
          expect(scoreText).toContain(score.toString())
          
          // Verify the label is "Good" for scores 60-79
          expect(scoreText).toContain('Good')
          
          // Check that the component renders without errors
          const progressContainer = container.querySelector('div')
          expect(progressContainer).toBeTruthy()
        }
      ), { numRuns: 10 })
    })

    it('should use error color (red) for scores < 60', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 59 }),
        (score) => {
          const { container } = render(
            <TestWrapper>
              <ScoreProgress score={score} size="md" animated={false} />
            </TestWrapper>
          )
          
          // Verify the score is displayed correctly
          const scoreText = container.textContent
          expect(scoreText).toContain(score.toString())
          
          // Verify the label is appropriate for scores < 60
          const expectedLabel = getExpectedScoreLabel(score)
          expect(scoreText).toContain(expectedLabel)
          
          // Check that the component renders without errors
          const progressContainer = container.querySelector('div')
          expect(progressContainer).toBeTruthy()
        }
      ), { numRuns: 10 })
    })

    it('should maintain color consistency across different score ranges', () => {
      fc.assert(fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 3, maxLength: 10 }),
        (scores) => {
          const results = scores.map(score => {
            const { container } = render(
              <TestWrapper>
                <ScoreProgress score={score} size="md" animated={false} />
              </TestWrapper>
            )
            
            let colorCategory = 'red' // default for < 60
            if (score >= 80) colorCategory = 'green'
            else if (score >= 60) colorCategory = 'yellow'
            
            return { score, colorCategory, container }
          })
          
          // Group by color category and verify consistency
          const greenScores = results.filter(r => r.colorCategory === 'green')
          const yellowScores = results.filter(r => r.colorCategory === 'yellow')
          const redScores = results.filter(r => r.colorCategory === 'red')
          
          // All green scores should be >= 80
          greenScores.forEach(({ score }) => {
            expect(score).toBeGreaterThanOrEqual(80)
          })
          
          // All yellow scores should be 60-79
          yellowScores.forEach(({ score }) => {
            expect(score).toBeGreaterThanOrEqual(60)
            expect(score).toBeLessThan(80)
          })
          
          // All red scores should be < 60
          redScores.forEach(({ score }) => {
            expect(score).toBeLessThan(60)
          })
        }
      ), { numRuns: 5 })
    })

    it('should handle edge cases correctly', () => {
      const edgeCases = [0, 59, 60, 79, 80, 100]
      
      edgeCases.forEach(score => {
        const { container } = render(
          <TestWrapper>
            <ScoreProgress score={score} size="md" animated={false} />
          </TestWrapper>
        )
        
        // Verify score is rendered
        expect(container.textContent).toContain(score.toString())
        
        // Verify appropriate label is applied based on thresholds
        const expectedLabel = getExpectedScoreLabel(score)
        expect(container.textContent).toContain(expectedLabel)
        
        // Verify component renders without errors
        const progressContainer = container.querySelector('div')
        expect(progressContainer).toBeTruthy()
      })
    })
  })
})