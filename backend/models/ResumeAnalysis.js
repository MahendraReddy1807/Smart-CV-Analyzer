import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest users
  },
  uploadedFileName: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  uploadTimestamp: {
    type: Date,
    default: Date.now
  },
  
  // Extracted content
  parsedText: {
    type: String,
    required: true
  },
  sections: {
    contactInfo: {
      name: String,
      email: String,
      phone: String,
      location: String
    },
    education: String,
    skills: [String],
    experience: String,
    projects: String,
    certifications: String
  },
  
  // Analysis results
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  scoreBreakdown: {
    structureScore: Number,
    skillsScore: Number,
    contentScore: Number,
    atsCompatibility: Number
  },
  
  // Recommendations
  issues: [String],
  suggestedKeywords: [String],
  missingComponents: [String],
  
  // Enhancements
  enhancedBullets: [{
    original: String,
    improved: String,
    section: String
  }],
  
  // Processing metadata
  processingTime: Number,
  aiServiceVersion: String
}, {
  timestamps: true
});

// Index for efficient querying
resumeAnalysisSchema.index({ userId: 1, uploadTimestamp: -1 });
resumeAnalysisSchema.index({ uploadTimestamp: -1 });

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);