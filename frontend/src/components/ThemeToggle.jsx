import { useTheme } from '../contexts/ThemeContext.jsx'

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 ease-out focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transform hover:scale-110 active:scale-95
        ${isDarkMode 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg'
        }
      `}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      aria-pressed={isDarkMode}
    >
      {/* Glow Effect */}
      <div className={`
        absolute inset-0 rounded-full transition-all duration-500 blur-sm
        ${isDarkMode 
          ? 'bg-gradient-to-r from-indigo-400/30 to-purple-400/30' 
          : 'bg-gradient-to-r from-yellow-300/30 to-orange-300/30'
        }
      `} />
      
      {/* Toggle switch circle */}
      <div
        className={`
          relative z-10 h-7 w-7 rounded-full shadow-xl flex items-center justify-center text-lg backdrop-blur-sm transition-all duration-500 ease-out
          ${isDarkMode ? 'translate-x-8' : 'translate-x-0.5'}
        `}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
            : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
        }}
      >
        <span className="animate-pulse">
          {isDarkMode ? '🌙' : '☀️'}
        </span>
      </div>
      
      {/* Static particles for dark mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
              style={{
                left: `${15 + i * 15}%`,
                top: `${25 + (i % 2) * 25}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Static rays for light mode */}
      {!isDarkMode && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-2 bg-yellow-300/40 rounded-full animate-pulse"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: '50% 16px',
                transform: `rotate(${i * 60}deg) translateX(-50%)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  )
}

export default ThemeToggle