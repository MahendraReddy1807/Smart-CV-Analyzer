import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const SimpleAnalysisResults = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('SimpleAnalysisResults: Component mounted, ID:', id)
    fetchAnalysis()
  }, [id])

  const fetchAnalysis = async () => {
    try {
      console.log('SimpleAnalysisResults: Fetching analysis for ID:', id)
      const response = await fetch(`http://localhost:5000/api/resume/analysis/${id}`)
      console.log('SimpleAnalysisResults: Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('SimpleAnalysisResults: Analysis data:', data)
      
      if (data && data._id) {
        setAnalysis(data)
      } else {
        setError('No analysis data found')
      }
    } catch (err) {
      console.error('SimpleAnalysisResults: Error fetching analysis:', err)
      setError(err.message || 'Failed to load analysis results')
    } finally {
      setLoading(false)
    }
  }

  console.log('SimpleAnalysisResults: Render state:', { loading, error, analysis: !!analysis })

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading Analysis Results...</h1>
        <p>Analysis ID: {id}</p>
        <div>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h1>Error Loading Analysis</h1>
        <p>Analysis ID: {id}</p>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/')}>Back to Upload</button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>No Analysis Found</h1>
        <p>Analysis ID: {id}</p>
        <button onClick={() => navigate('/')}>Back to Upload</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Analysis Results</h1>
      <p><strong>File:</strong> {analysis.uploadedFileName}</p>
      <p><strong>Job Role:</strong> {analysis.jobRole}</p>
      <p><strong>Overall Score:</strong> {analysis.overallScore}%</p>
      
      <h2>Score Breakdown</h2>
      {analysis.scoreBreakdown && (
        <ul>
          {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}%</li>
          ))}
        </ul>
      )}
      
      <h2>Issues</h2>
      {analysis.issues && analysis.issues.length > 0 ? (
        <ul>
          {analysis.issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      ) : (
        <p>No issues found</p>
      )}
      
      <h2>Suggested Keywords</h2>
      {analysis.suggestedKeywords && analysis.suggestedKeywords.length > 0 ? (
        <div>
          {analysis.suggestedKeywords.map((keyword, index) => (
            <span key={index} style={{ 
              display: 'inline-block', 
              margin: '2px', 
              padding: '4px 8px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px' 
            }}>
              {keyword}
            </span>
          ))}
        </div>
      ) : (
        <p>No keywords suggested</p>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/')}>Back to Upload</button>
      </div>
    </div>
  )
}

export default SimpleAnalysisResults