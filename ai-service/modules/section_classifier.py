import re
from typing import Dict, List, Optional
import spacy
from transformers import pipeline

class SectionClassifier:
    """Classifies resume sections using NLP techniques"""
    
    def __init__(self):
        # Load spaCy model for NER
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Warning: spaCy model 'en_core_web_sm' not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Initialize classification pipeline (using a lightweight model)
        try:
            self.classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=-1  # Use CPU
            )
        except Exception as e:
            print(f"Warning: Could not load classification model: {e}")
            self.classifier = None
    
    def classify_sections(self, text: str) -> Dict[str, str]:
        """
        Classify resume text into different sections
        
        Args:
            text: Raw resume text
            
        Returns:
            Dictionary with classified sections
        """
        sections = {
            'contactInfo': {},
            'education': '',
            'skills': [],
            'experience': '',
            'projects': '',
            'certifications': '',
            'raw': text
        }
        
        # Extract contact information
        sections['contactInfo'] = self.extract_contact_info(text)
        
        # Split text into sections using headers and keywords
        section_splits = self._split_by_headers(text)
        
        # Classify each section
        for section_text in section_splits:
            section_type = self._classify_section_type(section_text)
            
            if section_type == 'education':
                sections['education'] = section_text
            elif section_type == 'skills':
                sections['skills'] = self.extract_skills_list(section_text)
            elif section_type == 'experience':
                sections['experience'] = section_text
            elif section_type == 'projects':
                sections['projects'] = section_text
            elif section_type == 'certifications':
                sections['certifications'] = section_text
        
        return sections
    
    def extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from resume text"""
        contact_info = {
            'name': '',
            'email': '',
            'phone': '',
            'location': ''
        }
        
        # Extract email using regex
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Extract phone number using regex
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            contact_info['phone'] = phone_match.group()
        
        # Extract name (assume it's in the first few lines)
        lines = text.split('\n')[:5]
        for line in lines:
            line = line.strip()
            if line and not re.search(r'[@\d]', line) and len(line.split()) <= 4:
                # Likely a name if it's short, has no numbers/emails, and is early in document
                if not any(keyword in line.lower() for keyword in ['resume', 'cv', 'curriculum']):
                    contact_info['name'] = line
                    break
        
        # Use spaCy for better name extraction if available
        if self.nlp:
            doc = self.nlp(text[:500])  # First 500 chars
            for ent in doc.ents:
                if ent.label_ == "PERSON" and not contact_info['name']:
                    contact_info['name'] = ent.text
                    break
        
        return contact_info
    
    def extract_skills_list(self, text: str) -> List[str]:
        """Extract skills from text"""
        # Common technical skills database
        technical_skills = [
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'bash', 'powershell',
            
            # Frameworks & Libraries
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
            'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'pandas', 'numpy', 'tensorflow',
            'pytorch', 'scikit-learn', 'keras', 'opencv', 'matplotlib', 'seaborn',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
            'cassandra', 'dynamodb', 'firebase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
            'terraform', 'ansible', 'vagrant', 'nginx', 'apache',
            
            # Tools & Technologies
            'linux', 'windows', 'macos', 'vim', 'vscode', 'intellij', 'eclipse', 'postman',
            'jira', 'confluence', 'slack', 'trello', 'figma', 'photoshop', 'illustrator',
            
            # Data & Analytics
            'tableau', 'power bi', 'excel', 'google analytics', 'spark', 'hadoop', 'kafka',
            'airflow', 'jupyter', 'rstudio',
            
            # Mobile Development
            'android', 'ios', 'react native', 'flutter', 'xamarin', 'cordova',
            
            # Testing
            'junit', 'pytest', 'jest', 'selenium', 'cypress', 'postman', 'swagger'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        # Find skills mentioned in text
        for skill in technical_skills:
            if skill in text_lower:
                # Add the skill with proper capitalization
                found_skills.append(skill.title())
        
        # Also extract skills using common patterns
        skill_patterns = [
            r'(?:skills?|technologies?|tools?)[:\s]*([^\n]+)',
            r'(?:proficient|experienced|familiar)\s+(?:in|with)[:\s]*([^\n]+)',
            r'(?:programming|coding)\s+(?:languages?|skills?)[:\s]*([^\n]+)'
        ]
        
        for pattern in skill_patterns:
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                skill_text = match.group(1)
                # Split by common delimiters
                skills_in_line = re.split(r'[,;|•\-\n]', skill_text)
                for skill in skills_in_line:
                    skill = skill.strip()
                    if skill and len(skill) > 2:
                        found_skills.append(skill.title())
        
        # Remove duplicates and return
        return list(set(found_skills))
    
    def _split_by_headers(self, text: str) -> List[str]:
        """Split text into sections based on common resume headers"""
        # Common section headers
        section_headers = [
            r'(?:^|\n)\s*(?:EDUCATION|Education)\s*(?:\n|$)',
            r'(?:^|\n)\s*(?:EXPERIENCE|Experience|WORK EXPERIENCE|Work Experience)\s*(?:\n|$)',
            r'(?:^|\n)\s*(?:SKILLS|Skills|TECHNICAL SKILLS|Technical Skills)\s*(?:\n|$)',
            r'(?:^|\n)\s*(?:PROJECTS|Projects|PERSONAL PROJECTS|Personal Projects)\s*(?:\n|$)',
            r'(?:^|\n)\s*(?:CERTIFICATIONS|Certifications|CERTIFICATES|Certificates)\s*(?:\n|$)',
            r'(?:^|\n)\s*(?:ACHIEVEMENTS|Achievements|ACCOMPLISHMENTS|Accomplishments)\s*(?:\n|$)',
            r'(?:^|\n)\s*(?:SUMMARY|Summary|OBJECTIVE|Objective)\s*(?:\n|$)'
        ]
        
        # Find all header positions
        header_positions = []
        for pattern in section_headers:
            for match in re.finditer(pattern, text, re.MULTILINE | re.IGNORECASE):
                header_positions.append((match.start(), match.end(), match.group().strip()))
        
        # Sort by position
        header_positions.sort(key=lambda x: x[0])
        
        # Split text into sections
        sections = []
        for i, (start, end, header) in enumerate(header_positions):
            next_start = header_positions[i + 1][0] if i + 1 < len(header_positions) else len(text)
            section_text = text[end:next_start].strip()
            if section_text:
                sections.append(f"{header}\n{section_text}")
        
        return sections
    
    def _classify_section_type(self, section_text: str) -> str:
        """Classify what type of section this text represents"""
        text_lower = section_text.lower()
        
        # Rule-based classification
        if any(keyword in text_lower for keyword in ['education', 'degree', 'university', 'college', 'school', 'bachelor', 'master', 'phd']):
            return 'education'
        elif any(keyword in text_lower for keyword in ['skills', 'technologies', 'programming', 'proficient', 'languages']):
            return 'skills'
        elif any(keyword in text_lower for keyword in ['experience', 'work', 'employment', 'job', 'position', 'role']):
            return 'experience'
        elif any(keyword in text_lower for keyword in ['projects', 'project', 'built', 'developed', 'created']):
            return 'projects'
        elif any(keyword in text_lower for keyword in ['certification', 'certificate', 'certified', 'license']):
            return 'certifications'
        
        # If using transformer model, use it for classification
        if self.classifier:
            try:
                candidate_labels = ['education', 'skills', 'experience', 'projects', 'certifications', 'other']
                result = self.classifier(section_text[:512], candidate_labels)  # Limit text length
                return result['labels'][0] if result['scores'][0] > 0.5 else 'other'
            except Exception:
                pass
        
        return 'other'