import { useState, useEffect } from 'react'

const ProgressTracker = ({ 
  steps = [], 
  currentStep = 0, 
  isLoading = false, 
  error = null,
  onRetry = null 
}) => {
  const [animatedStep, setAnimatedStep] = useState(0)

  useEffect(() => {
    // Animate step progression
    const timer = setTimeout(() => {
      setAnimatedStep(currentStep)
    }, 100)
    return () => clearTimeout(timer)
  }, [currentStep])

  const getStepStatus = (stepIndex) => {
    if (error && stepIndex === currentStep) return 'error'
    if (stepIndex < animatedStep) return 'completed'
    if (stepIndex === animatedStep && isLoading) return 'active'
    if (stepIndex === animatedStep) return 'current'
    return 'pending'
  }

  const getStepIcon = (stepIndex, status) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'active':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
      case 'current':
        return '🔵'
      case 'error':
        return '❌'
      default:
        return '⚪'
    }
  }

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'active':
      case 'current':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const colorClass = getStepColor(status)
          
          return (
            <div
              key={index}
              className={`flex items-center p-3 rounded-lg border transition-all duration-300 ${colorClass}`}
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {getStepIcon(index, status)}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="font-medium">
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-sm opacity-75 mt-1">
                    {step.description}
                  </div>
                )}
                
                {/* Show progress bar for active step */}
                {status === 'active' && step.progress !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{step.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Show error message */}
                {status === 'error' && error && (
                  <div className="mt-2 text-sm">
                    <div className="text-red-700">{error}</div>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Step number */}
              <div className="flex-shrink-0 ml-3 text-sm font-medium opacity-60">
                {index + 1}/{steps.length}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Overall progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((animatedStep / Math.max(steps.length - 1, 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(animatedStep / Math.max(steps.length - 1, 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker