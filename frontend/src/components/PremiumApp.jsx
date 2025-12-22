import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'

// Lazy load premium components
const PremiumUpload = lazy(() => import('./PremiumUpload'))
const AnalysisResults = lazy(() => import('./AnalysisResults'))
const PremiumDashboard = lazy(() => import('./PremiumDashboard'))
const ResumeBuilder = lazy(() => import('./ResumeBuilder'))
const DebugUpload = lazy(() => import('./DebugUpload'))

import ThemeToggle from './ThemeToggle'
import CanvasBackground from './CanvasBackground'
import { RouteTransition } from './PageTransition'
import { PremiumCard, PremiumSkeleton } from './PremiumUI'
import { systemAPI } from '../utils/api'

function PremiumNavigation() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [systemHealth, setSystemHealth] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await systemAPI.healthCheck()
        setSystemHealth(response.data)
      } catch (error) {
        setSystemHealth({ status: 'ERROR', message: 'System unavailable' })
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 60000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (path) => location.pathname === path

  const navigationItems = [
    { path: '/', label: 'Upload', icon: '📤', description: 'Upload and analyze resume' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊', description: 'View analysis history' },
    { path: '/builder', label: 'Resume Builder', icon: '🔧', description: 'Build enhanced resume' }
  ]

  return (
    <header className={`
      nav-premium transition-all duration-500 sticky top-0 z-50 relative
      ${scrolled ? 'shadow-2xl backdrop-blur-xl' : 'shadow-lg'}
    `}>
      <div className="container-premium">
        <div className="flex justify-between items-center py-6">
          {/* Premium Logo and Title */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300 animate-float">
                🎯
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Smart CV Analyzer
                </h1>
                <p className="text-sm text-gray-700 dark:text-gray-200 hidden sm:block font-bold">
                  AI-Powered Resume Enhancement
                </p>
              </div>
            </Link>
            
            {/* Premium Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2 ml-12">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`nav-premium-item ${isActive(item.path) ? 'active' : ''}`}
                  title={item.description}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Premium Right Side */}
          <div className="flex items-center space-x-6">
            {/* Premium System Status */}
            {systemHealth && (
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 glass-premium rounded-full">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  systemHealth.status === 'OK' ? 'bg-green-500' : 
                  systemHealth.status === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {systemHealth.status === 'OK' ? 'Online' : 
                   systemHealth.status === 'DEGRADED' ? 'Limited' : 'Offline'}
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <div className="glass-premium rounded-full p-2">
              <ThemeToggle />
            </div>

            {/* Premium Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 glass-premium rounded-full text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 group"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
            >
              <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Premium Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 py-6 animate-slide-in-up">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    group flex items-center space-x-4 px-4 py-4 rounded-2xl font-semibold transition-all duration-300
                    ${isActive(item.path) 
                      ? 'glass-premium text-indigo-600 dark:text-indigo-400 shadow-lg' 
                      : 'text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    }
                  `}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-lg">{item.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{item.description}</div>
                  </div>
                  {isActive(item.path) && (
                    <div className="ml-auto w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse-glow"></div>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Premium Mobile System Status */}
            {systemHealth && (
              <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <PremiumCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        systemHealth.status === 'OK' ? 'bg-green-500' : 
                        systemHealth.status === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        System Status
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                      {systemHealth.status === 'OK' ? 'All Systems Operational' : 
                       systemHealth.status === 'DEGRADED' ? 'Limited Functionality' : 'System Issues'}
                    </span>
                  </div>
                </PremiumCard>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

function PremiumApp() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <div className="layout-premium relative min-h-screen">
        {/* Enhanced Canvas Background */}
        <CanvasBackground />
        
        <PremiumNavigation />
        
        <main className="flex-1 relative z-10">
          <RouteTransition>
            <Suspense fallback={
              <div className="container-premium py-16">
                <div className="max-w-4xl mx-auto">
                  <PremiumCard className="p-12 text-center animate-scale-in">
                    <div className="space-y-6">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse-glow">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <h3 className="text-premium-heading mb-2">Loading...</h3>
                        <p className="text-premium-body">Preparing your experience</p>
                      </div>
                      <div className="space-y-3">
                        <PremiumSkeleton height="20px" width="60%" className="mx-auto" />
                        <PremiumSkeleton height="20px" width="40%" className="mx-auto" />
                      </div>
                    </div>
                  </PremiumCard>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<PremiumUpload />} />
                <Route path="/debug" element={<DebugUpload />} />
                <Route path="/analysis/:id" element={<AnalysisResults />} />
                <Route path="/dashboard" element={<PremiumDashboard />} />
                <Route path="/builder" element={<ResumeBuilder />} />
              </Routes>
            </Suspense>
          </RouteTransition>
        </main>

        {/* Premium Footer */}
        <footer className="glass-premium border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
          <div className="container-premium py-12">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              <div className="text-center lg:text-left">
                <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Smart CV Analyzer
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  © 2024 Smart CV Analyzer. AI-powered resume analysis and enhancement.
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-end space-x-8">
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 font-semibold">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 font-semibold">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 font-semibold">
                  Support
                </a>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 font-semibold">
                  API
                </a>
              </div>
            </div>
            
            {/* Premium Footer Decoration */}
            <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="flex justify-center space-x-6 text-2xl">
                <span className="animate-float" style={{ animationDelay: '0s' }}>🚀</span>
                <span className="animate-float" style={{ animationDelay: '0.5s' }}>✨</span>
                <span className="animate-float" style={{ animationDelay: '1s' }}>🎯</span>
                <span className="animate-float" style={{ animationDelay: '1.5s' }}>💼</span>
                <span className="animate-float" style={{ animationDelay: '2s' }}>🏆</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default PremiumApp