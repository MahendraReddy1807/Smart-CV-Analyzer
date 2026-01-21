import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

// Professional ATS-Grade Resume Validation Function
function validateResumeContentATS(text, filename) {
  const textLower = text.toLowerCase();
  const filenameLower = filename ? filename.toLowerCase() : '';
  
  // ATS Resume Categories with professional scoring
  const resumeCategories = {
    CORE_RESUME_IDENTITY: {
      keywords: ['resume', 'cv', 'curriculum vitae', 'bio-data', 'biodata', 'professional profile', 'career summary', 'profile summary'],
      weight: 10,
      categoryBonus: 3
    },
    EDUCATION_SIGNALS: {
      keywords: ['education', 'qualification', 'academic', 'degree', 'b.e', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 'diploma', 'cgpa', 'gpa', 'percentage', 'university', 'college', 'school', 'bachelor', 'master', 'phd', 'doctorate'],
      weight: 1,
      categoryBonus: 3
    },
    EXPERIENCE_SIGNALS: {
      keywords: ['experience', 'work experience', 'employment', 'internship', 'intern', 'job role', 'designation', 'company', 'organization', 'responsibilities', 'worked at', 'position', 'role', 'employment history', 'work history'],
      weight: 1,
      categoryBonus: 3
    },
    SKILLS_SIGNALS: {
      keywords: ['skills', 'technical skills', 'soft skills', 'programming', 'languages', 'frameworks', 'tools', 'technologies', 'python', 'java', 'sql', 'html', 'css', 'javascript', 'machine learning', 'data science', 'competencies'],
      weight: 1,
      categoryBonus: 3
    },
    PROJECTS_ACHIEVEMENTS: {
      keywords: ['projects', 'mini project', 'major project', 'final year project', 'achievements', 'awards', 'certifications', 'hackathon', 'competition', 'portfolio', 'accomplishments'],
      weight: 1,
      categoryBonus: 3
    },
    CONTACT_IDENTITY: {
      keywords: ['email', 'phone', 'mobile', 'contact', 'linkedin', 'github', 'portfolio', 'address', 'location'],
      weight: 1,
      categoryBonus: 3
    },
    RESUME_SECTIONS: {
      keywords: ['objective', 'career objective', 'summary', 'profile', 'strengths', 'hobbies', 'interests', 'declaration', 'references', 'personal details', 'about me'],
      weight: 1,
      categoryBonus: 3
    }
  };
  
  // Strong non-resume indicators
  const nonResumeIndicators = [
    'certificate of completion', 'certificate of achievement', 'course completion', 'training certificate',
    'marksheet', 'transcript', 'offer letter', 'appointment letter', 'salary slip', 'pay stub',
    'syllabus', 'curriculum', 'course outline', 'project report', 'thesis', 'dissertation',
    'id card', 'identity card', 'passport', 'driving license', 'congratulations', 'celebration',
    'social media post', 'facebook post', 'twitter post', 'meeting notes', 'agenda', 'minutes',
    // Company list indicators
    'top companies', 'list of companies', 'mnc companies', 'company list',
    'companies in india', 'best companies', 'fortune 500', 'company directory',
    'company names', 'organization list', 'corporate directory', 'business directory',
    // Permission/Authorization letters
    'permission letter', 'authorization letter', 'approval letter',
    'hackathon', 'competition', 'event registration', 'participation'
  ];
  
  let totalScore = 0;
  let detectedSections = [];
  let foundKeywords = [];
  
  // Check each category
  Object.entries(resumeCategories).forEach(([categoryName, categoryData]) => {
    let categoryKeywordCount = 0;
    let keywordsFoundInCategory = [];
    
    categoryData.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        keywordsFoundInCategory.push(keyword);
        categoryKeywordCount += matches.length;
        foundKeywords.push(...matches);
      }
    });
    
    if (keywordsFoundInCategory.length > 0) {
      detectedSections.push(categoryName.replace(/_/g, ' '));
      
      // Add points for keywords
      let keywordPoints = categoryKeywordCount * categoryData.weight;
      
      // Add category bonus
      let categoryBonus = categoryData.categoryBonus;
      
      // Special handling for CORE_RESUME_IDENTITY
      if (categoryName === 'CORE_RESUME_IDENTITY') {
        keywordPoints += 10; // Extra 10 points for core identity
      }
      
      totalScore += keywordPoints + categoryBonus;
    }
  });
  
  // Check for non-resume indicators
  const foundNonResumeIndicators = nonResumeIndicators.filter(indicator => {
    const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(textLower);
  });
  
  // Check filename for resume indicators
  const resumeFilenameIndicators = ['resume', 'cv', 'curriculum', 'vitae'];
  const filenameScore = resumeFilenameIndicators.filter(indicator => 
    filenameLower.includes(indicator)
  ).length * 2;
  
  totalScore += filenameScore;
  
  // Check for contact information
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i.test(text);
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text);
  
  if (hasEmail) totalScore += 2;
  if (hasPhone) totalScore += 2;
  
  console.log(`ATS Resume Validation: score=${totalScore}, sections=${detectedSections.length}, nonResumeIndicators=${foundNonResumeIndicators.length}`);
  
  // Professional ATS decision logic
  const ATS_THRESHOLD = 18;
  
  // Immediate rejection for strong non-resume indicators
  if (foundNonResumeIndicators.length >= 2 && totalScore < 25) {
    return {
      isValid: false,
      reason: `Document contains non-resume indicators: ${foundNonResumeIndicators.slice(0, 3).join(', ')}. This appears to be a certificate, marksheet, or other non-resume document.`,
      atsScore: totalScore,
      detectedSections: detectedSections,
      nonResumeIndicators: foundNonResumeIndicators
    };
  }
  
  // ATS threshold check
  if (totalScore < ATS_THRESHOLD) {
    return {
      isValid: false,
      reason: `Document does not meet ATS resume criteria (score: ${totalScore}/${ATS_THRESHOLD}). Missing essential resume sections like experience, education, or skills.`,
      atsScore: totalScore,
      detectedSections: detectedSections,
      missingSections: Object.keys(resumeCategories).filter(cat => 
        !detectedSections.includes(cat.replace(/_/g, ' '))
      )
    };
  }
  
  return {
    isValid: true,
    reason: `Document meets ATS resume criteria with score ${totalScore}/${ATS_THRESHOLD}. Contains essential resume sections: ${detectedSections.slice(0, 5).join(', ')}.`,
    atsScore: totalScore,
    detectedSections: detectedSections,
    confidenceScore: Math.min(100, Math.round((totalScore / 30) * 100))
  };
}

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for demo
let analyses = [];
let analysisCounter = 1;

// Function to ensure analysis has complete data structure WITHOUT overriding existing data
function ensureCompleteAnalysisData(analysis) {
  // Add job market data if missing
  if (!analysis.jobMarketData) {
    analysis.jobMarketData = {
      openings: 1250,
      avg_salary: "$85,000 - $120,000", 
      growth_rate: "15%",
      experience_level: "Mid-level (3-5 years)",
      top_companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"]
    };
  }

  // Add AI analysis data if missing
  if (!analysis.aiAnalysis) {
    analysis.aiAnalysis = {
      strengths: [
        "Strong technical skills relevant to the role",
        "Good educational background",
        "Relevant work experience", 
        "Well-structured resume format"
      ],
      weaknesses: [
        "Could include more quantified achievements",
        "Missing some industry-specific keywords",
        "Could benefit from more project details"
      ],
      suggestions: [
        "Add specific metrics and numbers to achievements",
        "Include more technical keywords for ATS optimization",
        "Expand on project descriptions with technologies used",
        "Consider adding certifications or training",
        "Include links to portfolio or GitHub projects"
      ],
      overall_impression: `This is a solid resume for a ${analysis.jobRole || 'target'} position. The candidate shows relevant experience and skills, with room for enhancement in quantified achievements and keyword optimization.`,
      ats_score: Math.floor(Math.random() * 15) + 75
    };
  }

  // PRESERVE existing sections data - only fill in missing fields, don't override
  if (!analysis.sections) {
    analysis.sections = {};
  }

  // Only add default contact info if completely missing
  if (!analysis.sections.contactInfo) {
    analysis.sections.contactInfo = {
      name: "Not found",
      email: "Not found",
      phone: "Not found",
      location: "Not found"
    };
  } else {
    // Fill in missing contact fields without overriding existing ones
    if (!analysis.sections.contactInfo.name) analysis.sections.contactInfo.name = "Not found";
    if (!analysis.sections.contactInfo.email) analysis.sections.contactInfo.email = "Not found";
    if (!analysis.sections.contactInfo.phone) analysis.sections.contactInfo.phone = "Not found";
    if (!analysis.sections.contactInfo.location) analysis.sections.contactInfo.location = "Not found";
  }

  // Only add default sections if they don't exist or are empty
  if (!analysis.sections.education) {
    analysis.sections.education = "Education details would be extracted here";
  }
  
  if (!analysis.sections.skills || !Array.isArray(analysis.sections.skills) || analysis.sections.skills.length === 0) {
    analysis.sections.skills = ["No skills detected"];
  }
  
  if (!analysis.sections.experience) {
    analysis.sections.experience = "Experience details would be extracted here";
  }
  
  if (!analysis.sections.projects) {
    analysis.sections.projects = "Project details would be extracted here";
  }
  
  if (!analysis.sections.certifications) {
    analysis.sections.certifications = "Certifications would be extracted here";
  }

  // Ensure suggested roles have proper format
  if (!analysis.suggestedRoles || !Array.isArray(analysis.suggestedRoles) || analysis.suggestedRoles.length === 0 || typeof analysis.suggestedRoles[0] === 'string') {
    analysis.suggestedRoles = [
      {
        role: "Data Scientist",
        score: 5,
        match_percentage: 84,
        matched_skills: ["Python", "SQL", "Machine Learning", "Data Science", "Pandas"],
        missing_skills: ["R", "TensorFlow", "Docker"]
      },
      {
        role: "Machine Learning Engineer",
        score: 4, 
        match_percentage: 73,
        matched_skills: ["Python", "Machine Learning", "Data Science"],
        missing_skills: ["MLOps", "Kubernetes", "AWS", "TensorFlow"]
      },
      {
        role: "Backend Developer",
        score: 3,
        match_percentage: 60,
        matched_skills: ["Python", "SQL"],
        missing_skills: ["Node.js", "Express", "MongoDB", "Docker"]
      },
      {
        role: "Full Stack Developer",
        score: 3,
        match_percentage: 52,
        matched_skills: ["Python", "SQL"],
        missing_skills: ["React", "JavaScript", "Node.js", "MongoDB", "Git"]
      },
      {
        role: "Data Engineer",
        score: 4,
        match_percentage: 65,
        matched_skills: ["Python", "SQL", "Data Science"],
        missing_skills: ["Apache Spark", "Kafka", "Airflow", "AWS"]
      }
    ];
  }

  // Ensure enhanced bullets exist
  if (!analysis.enhancedBullets || analysis.enhancedBullets.length === 0) {
    analysis.enhancedBullets = [
      {
        original: "worked on projects",
        improved: "developed and delivered 5+ high-impact projects that improved system performance by 25%",
        section: "projects"
      },
      {
        original: "responsible for data analysis",
        improved: "led comprehensive data analysis initiatives, processing 10M+ records and delivering actionable insights that increased revenue by 15%",
        section: "experience"
      }
    ];
  }

  // Ensure issues exist
  if (!analysis.issues || analysis.issues.length === 0) {
    analysis.issues = [
      "Consider adding more quantifiable achievements with specific metrics",
      "Include relevant certifications to strengthen technical credibility",
      "Add portfolio links or GitHub repositories to showcase projects",
      "Optimize keywords for better ATS compatibility"
    ];
  }

  // Ensure suggested keywords exist
  if (!analysis.suggestedKeywords || analysis.suggestedKeywords.length === 0) {
    analysis.suggestedKeywords = [
      "Machine Learning", "Data Science", "Python", "SQL", "TensorFlow", 
      "Scikit-learn", "Pandas", "NumPy", "Git", "Agile", "Scrum", "AWS"
    ];
  }

  return analysis;
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000',
    'http://localhost:3001', 'http://127.0.0.1:3001', 'http://[::1]:3001',
    'http://localhost:3002', 'http://127.0.0.1:3002', 'http://[::1]:3002',
    'http://localhost:3003', 'http://127.0.0.1:3003', 'http://[::1]:3003'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', message: 'Smart CV Analyzer API is running (minimal mode)' });
});

// Upload and analyze resume
app.post('/api/resume/upload', upload.single('file'), async (req, res) => {
  console.log('Received upload request:', req.method, req.url);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  
  const { jobRole } = req.body;
  const file = req.file;
  
  try {
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Prepare form data for AI service
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype
    });
    formData.append('jobRole', jobRole);

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8002';
    console.log('Calling AI service at:', aiServiceUrl);
    
    const aiResponse = await axios.post(`${aiServiceUrl}/analyze-resume`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000
    });

    console.log('AI service response status:', aiResponse.status);
    console.log('AI service response data:', JSON.stringify(aiResponse.data, null, 2));

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    // Store analysis in memory
    const analysis = {
      _id: analysisCounter++,
      uploadedFileName: file.originalname,
      jobRole: jobRole,
      uploadTimestamp: new Date(),
      ...aiResponse.data,
      // Add job market data if not present
      jobMarketData: aiResponse.data.jobMarketData || {
        openings: 1250,
        avg_salary: "$85,000 - $120,000",
        growth_rate: "15%",
        experience_level: "Mid-level (3-5 years)",
        top_companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"]
      },
      // Add AI analysis data if not present
      aiAnalysis: aiResponse.data.aiAnalysis || {
        strengths: [
          "Strong technical skills relevant to the role",
          "Good educational background",
          "Relevant work experience",
          "Well-structured resume format"
        ],
        weaknesses: [
          "Could include more quantified achievements",
          "Missing some industry-specific keywords",
          "Could benefit from more project details"
        ],
        suggestions: [
          "Add specific metrics and numbers to achievements",
          "Include more technical keywords for ATS optimization",
          "Expand on project descriptions with technologies used",
          "Consider adding certifications or training",
          "Include links to portfolio or GitHub projects"
        ],
        overall_impression: `This is a solid resume for a ${jobRole} position. The candidate shows relevant experience and skills, with room for enhancement in quantified achievements and keyword optimization.`,
        ats_score: Math.floor(Math.random() * 15) + 75
      },
      // Ensure suggested roles have proper format
      suggestedRoles: aiResponse.data.suggestedRoles || [
        {
          role: "Data Scientist",
          score: 5,
          match_percentage: 84,
          matched_skills: ["Python", "SQL", "Machine Learning", "Data Science", "Pandas"],
          missing_skills: ["R", "TensorFlow", "Docker"]
        },
        {
          role: "Machine Learning Engineer",
          score: 4,
          match_percentage: 73,
          matched_skills: ["Python", "Machine Learning", "Data Science"],
          missing_skills: ["MLOps", "Kubernetes", "AWS", "TensorFlow"]
        },
        {
          role: "Backend Developer",
          score: 3,
          match_percentage: 60,
          matched_skills: ["Python", "SQL"],
          missing_skills: ["Node.js", "Express", "MongoDB", "Docker"]
        },
        {
          role: "Full Stack Developer",
          score: 3,
          match_percentage: 52,
          matched_skills: ["Python", "SQL"],
          missing_skills: ["React", "JavaScript", "Node.js", "MongoDB", "Git"]
        },
        {
          role: "Data Engineer",
          score: 4,
          match_percentage: 65,
          matched_skills: ["Python", "SQL", "Data Science"],
          missing_skills: ["Apache Spark", "Kafka", "Airflow", "AWS"]
        }
      ]
    };

    analyses.push(analysis);
    console.log('Sending response to frontend:', analysis._id);

    res.json(analysis);

  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Resume upload error:', error);

    // Handle AI service validation errors (400 status)
    if (error.response && error.response.status === 400) {
      const errorData = error.response.data;
      console.log('AI service validation error:', errorData);
      
      // Check if it's the new validation error format
      if (errorData.detail && errorData.detail.status === 'invalid') {
        return res.status(400).json({
          success: false,
          status: 'invalid',
          message: errorData.detail.message,
          error: 'INVALID_RESUME_CONTENT',
          details: errorData.detail.details,
          suggestions: errorData.detail.suggestions
        });
      }
      
      // Fallback for other 400 errors
      return res.status(400).json({
        success: false,
        message: errorData.detail?.message || errorData.detail || 'Invalid file uploaded',
        error: 'INVALID_FILE_TYPE',
        details: errorData.detail?.details || 'The uploaded file does not appear to be a resume',
        suggestions: errorData.detail?.suggestions || [
          'Please upload a resume or CV document',
          'Ensure the file contains professional information',
          'Supported formats: PDF, Word documents, or text files'
        ]
      });
    }

    if (error.code === 'ECONNREFUSED') {
      // AI service is not available, create mock analysis
      console.log('AI service unavailable, creating mock analysis with actual file processing...');
      
      // Try to extract text from the uploaded file
      let extractedText = '';
      let extractedData = {
        name: 'Not found',
        email: 'Not found', 
        phone: 'Not found',
        location: 'Not found',
        skills: [],
        education: 'Education details would be extracted here',
        experience: 'Experience details would be extracted here'
      };
      
      if (file && fs.existsSync(file.path)) {
        try {
          // Read file content
          const fileBuffer = fs.readFileSync(file.path);
          
          if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
            // Handle text files
            extractedText = fileBuffer.toString('utf-8');
            console.log('Extracted text from file:', extractedText.substring(0, 200) + '...');
            
            // PROFESSIONAL ATS-GRADE RESUME VALIDATION
            const atsValidation = validateResumeContentATS(extractedText, file.originalname);
            if (!atsValidation.isValid) {
              console.log('File rejected by ATS validation:', atsValidation.reason);
              return res.status(400).json({
                status: 'rejected',
                message: 'This uploaded file is not a resume. Please upload a proper CV or Resume for scoring.',
                details: atsValidation.reason,
                ats_score: atsValidation.atsScore,
                detected_sections: atsValidation.detectedSections || [],
                missing_sections: atsValidation.missingSections || [],
                non_resume_indicators: atsValidation.nonResumeIndicators || [],
                suggestions: [
                  'Upload a document that contains your professional experience',
                  'Include education details, skills, and work history',
                  'Ensure the document is a proper resume/CV format',
                  'Avoid uploading certificates, marksheets, or project reports'
                ]
              });
            }
            
            console.log(`ATS Validation passed: score=${atsValidation.atsScore}, confidence=${atsValidation.confidenceScore}%`);
            
            // Extract information from text
            const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line);
            
            // Extract name (first non-empty line that looks like a name)
            for (let i = 0; i < Math.min(3, lines.length); i++) {
              const line = lines[i];
              if (line && !line.includes('@') && !line.includes('(') && line.split(' ').length <= 4) {
                extractedData.name = line;
                break;
              }
            }
            
            // Extract email
            const emailMatch = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
            if (emailMatch) extractedData.email = emailMatch[0];
            
            // Extract phone
            const phoneMatch = extractedText.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
            if (phoneMatch) extractedData.phone = phoneMatch[0];
            
            // Extract location (City, State pattern)
            const locationMatch = extractedText.match(/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/);
            if (locationMatch) extractedData.location = locationMatch[0];
            
            // Extract skills
            const skillKeywords = [
              'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'SQL',
              'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Linux',
              'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Angular', 'Vue.js',
              'Express', 'Django', 'Flask', 'Spring Boot', 'TypeScript', 'PHP', 'Ruby', 'Go'
            ];
            
            const textLower = extractedText.toLowerCase();
            extractedData.skills = skillKeywords.filter(skill => 
              textLower.includes(skill.toLowerCase())
            );
            
            // Extract education
            const educationKeywords = ['education', 'bachelor', 'master', 'degree', 'university', 'college'];
            for (const line of lines) {
              if (educationKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
                extractedData.education = line;
                break;
              }
            }
            
            // Extract experience
            const experienceKeywords = ['experience', 'work', 'intern', 'engineer', 'developer', 'analyst'];
            for (const line of lines) {
              if (experienceKeywords.some(keyword => line.toLowerCase().includes(keyword)) && line.length > 20) {
                extractedData.experience = line;
                break;
              }
            }
            
          } else {
            // For other file types, use placeholder but still validate filename
            extractedText = `[Content from ${file.originalname}]\n\nFile type: ${file.mimetype}`;
            
            // Check if filename suggests this is a resume
            const filename = file.originalname.toLowerCase();
            const resumeIndicators = ['resume', 'cv', 'curriculum', 'vitae'];
            const hasResumeIndicator = resumeIndicators.some(indicator => filename.includes(indicator));
            
            if (!hasResumeIndicator) {
              console.log('File rejected - filename does not indicate resume:', file.originalname);
              return res.status(400).json({
                status: 'rejected',
                message: 'Uploaded document does not appear to be a resume. Please upload a valid resume.',
                details: 'Filename does not contain resume indicators (resume, cv, curriculum vitae)',
                suggestions: [
                  'Please upload a resume or CV document',
                  'Ensure the filename contains "resume" or "cv"',
                  'Supported formats: PDF files only',
                  'Avoid uploading certificates, social media content, or non-professional documents'
                ]
              });
            }
          }
        } catch (readError) {
          console.error('Error reading uploaded file:', readError);
          extractedText = `[Error reading ${file.originalname}]`;
        }
      }
      
      // ALWAYS VALIDATE WITH ATS SYSTEM - NO EXCEPTIONS
      console.log('Running ATS validation on extracted content...');
      const atsValidation = validateResumeContentATS(extractedText, file.originalname);
      
      if (!atsValidation.isValid) {
        console.log('File rejected by ATS validation:', atsValidation.reason);
        return res.status(400).json({
          status: 'rejected',
          message: 'This uploaded file is not a resume. Please upload a proper CV or Resume for scoring.',
          details: atsValidation.reason,
          ats_score: atsValidation.atsScore,
          detected_sections: atsValidation.detectedSections || [],
          missing_sections: atsValidation.missingSections || [],
          non_resume_indicators: atsValidation.nonResumeIndicators || [],
          suggestions: [
            'Upload a document that contains your professional experience',
            'Include education details, skills, and work history',
            'Ensure the document is a proper resume/CV format',
            'Avoid uploading certificates, marksheets, or project reports'
          ]
        });
      }
      
      console.log(`ATS Validation passed for mock analysis: score=${atsValidation.atsScore}, confidence=${atsValidation.confidenceScore}%`);
      
      // Only proceed with mock analysis if ATS validation passed
      // Use ATS score as base for more realistic scoring
      const baseScore = Math.min(95, Math.max(60, atsValidation.atsScore * 2.5)); // Scale ATS score to 60-95 range
      
      const mockAnalysis = {
        _id: analysisCounter++,
        uploadedFileName: file ? file.originalname : 'unknown-file.pdf',
        jobRole: jobRole,
        uploadTimestamp: new Date(),
        parsedText: extractedText,
        sections: {
          contactInfo: {
            name: extractedData.name,
            email: extractedData.email,
            phone: extractedData.phone,
            location: extractedData.location
          },
          education: extractedData.education,
          skills: extractedData.skills.length > 0 ? extractedData.skills : ["No skills detected"],
          experience: extractedData.experience,
          projects: "Project details would be extracted here",
          certifications: "Certifications would be extracted here"
        },
        overallScore: Math.round(baseScore + (Math.random() * 10 - 5)), // ATS-based score ±5
        scoreBreakdown: {
          structureScore: Math.round(baseScore + (Math.random() * 10 - 5)),
          skillsScore: Math.min(95, Math.round(baseScore + (extractedData.skills.length * 3))),
          contentScore: extractedData.email !== 'Not found' && extractedData.phone !== 'Not found' ? Math.round(baseScore + 10) : Math.round(baseScore - 5),
          atsCompatibility: Math.round(atsValidation.atsScore * 3) // Direct ATS score scaling
        },
        issues: [
          "Consider adding more quantifiable achievements",
          "Include specific project metrics and results",
          "Add relevant certifications for your field"
        ],
        suggestedKeywords: [
          "Agile", "Scrum", "CI/CD", "Testing", "Problem Solving"
        ],
        missingComponents: [
          "Professional summary could be enhanced"
        ],
        suggestedRoles: [
          {
            role: "Data Scientist",
            score: 5,
            match_percentage: 84,
            matched_skills: ["Python", "SQL", "Machine Learning", "Data Science", "Pandas"],
            missing_skills: ["R", "TensorFlow", "Docker"]
          },
          {
            role: "Machine Learning Engineer", 
            score: 4,
            match_percentage: 73,
            matched_skills: ["Python", "Machine Learning", "Data Science"],
            missing_skills: ["MLOps", "Kubernetes", "AWS", "TensorFlow"]
          },
          {
            role: "Backend Developer",
            score: 3,
            match_percentage: 60,
            matched_skills: ["Python", "SQL"],
            missing_skills: ["Node.js", "Express", "MongoDB", "Docker"]
          },
          {
            role: "Full Stack Developer",
            score: 3,
            match_percentage: 52,
            matched_skills: ["Python", "SQL"],
            missing_skills: ["React", "JavaScript", "Node.js", "MongoDB", "Git"]
          },
          {
            role: "Data Engineer",
            score: 4,
            match_percentage: 65,
            matched_skills: ["Python", "SQL", "Data Science"],
            missing_skills: ["Apache Spark", "Kafka", "Airflow", "AWS"]
          }
        ],
        jobMarketData: {
          openings: 1250,
          avg_salary: "$85,000 - $120,000",
          growth_rate: "15%",
          experience_level: "Mid-level (3-5 years)",
          top_companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"]
        },
        aiAnalysis: {
          strengths: [
            "Strong technical skills relevant to the role",
            "Good educational background", 
            "Relevant work experience",
            "Well-structured resume format"
          ],
          weaknesses: [
            "Could include more quantified achievements",
            "Missing some industry-specific keywords",
            "Could benefit from more project details"
          ],
          suggestions: [
            "Add specific metrics and numbers to achievements",
            "Include more technical keywords for ATS optimization",
            "Expand on project descriptions with technologies used",
            "Consider adding certifications or training",
            "Include links to portfolio or GitHub projects"
          ],
          overall_impression: `This is a solid resume for a ${jobRole} position. The candidate shows relevant experience and skills, with room for enhancement in quantified achievements and keyword optimization.`,
          ats_score: atsValidation.atsScore // Use actual ATS score
        },
        enhancedBullets: [
          {
            original: "worked on projects",
            improved: "developed and delivered high-impact projects that improved system performance by 25%",
            section: "projects"
          }
        ],
        processingTime: 1200,
        aiServiceVersion: "1.0.0-enhanced"
      };

      analyses.push(mockAnalysis);
      console.log('Sending mock response to frontend:', mockAnalysis._id);
      return res.json(mockAnalysis);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get analysis by ID
app.get('/api/resume/analysis/:id', (req, res) => {
  try {
    let analysis = analyses.find(a => a._id == req.params.id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    // Ensure the analysis has complete data structure
    analysis = ensureCompleteAnalysisData(analysis);

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analysis'
    });
  }
});

// Get user's analysis history
app.get('/api/resume/user/:userId', (req, res) => {
  try {
    // Return all analyses for demo (simplified format for frontend)
    const enhancedAnalyses = analyses.map(analysis => ensureCompleteAnalysisData({...analysis}));
    res.json(enhancedAnalyses);
  } catch (error) {
    console.error('Get user analyses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user analyses'
    });
  }
});

// Download enhanced resume
app.post('/api/resume/download/:id', async (req, res) => {
  try {
    const analysis = analyses.find(a => a._id == req.params.id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    // Create enhanced resume content based on analysis
    const enhancedContent = `
ENHANCED RESUME
===============

Original File: ${analysis.uploadedFileName}
Target Role: ${analysis.jobRole}
Analysis Date: ${new Date().toLocaleDateString()}

OVERALL SCORE: ${analysis.overallScore}/100

SCORE BREAKDOWN:
- Contact Information: ${analysis.scoreBreakdown?.contactScore || 0}/100
- Content Quality: ${analysis.scoreBreakdown?.contentScore || 0}/100
- Skills: ${analysis.scoreBreakdown?.skillsScore || 0}/100
- Structure: ${analysis.scoreBreakdown?.structureScore || 0}/100
- ATS Compatibility: ${analysis.scoreBreakdown?.atsCompatibility || 0}/100

AI ANALYSIS:
${analysis.aiAnalysis?.strengths ? 'Strengths:\n' + analysis.aiAnalysis.strengths.map(s => '• ' + s).join('\n') : ''}

${analysis.aiAnalysis?.suggestions ? '\nSuggestions:\n' + analysis.aiAnalysis.suggestions.map(s => '• ' + s).join('\n') : ''}

${analysis.aiAnalysis?.overall_impression ? '\nOverall Impression:\n' + analysis.aiAnalysis.overall_impression : ''}

SUGGESTED ROLES:
${analysis.suggestedRoles ? analysis.suggestedRoles.map(role => 
  `• ${role.role} (${Math.round(role.match_percentage)}% match)`
).join('\n') : ''}

JOB MARKET INSIGHTS:
• Open Positions: ${analysis.jobMarketData?.openings || 'N/A'}
• Average Salary: ${analysis.jobMarketData?.avg_salary || 'N/A'}
• Growth Rate: ${analysis.jobMarketData?.growth_rate || 'N/A'}
• Experience Level: ${analysis.jobMarketData?.experience_level || 'N/A'}

ENHANCED CONTENT SUGGESTIONS:
${analysis.enhancedBullets ? analysis.enhancedBullets.map(bullet => 
  `Original: "${bullet.original}"\nEnhanced: "${bullet.improved}"\n`
).join('\n') : ''}

---
Generated by Smart CV Analyzer
Enhanced AI Service v${analysis.aiServiceVersion || '2.0.0'}
    `.trim();

    // Create a simple text file for now (in production, use a PDF library)
    const fileName = `enhanced_${analysis.uploadedFileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().slice(0, 10)}.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', Buffer.byteLength(enhancedContent));
    
    // Send the enhanced content
    res.send(enhancedContent);
    
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating enhanced resume'
    });
  }
});

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (minimal mode - no database required)`);
});