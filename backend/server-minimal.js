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
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { jobRole } = req.body;
    const file = req.file;

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
      ...aiResponse.data
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

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please make sure it is running on port 8002.'
      });
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
    const analysis = analyses.find(a => a._id == req.params.id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

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
    res.json(analyses);
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