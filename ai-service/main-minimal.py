from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Smart CV Analyzer AI Service (Minimal)", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "AI Service is running (minimal mode)"}

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    jobRole: str = Form(...)
):
    try:
        # Read the uploaded file
        file_content = await file.read()
        
        # Extract text based on file type
        extracted_text = ""
        if file.content_type == "application/pdf":
            # For PDF files, we'll extract basic text (simplified)
            extracted_text = f"[PDF Content from {file.filename}]\n\nThis is a simplified text extraction. In a real implementation, you would use libraries like PyPDF2, pdfplumber, or pytesseract for OCR."
        elif file.content_type in ["image/jpeg", "image/jpg", "image/png"]:
            # For images, we'd use OCR (simplified)
            extracted_text = f"[Image OCR from {file.filename}]\n\nThis is a simplified OCR extraction. In a real implementation, you would use pytesseract or similar OCR libraries."
        else:
            extracted_text = f"Unsupported file type: {file.content_type}"
        
        # Simple text analysis (extract basic info)
        text_lower = extracted_text.lower()
        
        # Extract email (simple regex)
        import re
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', extracted_text)
        email = email_match.group() if email_match else "Not found"
        
        # Extract phone (simple regex)
        phone_match = re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', extracted_text)
        phone = phone_match.group() if phone_match else "Not found"
        
        # Extract name (first line or common patterns)
        lines = extracted_text.split('\n')
        name = lines[0].strip() if lines else "Not found"
        
        # Detect skills (common tech skills)
        common_skills = [
            "Python", "JavaScript", "Java", "C++", "React", "Node.js", "Angular", "Vue.js",
            "HTML", "CSS", "SQL", "MongoDB", "PostgreSQL", "Docker", "Kubernetes", "AWS",
            "Azure", "Git", "Linux", "Machine Learning", "Data Science", "AI", "TensorFlow",
            "PyTorch", "Pandas", "NumPy", "Flask", "Django", "Express", "Spring Boot"
        ]
        
        detected_skills = []
        for skill in common_skills:
            if skill.lower() in text_lower:
                detected_skills.append(skill)
        
        # Role suggestions based on detected skills
        role_suggestions = []
        if any(skill in detected_skills for skill in ["Python", "Machine Learning", "Data Science", "TensorFlow", "PyTorch", "Pandas"]):
            role_suggestions.extend(["Data Scientist", "Machine Learning Engineer", "AI Engineer"])
        if any(skill in detected_skills for skill in ["JavaScript", "React", "Angular", "Vue.js", "HTML", "CSS"]):
            role_suggestions.extend(["Frontend Developer", "Full Stack Developer", "Web Developer"])
        if any(skill in detected_skills for skill in ["Node.js", "Express", "Django", "Flask", "Spring Boot"]):
            role_suggestions.extend(["Backend Developer", "Full Stack Developer", "Software Engineer"])
        if any(skill in detected_skills for skill in ["Docker", "Kubernetes", "AWS", "Azure", "Linux"]):
            role_suggestions.extend(["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer"])
        if any(skill in detected_skills for skill in ["SQL", "MongoDB", "PostgreSQL"]):
            role_suggestions.extend(["Database Administrator", "Data Engineer", "Backend Developer"])
        
        # Remove duplicates and limit to top 3
        role_suggestions = list(dict.fromkeys(role_suggestions))[:3]
        
        if not role_suggestions:
            role_suggestions = ["Software Engineer", "Developer", "Technical Specialist"]
        
        # Calculate scores based on content
        structure_score = 85 if len(detected_skills) > 3 else 65
        skills_score = min(90, len(detected_skills) * 10)
        content_score = 80 if email != "Not found" and phone != "Not found" else 60
        ats_score = 75 if len(detected_skills) > 2 else 55
        
        overall_score = int((structure_score + skills_score + content_score + ats_score) / 4)
        
        return {
            "parsedText": extracted_text,
            "sections": {
                "contactInfo": {
                    "name": name,
                    "email": email,
                    "phone": phone
                },
                "education": "Education details would be extracted here",
                "skills": detected_skills,
                "experience": "Experience details would be extracted here",
                "projects": "Project details would be extracted here",
                "certifications": "Certifications would be extracted here"
            },
            "overallScore": overall_score,
            "scoreBreakdown": {
                "structureScore": structure_score,
                "skillsScore": skills_score,
                "contentScore": content_score,
                "atsCompatibility": ats_score
            },
            "issues": [
                "Consider adding more quantifiable achievements",
                "Include specific project metrics and results",
                "Add relevant certifications for your field"
            ],
            "suggestedKeywords": ["Agile", "Scrum", "CI/CD", "Testing", "Problem Solving"],
            "missingComponents": ["Professional summary could be enhanced"],
            "suggestedRoles": role_suggestions,
            "enhancedBullets": [
                {
                    "original": "worked on projects",
                    "improved": "developed and delivered high-impact projects that improved system performance by 25%",
                    "section": "projects"
                }
            ],
            "processingTime": 1200,
            "aiServiceVersion": "1.0.0-enhanced"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-resume")
async def generate_enhanced_resume(
    analysis_data: dict,
    accepted_enhancements: list = None
):
    # Mock PDF generation
    return {
        "file_path": "mock_resume.pdf",
        "filename": f"enhanced_{analysis_data.get('uploadedFileName', 'resume')}.pdf",
        "metadata": {
            "total_sections": 5,
            "has_contact_info": True,
            "skills_count": 4,
            "enhancement_count": 1,
            "overall_score": 75,
            "ats_optimized": True
        },
        "size_bytes": 1024
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)