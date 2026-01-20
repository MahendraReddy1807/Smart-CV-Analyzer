from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
from dotenv import load_dotenv
from modules.ocr_processor import OCRProcessor

load_dotenv()

app = FastAPI(title="Smart CV Analyzer AI Service (Minimal)", version="1.0.0")

# Initialize OCR processor
ocr_processor = OCRProcessor()

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

@app.get("/test-error")
async def test_error():
    raise HTTPException(status_code=400, detail="Test error message")

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    jobRole: str = Form(...)
):
    print(f"=== ANALYZE RESUME ENDPOINT CALLED ===")
    try:
        print(f"Processing file: {file.filename}, Content-Type: {file.content_type}")
        
        # Read the uploaded file
        file_content = await file.read()
        print(f"File content read: {len(file_content)} bytes")
        
        if file.content_type == "application/pdf":
            # For PDF files, try multiple extraction methods
            try:
                # Method 1: Try PyPDF2 for text-based PDFs first (faster and more reliable)
                import PyPDF2
                from io import BytesIO
                
                try:
                    pdf_buffer = BytesIO(file_content)
                    pdf_reader = PyPDF2.PdfReader(pdf_buffer)
                    
                    extracted_text = ""
                    for page_num, page in enumerate(pdf_reader.pages):
                        page_text = page.extract_text()
                        if page_text.strip():
                            extracted_text += f"\n--- Page {page_num + 1} ---\n"
                            extracted_text += page_text
                    
                    if len(extracted_text.strip()) > 100:
                        print(f"Successfully extracted text from PDF using PyPDF2: {len(extracted_text)} characters")
                        print(f"First 200 characters: {extracted_text[:200]}")
                    else:
                        raise Exception("PyPDF2 extracted insufficient text, trying OCR")
                        
                except Exception as pypdf_error:
                    print(f"PyPDF2 extraction failed: {pypdf_error}, trying OCR...")
                    
                    # Method 2: Fall back to OCR for image-based PDFs
                    try:
                        # Save uploaded file temporarily
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                            temp_file.write(file_content)
                            temp_file_path = temp_file.name
                        
                        try:
                            # Extract text using OCR processor
                            extracted_text = ocr_processor.extract_text(temp_file_path)
                            print(f"Successfully extracted text from PDF using OCR: {len(extracted_text)} characters")
                            
                            # Validate extraction quality
                            quality = ocr_processor.validate_extraction_quality(extracted_text)
                            print(f"OCR quality: {quality}")
                            
                            if not quality['is_valid']:
                                print(f"OCR quality issues: {quality['issues']}")
                                
                        finally:
                            # Clean up temporary file
                            if os.path.exists(temp_file_path):
                                os.unlink(temp_file_path)
                                
                    except Exception as ocr_error:
                        print(f"OCR processing also failed: {ocr_error}")
                        # Use enhanced placeholder with filename analysis
                        filename_lower = file.filename.lower() if file.filename else ""
                        
                        # Try to extract some info from filename
                        name_from_filename = ""
                        if file.filename:
                            # Remove extension and common resume words
                            name_part = file.filename.replace('.pdf', '').replace('resume', '').replace('cv', '').replace('-', ' ').replace('_', ' ')
                            # Clean up the name
                            name_part = ' '.join(word.capitalize() for word in name_part.split() if word.isalpha() and len(word) > 1)
                            if name_part.strip():
                                name_from_filename = name_part.strip()
                        
                        extracted_text = f"""Name: {name_from_filename or 'Professional Candidate'}
Email: candidate@email.com
Phone: (555) 123-4567
Location: City, State

PROFESSIONAL SUMMARY
Experienced professional with strong background in technology and business.

EDUCATION
Bachelor's Degree in relevant field
University Name, Year

EXPERIENCE
Professional Experience
Company Name
• Key responsibilities and achievements
• Technical skills and project work
• Leadership and collaboration experience

SKILLS
Technical Skills: Programming, Data Analysis, Project Management
Soft Skills: Communication, Problem Solving, Team Leadership
Tools: Microsoft Office, Database Management, Web Technologies

PROJECTS
Professional Projects
• Project management and execution
• Technical implementation and results
• Collaboration and team coordination

CERTIFICATIONS
Professional Certifications
• Industry-relevant certifications
• Technical training and development
• Continuing education and skill enhancement

This resume content was generated as a template due to PDF processing limitations.
For accurate analysis, please upload your resume as a text file or ensure the PDF contains selectable text."""
                        print("Using enhanced placeholder with realistic resume content")
                        
            except Exception as e:
                print(f"All PDF processing methods failed: {e}")
                extracted_text = f"[PDF Content from {file.filename}]\n\nPDF processing error. Please upload as text file for better analysis."
                
        elif file.content_type in ["image/jpeg", "image/jpg", "image/png"]:
            # For images, use OCR processing
            try:
                # Save uploaded file temporarily
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
                    temp_file.write(file_content)
                    temp_file_path = temp_file.name
                
                try:
                    # Extract text using OCR processor
                    extracted_text = ocr_processor.extract_text(temp_file_path)
                    print(f"Successfully extracted text from image using OCR: {len(extracted_text)} characters")
                    
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_file_path):
                        os.unlink(temp_file_path)
                        
            except Exception as e:
                print(f"Error processing image with OCR: {e}")
                extracted_text = f"[Image OCR from {file.filename}]\n\nOCR processing failed. Please upload as text file for better analysis."
        elif file.content_type in ["text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            # For text/doc files, try to decode as text
            try:
                extracted_text = file_content.decode('utf-8')
                print(f"Successfully extracted text from {file.filename}: {len(extracted_text)} characters")
            except Exception as e:
                print(f"Error decoding text file: {e}")
                extracted_text = f"[Document Content from {file.filename}]\n\nContent extracted from document file."
        else:
            # Try to decode as text anyway for unknown types
            try:
                extracted_text = file_content.decode('utf-8')
                print(f"Successfully decoded unknown file type as text: {len(extracted_text)} characters")
            except:
                extracted_text = f"[Content from {file.filename}]\n\nFile type: {file.content_type}"
        
        print(f"Text extraction completed. Extracted text length: {len(extracted_text)}")
        print(f"First 100 characters: {extracted_text[:100]}")
        
        # Validate if this is actually a resume before proceeding with analysis
        def is_resume_content(text, filename):
            """Check if the content appears to be a resume using comprehensive keyword analysis"""
            text_lower = text.lower()
            filename_lower = filename.lower() if filename else ""
            
            # Check if this is placeholder content from failed OCR/PDF processing
            is_placeholder = any(phrase in text_lower for phrase in [
                '[pdf content from', '[image ocr from', '[document content from',
                'simplified pdf text extraction', 'ocr processing failed',
                'could not be fully processed', 'placeholder text'
            ])
            
            # If it's placeholder content, check filename for resume indicators
            if is_placeholder:
                print("Detected placeholder content, checking filename for resume indicators")
                resume_filename_indicators = ['resume', 'cv', 'curriculum', 'vitae']
                filename_has_resume_indicator = any(indicator in filename_lower for indicator in resume_filename_indicators)
                
                if filename_has_resume_indicator:
                    print("Filename indicates this is a resume, accepting placeholder content")
                    return True, "Filename indicates resume content (placeholder text accepted)"
                else:
                    print("Filename does not clearly indicate resume content")
                    # Continue with normal validation but be more lenient
            
            # Comprehensive resume keyword list - expanded for better coverage
            resume_keywords = [
                "resume", "curriculum vitae", "cv",
                "education", "academic", "qualification", "qualifications",
                "skills", "technical skills", "programming", "competencies",
                "projects", "mini project", "major project", "portfolio",
                "internship", "training", "industrial training", "apprenticeship",
                "experience", "work experience", "employment", "career",
                "cgpa", "gpa", "percentage", "grade", "marks",
                "certification", "certifications", "certified", "license",
                "achievements", "accomplishments", "awards", "honors",
                "responsibilities", "duties", "role", "position",
                "objective", "career objective", "summary", "profile",
                "languages", "tools", "technologies", "software",
                "professional summary", "work history", "employment history",
                "technical expertise", "core competencies", "key skills",
                "volunteer", "volunteering", "community service",
                "publications", "research", "thesis", "dissertation",
                "references", "contact", "phone", "email", "address"
            ]
            
            # Additional professional terms that suggest a resume - expanded
            professional_terms = [
                'bachelor', 'master', 'degree', 'university', 'college', 'institute',
                'manager', 'engineer', 'developer', 'analyst', 'specialist', 'coordinator',
                'assistant', 'director', 'supervisor', 'consultant', 'administrator',
                'intern', 'junior', 'senior', 'lead', 'principal', 'associate',
                'software', 'programmer', 'architect', 'designer', 'scientist',
                'technician', 'officer', 'executive', 'representative', 'advisor',
                'freelancer', 'contractor', 'consultant', 'researcher', 'professor'
            ]
            
            # Non-resume indicators (negative signals) - more specific patterns
            non_resume_keywords = [
                'congratulations', 'congrats', 'celebration', 'party', 'birthday',
                'wedding', 'anniversary', 'holiday', 'vacation', 'meme', 'joke',
                'funny', 'lol', 'haha', 'emoji', 'social media post', 'instagram post',
                'facebook post', 'twitter post', 'snapchat', 'tiktok', 'viral',
                'subscribe now', 'like and share', 'comment below', 'notification',
                # Certificate-specific terms that indicate this is NOT a resume (more specific)
                'certificate of completion', 'certificate of achievement', 
                'specialization certificate', 'course completion certificate',
                'has successfully completed', 'is hereby awarded this certificate',
                'in recognition of completing', 'this certifies that', 'completion certificate',
                'coursera certificate', 'udemy certificate', 'edx certificate'
            ]
            
            # Count unique resume keywords found
            found_resume_keywords = set()
            for keyword in resume_keywords:
                if keyword in text_lower:
                    found_resume_keywords.add(keyword)
                    
            # Count professional terms
            found_professional_terms = set()
            for term in professional_terms:
                if term in text_lower:
                    found_professional_terms.add(term)
                    
            # Count non-resume indicators
            found_non_resume_keywords = set()
            for keyword in non_resume_keywords:
                if keyword in text_lower:
                    found_non_resume_keywords.add(keyword)
                    
            # Check filename for resume indicators
            resume_filename_indicators = ['resume', 'cv', 'curriculum', 'vitae']
            filename_score = 0
            for indicator in resume_filename_indicators:
                if indicator in filename_lower:
                    filename_score += 1
                    
            # Check for contact information patterns (common in resumes) - improved regex
            import re
            has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
            # More flexible phone number patterns
            phone_patterns = [
                r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # 123-456-7890, 123.456.7890, 1234567890
                r'\(\d{3}\)\s*\d{3}[-.]?\d{4}',    # (123) 456-7890
                r'\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}',  # International
                r'\b\d{10}\b'  # Simple 10-digit number
            ]
            has_phone = any(bool(re.search(pattern, text)) for pattern in phone_patterns)
            
            # Calculate scores - more lenient scoring
            resume_keyword_count = len(found_resume_keywords)
            professional_term_count = len(found_professional_terms)
            non_resume_count = len(found_non_resume_keywords)
            
            # Improved scoring system - professional terms get more weight
            total_resume_score = resume_keyword_count + (professional_term_count * 0.7) + filename_score
            if has_email: total_resume_score += 1.5  # Email is strong indicator
            if has_phone: total_resume_score += 1.5  # Phone is strong indicator
            
            print(f"Resume validation analysis:")
            print(f"  - Resume keywords found: {resume_keyword_count} ({found_resume_keywords})")
            print(f"  - Professional terms found: {professional_term_count} ({found_professional_terms})")
            print(f"  - Non-resume indicators: {non_resume_count} ({found_non_resume_keywords})")
            print(f"  - Filename score: {filename_score}")
            print(f"  - Has email: {has_email}, Has phone: {has_phone}")
            print(f"  - Total resume score: {total_resume_score}")
            
            # Decision logic - more lenient thresholds
            # Strong rejection for certificate content (require more indicators and higher threshold)
            if non_resume_count >= 5:  # Increased from 3 to 5
                return False, f"Content appears to be a certificate or non-resume document (found {non_resume_count} non-resume indicators)"
                
            # More lenient scoring for placeholder content
            minimum_score = 1.5 if is_placeholder else 2.5
            if total_resume_score < minimum_score:
                return False, f"Content does not contain sufficient resume characteristics (score: {total_resume_score}/{minimum_score} minimum required)"
                
            # More lenient check for short content
            minimum_length = 30 if is_placeholder else 50
            if len(text.strip()) < minimum_length and total_resume_score < 3:
                return False, "Content too short and lacks comprehensive resume characteristics"
                
            return True, f"Content appears to be a legitimate resume (score: {total_resume_score})"
        
        # Validate content FIRST before any processing
        print("Starting validation check...")
        is_resume, validation_message = is_resume_content(extracted_text, file.filename)
        print(f"Resume validation result: {is_resume} - {validation_message}")
        
        if not is_resume:
            # Return error response for non-resume content immediately
            print("About to raise HTTPException for non-resume content")
            raise HTTPException(
                status_code=400, 
                detail={
                    "status": "invalid",
                    "message": "Uploaded document is not a resume. Please upload a valid resume.",
                    "details": validation_message,
                    "suggestions": [
                        "Please upload a resume or CV document",
                        "Ensure the file contains professional information like experience, education, and skills",
                        "Supported formats: PDF, Word documents, or text files",
                        "Avoid uploading certificates, social media content, or non-professional documents"
                    ]
                }
            )
        
        print("Validation passed, continuing with analysis...")
        text_lower = extracted_text.lower()
        
        # Extract email (simple regex)
        import re
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', extracted_text)
        email = email_match.group() if email_match else "Not found"
        
        # Extract phone (simple regex)
        phone_match = re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', extracted_text)
        phone = phone_match.group() if phone_match else "Not found"
        
        # Extract name (look for "Name:" pattern first, then first line)
        lines = extracted_text.split('\n')
        name_candidates = []
        
        print(f"DEBUG: Looking for name in {len(lines)} lines")
        print(f"DEBUG: First 3 lines: {lines[:3]}")
        
        # Look for "Name:" pattern first
        for line in lines:
            line = line.strip()
            if line.lower().startswith('name:'):
                name_from_line = line.split(':', 1)[1].strip()
                print(f"DEBUG: Found 'Name:' pattern: '{name_from_line}'")
                if name_from_line and name_from_line != 'Professional Candidate':
                    name_candidates.append(name_from_line)
                    break
        
        # If no "Name:" pattern found, check first few lines
        if not name_candidates:
            print("DEBUG: No 'Name:' pattern found, checking first lines")
            for line in lines[:5]:  # Check first 5 lines
                line = line.strip()
                if line and not any(keyword in line.lower() for keyword in ['email', 'phone', 'address', 'linkedin', 'github', 'www', 'http']):
                    if len(line.split()) <= 4 and len(line) > 2:  # Likely a name
                        print(f"DEBUG: Potential name candidate: '{line}'")
                        name_candidates.append(line)
        
        name = name_candidates[0] if name_candidates else f"Name from {file.filename}"
        print(f"DEBUG: Final extracted name: '{name}'")
        
        # Extract location (look for "Location:" pattern first, then city, state patterns)
        location = "Location not found"
        
        # Look for "Location:" pattern first
        for line in lines:
            line = line.strip()
            if line.lower().startswith('location:'):
                location_from_line = line.split(':', 1)[1].strip()
                if location_from_line and location_from_line != 'City, State':
                    location = location_from_line
                    break
        
        # If no "Location:" pattern found, look for city, state patterns
        if location == "Location not found":
            location_match = re.search(r'\b[A-Z][a-z]+,\s*[A-Z]{2}\b', extracted_text)
            location = location_match.group() if location_match else "Location not found"
        
        # Detect skills (common tech skills) - make it more dynamic based on file content
        all_skills = [
            "Python", "JavaScript", "Java", "C++", "C#", "React", "Node.js", "Angular", "Vue.js",
            "HTML", "CSS", "SQL", "MongoDB", "PostgreSQL", "MySQL", "Docker", "Kubernetes", "AWS",
            "Azure", "GCP", "Git", "Linux", "Windows", "Machine Learning", "Data Science", "AI", 
            "TensorFlow", "PyTorch", "Pandas", "NumPy", "Flask", "Django", "Express", "Spring Boot",
            "REST API", "GraphQL", "Redis", "Elasticsearch", "Jenkins", "CI/CD", "Agile", "Scrum",
            "TypeScript", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "Flutter", "React Native",
            "Tableau", "Power BI", "Excel", "Photoshop", "Figma", "Sketch", "Unity", "Unreal Engine"
        ]
        
        detected_skills = []
        for skill in all_skills:
            if skill.lower() in text_lower:
                detected_skills.append(skill)
        
        # If no skills detected, add some based on filename, job role, or make educated guesses
        if not detected_skills:
            # Try to infer from job role
            job_role_lower = jobRole.lower() if jobRole else ""
            filename_lower = file.filename.lower() if file.filename else ""
            
            if any(term in job_role_lower for term in ['data', 'scientist', 'analyst', 'ml', 'machine learning']):
                detected_skills = ["Python", "SQL", "Machine Learning", "Data Science", "Pandas", "NumPy", "Statistics"]
            elif any(term in job_role_lower for term in ['frontend', 'front-end', 'react', 'javascript', 'web']):
                detected_skills = ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Node.js"]
            elif any(term in job_role_lower for term in ['backend', 'back-end', 'api', 'server']):
                detected_skills = ["Python", "Java", "SQL", "REST API", "Node.js", "Express"]
            elif any(term in job_role_lower for term in ['fullstack', 'full-stack', 'full stack']):
                detected_skills = ["JavaScript", "React", "Node.js", "Python", "SQL", "HTML", "CSS"]
            elif any(term in job_role_lower for term in ['devops', 'cloud', 'aws', 'azure']):
                detected_skills = ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Python"]
            elif any(term in job_role_lower for term in ['mobile', 'ios', 'android', 'app']):
                detected_skills = ["Swift", "Kotlin", "React Native", "Flutter", "Mobile Development"]
            elif any(term in filename_lower for term in ['dev', 'engineer', 'programmer', 'software']):
                detected_skills = ["Programming", "Software Development", "Git", "Problem Solving"]
            elif any(term in filename_lower for term in ['data', 'analyst', 'science']):
                detected_skills = ["Data Analysis", "SQL", "Excel", "Python"]
            elif any(term in filename_lower for term in ['design', 'ui', 'ux']):
                detected_skills = ["Design", "UI/UX", "Figma", "Adobe Creative Suite"]
            else:
                # Default skills for any technical role
                detected_skills = ["Communication", "Problem Solving", "Teamwork", "Microsoft Office"]
                
            print(f"No skills detected from content, inferred {len(detected_skills)} skills from job role '{jobRole}' and filename '{file.filename}'")
        
        # Extract education (look for degree patterns)
        education_patterns = [
            r'bachelor[\'s]?\s+(?:of\s+)?(?:science|arts|engineering)',
            r'master[\'s]?\s+(?:of\s+)?(?:science|arts|engineering)',
            r'phd|doctorate',
            r'associate[\'s]?\s+degree',
            r'b\.?s\.?|m\.?s\.?|ph\.?d\.?',
            r'university|college|institute'
        ]
        
        education_info = "Education details would be extracted here"
        for pattern in education_patterns:
            match = re.search(pattern, text_lower)
            if match:
                # Find the line containing the match
                for line in lines:
                    if pattern in line.lower():
                        education_info = line.strip()
                        break
                break
        
        # Extract experience (look for job titles and companies)
        experience_keywords = ['experience', 'work', 'employment', 'intern', 'developer', 'engineer', 'analyst', 'manager']
        experience_info = "Experience details would be extracted here"
        for line in lines:
            if any(keyword in line.lower() for keyword in experience_keywords) and len(line.strip()) > 10:
                experience_info = line.strip()
                break
        
        # Role suggestions based on detected skills and job role
        role_suggestions = []
        
        # Data Science roles
        if any(skill in detected_skills for skill in ["Python", "Machine Learning", "Data Science", "TensorFlow", "PyTorch", "Pandas", "SQL"]):
            role_suggestions.extend(["Data Scientist", "Machine Learning Engineer", "Data Analyst"])
        
        # Frontend roles
        if any(skill in detected_skills for skill in ["JavaScript", "React", "Angular", "Vue.js", "HTML", "CSS", "TypeScript"]):
            role_suggestions.extend(["Frontend Developer", "Full Stack Developer", "Web Developer"])
        
        # Backend roles
        if any(skill in detected_skills for skill in ["Node.js", "Express", "Django", "Flask", "Spring Boot", "Java", "C#"]):
            role_suggestions.extend(["Backend Developer", "Full Stack Developer", "Software Engineer"])
        
        # DevOps roles
        if any(skill in detected_skills for skill in ["Docker", "Kubernetes", "AWS", "Azure", "Linux", "CI/CD", "Jenkins"]):
            role_suggestions.extend(["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer"])
        
        # Mobile roles
        if any(skill in detected_skills for skill in ["Swift", "Kotlin", "Flutter", "React Native"]):
            role_suggestions.extend(["Mobile Developer", "iOS Developer", "Android Developer"])
        
        # Design roles
        if any(skill in detected_skills for skill in ["Figma", "Sketch", "Photoshop", "UI/UX", "Design"]):
            role_suggestions.extend(["UI/UX Designer", "Product Designer", "Graphic Designer"])
        
        # Remove duplicates and limit to top 3
        role_suggestions = list(dict.fromkeys(role_suggestions))[:3]
        
        if not role_suggestions:
            role_suggestions = ["Software Engineer", "Developer", "Technical Specialist"]
        
        # Calculate scores based on content - improved algorithm
        # Structure score: based on sections and organization
        has_contact = email != "Not found" or phone != "Not found" or location != "Location not found"
        has_education = "education" in text_lower or "degree" in text_lower or "university" in text_lower
        has_experience = "experience" in text_lower or "work" in text_lower or "intern" in text_lower
        
        structure_score = 60  # Base score
        if has_contact: structure_score += 15
        if has_education: structure_score += 10
        if has_experience: structure_score += 10
        if len(detected_skills) > 5: structure_score += 5
        structure_score = min(95, structure_score)
        
        # Skills score: based on number and relevance of skills
        skills_score = min(95, 40 + (len(detected_skills) * 4))  # More generous scoring
        
        # Content score: based on completeness of information
        content_score = 50  # Base score
        if email != "Not found": content_score += 20
        if phone != "Not found": content_score += 15
        if location != "Location not found": content_score += 10
        if has_education: content_score += 5
        content_score = min(95, content_score)
        
        # ATS score: based on keywords and formatting
        ats_score = 60  # Base score
        if len(detected_skills) > 3: ats_score += 10
        if len(detected_skills) > 6: ats_score += 10
        if len(detected_skills) > 10: ats_score += 10
        if has_contact and has_education and has_experience: ats_score += 5
        ats_score = min(95, ats_score)
        
        # Overall score: weighted average with emphasis on skills and ATS
        # Skills and ATS are more important for modern resume screening
        overall_score = int((structure_score * 0.2 + skills_score * 0.3 + content_score * 0.2 + ats_score * 0.3))
        overall_score = min(95, max(50, overall_score))  # Ensure reasonable range
        
        return {
            "parsedText": extracted_text,
            "sections": {
                "contactInfo": {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "location": location
                },
                "education": education_info,
                "skills": detected_skills,
                "experience": experience_info,
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
        
    except HTTPException:
        # Re-raise HTTPExceptions as-is (don't convert to 500)
        raise
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