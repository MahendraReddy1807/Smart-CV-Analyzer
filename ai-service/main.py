from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from modules.ocr_processor import OCRProcessor
from modules.section_classifier import SectionClassifier
from modules.scoring_engine import ScoringEngine
from modules.enhancement_engine import EnhancementEngine
from modules.recommendation_engine import RecommendationEngine
from modules.resume_generator import ResumeGenerator
from modules.keyword_analyzer import KeywordAnalyzer

load_dotenv()

app = FastAPI(title="Smart CV Analyzer AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI modules
ocr_processor = OCRProcessor()
section_classifier = SectionClassifier()
scoring_engine = ScoringEngine()
enhancement_engine = EnhancementEngine()
recommendation_engine = RecommendationEngine()
resume_generator = ResumeGenerator()
keyword_analyzer = KeywordAnalyzer()

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "AI Service is running"}

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    jobRole: str = Form(...)
):
    import time
    start_time = time.time()
    temp_file_path = None
    
    try:
        # Validate file type - Only PDF files allowed
        allowed_types = ['application/pdf']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file.content_type}. Only PDF files are allowed."
            )
        
        # Validate file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        content = await file.read()
        if len(content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size too large: {len(content)} bytes. Maximum allowed: {max_size} bytes"
            )
        
        # Save uploaded file temporarily
        temp_file_path = f"temp_{int(time.time())}_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(content)
        
        print(f"Processing file: {file.filename}, Size: {len(content)} bytes, Job Role: {jobRole}")
        
        # Extract text using OCR
        print("Starting OCR extraction...")
        extracted_text = ocr_processor.extract_text(temp_file_path)
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the file. Please ensure the file is readable and contains text."
            )
        
        print(f"OCR completed. Extracted {len(extracted_text)} characters")
        
        # Classify sections
        print("Starting section classification...")
        sections = section_classifier.classify_sections(extracted_text)
        
        # Calculate score
        print("Calculating resume score...")
        score_result = scoring_engine.calculate_score(sections, jobRole)
        
        # Analyze keywords and job role matching
        print("Analyzing keywords...")
        keyword_analysis = keyword_analyzer.analyze_keywords(sections, jobRole)
        
        # Generate recommendations
        print("Generating recommendations...")
        recommendations = recommendation_engine.generate_recommendations(sections, score_result)
        
        # Enhance bullet points
        print("Enhancing content...")
        enhancements = enhancement_engine.enhance_content(sections)
        
        processing_time = time.time() - start_time
        print(f"Analysis completed in {processing_time:.2f} seconds")
        
        return {
            "parsedText": extracted_text,
            "sections": sections,
            "overallScore": score_result["overall_score"],
            "scoreBreakdown": score_result["breakdown"],
            "issues": recommendations["issues"],
            "suggestedKeywords": keyword_analysis["missing_keywords"],
            "missingComponents": recommendations["missing_components"],
            "enhancedBullets": enhancements,
            "keywordAnalysis": keyword_analysis,
            "processingTime": processing_time,
            "aiServiceVersion": "1.0.0"
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                print(f"Cleaned up temp file: {temp_file_path}")
            except Exception as e:
                print(f"Failed to clean up temp file {temp_file_path}: {e}")

@app.post("/generate-resume")
async def generate_enhanced_resume(
    analysis_data: dict,
    accepted_enhancements: list = None
):
    try:
        # Generate enhanced resume PDF
        pdf_bytes = resume_generator.generate_enhanced_resume(
            analysis_data, 
            accepted_enhancements or []
        )
        
        # Save to temporary file
        filename = f"enhanced_resume_{analysis_data.get('uploadedFileName', 'resume')}.pdf"
        file_path = resume_generator.save_resume_to_file(pdf_bytes, filename)
        
        # Get metadata
        metadata = resume_generator.get_resume_metadata(analysis_data)
        
        return {
            "file_path": file_path,
            "filename": filename,
            "metadata": metadata,
            "size_bytes": len(pdf_bytes)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)