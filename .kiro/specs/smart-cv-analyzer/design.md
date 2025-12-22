# Smart CV Analyzer Design Document

## Overview

The Smart CV Analyzer is a web-based application built using a MERN stack (MongoDB, Express.js, React, Node.js) with a dedicated Python AI microservice. The system processes resume documents through multiple AI/ML pipelines including OCR, NLP classification, ML-based scoring, and generative AI enhancement to provide comprehensive resume analysis and improvement recommendations.

## Architecture

The system follows a microservices architecture with clear separation between the web application layer and AI processing services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │   Node.js API   │    │   MongoDB       │
│   Frontend      │◄──►│   Server        │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Python AI     │
                       │   Microservice  │
                       │   (FastAPI)     │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   External AI   │
                       │   Services      │
                       │   (OpenAI/etc)  │
                       └─────────────────┘
```

### Technology Stack

**Frontend (React)**
- React 18 with Vite for fast development
- Tailwind CSS for responsive styling
- Axios for API communication
- React Hook Form for file upload handling

**Backend API (Node.js)**
- Express.js web framework
- Multer for multipart file upload processing
- Mongoose ODM for MongoDB interactions
- JWT for optional user authentication

**AI Service (Python)**
- FastAPI for high-performance API endpoints
- pytesseract + pdf2image for OCR processing
- transformers library with DistilBERT for section classification
- scikit-learn for ML scoring models
- OpenAI API for generative AI enhancements

**Database (MongoDB)**
- Document-based storage for flexible resume data
- GridFS for large file storage if needed
- Indexing on user IDs and analysis timestamps

## Components and Interfaces

### Frontend Components

**UploadResume Component**
- File input with drag-and-drop support
- Job role specification input
- Progress indicator during processing
- File validation (PDF, PNG, JPG formats)

**AnalysisResults Component**
- Score visualization with progress bars
- Tabbed interface for different analysis sections
- Side-by-side comparison of original vs enhanced content
- Downloadable enhanced resume generation

**Dashboard Component**
- Historical analysis listing
- Score trend visualization
- Quick re-analysis functionality

### Backend API Endpoints

```
POST /api/resume/upload
- Accepts multipart form data (file + jobRole)
- Returns analysis ID for tracking
- Forwards processing to Python AI service

GET /api/resume/analysis/:id
- Retrieves complete analysis results
- Includes scores, recommendations, enhancements

GET /api/resume/user/:userId
- Lists all analyses for a user
- Supports pagination and filtering

POST /api/resume/download/:id
- Generates enhanced resume PDF
- Returns downloadable file stream
```

### Python AI Service Interfaces

**OCR Processing Module**
```python
def extract_text_from_file(file_path: str) -> str
def preprocess_extracted_text(raw_text: str) -> str
```

**Section Classification Module**
```python
def classify_resume_sections(text: str) -> Dict[str, str]
def extract_contact_info(text: str) -> Dict[str, str]
def extract_skills_list(text: str) -> List[str]
```

**Scoring Engine Module**
```python
def calculate_resume_score(sections: Dict, job_role: str) -> int
def identify_missing_components(sections: Dict) -> List[str]
def suggest_keywords(sections: Dict, job_role: str) -> List[str]
```

**Enhancement Module**
```python
def enhance_bullet_points(project_text: str) -> List[Dict]
def improve_grammar_and_style(text: str) -> str
```

## Data Models

### Resume Analysis Document (MongoDB)

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Optional for guest users
  uploadedFileName: String,
  jobRole: String,
  uploadTimestamp: Date,
  
  // Extracted content
  parsedText: String,
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
  overallScore: Number, // 0-100
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
}
```

### User Document (MongoDB) - Optional

```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  createdAt: Date,
  analysisCount: Number,
  lastLoginAt: Date
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, I'll consolidate related properties to eliminate redundancy and create comprehensive correctness properties:

**Property Reflection:**
- OCR properties (1.1, 1.2) can be combined into a single text extraction property
- Section classification properties (2.1-2.4) can be consolidated into comprehensive section detection
- Scoring properties (3.1-3.5) overlap and can be streamlined
- Enhancement properties (5.1-5.5) have redundancy that can be eliminated
- Storage properties (7.1-7.3) can be combined into data persistence integrity

**Property 1: OCR Text Extraction Accuracy**
*For any* valid resume document (PDF or image format), extracting text using OCR should preserve all readable content without loss of information
**Validates: Requirements 1.1, 1.2**

**Property 2: File Format Validation**
*For any* uploaded file, if the format is not supported (not PDF, PNG, JPG, JPEG), the system should reject the upload and return an appropriate error message
**Validates: Requirements 1.3**

**Property 3: Section Classification Completeness**
*For any* resume text containing identifiable sections (contact, education, skills, projects, experience), the section classifier should detect and properly categorize all present sections
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

**Property 4: Score Boundary Compliance**
*For any* resume analysis, the calculated score should always be within the valid range of 0 to 100, regardless of resume quality or content
**Validates: Requirements 3.1**

**Property 5: Enhancement Content Preservation**
*For any* bullet point enhancement, the improved version should maintain all factual information from the original while improving language quality and impact
**Validates: Requirements 5.3**

**Property 6: Keyword Gap Analysis**
*For any* resume and target job role combination, if the resume lacks keywords relevant to that job role, the system should identify and suggest those missing keywords
**Validates: Requirements 4.2, 4.5**

**Property 7: Data Persistence Integrity**
*For any* completed analysis, storing the results should preserve all analysis components (scores, recommendations, enhancements, original content) such that retrieval returns identical data
**Validates: Requirements 7.1, 7.3**

**Property 8: Enhanced Resume Generation**
*For any* analysis with applied enhancements, generating the enhanced resume should produce a valid PDF document containing all accepted improvements and maintaining ATS-friendly formatting
**Validates: Requirements 8.1, 8.3, 8.4**

## Error Handling

### File Processing Errors
- **Invalid File Format**: Return HTTP 400 with specific format requirements
- **OCR Processing Failure**: Retry with different OCR parameters, fallback to manual text input option
- **File Size Limits**: Reject files over 10MB with clear size limit message
- **Corrupted Files**: Detect and handle corrupted PDFs/images gracefully

### AI Service Errors
- **External API Failures**: Implement retry logic with exponential backoff for GenAI services
- **Model Loading Errors**: Cache ML models locally, provide fallback scoring mechanisms
- **Processing Timeouts**: Set reasonable timeouts (30s for OCR, 60s for enhancement)
- **Rate Limiting**: Implement queue system for high-volume processing

### Data Validation Errors
- **Missing Required Fields**: Validate job role input, provide default analysis if missing
- **Malformed Resume Content**: Handle edge cases where OCR produces garbled text
- **Database Connection Issues**: Implement connection pooling and retry mechanisms

### User Experience Error Handling
- **Progress Indicators**: Show processing status for long-running operations
- **Graceful Degradation**: Provide partial results if some analysis components fail
- **Error Recovery**: Allow users to retry failed operations without re-uploading

## Testing Strategy

The Smart CV Analyzer requires a dual testing approach combining unit tests for specific functionality and property-based tests for universal correctness guarantees.

### Unit Testing Approach

Unit tests will verify specific examples and integration points:

**OCR Module Tests**
- Test extraction from sample PDF and image files
- Verify handling of different file formats and sizes
- Test error conditions with corrupted files

**Section Classification Tests**
- Test with known resume formats and section arrangements
- Verify contact information extraction accuracy
- Test edge cases with non-standard section headers

**Scoring Engine Tests**
- Test scoring with resumes of known quality levels
- Verify score component calculations
- Test boundary conditions and edge cases

**API Integration Tests**
- Test file upload and processing workflows
- Verify database storage and retrieval operations
- Test error handling and response formats

### Property-Based Testing Approach

Property-based tests will use **Hypothesis** (Python) for the AI service and **fast-check** (JavaScript) for the Node.js API to verify universal properties across all inputs.

**Configuration Requirements:**
- Each property-based test MUST run a minimum of 100 iterations
- Tests MUST be tagged with comments referencing design document properties
- Tag format: `**Feature: smart-cv-analyzer, Property {number}: {property_text}**`

**Property Test Implementation:**
- Generate random resume content with varying structures and quality levels
- Create diverse file formats and sizes for upload testing
- Generate random job roles and skill combinations for keyword analysis
- Test enhancement algorithms with various bullet point styles and content

**Test Data Generation:**
- Resume text generators with configurable sections and content quality
- File format generators for testing upload validation
- Job role and skill databases for keyword matching tests
- Bullet point generators with varying language quality levels

The combination of unit and property-based testing ensures both concrete functionality verification and comprehensive coverage of the input space, providing confidence in system correctness across all possible user interactions.