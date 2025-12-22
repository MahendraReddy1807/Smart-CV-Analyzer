import express from 'express';
import axios from 'axios';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import upload from '../middleware/upload.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Upload and analyze resume
router.post('/upload', 
  upload.single('file'),
  [
    body('jobRole')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Job role is required')
      .isLength({ max: 100 })
      .withMessage('Job role must be less than 100 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Check if file was uploaded
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

      // Call AI service with retry logic
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
      let aiResponse;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          aiResponse = await axios.post(`${aiServiceUrl}/analyze-resume`, formData, {
            headers: {
              ...formData.getHeaders(),
            },
            timeout: 90000, // 90 second timeout for AI processing
            onUploadProgress: (progressEvent) => {
              // Could emit progress via WebSocket in future
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`AI Service upload progress: ${progress}%`);
            }
          });
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.log(`AI service call attempt ${retryCount} failed:`, error.message);
          
          if (retryCount >= maxRetries) {
            throw error; // Re-throw after max retries
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      // Save analysis to database
      const analysis = new ResumeAnalysis({
        uploadedFileName: file.originalname,
        jobRole: jobRole,
        ...aiResponse.data
      });

      await analysis.save();

      res.json({
        success: true,
        data: analysis,
        message: 'Resume analyzed successfully'
      });

    } catch (error) {
      // Clean up uploaded file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('Resume upload error:', error);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'AI service is currently unavailable. Please try again later.'
        });
      }

      if (error.response && error.response.status === 422) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file format or corrupted file'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error processing resume',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get analysis by ID
router.get('/analysis/:id', async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analysis'
    });
  }
});

// Get user's analysis history
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await ResumeAnalysis.find({ userId: req.params.userId })
      .sort({ uploadTimestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-parsedText -enhancedBullets'); // Exclude large fields for list view

    const total = await ResumeAnalysis.countDocuments({ userId: req.params.userId });

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user analyses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user analyses'
    });
  }
});

// Download enhanced resume
router.post('/download/:id', async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    const { acceptedEnhancements = [] } = req.body;

    // Call AI service to generate enhanced resume
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    const generateResponse = await axios.post(`${aiServiceUrl}/generate-resume`, {
      analysis_data: analysis.toObject(),
      accepted_enhancements: acceptedEnhancements
    }, {
      timeout: 30000 // 30 second timeout
    });

    const { file_path, filename } = generateResponse.data;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(file_path);
    fileStream.pipe(res);
    
    // Clean up temp file after streaming
    fileStream.on('end', () => {
      fs.unlink(file_path, (err) => {
        if (err) console.error('Error cleaning up temp file:', err);
      });
    });

  } catch (error) {
    console.error('Download resume error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Resume generation service is currently unavailable'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error generating enhanced resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;