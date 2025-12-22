import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { resumeAPI, handleAPIError } from '../utils/api';
import { 
  PremiumCard, 
  PremiumButton, 
  PremiumInput, 
  PremiumProgress,
  PremiumHero,
  PremiumToast
} from './PremiumUI';

const PremiumUpload = () => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const showNotification = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    console.log('📁 File drop event:', { acceptedFiles, rejectedFiles });
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      console.warn('❌ File rejected:', rejection);
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        showNotification('File size must be less than 10MB', 'error');
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        showNotification('Please upload a valid PDF, PNG, JPG, or JPEG file', 'error');
      } else {
        showNotification('Invalid file. Please try again.', 'error');
      }
      return;
    }
    
    if (acceptedFiles.length > 0) {
      console.log('✅ File accepted:', acceptedFiles[0]);
      setFile(acceptedFiles[0]);
      setError('');
      setExtractedText('');
      showNotification('File selected successfully!', 'success');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🎯 PremiumUpload: Form submitted');
    console.log('📋 Current state:', { file: file?.name, jobRole, isUploading });
    
    if (!file) {
      console.warn('⚠️ No file selected');
      showNotification('Please select a file to upload', 'error');
      return;
    }
    
    if (!jobRole.trim()) {
      console.warn('⚠️ No job role specified');
      showNotification('Please specify a target job role', 'error');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);
    setCurrentStep(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobRole', jobRole.trim());

    try {
      setCurrentStep(1);
      showNotification('Starting analysis...', 'info');
      
      console.log('🚀 PremiumUpload: Starting upload process');
      console.log('📁 File:', file.name, file.size, file.type);
      console.log('💼 Job Role:', jobRole);
      
      const response = await resumeAPI.uploadResume(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
        console.log('📊 Upload progress:', progress + '%');
      });

      console.log('✅ Upload response received:', response.data);

      if (response.data && response.data._id) {
        setCurrentStep(2);
        
        if (response.data.parsedText) {
          setExtractedText(response.data.parsedText);
        }

        setCurrentStep(3);
        showNotification('Analysis completed successfully!', 'success');
        
        console.log('🎉 Navigating to results page:', `/analysis/${response.data._id}`);
        
        setTimeout(() => {
          navigate(`/analysis/${response.data._id}`);
        }, 2000);
      } else {
        console.error('❌ Invalid response format:', response.data);
        setError(response.data?.message || 'Analysis failed');
        showNotification('Analysis failed. Please try again.', 'error');
      }

    } catch (err) {
      console.error('❌ Upload error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = handleAPIError(err, 'Failed to upload and analyze resume');
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobRole('');
    setExtractedText('');
    setError('');
    setUploadProgress(0);
    setCurrentStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const steps = [
    { title: 'Preparing Upload', description: 'Validating file and preparing for upload', icon: '📋' },
    { title: 'Uploading File', description: 'Sending file to server for processing', icon: '📤', progress: uploadProgress },
    { title: 'AI Analysis', description: 'Extracting text, analyzing sections, and generating insights', icon: '🧠' },
    { title: 'Complete', description: 'Analysis ready for review', icon: '✅' }
  ];

  return (
    <div className="layout-premium">
      {/* Premium Hero Section */}
      <PremiumHero
        title="Smart CV Analyzer"
        subtitle="Transform your resume with AI-powered insights and professional recommendations"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PremiumButton
            variant="glass"
            size="lg"
            onClick={() => document.getElementById('file-upload').scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started
          </PremiumButton>
          <PremiumButton
            variant="glass"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            View Dashboard
          </PremiumButton>
        </div>
      </PremiumHero>

      {/* Main Upload Section */}
      <div className="container-premium py-16" id="file-upload">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-slide-in-up">
            <h2 className="text-premium-heading mb-4">Upload Your Resume</h2>
            <p className="text-premium-body">
              Get instant AI-powered analysis with personalized recommendations to improve your resume
            </p>
          </div>

          <PremiumCard className="p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Premium File Upload Area */}
              <div className="space-y-6">
                <label className="block text-lg font-bold text-gray-900 dark:text-white">
                  Resume File
                </label>
                
                <div
                  {...getRootProps()}
                  className={`
                    group relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer 
                    transition-all duration-500 transform focus:outline-none focus:ring-4 focus:ring-indigo-500/20
                    ${isDragActive
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 scale-105 shadow-2xl'
                      : file
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:shadow-xl hover:scale-102'
                    }
                  `}
                  role="button"
                  tabIndex={0}
                  aria-label={file ? `Selected file: ${file.name}. Click to change file.` : "Click or drag to upload resume file"}
                >
                  <input {...getInputProps()} ref={fileInputRef} />
                  
                  {/* Upload Icon with Animation */}
                  <div className={`
                    mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500
                    ${isDragActive
                      ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 scale-110 animate-pulse-glow'
                      : file
                      ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 animate-pulse-glow'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110'
                    }
                  `}>
                    {file ? (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : isDragActive ? (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  </div>
                  
                  {file ? (
                    <div className="space-y-4 animate-scale-in">
                      <div className="text-green-700 dark:text-green-300 font-bold text-xl">
                        ✓ File Selected Successfully
                      </div>
                      <PremiumCard className="p-6 bg-white/80 dark:bg-gray-800/80">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">📄</div>
                            <div className="text-left">
                              <div className="font-bold text-gray-900 dark:text-white truncate max-w-xs">
                                {file.name}
                              </div>
                              <div className="text-sm text-gray-800 dark:text-gray-100 font-bold">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                              </div>
                            </div>
                          </div>
                          <PremiumButton
                            variant="glass"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetForm();
                            }}
                          >
                            Change
                          </PremiumButton>
                        </div>
                      </PremiumCard>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className={`text-2xl font-bold transition-colors duration-300 ${
                          isDragActive 
                            ? 'text-indigo-700 dark:text-indigo-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {isDragActive
                            ? 'Drop your resume here!'
                            : 'Upload Your Resume'}
                        </div>
                        <div className="text-gray-800 dark:text-gray-100 font-bold text-lg">
                          {isDragActive
                            ? 'Release to upload your file'
                            : 'Drag & drop your resume here, or click to browse'}
                        </div>
                      </div>
                      
                      {/* File format indicators */}
                      <div className="flex items-center justify-center space-x-8 text-base text-gray-800 dark:text-gray-100 font-bold">
                        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <span className="text-red-500 text-xl">📄</span>
                          <span>PDF</span>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <span className="text-blue-500 text-xl">🖼️</span>
                          <span>JPG</span>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <span className="text-green-500 text-xl">🖼️</span>
                          <span>PNG</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-800 dark:text-gray-100 font-bold">
                        Maximum file size: 10MB
                      </div>
                    </div>
                  )}

                  {/* Drag overlay */}
                  {isDragActive && (
                    <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-3xl border-2 border-indigo-400 dark:border-indigo-500 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl animate-bounce">
                        Drop file to upload
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Job Role Input */}
              <div className="space-y-4">
                <PremiumInput
                  label="Target Job Role"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                  icon="🎯"
                  disabled={isUploading}
                />
                <div className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-300 font-medium p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    Specify your target role to receive personalized keyword suggestions and role-specific scoring
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <PremiumCard className="p-4 border-red-300 bg-red-50 dark:bg-red-900/20 animate-slide-in-up">
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </PremiumCard>
              )}

              {/* Progress Tracker */}
              {isUploading && (
                <PremiumCard className="p-6 animate-scale-in">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                      Processing Your Resume
                    </h3>
                    
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-500
                            ${index < currentStep 
                              ? 'bg-green-100 text-green-600 scale-110' 
                              : index === currentStep 
                              ? 'bg-indigo-100 text-indigo-600 animate-pulse-glow scale-110' 
                              : 'bg-gray-100 text-gray-400'
                            }
                          `}>
                            {index < currentStep ? '✓' : step.icon}
                          </div>
                          
                          <div className="flex-1">
                            <div className={`font-bold ${
                              index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {step.title}
                            </div>
                            <div className={`text-sm ${
                              index <= currentStep ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {step.description}
                            </div>
                            
                            {step.progress !== undefined && index === currentStep && (
                              <div className="mt-2">
                                <PremiumProgress 
                                  value={step.progress} 
                                  showValue={true}
                                  animated={true}
                                  gradient={true}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PremiumCard>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!file || !jobRole.trim() || isUploading}
                className="w-full px-10 py-5 text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                onClick={(e) => {
                  console.log('🖱️ Regular button clicked');
                  if (!isUploading && file && jobRole.trim()) {
                    console.log('✅ Regular button click conditions met, form should submit');
                  } else {
                    console.log('❌ Regular button click conditions not met:', {
                      isUploading,
                      hasFile: !!file,
                      hasJobRole: !!jobRole.trim()
                    });
                  }
                }}
              >
                {isUploading ? 'Analyzing Resume...' : 'Analyze Resume'}
              </button>
            </form>
          </PremiumCard>

          {/* Extracted Text Preview */}
          {extractedText && (
            <PremiumCard className="p-8 mt-8 animate-slide-in-up">
              <h3 className="text-premium-heading mb-6">Extracted Text Preview</h3>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-h-64 overflow-y-auto scrollbar-enhanced">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium">
                  {extractedText.substring(0, 1000)}
                  {extractedText.length > 1000 && '...'}
                </pre>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 font-medium">
                Please verify that the text was extracted correctly. You'll be redirected to the analysis results shortly.
              </p>
            </PremiumCard>
          )}
        </div>
      </div>

      {/* Premium Toast Notification */}
      <PremiumToast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default PremiumUpload;