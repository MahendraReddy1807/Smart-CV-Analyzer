"""
Professional ATS-Grade Resume Classifier
Validates whether an uploaded document is a Resume (CV) or Non-Resume document
"""

import re
import json
from typing import Dict, List, Tuple


class ATSResumeClassifier:
    """
    Professional ATS-grade resume classifier that validates documents
    before running ATS scoring using strict professional logic.
    """
    
    def __init__(self):
        # Define resume trigger categories with professional ATS keywords
        self.resume_categories = {
            'CORE_RESUME_IDENTITY': {
                'keywords': [
                    'resume', 'cv', 'curriculum vitae', 'bio-data', 'biodata',
                    'professional profile', 'career summary', 'profile summary'
                ],
                'weight': 10,  # Very high weight for core identity
                'category_bonus': 3
            },
            'EDUCATION_SIGNALS': {
                'keywords': [
                    'education', 'qualification', 'academic', 'degree',
                    'b.e', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 'diploma',
                    'cgpa', 'gpa', 'percentage', 'university', 'college', 'school',
                    'bachelor', 'master', 'phd', 'doctorate', 'graduate',
                    'undergraduate', 'postgraduate', 'mba', 'bba'
                ],
                'weight': 1,
                'category_bonus': 3
            },
            'EXPERIENCE_SIGNALS': {
                'keywords': [
                    'experience', 'work experience', 'employment', 'internship',
                    'intern', 'job role', 'designation', 'company', 'organization',
                    'responsibilities', 'worked at', 'position', 'role',
                    'employment history', 'work history', 'professional experience',
                    'career', 'tenure', 'duration'
                ],
                'weight': 1,
                'category_bonus': 3
            },
            'SKILLS_SIGNALS': {
                'keywords': [
                    'skills', 'technical skills', 'soft skills', 'programming',
                    'languages', 'frameworks', 'tools', 'technologies',
                    'python', 'java', 'sql', 'html', 'css', 'javascript',
                    'machine learning', 'data science', 'competencies',
                    'expertise', 'proficiency', 'abilities', 'capabilities'
                ],
                'weight': 1,
                'category_bonus': 3
            },
            'PROJECTS_ACHIEVEMENTS': {
                'keywords': [
                    'projects', 'mini project', 'major project', 'final year project',
                    'achievements', 'awards', 'certifications', 'hackathon',
                    'competition', 'portfolio', 'accomplishments', 'honors',
                    'recognition', 'publications', 'research'
                ],
                'weight': 1,
                'category_bonus': 3
            },
            'CONTACT_IDENTITY': {
                'keywords': [
                    'email', 'phone', 'mobile', 'contact', 'linkedin',
                    'github', 'portfolio', 'address', 'location',
                    'website', 'profile', 'social'
                ],
                'weight': 1,
                'category_bonus': 3
            },
            'RESUME_SECTIONS': {
                'keywords': [
                    'objective', 'career objective', 'summary', 'profile',
                    'strengths', 'hobbies', 'interests', 'declaration',
                    'references', 'personal details', 'about me',
                    'professional summary', 'career goals'
                ],
                'weight': 1,
                'category_bonus': 3
            }
        }
        
        # Non-resume indicators (negative signals)
        self.non_resume_indicators = [
            'certificate of completion', 'certificate of achievement',
            'course completion', 'training certificate', 'marksheet',
            'transcript', 'offer letter', 'appointment letter',
            'salary slip', 'pay stub', 'invoice', 'receipt',
            'syllabus', 'curriculum', 'course outline', 'lesson plan',
            'project report', 'thesis', 'dissertation', 'research paper',
            'id card', 'identity card', 'passport', 'driving license',
            'congratulations', 'celebration', 'party invitation',
            'social media post', 'facebook post', 'twitter post',
            'instagram post', 'blog post', 'article', 'news',
            'meeting notes', 'agenda', 'minutes', 'memo',
            'policy document', 'manual', 'handbook', 'guide',
            # Company list indicators
            'top companies', 'list of companies', 'mnc companies', 'company list',
            'companies in india', 'best companies', 'fortune 500', 'company directory',
            'company names', 'organization list', 'corporate directory', 'business directory',
            'company profiles', 'company information', 'company details',
            # Job listing indicators  
            'job openings', 'career opportunities', 'job vacancies', 'hiring now',
            'apply now', 'job description', 'job requirements', 'job posting',
            # Permission/Authorization letters
            'permission letter', 'authorization letter', 'approval letter',
            'consent letter', 'clearance letter', 'recommendation letter',
            'reference letter', 'verification letter', 'confirmation letter',
            # Event/Competition documents
            'hackathon', 'competition', 'event registration', 'participation',
            'team registration', 'event details', 'competition guidelines'
        ]
    
    def normalize_text(self, text: str) -> str:
        """
        STEP 1: TEXT NORMALIZATION
        Convert to lowercase, remove punctuation, treat as raw text
        """
        if not text:
            return ""
        
        # Convert to lowercase
        normalized = text.lower()
        
        # Remove excessive whitespace and normalize
        normalized = re.sub(r'\s+', ' ', normalized)
        
        # Remove special characters but keep spaces for word boundaries
        normalized = re.sub(r'[^\w\s@.-]', ' ', normalized)
        
        return normalized.strip()
    
    def extract_keywords_and_score(self, normalized_text: str) -> Tuple[Dict, int, List[str]]:
        """
        STEP 2 & 3: SEARCH FOR RESUME TRIGGER CATEGORIES AND SCORING
        Scan document for resume-specific keyword groups and calculate score
        """
        total_score = 0
        detected_sections = []
        found_keywords = []
        category_matches = {}
        
        # Check each category
        for category_name, category_data in self.resume_categories.items():
            keywords_found_in_category = []
            category_keyword_count = 0
            
            # Search for each keyword in the category
            for keyword in category_data['keywords']:
                # Use word boundaries to avoid partial matches
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                matches = re.findall(pattern, normalized_text)
                
                if matches:
                    keywords_found_in_category.append(keyword)
                    category_keyword_count += len(matches)
                    found_keywords.extend([keyword] * len(matches))
            
            # If any keywords found in this category
            if keywords_found_in_category:
                detected_sections.append(category_name.replace('_', ' ').title())
                category_matches[category_name] = keywords_found_in_category
                
                # Add points for each keyword occurrence
                keyword_points = category_keyword_count * category_data['weight']
                
                # Add category bonus (3 points for having any keyword in category)
                category_bonus = category_data['category_bonus']
                
                # Special handling for CORE_RESUME_IDENTITY (10 extra points)
                if category_name == 'CORE_RESUME_IDENTITY':
                    keyword_points += 10
                
                total_score += keyword_points + category_bonus
        
        return category_matches, total_score, detected_sections
    
    def check_non_resume_indicators(self, normalized_text: str) -> Tuple[bool, List[str]]:
        """
        Check for strong non-resume indicators that should immediately disqualify
        """
        found_non_resume_indicators = []
        
        for indicator in self.non_resume_indicators:
            pattern = r'\b' + re.escape(indicator.lower()) + r'\b'
            if re.search(pattern, normalized_text):
                found_non_resume_indicators.append(indicator)
        
        # Special pattern detection for company lists
        company_list_patterns = [
            r'\d+\.\s+[A-Z][a-z]+.*(?:technologies|services|limited|ltd|inc|corp)',  # "1. Company Name Technologies"
            r'top\s+\d+.*companies',  # "Top 10 Companies"
            r'list\s+of.*companies',  # "List of Companies"
            r'\d+\.\s+[A-Z][a-z]+.*\n\s*-.*(?:services|development|solutions)',  # Company with service descriptions
        ]
        
        for pattern in company_list_patterns:
            if re.search(pattern, normalized_text, re.IGNORECASE | re.MULTILINE):
                found_non_resume_indicators.append('company list pattern detected')
                break
        
        # If we find 2 or more strong non-resume indicators, it's likely not a resume
        is_non_resume = len(found_non_resume_indicators) >= 2
        
        return is_non_resume, found_non_resume_indicators
    
    def calculate_confidence_score(self, total_score: int, detected_sections: List[str], 
                                 text_length: int) -> int:
        """
        Calculate confidence score (0-100) based on various factors
        """
        # Base confidence from scoring
        base_confidence = min(100, (total_score / 30) * 100)  # Scale to 100
        
        # Adjust based on number of detected sections
        section_bonus = min(20, len(detected_sections) * 3)
        
        # Adjust based on text length (resumes should have substantial content)
        length_factor = 1.0
        if text_length < 200:
            length_factor = 0.7  # Penalize very short documents
        elif text_length > 1000:
            length_factor = 1.1  # Bonus for comprehensive documents
        
        confidence = int((base_confidence + section_bonus) * length_factor)
        return min(100, max(0, confidence))
    
    def classify_document(self, text: str, filename: str = "") -> Dict:
        """
        STEP 4 & 5: FINAL DECISION AND RESPONSE
        Main classification method that returns professional ATS decision
        """
        if not text or len(text.strip()) < 50:
            return {
                "document_type": "NON_RESUME",
                "resume_confidence_score": 0,
                "detected_sections": [],
                "reason": "Document too short or empty. Minimum 50 characters required for resume analysis.",
                "found_keywords": [],
                "missing_sections": ["All resume sections missing"],
                "non_resume_indicators": []
            }
        
        # Step 1: Normalize text
        normalized_text = self.normalize_text(text)
        
        # Check for non-resume indicators first
        is_non_resume, non_resume_indicators = self.check_non_resume_indicators(normalized_text)
        
        # Step 2 & 3: Extract keywords and calculate score
        category_matches, total_score, detected_sections = self.extract_keywords_and_score(normalized_text)
        
        # Calculate confidence score
        confidence_score = self.calculate_confidence_score(total_score, detected_sections, len(text))
        
        # Step 4: Final decision (threshold = 18)
        RESUME_THRESHOLD = 18
        
        # Override decision if strong non-resume indicators found
        if is_non_resume and total_score < 25:  # Allow override only for very low scores
            document_type = "NON_RESUME"
            reason = f"Document contains non-resume indicators: {', '.join(non_resume_indicators[:3])}. This appears to be a certificate, marksheet, or other non-resume document."
            confidence_score = min(confidence_score, 25)  # Cap confidence for non-resume
        elif total_score >= RESUME_THRESHOLD:
            document_type = "RESUME"
            reason = f"Document meets ATS resume criteria with score {total_score}/{RESUME_THRESHOLD}. Contains essential resume sections: {', '.join(detected_sections[:5])}."
        else:
            document_type = "NON_RESUME"
            reason = f"Document does not meet ATS resume criteria (score: {total_score}/{RESUME_THRESHOLD}). Missing essential resume sections like experience, education, or skills."
        
        # Identify missing sections for non-resumes
        all_sections = [cat.replace('_', ' ').title() for cat in self.resume_categories.keys()]
        missing_sections = [section for section in all_sections if section not in detected_sections]
        
        # Flatten found keywords
        all_found_keywords = []
        for category, keywords in category_matches.items():
            all_found_keywords.extend(keywords)
        
        return {
            "document_type": document_type,
            "resume_confidence_score": confidence_score,
            "detected_sections": detected_sections,
            "reason": reason,
            "found_keywords": all_found_keywords[:20],  # Limit to first 20 for readability
            "missing_sections": missing_sections[:10],   # Limit to first 10
            "non_resume_indicators": non_resume_indicators[:5],  # Limit to first 5
            "ats_score": total_score,
            "threshold_met": total_score >= RESUME_THRESHOLD,
            "category_breakdown": category_matches
        }
    
    def should_process_for_ats_scoring(self, classification_result: Dict) -> bool:
        """
        Determine if document should proceed to full ATS scoring
        """
        return classification_result["document_type"] == "RESUME"
    
    def get_rejection_message(self, classification_result: Dict) -> Dict:
        """
        Generate professional rejection message for non-resume documents
        """
        return {
            "status": "rejected",
            "message": "This uploaded file is not a resume. Please upload a proper CV or Resume for scoring.",
            "details": classification_result["reason"],
            "detected_keywords": classification_result["found_keywords"],
            "missing_resume_sections": classification_result["missing_sections"],
            "suggestions": [
                "Upload a document that contains your professional experience",
                "Include education details, skills, and work history",
                "Ensure the document is a proper resume/CV format",
                "Avoid uploading certificates, marksheets, or project reports"
            ],
            "confidence_score": classification_result["resume_confidence_score"]
        }


# Example usage and testing
if __name__ == "__main__":
    classifier = ATSResumeClassifier()
    
    # Test with sample resume text
    resume_text = """
    John Smith
    Software Engineer
    john.smith@email.com
    (555) 123-4567
    
    EDUCATION
    Bachelor of Science in Computer Science
    Stanford University, 2020-2024
    
    EXPERIENCE
    Software Engineer Intern
    Google Inc. (Summer 2023)
    • Developed React components
    • Implemented REST APIs
    
    SKILLS
    JavaScript, Python, React, Node.js, SQL
    
    PROJECTS
    E-commerce Web Application
    Built full-stack web app using React
    """
    
    result = classifier.classify_document(resume_text)
    print("Resume Classification Result:")
    print(json.dumps(result, indent=2))
    
    # Test with certificate text
    certificate_text = """
    Certificate of Completion
    
    This certifies that John Doe has successfully completed the course:
    "Machine Learning Specialization"
    
    Offered by Coursera in partnership with Stanford University
    Date of Completion: December 2024
    
    Coursera Certificate ID: ABC123XYZ
    """
    
    result2 = classifier.classify_document(certificate_text)
    print("\nCertificate Classification Result:")
    print(json.dumps(result2, indent=2))