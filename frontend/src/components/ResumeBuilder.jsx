import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ResumeBuilder = () => {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }
    ],
    education: [
      {
        degree: '',
        school: '',
        location: '',
        graduationDate: '',
        gpa: ''
      }
    ],
    skills: [],
    projects: [
      {
        name: '',
        description: '',
        technologies: '',
        link: ''
      }
    ]
  })

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and contemporary design',
      preview: '🎨'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional professional layout',
      preview: '📄'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold design for creative roles',
      preview: '🎭'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant',
      preview: '✨'
    }
  ]

  const handleInputChange = (section, field, value, index = null) => {
    setResumeData(prev => {
      const newData = { ...prev }
      
      if (index !== null) {
        newData[section][index][field] = value
      } else if (section === 'personalInfo') {
        newData.personalInfo[field] = value
      } else {
        newData[field] = value
      }
      
      return newData
    })
  }

  const addSection = (section) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [
        ...prev[section],
        section === 'experience' ? {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        } : section === 'education' ? {
          degree: '',
          school: '',
          location: '',
          graduationDate: '',
          gpa: ''
        } : {
          name: '',
          description: '',
          technologies: '',
          link: ''
        }
      ]
    }))
  }

  const removeSection = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const addSkill = (skill) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const removeSkill = (skillToRemove) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const generateResume = () => {
    // In a real implementation, this would generate a PDF
    alert('Resume generation feature coming soon! This would create a PDF with your selected template.')
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Builder</h1>
        <p className="text-gray-800 dark:text-gray-100 font-bold">Create a professional resume with our AI-powered builder</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Template Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Choose Template</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{template.preview}</div>
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-800 dark:text-gray-100 font-bold">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={resumeData.personalInfo.name}
                onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={resumeData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={resumeData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={resumeData.personalInfo.location}
                onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={resumeData.personalInfo.linkedin}
                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                placeholder="Website/Portfolio"
                value={resumeData.personalInfo.website}
                onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
            <textarea
              placeholder="Write a brief professional summary..."
              value={resumeData.summary}
              onChange={(e) => handleInputChange(null, 'summary', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Add a skill and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill(e.target.value.trim())
                    e.target.value = ''
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Experience</h2>
              <button
                onClick={() => addSection('experience')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Experience
              </button>
            </div>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium">Experience {index + 1}</h3>
                  {resumeData.experience.length > 1 && (
                    <button
                      onClick={() => removeSection('experience', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => handleInputChange('experience', 'title', e.target.value, index)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) => handleInputChange('experience', 'location', e.target.value, index)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="month"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, index)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="month"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, index)}
                      disabled={exp.current}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => handleInputChange('experience', 'current', e.target.checked, index)}
                      className="mr-2"
                    />
                    Currently working here
                  </label>
                </div>
                <textarea
                  placeholder="Job description and achievements..."
                  value={exp.description}
                  onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">{resumeData.personalInfo.name || 'Your Name'}</h3>
                <p className="text-sm text-gray-800 dark:text-gray-100 font-bold">
                  {resumeData.personalInfo.email} | {resumeData.personalInfo.phone}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-100 font-bold">{resumeData.personalInfo.location}</p>
              </div>
              
              {resumeData.summary && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">SUMMARY</h4>
                  <p className="text-xs text-gray-700">{resumeData.summary}</p>
                </div>
              )}

              {resumeData.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">SKILLS</h4>
                  <div className="flex flex-wrap gap-1">
                    {resumeData.skills.map((skill, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-800 dark:text-gray-100 font-bold text-center mt-8">
                Live preview will update as you type
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={generateResume}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate Resume PDF
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Analyzer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder