import { Link, useLocation } from 'react-router-dom'

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation()
  
  // Default breadcrumb mapping
  const pathMap = {
    '/': { label: 'Upload', icon: '📤' },
    '/dashboard': { label: 'Dashboard', icon: '📊' },
    '/analysis': { label: 'Analysis Results', icon: '📋' }
  }

  // Generate breadcrumb items
  const generateBreadcrumbs = () => {
    if (customItems) return customItems

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Upload', path: '/', icon: '📤' }]

    if (pathSegments.length > 0) {
      if (pathSegments[0] === 'dashboard') {
        breadcrumbs.push({ label: 'Dashboard', path: '/dashboard', icon: '📊' })
      } else if (pathSegments[0] === 'analysis') {
        breadcrumbs.push({ label: 'Dashboard', path: '/dashboard', icon: '📊' })
        breadcrumbs.push({ 
          label: 'Analysis Results', 
          path: location.pathname, 
          icon: '📋',
          current: true 
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={item.path || index} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          
          {item.current ? (
            <span className="flex items-center space-x-1 text-gray-900 font-medium">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
          ) : (
            <Link 
              to={item.path} 
              className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumb