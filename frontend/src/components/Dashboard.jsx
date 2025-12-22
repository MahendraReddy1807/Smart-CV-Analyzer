import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeAPI, handleAPIError } from '../utils/api'
import Card, { CardContent, CardHeader, CardTitle } from './Card'

const Dashboard = () => {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    fetchAnalyses(currentPage)
  }, [currentPage])

  // Filter and sort analyses
  const filteredAnalyses = analyses
    .filter(analysis => 
      analysis.uploadedFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.jobRole.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadTimestamp) - new Date(a.uploadTimestamp)
        case 'oldest':
          return new Date(a.uploadTimestamp) - new Date(b.uploadTimestamp)
        case 'score-high':
          return b.overallScore - a.overallScore
        case 'score-low':
          return a.overallScore - b.overallScore
        case 'name':
          return a.uploadedFileName.localeCompare(b.uploadedFileName)
        default:
          return 0
      }
    })

  const fetchAnalyses = async (page = 1) => {
    try {
      setLoading(true)
      // For now, we'll use a mock user ID since we don't have authentication
      const response = await resumeAPI.getUserAnalyses('guest', page, 10)
      
      if (response.data.success) {
        setAnalyses(response.data.data.analyses)
        setTotalPages(response.data.data.pagination.pages)
        setCurrentPage(page)
      } else {
        setError(response.data.message || 'Failed to load analysis history')
      }
    } catch (err) {
      const errorMessage = handleAPIError(err, 'Failed to load analysis history')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analysis Dashboard</h1>
            <p className="text-gray-700 dark:text-gray-200 mt-1 font-medium">
              View and manage your resume analysis history
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 self-start sm:self-auto font-semibold shadow-md"
          >
            <span>+</span>
            New Analysis
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by filename or job role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-800 dark:text-gray-100">🔍</span>
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score-high">Highest Score</option>
            <option value="score-low">Lowest Score</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {error && (
        <Card variant="outlined" className="border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 mb-6">
          <CardContent className="py-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {filteredAnalyses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-800 dark:text-gray-100 text-6xl mb-4">📄</div>
          {searchTerm ? (
            <>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching analyses</h3>
              <p className="text-gray-800 dark:text-gray-100 mb-6 font-bold">
                Try adjusting your search terms or clear the search to see all analyses
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors mr-3"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No analyses yet</h3>
              <p className="text-gray-800 dark:text-gray-100 mb-6 font-bold">
                Upload your first resume to get started with AI-powered analysis
              </p>
            </>
          )}
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-200 font-medium">
            Showing {filteredAnalyses.length} of {analyses.length} analyses
          </div>

          {/* Enhanced Responsive Grid View */}
          {viewMode === 'grid' && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAnalyses.map((analysis) => (
                <Card
                  key={analysis._id}
                  variant="elevated"
                  hover={true}
                  onClick={() => navigate(`/analysis/${analysis._id}`)}
                >
                  <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {analysis.uploadedFileName}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-200 text-sm truncate font-medium">
                      {analysis.jobRole}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-900 dark:text-white font-bold">
                        {formatDate(analysis.uploadTimestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-700 dark:text-gray-200">
                    <div className="text-center">
                      <div className="font-bold">🔧 {analysis.enhancedBullets?.length || 0}</div>
                      <div className="font-medium">Enhancements</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">⚠️ {analysis.issues?.length || 0}</div>
                      <div className="font-medium">Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">🏷️ {analysis.suggestedKeywords?.length || 0}</div>
                      <div className="font-medium">Keywords</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/analysis/${analysis._id}`)
                    }}
                    className="w-full py-3 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium text-sm transition-colors duration-200 min-h-[44px] flex items-center justify-center"
                  >
                    View Details →
                  </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis) => (
                <Card
                  key={analysis._id}
                  variant="default"
                  hover={true}
                  onClick={() => navigate(`/analysis/${analysis._id}`)}
                >
                  <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {analysis.uploadedFileName}
                      </h3>
                      <p className="text-gray-800 dark:text-gray-100 text-sm truncate font-bold">
                        Target Role: {analysis.jobRole}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-800 dark:text-gray-100 mt-1 font-bold">
                        <span>{formatDate(analysis.uploadTimestamp)}</span>
                        <span>🔧 {analysis.enhancedBullets?.length || 0}</span>
                        <span>⚠️ {analysis.issues?.length || 0}</span>
                        <span>🏷️ {analysis.suggestedKeywords?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </div>
                        <div className="text-xs text-gray-800 dark:text-gray-100 font-bold">Score</div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/analysis/${analysis._id}`)
                        }}
                        className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium text-sm transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchAnalyses(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => fetchAnalyses(page)}
                        className={`px-3 py-2 text-sm rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => fetchAnalyses(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard