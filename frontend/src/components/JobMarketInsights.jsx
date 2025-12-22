import { useState, useEffect } from 'react'

const JobMarketInsights = ({ jobMarketData, suggestedRoles }) => {
  const [activeRole, setActiveRole] = useState(0)

  // Don't render if no data is available
  if (!jobMarketData && (!suggestedRoles || suggestedRoles.length === 0)) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
        <span className="mr-2">📊</span>
        Job Market Insights
      </h2>

      {/* Market Overview */}
      {jobMarketData && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Market Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{jobMarketData.openings}</div>
              <div className="text-sm text-blue-800">Open Positions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{jobMarketData.avg_salary}</div>
              <div className="text-sm text-green-800">Average Salary</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{jobMarketData.growth_rate}</div>
              <div className="text-sm text-purple-800">Growth Rate</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-sm font-bold text-orange-600">{jobMarketData.experience_level}</div>
              <div className="text-sm text-orange-800">Experience Level</div>
            </div>
          </div>
        </div>
      )}

      {/* Role Suggestions with Match Analysis */}
      {suggestedRoles && suggestedRoles.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Role Match Analysis</h3>
          
          {/* Role Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedRoles.map((roleData, index) => (
              <button
                key={index}
                onClick={() => setActiveRole(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeRole === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {roleData.role}
                <span className="ml-2 text-xs">
                  {Math.round(roleData.match_percentage)}% match
                </span>
              </button>
            ))}
          </div>

          {/* Active Role Details */}
          {suggestedRoles[activeRole] && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold">{suggestedRoles[activeRole].role}</h4>
                <div className="flex items-center">
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${suggestedRoles[activeRole].match_percentage * 1.76} 176`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {Math.round(suggestedRoles[activeRole].match_percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div>
                  <h5 className="font-medium text-green-700 mb-2">✅ Your Matching Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {suggestedRoles[activeRole].matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h5 className="font-medium text-red-700 mb-2">📚 Skills to Learn</h5>
                  <div className="flex flex-wrap gap-2">
                    {suggestedRoles[activeRole].missing_skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-800 dark:text-gray-100 mb-1 font-bold">
                  <span>Skill Match Progress</span>
                  <span>{suggestedRoles[activeRole].score} of {suggestedRoles[activeRole].matched_skills.length + suggestedRoles[activeRole].missing_skills.length} skills</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${suggestedRoles[activeRole].match_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Companies */}
      {jobMarketData?.top_companies && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Top Hiring Companies</h3>
          <div className="flex flex-wrap gap-2">
            {jobMarketData.top_companies.map((company, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobMarketInsights