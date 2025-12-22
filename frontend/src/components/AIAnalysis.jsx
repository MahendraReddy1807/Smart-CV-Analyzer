import { useState } from 'react'

const AIAnalysis = ({ aiAnalysis }) => {
  const [activeSection, setActiveSection] = useState('strengths')

  // Don't render if no data or error
  if (!aiAnalysis || aiAnalysis.error) {
    return null
  }

  const sections = [
    { id: 'strengths', label: 'Strengths', icon: '💪', color: 'green' },
    { id: 'weaknesses', label: 'Areas to Improve', icon: '🎯', color: 'red' },
    { id: 'suggestions', label: 'Suggestions', icon: '💡', color: 'blue' },
    { id: 'impression', label: 'Overall Impression', icon: '📝', color: 'purple' }
  ]

  const getColorClasses = (color, active = false) => {
    const colors = {
      green: active ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
      red: active ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200',
      blue: active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      purple: active ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center text-gray-900 dark:text-white">
          <span className="mr-2">🤖</span>
          AI-Powered Analysis
        </h2>
        {aiAnalysis.ats_score && (
          <div className="flex items-center">
            <span className="text-sm text-gray-800 dark:text-gray-100 mr-2 font-bold">ATS Score:</span>
            <div className={`px-3 py-1 rounded-full font-semibold ${
              aiAnalysis.ats_score >= 80 ? 'bg-green-100 text-green-700' :
              aiAnalysis.ats_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {aiAnalysis.ats_score}/100
            </div>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
              getColorClasses(section.color, activeSection === section.id)
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeSection === 'strengths' && aiAnalysis.strengths && (
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4">Your Key Strengths</h3>
            <div className="space-y-3">
              {aiAnalysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                  <span className="text-green-500 mr-3 mt-0.5">✅</span>
                  <p className="text-green-800">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'weaknesses' && aiAnalysis.weaknesses && (
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-4">Areas for Improvement</h3>
            <div className="space-y-3">
              {aiAnalysis.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500 mr-3 mt-0.5">🎯</span>
                  <p className="text-red-800">{weakness}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'suggestions' && aiAnalysis.suggestions && (
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              {aiAnalysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 mr-3 mt-0.5">💡</span>
                  <p className="text-blue-800">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'impression' && aiAnalysis.overall_impression && (
          <div>
            <h3 className="text-lg font-semibold text-purple-700 mb-4">Overall Impression</h3>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-800 leading-relaxed">{aiAnalysis.overall_impression}</p>
            </div>
          </div>
        )}
      </div>

      {/* ATS Compatibility Details */}
      {aiAnalysis.ats_score && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">ATS Compatibility Analysis</h4>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  aiAnalysis.ats_score >= 80 ? 'bg-green-500' :
                  aiAnalysis.ats_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${aiAnalysis.ats_score}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {aiAnalysis.ats_score >= 80 ? 'Excellent' :
               aiAnalysis.ats_score >= 60 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-100 mt-2 font-bold">
            Your resume is {aiAnalysis.ats_score >= 80 ? 'highly' : aiAnalysis.ats_score >= 60 ? 'moderately' : 'poorly'} optimized for Applicant Tracking Systems (ATS).
          </p>
        </div>
      )}
    </div>
  )
}

export default AIAnalysis