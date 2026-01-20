import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeAPI, handleAPIError } from '../utils/api'
import Breadcrumb from './Breadcrumb'
import JobMarketInsights from './JobMarketInsights'
import AIAnalysis from './AIAnalysis'
import Card, { CardContent, CardHeader, CardTitle } from './Card'
import { ScoreProgress } from './ProgressIndicator'
import { ScoreTooltip } from './Tooltip'

const AnalysisResults = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingSection, setEditingSection] = useState(null)
  const [editedContent, setEditedContent] = useState('')
  const [acceptedEnhancements, setAcceptedEnhancements] = useState(new Set())
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    fetchAnalysis()
  }, [id])

  const fetchAnalysis = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true)
      setError('')
    }
    
    try {
      const response = await resumeAPI.getAnalysis(id)
      
      // Check if we have analysis data (successful response)
      if (response.data && response.data._id) {
        setAnalysis(response.data)
        setRetryCount(0) // Reset retry count on success
      } else {
        setError(response.data?.message || 'Failed to load analysis results')
      }
    } catch (err) {
      console.error('Error fetching analysis:', err)
      
      let errorMessage = 'Failed to load analysis results'
      let isValidationError = false
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.response) {
        if (err.response.status === 400) {
          // Check for validation errors
          const errorData = err.response.data
          if (errorData.status === 'invalid' || errorData.error === 'INVALID_RESUME_CONTENT') {
            isValidationError = true
            errorMessage = errorData.message || 'The uploaded document is not a valid resume.'
            setError({
              type: 'validation',
              message: errorMessage,
              details: errorData.details,
              suggestions: errorData.suggestions || []
            })
            return
          }
        } else if (err.response.status === 404) {
          errorMessage = 'Analysis not found. It may have been deleted or the link is invalid.'
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = err.response.data?.message || errorMessage
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchAnalysis(true)
  }

  const handleSectionEdit = (sectionName, content) => {
    setEditingSection(sectionName)
    setEditedContent(typeof content === 'string' ? content : JSON.stringify(content, null, 2))
  }

  const handleSaveEdit = () => {
    // In a real implementation, this would save to backend
    console.log('Saving edit for section:', editingSection, editedContent)
    setEditingSection(null)
    setEditedContent('')
  }

  const handleCancelEdit = () => {
    setEditingSection(null)
    setEditedContent('')
  }

  const handleAcceptEnhancement = (enhancementIndex) => {
    const newAccepted = new Set(acceptedEnhancements)
    newAccepted.add(enhancementIndex)
    setAcceptedEnhancements(newAccepted)
  }

  const handleRejectEnhancement = (enhancementIndex) => {
    const newAccepted = new Set(acceptedEnhancements)
    newAccepted.delete(enhancementIndex)
    setAcceptedEnhancements(newAccepted)
  }

  const handleDownload = async () => {
    if (!analysis) return

    setIsDownloading(true)
    setError('') // Clear any previous errors
    
    try {
      const response = await resumeAPI.downloadResume(analysis._id, Array.from(acceptedEnhancements))

      // Check if response has data
      if (!response.data) {
        throw new Error('No data received from server.')
      }

      // Create download link
      const contentType = response.headers['content-type'] || 'text/plain'
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }))
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10)
      const fileExtension = contentType.includes('pdf') ? 'pdf' : 'txt'
      const filename = `enhanced_${analysis.uploadedFileName.replace(/\.[^/.]+$/, '')}_${timestamp}.${fileExtension}`
      link.setAttribute('download', filename)
      
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Show success message briefly
      const originalError = error
      setError('✅ Enhanced resume report downloaded successfully!')
      setTimeout(() => setError(originalError), 3000)

    } catch (err) {
      console.error('Download error:', err)
      
      let errorMessage = 'Failed to download enhanced resume report. Please try again.'
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Download timeout. Please try again.'
      } else if (err.response) {
        if (err.response.status === 503) {
          errorMessage = 'Resume generation service is temporarily unavailable. Please try again later.'
        } else if (err.response.status === 404) {
          errorMessage = 'Analysis not found. Please refresh the page and try again.'
        } else {
          errorMessage = err.response.data?.message || errorMessage
        }
      } else if (err.request) {
        errorMessage = 'Network error during download. Please check your connection.'
      }
      
      setError(errorMessage)
    } finally {
      setIsDownloading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading analysis results...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Analysis ID: {id}</p>
          {retryCount > 0 && (
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">Retry attempt {retryCount}</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    // Handle validation errors differently
    if (typeof error === 'object' && error.type === 'validation') {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card variant="outlined" className="border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20">
            <CardContent>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-orange-500 text-xl">📄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-orange-800 dark:text-orange-200 font-bold mb-2">Invalid Resume Document</h3>
                  <p className="text-orange-600 dark:text-orange-400 mb-4">{error.message}</p>
                  
                  {error.details && (
                    <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded border border-orange-200 dark:border-orange-700">
                      <p className="text-orange-700 dark:text-orange-300 text-sm font-medium mb-2">Details:</p>
                      <p className="text-orange-600 dark:text-orange-400 text-sm">{error.details}</p>
                    </div>
                  )}
                  
                  {error.suggestions && error.suggestions.length > 0 && (
                    <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded border border-orange-200 dark:border-orange-700">
                      <p className="text-orange-700 dark:text-orange-300 text-sm font-medium mb-2">Suggestions:</p>
                      <ul className="text-orange-600 dark:text-orange-400 text-sm space-y-1">
                        {error.suggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                    >
                      ← Upload a Valid Resume
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Help section for validation errors */}
          <Card variant="outlined" className="border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20">
            <CardContent>
              <h4 className="text-blue-800 dark:text-blue-200 font-bold mb-2">💡 What makes a valid resume?</h4>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
                <li>• Contains sections like Education, Skills, Experience, or Projects</li>
                <li>• Includes professional information and contact details</li>
                <li>• Uses career-focused language and terminology</li>
                <li>• Avoid uploading certificates, social media content, or congratulations messages</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // Handle other errors (network, server, etc.)
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card variant="outlined" className="border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
          <CardContent>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 dark:text-red-200 font-bold mb-2">Unable to Load Analysis</h3>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                
                {/* Debugging information in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-2">Debug Information:</p>
                    <ul className="text-red-600 dark:text-red-400 text-xs space-y-1">
                      <li>• Analysis ID: {id}</li>
                      <li>• API Base URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</li>
                      <li>• Retry attempts: {retryCount}</li>
                      <li>• Current URL: {window.location.href}</li>
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Retrying...
                      </span>
                    ) : (
                      `Try Again ${retryCount > 0 ? `(${retryCount})` : ''}`
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    ← Back to Upload
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional help for common issues */}
        <Card variant="outlined" className="border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20">
          <CardContent>
            <h4 className="text-blue-800 dark:text-blue-200 font-bold mb-2">💡 Troubleshooting Tips</h4>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
              <li>• Make sure the backend server is running on port 5000</li>
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• If the issue persists, try uploading and analyzing a new resume</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card variant="outlined" className="border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-yellow-500 text-xl">📄</span>
              </div>
              <div className="flex-1">
                <h3 className="text-yellow-800 dark:text-yellow-200 font-bold mb-2">No Analysis Data Found</h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  The analysis data for ID "{id}" could not be found. This might happen if:
                </p>
                <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 mb-4 ml-4">
                  <li>• The analysis was recently created and hasn't been saved yet</li>
                  <li>• The analysis ID is invalid or expired</li>
                  <li>• There was an issue with data storage</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => fetchAnalysis(true)}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Refresh Data
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    ← Upload New Resume
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log('AnalysisResults: Rendering analysis results for:', analysis.uploadedFileName)
  console.log('AnalysisResults: Active tab:', activeTab)
  console.log('AnalysisResults: Analysis data:', {
    overallScore: analysis.overallScore,
    sectionsSkills: analysis.sections?.skills?.length,
    issues: analysis.issues?.length,
    enhancedBullets: analysis.enhancedBullets?.length,
    suggestedKeywords: analysis.suggestedKeywords?.length
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'market', label: 'Job Market', icon: '📈' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: '🤖' },
    { id: 'sections', label: 'Sections', icon: '📋' },
    { id: 'enhancements', label: 'Enhancements', icon: '✨' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' }
  ]

  try {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Breadcrumb - with error boundary */}
        {(() => {
          try {
            return <Breadcrumb />
          } catch (error) {
            console.error('Breadcrumb error:', error)
            return null
          }
        })()}
        
        {/* Job Market Insights - with error boundary */}
        {(() => {
          try {
            return (analysis.jobMarketData || analysis.suggestedRoles) ? (
              <JobMarketInsights 
                jobMarketData={analysis.jobMarketData} 
                suggestedRoles={analysis.suggestedRoles} 
              />
            ) : null
          } catch (error) {
            console.error('JobMarketInsights error:', error)
            return (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ℹ️ Job market insights not available for this analysis
                </p>
              </div>
            )
          }
        })()}
        
        {/* AI Analysis - with error boundary */}
        {(() => {
          try {
            return analysis.aiAnalysis ? (
              <AIAnalysis aiAnalysis={analysis.aiAnalysis} />
            ) : null
          } catch (error) {
            console.error('AIAnalysis error:', error)
            return (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ℹ️ AI analysis not available for this analysis
                </p>
              </div>
            )
          }
        })()}
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white">Resume Analysis Results</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2 font-medium">
              <span className="font-semibold">{analysis.uploadedFileName}</span> • Target Role: {analysis.jobRole}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+</span>
            New Analysis
          </button>
        </div>
      </div>

      {/* Score Overview */}
      <Card variant="elevated" className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle level={2}>Overall Score</CardTitle>
            <ScoreTooltip score={analysis.overallScore} category="overall">
              <ScoreProgress
                score={analysis.overallScore}
                size="lg"
                showLabel={true}
                animated={true}
              />
            </ScoreTooltip>
          </div>
        </CardHeader>
        <CardContent>
        
        {/* Enhanced Responsive Score Breakdown */}
        {analysis.scoreBreakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            {Object.entries(analysis.scoreBreakdown || {}).map(([key, value]) => {
              const getScoreColor = (score) => {
                if (score >= 80) return 'text-green-600'
                if (score >= 60) return 'text-yellow-600'
                return 'text-red-600'
              }
              
              const getProgressColor = (score) => {
                if (score >= 80) return 'bg-green-500'
                if (score >= 60) return 'bg-yellow-500'
                return 'bg-red-500'
              }
              
              const getLabel = (key) => {
                const labels = {
                  'contactScore': 'Contact Info',
                  'contentScore': 'Content Quality',
                  'skillsScore': 'Skills',
                  'structureScore': 'Structure',
                  'atsCompatibility': 'ATS Score'
                }
                return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              }
              
              return (
                <div key={key} className="flex flex-col items-center space-y-2">
                  <ScoreTooltip score={value} category={key}>
                    <ScoreProgress
                      score={value}
                      size="md"
                      showLabel={false}
                      animated={true}
                    />
                  </ScoreTooltip>
                  <div className="text-sm font-black text-black dark:text-white text-center bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
                    {getLabel(key)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Enhanced Responsive Tab Navigation */}
      <Card variant="default" className="overflow-hidden">
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-4 px-3 sm:px-4 border-b-2 font-bold text-sm transition-colors duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-base">{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div 
          className="p-6" 
          role="tabpanel" 
          id={`tabpanel-${activeTab}`} 
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'market' && (
            <div className="text-center py-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">Job market insights are displayed above in the dedicated section.</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-blue-600 hover:text-blue-800"
              >
                Scroll to Job Market Insights ↑
              </button>
            </div>
          )}

          {activeTab === 'ai-analysis' && (
            <div className="text-center py-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">AI analysis is displayed above in the dedicated section.</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-blue-600 hover:text-blue-800"
              >
                Scroll to AI Analysis ↑
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {console.log('AnalysisResults: Rendering Overview tab with data:', {
                skillsCount: analysis.sections?.skills?.length || 0,
                enhancementsCount: analysis.enhancedBullets?.length || 0,
                issuesCount: analysis.issues?.length || 0,
                sectionsData: analysis.sections ? Object.keys(analysis.sections) : []
              })}
              
              {/* Enhanced Quick Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="text-center py-6">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {Array.isArray(analysis.sections?.skills) ? analysis.sections.skills.length : 0}
                    </div>
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Skills Identified</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Technical & Soft Skills
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                  <CardContent className="text-center py-6">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {Array.isArray(analysis.enhancedBullets) ? analysis.enhancedBullets.length : 0}
                    </div>
                    <div className="text-sm font-medium text-green-800 dark:text-green-300">AI Enhancements</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Content Improvements
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="elevated" className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700 sm:col-span-2 lg:col-span-1">
                  <CardContent className="text-center py-6">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {Array.isArray(analysis.issues) ? analysis.issues.length : 0}
                    </div>
                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Issues Found</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Areas for Improvement
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Key Issues Section */}
              {analysis.issues && analysis.issues.length > 0 && (
                <Card variant="outlined" className="border-red-200 dark:border-red-700">
                  <CardHeader>
                    <CardTitle level={3} className="text-red-700 dark:text-red-400 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Key Issues to Address
                      <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                        {analysis.issues.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(analysis.issues || []).slice(0, 5).map((issue, index) => (
                        <div key={index} className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-red-600 dark:text-red-400 text-sm font-bold">{index + 1}</span>
                          </div>
                          <span className="text-red-800 dark:text-red-300 text-sm leading-relaxed">{issue}</span>
                        </div>
                      ))}
                      {analysis.issues.length > 5 && (
                        <div className="text-center pt-2">
                          <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium">
                            View {analysis.issues.length - 5} more issues →
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Suggested Roles */}
              {analysis.suggestedRoles && analysis.suggestedRoles.length > 0 && (
                <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                  <CardHeader>
                    <CardTitle level={3} className="text-purple-700 dark:text-purple-400 flex items-center">
                      <span className="mr-2">🎯</span>
                      Recommended Job Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-800 dark:text-purple-300 mb-4 text-sm">
                      Based on your skills and experience, these roles align perfectly with your profile:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(analysis.suggestedRoles || []).map((roleData, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mr-3">
                            <span className="text-purple-600 dark:text-purple-400 text-sm">🎯</span>
                          </div>
                          <span className="text-purple-800 dark:text-purple-300 font-medium text-sm">
                            {roleData.role || roleData}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggested Keywords */}
              {analysis.suggestedKeywords && analysis.suggestedKeywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-3">Suggested Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.suggestedKeywords || []).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6">
              {console.log('AnalysisResults: Rendering Sections tab with data:', {
                contactInfo: analysis.sections?.contactInfo,
                skillsCount: Array.isArray(analysis.sections?.skills) ? analysis.sections.skills.length : 0,
                hasEducation: !!analysis.sections?.education,
                hasExperience: !!analysis.sections?.experience,
                hasProjects: !!analysis.sections?.projects,
                hasCertifications: !!analysis.sections?.certifications
              })}
              
              {/* Contact Information */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-black dark:text-white">Contact Information</h3>
                  <button
                    onClick={() => handleSectionEdit('contactInfo', analysis.sections?.contactInfo)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                {editingSection === 'contactInfo' ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md h-32 bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-black dark:text-white">
                      <span className="font-bold text-gray-800 dark:text-gray-200">Name:</span> <span className="font-medium text-black dark:text-white">{analysis.sections?.contactInfo?.name || 'Not found'}</span>
                    </div>
                    <div className="text-black dark:text-white">
                      <span className="font-bold text-gray-800 dark:text-gray-200">Email:</span> <span className="font-medium text-black dark:text-white">{analysis.sections?.contactInfo?.email || 'Not found'}</span>
                    </div>
                    <div className="text-black dark:text-white">
                      <span className="font-bold text-gray-800 dark:text-gray-200">Phone:</span> <span className="font-medium text-black dark:text-white">{analysis.sections?.contactInfo?.phone || 'Not found'}</span>
                    </div>
                    <div className="text-black dark:text-white">
                      <span className="font-bold text-gray-800 dark:text-gray-200">Location:</span> <span className="font-medium text-black dark:text-white">{analysis.sections?.contactInfo?.location || 'Not found'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-black dark:text-white">Skills</h3>
                  <button
                    onClick={() => handleSectionEdit('skills', analysis.sections?.skills)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                {editingSection === 'skills' ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md h-32 bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(analysis.sections?.skills) && analysis.sections.skills.length > 0 ? (
                      analysis.sections.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-black dark:text-white font-bold">No skills identified</p>
                    )}
                  </div>
                )}
              </div>

              {/* Other Sections */}
              {['education', 'experience', 'projects', 'certifications'].map((sectionName) => {
                const sectionData = analysis.sections?.[sectionName];
                console.log(`AnalysisResults: Rendering ${sectionName} section:`, sectionData);
                
                return (
                  <div key={sectionName} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-black dark:text-white capitalize">{sectionName}</h3>
                      <button
                        onClick={() => handleSectionEdit(sectionName, sectionData)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    {editingSection === sectionName ? (
                      <div className="space-y-3">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md h-40 bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-black dark:text-white font-medium bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                        {sectionData || `No ${sectionName} content found`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'enhancements' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">AI-Enhanced Content</h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Compare your original content with AI-enhanced versions that use stronger action verbs and more impactful language.
                </p>
              </div>

              {analysis.enhancedBullets && analysis.enhancedBullets.length > 0 ? (
                <div className="space-y-4">
                  {(analysis.enhancedBullets || []).map((enhancement, index) => (
                    <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="mb-2">
                        <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wide bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {enhancement.section || 'General'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Original</h4>
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-800 dark:text-red-200 font-medium border border-red-200 dark:border-red-700">
                            {enhancement.original}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">Enhanced</h4>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-sm text-green-800 dark:text-green-200 font-medium border border-green-200 dark:border-green-700">
                            {enhancement.improved}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex space-x-2">
                        <button 
                          onClick={() => handleAcceptEnhancement(index)}
                          className={`px-3 py-1 rounded text-sm ${
                            acceptedEnhancements.has(index)
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {acceptedEnhancements.has(index) ? '✓ Accepted' : 'Accept Enhancement'}
                        </button>
                        <button 
                          onClick={() => handleRejectEnhancement(index)}
                          className={`px-3 py-1 rounded text-sm ${
                            !acceptedEnhancements.has(index)
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {!acceptedEnhancements.has(index) ? '✓ Keep Original' : 'Keep Original'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="font-bold text-black dark:text-white">No content enhancements available.</p>
                  <p className="text-sm mt-2 font-medium text-gray-700 dark:text-gray-300">This could be because your content is already well-written or the AI service is unavailable.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {/* Priority Issues */}
              {analysis.issues && analysis.issues.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Issues to Address</h3>
                  <div className="space-y-3">
                    {(analysis.issues || []).map((issue, index) => (
                      <div key={index} className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-lg border border-yellow-200 dark:border-yellow-700">
                        <span className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5">⚠️</span>
                        <div>
                          <p className="text-yellow-800 dark:text-yellow-200 font-medium">{issue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Components */}
              {analysis.missingComponents && analysis.missingComponents.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Missing Components</h3>
                  <div className="space-y-3">
                    {(analysis.missingComponents || []).map((component, index) => (
                      <div key={index} className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 rounded-r-lg border border-red-200 dark:border-red-700">
                        <span className="text-red-600 dark:text-red-400 mr-3 mt-0.5">❌</span>
                        <div>
                          <p className="text-red-800 dark:text-red-200 font-medium">{component}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Suggestions */}
              {analysis.suggestedKeywords && analysis.suggestedKeywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Recommended Keywords for {analysis.jobRole}</h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-800 dark:text-blue-200 mb-3 font-medium">
                      Consider adding these keywords to improve your resume's relevance for the target role:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.suggestedKeywords || []).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-bold border border-blue-300 dark:border-blue-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Items */}
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-4">Next Steps</h3>
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                    <span className="text-green-800 dark:text-green-200 font-medium">Review and apply suggested enhancements</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                    <span className="text-green-800 dark:text-green-200 font-medium">Add missing sections identified above</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                    <span className="text-green-800 dark:text-green-200 font-medium">Incorporate recommended keywords naturally</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <span className="text-green-600 dark:text-green-400 mr-3">✅</span>
                    <span className="text-green-800 dark:text-green-200 font-medium">Download analysis report when ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Analyze Another Resume
        </button>
        <button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating PDF...
            </span>
          ) : (
            'Download Analysis Report'
          )}
        </button>
      </div>

      {/* Debug Section - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8">
          <Card variant="outlined" className="border-gray-300 dark:border-gray-600">
            <CardHeader>
              <CardTitle level={3} className="text-gray-700 dark:text-gray-300">
                🔧 Debug Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  View Raw Analysis Data
                </summary>
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-96">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              </details>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Analysis ID:</strong> {id}</p>
                <p><strong>Component State:</strong> Loaded successfully</p>
                <p><strong>Data Keys:</strong> {Object.keys(analysis || {}).join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
  } catch (renderError) {
    console.error('AnalysisResults: Render error:', renderError)
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card variant="outlined" className="border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
          <CardContent>
            <h3 className="text-red-800 dark:text-red-200 font-bold mb-2">Render Error</h3>
            <p className="text-red-600 dark:text-red-400 mb-2">{renderError.message}</p>
            <p className="text-sm text-gray-500 mt-2">Analysis ID: {id}</p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to Upload
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default AnalysisResults