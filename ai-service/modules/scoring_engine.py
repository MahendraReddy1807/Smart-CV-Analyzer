import re
from typing import Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class ScoringEngine:
    """ML-based resume scoring engine"""
    
    def __init__(self):
        # Job role keywords database
        self.job_keywords = {
            'software engineer': [
                'python', 'java', 'javascript', 'react', 'node.js', 'sql', 'git', 'api', 'database',
                'algorithms', 'data structures', 'testing', 'debugging', 'agile', 'scrum'
            ],
            'data scientist': [
                'python', 'r', 'machine learning', 'statistics', 'pandas', 'numpy', 'tensorflow',
                'pytorch', 'sql', 'tableau', 'visualization', 'modeling', 'analysis', 'research'
            ],
            'product manager': [
                'strategy', 'roadmap', 'stakeholder', 'requirements', 'analytics', 'user experience',
                'market research', 'agile', 'scrum', 'leadership', 'communication', 'metrics'
            ],
            'frontend developer': [
                'javascript', 'react', 'vue', 'angular', 'html', 'css', 'typescript', 'responsive',
                'ui/ux', 'webpack', 'npm', 'git', 'testing', 'accessibility', 'performance'
            ],
            'backend developer': [
                'python', 'java', 'node.js', 'api', 'database', 'sql', 'microservices', 'docker',
                'kubernetes', 'aws', 'testing', 'security', 'performance', 'scalability'
            ],
            'devops engineer': [
                'docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'terraform', 'ansible', 'linux',
                'monitoring', 'ci/cd', 'automation', 'infrastructure', 'security', 'scripting'
            ]
        }
        
        # Initialize TF-IDF vectorizer for keyword matching
        self.vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
    
    def calculate_score(self, sections: Dict, job_role: str) -> Dict:
        """
        Calculate comprehensive resume score
        
        Args:
            sections: Classified resume sections
            job_role: Target job role
            
        Returns:
            Dictionary with overall score and breakdown
        """
        scores = {
            'structure_score': self._calculate_structure_score(sections),
            'skills_score': self._calculate_skills_score(sections, job_role),
            'content_score': self._calculate_content_score(sections),
            'ats_compatibility': self._calculate_ats_score(sections)
        }
        
        # Calculate weighted overall score
        weights = {
            'structure_score': 0.25,
            'skills_score': 0.30,
            'content_score': 0.25,
            'ats_compatibility': 0.20
        }
        
        overall_score = sum(scores[key] * weights[key] for key in scores)
        overall_score = max(0, min(100, int(overall_score)))  # Ensure 0-100 range
        
        return {
            'overall_score': overall_score,
            'breakdown': scores
        }
    
    def _calculate_structure_score(self, sections: Dict) -> int:
        """Calculate score based on resume structure completeness"""
        score = 0
        max_score = 100
        
        # Essential sections
        essential_sections = ['contactInfo', 'education', 'skills']
        for section in essential_sections:
            if section in sections and sections[section]:
                if section == 'contactInfo':
                    # Check if contact info has required fields
                    contact = sections[section]
                    if contact.get('email'):
                        score += 15
                    if contact.get('name'):
                        score += 10
                    if contact.get('phone'):
                        score += 5
                else:
                    score += 20
        
        # Important sections
        important_sections = ['experience', 'projects']
        for section in important_sections:
            if section in sections and sections[section]:
                score += 15
        
        # Optional sections
        optional_sections = ['certifications']
        for section in optional_sections:
            if section in sections and sections[section]:
                score += 10
        
        return min(score, max_score)
    
    def _calculate_skills_score(self, sections: Dict, job_role: str) -> int:
        """Calculate score based on skills relevance and quantity"""
        if 'skills' not in sections or not sections['skills']:
            return 0
        
        skills = sections['skills']
        score = 0
        
        # Base score for having skills
        if len(skills) >= 5:
            score += 30
        elif len(skills) >= 3:
            score += 20
        elif len(skills) >= 1:
            score += 10
        
        # Relevance score based on job role
        job_role_lower = job_role.lower()
        relevant_keywords = []
        
        # Find matching job role keywords
        for role, keywords in self.job_keywords.items():
            if role in job_role_lower:
                relevant_keywords = keywords
                break
        
        if relevant_keywords:
            skills_text = ' '.join(skills).lower()
            matching_keywords = sum(1 for keyword in relevant_keywords if keyword in skills_text)
            relevance_score = min(50, (matching_keywords / len(relevant_keywords)) * 50)
            score += relevance_score
        else:
            # Generic relevance score
            score += 20
        
        # Diversity bonus
        if len(skills) >= 10:
            score += 20
        elif len(skills) >= 8:
            score += 10
        
        return min(score, 100)
    
    def _calculate_content_score(self, sections: Dict) -> int:
        """Calculate score based on content quality"""
        score = 0
        
        # Analyze project descriptions
        if 'projects' in sections and sections['projects']:
            projects_text = sections['projects']
            score += self._analyze_content_quality(projects_text)
        
        # Analyze experience descriptions
        if 'experience' in sections and sections['experience']:
            experience_text = sections['experience']
            score += self._analyze_content_quality(experience_text)
        
        return min(score, 100)
    
    def _analyze_content_quality(self, text: str) -> int:
        """Analyze quality of content text"""
        if not text:
            return 0
        
        score = 0
        text_lower = text.lower()
        
        # Check for action verbs
        action_verbs = [
            'developed', 'created', 'built', 'designed', 'implemented', 'managed', 'led',
            'improved', 'optimized', 'achieved', 'delivered', 'collaborated', 'analyzed',
            'researched', 'established', 'maintained', 'coordinated', 'executed'
        ]
        
        action_verb_count = sum(1 for verb in action_verbs if verb in text_lower)
        if action_verb_count >= 5:
            score += 30
        elif action_verb_count >= 3:
            score += 20
        elif action_verb_count >= 1:
            score += 10
        
        # Check for quantifiable achievements
        number_patterns = [
            r'\d+%',  # percentages
            r'\$\d+',  # dollar amounts
            r'\d+\s*(?:users?|customers?|clients?)',  # user counts
            r'\d+\s*(?:hours?|days?|weeks?|months?)',  # time periods
            r'\d+\s*(?:projects?|applications?|systems?)'  # project counts
        ]
        
        quantifiable_count = sum(1 for pattern in number_patterns 
                                if re.search(pattern, text_lower))
        if quantifiable_count >= 3:
            score += 25
        elif quantifiable_count >= 2:
            score += 15
        elif quantifiable_count >= 1:
            score += 10
        
        # Check for technical depth
        technical_indicators = [
            'architecture', 'framework', 'algorithm', 'optimization', 'scalability',
            'performance', 'security', 'integration', 'deployment', 'testing'
        ]
        
        technical_count = sum(1 for indicator in technical_indicators 
                            if indicator in text_lower)
        if technical_count >= 3:
            score += 20
        elif technical_count >= 1:
            score += 10
        
        return score
    
    def _calculate_ats_score(self, sections: Dict) -> int:
        """Calculate ATS compatibility score"""
        score = 0
        
        # Check for standard section headers
        if sections.get('education'):
            score += 20
        if sections.get('experience'):
            score += 20
        if sections.get('skills'):
            score += 20
        
        # Check contact information completeness
        contact = sections.get('contactInfo', {})
        if contact.get('email'):
            score += 15
        if contact.get('phone'):
            score += 10
        if contact.get('name'):
            score += 15
        
        return min(score, 100)
    
    def get_keyword_suggestions(self, sections: Dict, job_role: str) -> List[str]:
        """Get keyword suggestions for the target job role"""
        job_role_lower = job_role.lower()
        relevant_keywords = []
        
        # Find matching job role keywords
        for role, keywords in self.job_keywords.items():
            if role in job_role_lower:
                relevant_keywords = keywords
                break
        
        if not relevant_keywords:
            return []
        
        # Check which keywords are missing
        resume_text = ' '.join([
            str(sections.get('skills', [])),
            sections.get('experience', ''),
            sections.get('projects', '')
        ]).lower()
        
        missing_keywords = [
            keyword for keyword in relevant_keywords
            if keyword not in resume_text
        ]
        
        return missing_keywords[:10]  # Return top 10 suggestions