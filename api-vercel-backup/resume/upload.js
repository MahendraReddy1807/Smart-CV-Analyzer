// Vercel Serverless Function - Resume Upload and Analysis
import formidable from 'formidable';
import fs from 'fs';

// Configure formidable for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// In-memory storage for demo (use database in production)
let analyses = [];
let analysisCounter = 1;

// Mock AI Analysis Function (simplified for serverless)
function generateMockAnalysis(fileName, jobRole, fileContent) {
  const mockAnalysis = {
    _id: analysisCounter++,
    uploadedFileName: fileName,
    jobRole: jobRole,
    uploadTimestamp: new Date(),
    parsedText: fileContent || "Sample resume content extracted from uploaded file",
    sections: {
      contactInfo: {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        location: "New York, NY",
        linkedin: "linkedin.com/in/johndoe"
      },
      education: "Bachelor's Degree in Computer Science",
      skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
      experience: "3+ years of software development experience",
      projects: "Multiple full-stack web applications",
      certifications: "AWS Certified Developer"
    },
    overallScore: Math.floor(Math.random() * 20) + 70, // 70-90 range
    scoreBreakdown: {
      contactScore: Math.floor(Math.random() * 20) + 80,
      contentScore: Math.floor(Math.random() * 20) + 75,
      skillsScore: Math.floor(Math.random() * 20) + 85,
      structureScore: Math.floor(Math.random() * 20) + 70,
      atsCompatibility: Math.floor(Math.random() * 20) + 75
    },
    suggestedRoles: [
      {
        role: jobRole,
        score: 5,
        match_percentage: 85,
        matched_skills: ["JavaScript", "React", "Node.js"],
        missing_skills: ["Docker", "AWS", "TypeScript"]
      },
      {
        role: "Full Stack Developer",
        score: 4,
        match_percentage: 78,
        matched_skills: ["JavaScript", "React", "SQL"],
        missing_skills: ["MongoDB", "Express", "Git"]
      }
    ],
    jobMarketData: {
      openings: 1250,
      avg_salary: "$85,000 - $120,000",
      growth_rate: "15%",
      top_companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
      required_skills: ["JavaScript", "React", "Node.js", "Python"],
      experience_level: "Mid-level (3-5 years)"
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
    detailedFeedback: {
      issues: ["Could use more quantified achievements", "Missing some keywords"],
      suggestions: ["Add metrics to accomplishments", "Include more technical terms"]
    },
    issues: ["Could use more quantified achievements", "Missing some keywords"],
    suggestedKeywords: ["Agile", "Scrum", "CI/CD", "Testing", "Problem Solving", "Leadership"],
    missingComponents: ["Portfolio links", "Certifications", "Volunteer work"],
    enhancedBullets: [
      {
        original: "worked on projects",
        improved: "developed and delivered 5+ high-impact projects that improved system performance by 25%",
        section: "projects"
      },
      {
        original: "responsible for tasks",
        improved: "led cross-functional teams of 3-5 members to deliver critical business objectives, resulting in 30% efficiency improvement",
        section: "experience"
      }
    ],
    processingTime: 1500,
    aiServiceVersion: "2.0.0-vercel",
    timestamp: new Date().toISOString()
  };

  analyses.push(mockAnalysis);
  return mockAnalysis;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const jobRole = Array.isArray(fields.jobRole) ? fields.jobRole[0] : fields.jobRole;
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required'
      });
    }

    // Read file content (simplified - in production, use proper text extraction)
    let fileContent = '';
    try {
      if (uploadedFile.mimetype === 'text/plain') {
        fileContent = fs.readFileSync(uploadedFile.filepath, 'utf8');
      } else {
        fileContent = `Content extracted from ${uploadedFile.originalFilename}`;
      }
    } catch (error) {
      console.error('File reading error:', error);
      fileContent = 'Sample resume content';
    }

    // Generate mock analysis
    const analysis = generateMockAnalysis(
      uploadedFile.originalFilename || 'resume.pdf',
      jobRole,
      fileContent
    );

    // Clean up uploaded file
    try {
      fs.unlinkSync(uploadedFile.filepath);
    } catch (error) {
      console.error('File cleanup error:', error);
    }

    res.status(200).json(analysis);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}