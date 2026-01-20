import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

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
            // For other file types, use placeholder
            extractedText = `[Content from ${file.originalname}]\n\nFile type: ${file.mimetype}`;
          }
        } catch (readError) {
          console.error('Error reading uploaded file:', readError);
          extractedText = `[Error reading ${file.originalname}]`;
        }
      }
      
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
        overallScore: Math.floor(Math.random() * 30) + 60, // 60-90 range
        scoreBreakdown: {
          structureScore: Math.floor(Math.random() * 20) + 70,
          skillsScore: Math.min(95, 40 + (extractedData.skills.length * 4)),
          contentScore: extractedData.email !== 'Not found' && extractedData.phone !== 'Not found' ? 85 : 65,
          atsCompatibility: extractedData.skills.length > 6 ? 85 : extractedData.skills.length > 3 ? 75 : 60
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
          ats_score: Math.floor(Math.random() * 15) + 75
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