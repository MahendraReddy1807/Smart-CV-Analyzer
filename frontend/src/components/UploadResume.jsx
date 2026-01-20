import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { resumeAPI, handleAPIError } from '../utils/api'
import ProgressTracker from './ProgressTracker'
import Card, { CardContent, CardHeader, CardTitle } from './Card'
import Button from './Button'

const UploadResume = () => {
  const [file, setFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF, PNG, JPG, or JPEG file')
      return
    }
    
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError('')
      setExtractedText('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file to upload')
      return
    }
    
    if (!jobRole.trim()) {
      setError('Please specify a target job role')
      return
    }

    setIsUploading(true)
    setError('')
    setUploadProgress(0)
    setCurrentStep(0)
    setShowProgress(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobRole', jobRole.trim())

    try {
      setCurrentStep(1) // File upload step
      
      const response = await resumeAPI.uploadResume(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(progress)
      })

      // Check if we have analysis data (successful response)
      if (response.data && response.data._id) {
        setCurrentStep(2) // Processing complete
        
        // Display extracted text for user verification
        if (response.data.parsedText) {
          setExtractedText(response.data.parsedText)
        }

        setCurrentStep(3) // Ready to view results
        
        // Navigate to analysis results after a brief delay
        setTimeout(() => {
          navigate(`/analysis/${response.data._id}`)
        }, 2000)
      } else {
        setError(response.data?.message || 'Analysis failed')
      }

    } catch (err) {
      console.error('Upload error:', err)
      
      let errorMessage = 'Failed to upload and analyze resume'
      
      // Handle validation errors specifically
      if (err.response?.status === 400) {
        const errorData = err.response.data
        if (errorData.status === 'invalid' || errorData.error === 'INVALID_RESUME_CONTENT') {
          setError({
            type: 'validation',
            message: errorData.message || 'The uploaded document is not a valid resume.',
            details: errorData.details,
            suggestions: errorData.suggestions || []
          })
          return
        }
      }
      
      // Handle other errors
      errorMessage = handleAPIError(err, errorMessage)
      setError(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setTimeout(() => setShowProgress(false), 3000) // Hide progress after delay
    }
  }

  const resetForm = () => {
    setFile(null)
    setJobRole('')
    setExtractedText('')
    setError('')
    setUploadProgress(0)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card variant="elevated" className="text-center">
        <CardHeader>
          <CardTitle level={1} className="text-3xl">
            Smart CV Analyzer
          </CardTitle>
        </CardHeader>
      </Card>
      
      <Card variant="default">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-900 dark:text-white">
            Upload Resume
          </label>
          
          <div
            {...getRootProps()}
            className={`group relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900 ${
              isDragActive
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-105 shadow-lg'
                : file
                ? 'border-green-400 bg-green-50 dark:bg-green-900/20 shadow-md'
                : 'border-gray-300 dark:border-dark-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 hover:shadow-md hover:scale-102'
            }`}
            role="button"
            tabIndex={0}
            aria-label={file ? `Selected file: ${file.name}. Click to change file.` : "Click or drag to upload resume file"}
          >
            <input {...getInputProps()} />
            
            {/* Upload Icon */}
            <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragActive
                ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400 scale-110'
                : file
                ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-dark-700 text-gray-400 dark:text-gray-500 group-hover:bg-primary-100 dark:group-hover:bg-primary-800 group-hover:text-primary-600 dark:group-hover:text-primary-400'
            }`}>
              {file ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isDragActive ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            
            {file ? (
              <div className="space-y-3">
                <div className="text-green-700 dark:text-green-300 font-bold text-lg">
                  ✓ File Selected Successfully
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📄</div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-xs">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-100 font-bold">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        resetForm()
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                      title="Remove file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetForm()
                  }}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className={`text-xl font-bold transition-colors duration-300 ${
                    isDragActive 
                      ? 'text-primary-700 dark:text-primary-300' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {isDragActive
                      ? 'Drop your resume here!'
                      : 'Upload Your Resume'}
                  </div>
                  <div className="text-gray-800 dark:text-gray-100 font-bold">
                    {isDragActive
                      ? 'Release to upload your file'
                      : 'Drag & drop your resume here, or click to browse'}
                  </div>
                </div>
                
                {/* File format indicators */}
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-800 dark:text-gray-100 font-bold">
                  <div className="flex items-center space-x-1">
                    <span className="text-red-500">📄</span>
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-500">🖼️</span>
                    <span>JPG</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-500">🖼️</span>
                    <span>PNG</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-800 dark:text-gray-100 font-bold">
                  Maximum file size: 10MB
                </div>
              </div>
            )}

            {/* Drag overlay */}
            {isDragActive && (
              <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-400/10 rounded-xl border-2 border-primary-400 dark:border-primary-500 flex items-center justify-center">
                <div className="text-primary-600 dark:text-primary-400 font-semibold text-lg animate-pulse">
                  Drop file to upload
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Job Role Input */}
        <div className="space-y-3">
          <label htmlFor="jobRole" className="block text-sm font-bold text-gray-900 dark:text-white">
            Target Job Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500 text-lg">🎯</span>
            </div>
            <input
              type="text"
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={isUploading}
              aria-describedby="jobRole-help"
              aria-required="true"
            />
            {jobRole && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <span className="text-green-500 text-lg">✓</span>
              </div>
            )}
          </div>
          <div id="jobRole-help" className="flex items-start space-x-2 text-sm text-gray-800 dark:text-gray-100 font-bold">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Specify your target role to receive personalized keyword suggestions and role-specific scoring
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card variant="outlined" className={
            typeof error === 'object' && error.type === 'validation'
              ? "border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20"
              : "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
          }>
            <CardContent className="py-3">
              {typeof error === 'object' && error.type === 'validation' ? (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-orange-500 text-lg">📄</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                        Invalid Resume Document
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                        {error.message}
                      </p>
                      
                      {error.details && (
                        <p className="text-xs text-orange-500 dark:text-orange-400 mb-2">
                          {error.details}
                        </p>
                      )}
                      
                      {error.suggestions && error.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                            Suggestions:
                          </p>
                          <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                            {error.suggestions.map((suggestion, index) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Tracker */}
        {showProgress && (
          <ProgressTracker
            steps={[
              { title: 'Preparing Upload', description: 'Validating file and preparing for upload' },
              { title: 'Uploading File', description: 'Sending file to server for processing', progress: uploadProgress },
              { title: 'AI Analysis', description: 'Extracting text, analyzing sections, and generating insights' },
              { title: 'Complete', description: 'Analysis ready for review' }
            ]}
            currentStep={currentStep}
            isLoading={isUploading}
            error={error}
            onRetry={() => {
              setError('')
              setCurrentStep(0)
              setUploadProgress(0)
              handleSubmit({ preventDefault: () => {} })
            }}
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth={true}
          disabled={!file || !jobRole.trim() || isUploading}
          loading={isUploading}
        >
          {isUploading ? 'Analyzing Resume...' : 'Analyze Resume'}
        </Button>
          </form>
        </CardContent>
      </Card>

      {/* Extracted Text Preview */}
      {extractedText && (
        <Card variant="default">
          <CardHeader>
            <CardTitle level={3}>
              Extracted Text Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-md p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium">
                {extractedText.substring(0, 1000)}
                {extractedText.length > 1000 && '...'}
              </pre>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-100 mt-4 font-bold">
              Please verify that the text was extracted correctly. You'll be redirected to the analysis results shortly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UploadResume