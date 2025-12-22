import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeAPI, handleAPIError } from '../utils/api'

const MinimalAnalysisResults = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalysis()
  }, [id])

  const fetchAnalysis = async () => {
    try {
      const response = await resumeAPI.getAnalysis(id)
      
      if (response.data && response.data._id) {
        setAnalysis(response.data)
      } else {
        setError(response.data?.message || 'Failed to load analysis results')
      }
    } catch (err) {
      console.error('Error fetching analysis:', err)
      setError(handleAPIError(err, 'Failed to load analysis results'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-300 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Back to Upload
          </button>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>No analysis data found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Resume Analysis Results
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">{analysis.uploadedFileName}</span> • Target Role: {analysis.jobRole}
        </p>
      </div>

      {/* Score Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overall Score</h2>
        <div className="text-4xl font-bold text-blue-600 mb-4">{analysis.overallScore}%</div>
        
        {/* Score Breakdown */}
        {analysis.scoreBreakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issues */}
      {analysis.issues && analysis.issues.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Issues to Address</h2>
          <ul className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-gray-700 dark:text-gray-300">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Keywords */}
      {analysis.suggestedKeywords && analysis.suggestedKeywords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Suggested Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.suggestedKeywords.map((keyword, index) => (
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

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg"
        >
          Analyze Another Resume
        </button>
      </div>
    </div>
  )
}

export default MinimalAnalysisResults