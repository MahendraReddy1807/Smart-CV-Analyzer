import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 second default timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    
    // Handle common error scenarios
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.'
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          error.message = data?.message || 'Invalid request'
          break
        case 401:
          error.message = 'Unauthorized. Please log in again.'
          // Clear auth token on 401
          localStorage.removeItem('authToken')
          break
        case 403:
          error.message = 'Access forbidden'
          break
        case 404:
          error.message = 'Resource not found'
          break
        case 408:
          error.message = 'Request timeout. Please try again.'
          break
        case 429:
          error.message = 'Too many requests. Please wait and try again.'
          break
        case 503:
          error.message = 'Service temporarily unavailable. Please try again later.'
          break
        case 500:
        default:
          error.message = data?.message || 'Server error. Please try again later.'
      }
    } else if (error.request) {
      // Network error
      error.message = 'Network error. Please check your connection.'
    }
    
    return Promise.reject(error)
  }
)

// API methods
export const resumeAPI = {
  // Upload and analyze resume
  uploadResume: (formData, onProgress) => {
    return api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000, // 2 minute timeout for uploads
      onUploadProgress: onProgress
    })
  },

  // Get analysis by ID
  getAnalysis: (id) => {
    return api.get(`/resume/analysis/${id}`)
  },

  // Get user's analysis history
  getUserAnalyses: (userId, page = 1, limit = 10) => {
    return api.get(`/resume/user/${userId}`, {
      params: { page, limit }
    })
  },

  // Download enhanced resume
  downloadResume: (analysisId, acceptedEnhancements = []) => {
    return api.post(`/resume/download/${analysisId}`, {
      acceptedEnhancements
    }, {
      responseType: 'blob',
      timeout: 60000 // 1 minute timeout for PDF generation
    })
  }
}

export const userAPI = {
  // Register user
  register: (userData) => {
    return api.post('/user/register', userData)
  },

  // Login user
  login: (credentials) => {
    return api.post('/user/login', credentials)
  }
}

export const systemAPI = {
  // Health check
  healthCheck: () => {
    return api.get('/health', { timeout: 5000 })
  }
}

// Utility function to handle API errors consistently
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error)
  
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  return error.message || defaultMessage
}

// Utility function to check if error is retryable
export const isRetryableError = (error) => {
  if (error.code === 'ECONNABORTED') return true // Timeout
  if (error.code === 'ECONNREFUSED') return true // Connection refused
  if (error.response?.status >= 500) return true // Server errors
  if (error.response?.status === 408) return true // Request timeout
  if (error.response?.status === 429) return true // Rate limit
  if (error.response?.status === 503) return true // Service unavailable
  
  return false
}

export default api