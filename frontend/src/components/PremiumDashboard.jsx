import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI, handleAPIError } from '../utils/api';
import { 
  PremiumCard, 
  PremiumButton, 
  PremiumInput, 
  PremiumStatsCard,
  PremiumSkeleton,
  PremiumModal
} from './PremiumUI';

const PremiumDashboard = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageScore: 0,
    topScore: 0,
    recentAnalyses: 0
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [analyses]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('PremiumDashboard: Fetching analyses...');
      const response = await resumeAPI.getUserAnalyses('guest', 1, 50);
      console.log('PremiumDashboard: API response:', response.data);
      
      // Handle different response formats
      let analysesData = [];
      if (Array.isArray(response.data)) {
        // Direct array response
        analysesData = response.data;
      } else if (response.data.success && response.data.data?.analyses) {
        // Nested response format
        analysesData = response.data.data.analyses;
      } else if (response.data.analyses) {
        // Simple nested format
        analysesData = response.data.analyses;
      } else {
        console.warn('PremiumDashboard: Unexpected response format:', response.data);
        analysesData = [];
      }
      
      console.log('PremiumDashboard: Processed analyses:', analysesData);
      setAnalyses(analysesData);
      
    } catch (err) {
      console.error('PremiumDashboard: Error fetching analyses:', err);
      const errorMessage = handleAPIError(err, 'Failed to load analysis history');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!analyses || analyses.length === 0) {
      setStats({ totalAnalyses: 0, averageScore: 0, topScore: 0, recentAnalyses: 0 });
      return;
    }

    try {
      const totalAnalyses = analyses.length;
      const validScores = analyses.filter(a => typeof a.overallScore === 'number').map(a => a.overallScore);
      
      const averageScore = validScores.length > 0 
        ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
        : 0;
        
      const topScore = validScores.length > 0 ? Math.max(...validScores) : 0;
      
      const recentAnalyses = analyses.filter(a => {
        try {
          return a.uploadTimestamp && new Date(a.uploadTimestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        } catch {
          return false;
        }
      }).length;

      setStats({ totalAnalyses, averageScore, topScore, recentAnalyses });
    } catch (error) {
      console.error('PremiumDashboard: Error calculating stats:', error);
      setStats({ totalAnalyses: 0, averageScore: 0, topScore: 0, recentAnalyses: 0 });
    }
  };

  const filteredAnalyses = (analyses || [])
    .filter(analysis => {
      try {
        const fileName = analysis.uploadedFileName || '';
        const jobRole = analysis.jobRole || '';
        return fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               jobRole.toLowerCase().includes(searchTerm.toLowerCase());
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      try {
        switch (sortBy) {
          case 'newest':
            return new Date(b.uploadTimestamp || 0) - new Date(a.uploadTimestamp || 0);
          case 'oldest':
            return new Date(a.uploadTimestamp || 0) - new Date(b.uploadTimestamp || 0);
          case 'score-high':
            return (b.overallScore || 0) - (a.overallScore || 0);
          case 'score-low':
            return (a.overallScore || 0) - (b.overallScore || 0);
          case 'name':
            return (a.uploadedFileName || '').localeCompare(b.uploadedFileName || '');
          default:
            return 0;
        }
      } catch {
        return 0;
      }
    });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="layout-premium">
        <div className="container-premium py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <PremiumSkeleton height="40px" width="300px" className="mb-4" />
            <PremiumSkeleton height="20px" width="500px" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid-premium mb-8">
            {[...Array(4)].map((_, i) => (
              <PremiumCard key={i} className="p-6">
                <PremiumSkeleton height="60px" />
              </PremiumCard>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid-premium">
            {[...Array(6)].map((_, i) => (
              <PremiumCard key={i} className="p-6">
                <PremiumSkeleton height="200px" />
              </PremiumCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-premium">
      <div className="container-premium py-8">
        {/* Premium Header */}
        <div className="mb-8 animate-slide-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-premium-display bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analysis Dashboard
              </h1>
              <p className="text-premium-body mt-2">
                Track your resume analysis progress and insights
              </p>
            </div>
            <PremiumButton
              variant="gradient"
              size="lg"
              icon="+"
              onClick={() => navigate('/')}
              className="self-start lg:self-auto"
            >
              New Analysis
            </PremiumButton>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid-premium mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <PremiumStatsCard
            title="Total Analyses"
            value={stats.totalAnalyses}
            icon="📊"
            trend="up"
            change="+12% this month"
          />
          <PremiumStatsCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon="🎯"
            trend={stats.averageScore >= 70 ? 'up' : 'neutral'}
            change={`${stats.averageScore >= 70 ? '+' : ''}${stats.averageScore - 65}% from last month`}
          />
          <PremiumStatsCard
            title="Top Score"
            value={`${stats.topScore}%`}
            icon="🏆"
            trend="up"
            change="Personal best!"
          />
          <PremiumStatsCard
            title="This Week"
            value={stats.recentAnalyses}
            icon="📈"
            trend={stats.recentAnalyses > 0 ? 'up' : 'neutral'}
            change={`${stats.recentAnalyses} new analyses`}
          />
        </div>

        {/* Premium Controls */}
        <PremiumCard className="p-6 mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <PremiumInput
                placeholder="Search by filename or job role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="🔍"
                className="flex-1"
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-premium px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </PremiumCard>

        {error && (
          <PremiumCard className="p-6 mb-8 border-red-300 bg-red-50 dark:bg-red-900/20 animate-slide-in-up">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </PremiumCard>
        )}

        {filteredAnalyses.length === 0 ? (
          <PremiumCard className="p-12 text-center animate-scale-in">
            <div className="text-6xl mb-6 animate-float">📄</div>
            {searchTerm ? (
              <>
                <h3 className="text-premium-heading mb-4">No matching analyses</h3>
                <p className="text-premium-body mb-8">
                  Try adjusting your search terms or clear the search to see all analyses
                </p>
                <PremiumButton
                  variant="glass"
                  onClick={() => setSearchTerm('')}
                  className="mr-4"
                >
                  Clear Search
                </PremiumButton>
              </>
            ) : (
              <>
                <h3 className="text-premium-heading mb-4">No analyses yet</h3>
                <p className="text-premium-body mb-8">
                  Upload your first resume to get started with AI-powered analysis
                </p>
              </>
            )}
            <PremiumButton
              variant="gradient"
              size="lg"
              onClick={() => navigate('/')}
            >
              Upload Resume
            </PremiumButton>
          </PremiumCard>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-800 dark:text-gray-100 font-bold animate-slide-in-up">
              Showing {filteredAnalyses.length} of {analyses.length} analyses
            </div>

            {viewMode === 'grid' && (
              <div className="grid-premium animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                {filteredAnalyses.map((analysis, index) => (
                  <PremiumCard
                    key={analysis._id}
                    hover={true}
                    className="p-6 cursor-pointer group"
                    onClick={() => navigate(`/analysis/${analysis._id}`)}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                        {analysis.uploadedFileName}
                      </h3>
                      <p className="text-gray-800 dark:text-gray-100 font-bold">
                        {analysis.jobRole}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className={`text-4xl font-bold bg-gradient-to-r ${getScoreGradient(analysis.overallScore)} bg-clip-text text-transparent`}>
                          {analysis.overallScore}%
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-800 dark:text-gray-100 font-bold">
                          {formatDate(analysis.uploadTimestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="text-lg font-bold text-indigo-600">🔧</div>
                        <div className="font-bold text-gray-900 dark:text-white">{analysis.enhancedBullets?.length || 0}</div>
                        <div className="text-gray-800 dark:text-gray-100 font-bold">Enhancements</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="text-lg font-bold text-yellow-600">⚠️</div>
                        <div className="font-bold text-gray-900 dark:text-white">{analysis.issues?.length || 0}</div>
                        <div className="text-gray-800 dark:text-gray-100 font-bold">Issues</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="text-lg font-bold text-green-600">🏷️</div>
                        <div className="font-bold text-gray-900 dark:text-white">{analysis.suggestedKeywords?.length || 0}</div>
                        <div className="text-gray-800 dark:text-gray-100 font-bold">Keywords</div>
                      </div>
                    </div>

                    <PremiumButton
                      variant="glass"
                      className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/analysis/${analysis._id}`);
                      }}
                    >
                      View Details →
                    </PremiumButton>
                  </PremiumCard>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                {filteredAnalyses.map((analysis, index) => (
                  <PremiumCard
                    key={analysis._id}
                    hover={true}
                    className="p-6 cursor-pointer group"
                    onClick={() => navigate(`/analysis/${analysis._id}`)}
                    style={{ animationDelay: `${0.05 * index}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                          {analysis.uploadedFileName}
                        </h3>
                        <p className="text-gray-800 dark:text-gray-100 font-bold mb-2">
                          Target Role: {analysis.jobRole}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-800 dark:text-gray-100 font-bold">
                          <span className="font-medium">{formatDate(analysis.uploadTimestamp)}</span>
                          <span className="flex items-center">🔧 {analysis.enhancedBullets?.length || 0}</span>
                          <span className="flex items-center">⚠️ {analysis.issues?.length || 0}</span>
                          <span className="flex items-center">🏷️ {analysis.suggestedKeywords?.length || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className={`text-3xl font-bold bg-gradient-to-r ${getScoreGradient(analysis.overallScore)} bg-clip-text text-transparent`}>
                            {analysis.overallScore}%
                          </div>
                          <div className="text-sm text-gray-800 dark:text-gray-100 font-bold">Score</div>
                        </div>
                        
                        <PremiumButton
                          variant="glass"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/analysis/${analysis._id}`);
                          }}
                        >
                          View →
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            )}
          </>
        )}

        {/* Premium Modal for Quick Preview */}
        <PremiumModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Analysis Preview"
          size="lg"
        >
          {selectedAnalysis && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreGradient(selectedAnalysis.overallScore)} bg-clip-text text-transparent mb-4`}>
                  {selectedAnalysis.overallScore}%
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedAnalysis.uploadedFileName}
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-bold">
                  {selectedAnalysis.jobRole}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAnalysis.enhancedBullets?.length || 0}</div>
                  <div className="text-gray-800 dark:text-gray-100 font-bold">Enhancements</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAnalysis.issues?.length || 0}</div>
                  <div className="text-gray-800 dark:text-gray-100 font-bold">Issues</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-2xl mb-2">🏷️</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAnalysis.suggestedKeywords?.length || 0}</div>
                  <div className="text-gray-800 dark:text-gray-100 font-bold">Keywords</div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <PremiumButton
                  variant="gradient"
                  className="flex-1"
                  onClick={() => {
                    navigate(`/analysis/${selectedAnalysis._id}`);
                    setShowModal(false);
                  }}
                >
                  View Full Analysis
                </PremiumButton>
                <PremiumButton
                  variant="glass"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </PremiumButton>
              </div>
            </div>
          )}
        </PremiumModal>
      </div>
    </div>
  );
};

export default PremiumDashboard;