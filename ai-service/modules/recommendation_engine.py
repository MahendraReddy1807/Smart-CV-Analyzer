from typing import Dict, List
import re

class RecommendationEngine:
    """Generate specific recommendations for resume improvement"""
    
    def __init__(self):
        self.grammar_patterns = [
            (r'\bi\s', 'Use active voice instead of "I" statements'),
            (r'\bwas\s+\w+ing\b', 'Replace passive voice with active verbs'),
            (r'\bhelped\s+to\b', 'Use stronger action verbs than "helped"'),
            (r'\bworked\s+on\b', 'Be more specific than "worked on"'),
            (r'\bresponsible\s+for\b', 'Use action verbs instead of "responsible for"')
        ]
    
    def generate_recommendations(self, sections: Dict, score_result: Dict) -> Dict:
        """
        Generate comprehensive recommendations based on analysis
        
        Args:
            sections: Classified resume sections
            score_result: Scoring results with breakdown
            
        Returns:
            Dictionary with issues, suggestions, and missing components
        """
        recommendations = {
            'issues': [],
            'suggested_keywords': [],
            'missing_components': [],
            'priority_suggestions': []
        }
        
        # Analyze structure issues
        recommendations['missing_components'] = self._identify_missing_sections(sections)
        
        # Analyze content issues
        content_issues = self._analyze_content_issues(sections)
        recommendations['issues'].extend(content_issues)
        
        # Generate grammar suggestions
        grammar_issues = self._analyze_grammar_issues(sections)
        recommendations['issues'].extend(grammar_issues)
        
        # Generate formatting suggestions
        formatting_issues = self._analyze_formatting_issues(sections)
        recommendations['issues'].extend(formatting_issues)
        
        # Prioritize recommendations
        recommendations['priority_suggestions'] = self._prioritize_suggestions(
            recommendations, score_result
        )
        
        return recommendations
    
    def _identify_missing_sections(self, sections: Dict) -> List[str]:
        """Identify missing essential resume sections"""
        missing = []
        
        # Check essential sections
        if not sections.get('contactInfo') or not sections['contactInfo'].get('email'):
            missing.append('Contact information (email required)')
        
        if not sections.get('education'):
            missing.append('Education section')
        
        if not sections.get('skills') or len(sections['skills']) < 3:
            missing.append('Technical skills section (minimum 3 skills)')
        
        # Check important sections
        if not sections.get('experience') and not sections.get('projects'):
            missing.append('Work experience or projects section')
        
        if not sections.get('projects'):
            missing.append('Projects section to showcase practical experience')
        
        # Check optional but valuable sections
        if not sections.get('certifications'):
            missing.append('Certifications section (if applicable)')
        
        return missing
    
    def _analyze_content_issues(self, sections: Dict) -> List[str]:
        """Analyze content quality issues"""
        issues = []
        
        # Analyze skills section
        if sections.get('skills'):
            skills = sections['skills']
            if len(skills) < 5:
                issues.append(f"Only {len(skills)} skills listed. Add more relevant technical skills.")
            
            # Check for generic skills
            generic_skills = ['microsoft office', 'word', 'excel', 'powerpoint', 'communication']
            generic_count = sum(1 for skill in skills if any(g in skill.lower() for g in generic_skills))
            if generic_count > len(skills) * 0.3:
                issues.append("Too many generic skills. Focus on technical and specialized skills.")
        
        # Analyze project descriptions
        if sections.get('projects'):
            projects_text = sections['projects']
            if len(projects_text) < 200:
                issues.append("Project descriptions are too brief. Add more detail about your contributions.")
            
            # Check for weak language
            weak_phrases = ['worked on', 'helped with', 'was involved in', 'participated in']
            weak_count = sum(1 for phrase in weak_phrases if phrase in projects_text.lower())
            if weak_count > 2:
                issues.append("Use stronger action verbs in project descriptions.")
        
        # Analyze experience section
        if sections.get('experience'):
            experience_text = sections['experience']
            if len(experience_text) < 150:
                issues.append("Work experience descriptions need more detail about achievements.")
            
            # Check for quantifiable achievements
            has_numbers = bool(re.search(r'\d+(?:%|\$|k|million|billion|users|customers)', experience_text))
            if not has_numbers:
                issues.append("Add quantifiable achievements to demonstrate impact.")
        
        return issues
    
    def _analyze_grammar_issues(self, sections: Dict) -> List[str]:
        """Analyze grammar and style issues"""
        issues = []
        
        # Combine all text content
        all_text = ' '.join([
            sections.get('experience', ''),
            sections.get('projects', ''),
            sections.get('education', '')
        ])
        
        if not all_text:
            return issues
        
        # Check grammar patterns
        for pattern, suggestion in self.grammar_patterns:
            if re.search(pattern, all_text, re.IGNORECASE):
                issues.append(suggestion)
        
        # Check for inconsistent tense
        past_tense_verbs = len(re.findall(r'\b\w+ed\b', all_text))
        present_tense_verbs = len(re.findall(r'\b(?:manage|develop|create|build|lead|work)\b', all_text))
        
        if past_tense_verbs > 0 and present_tense_verbs > 0:
            issues.append("Maintain consistent verb tense throughout resume.")
        
        # Check for bullet point consistency
        bullet_patterns = [r'•', r'-', r'\*', r'◦']
        bullet_types = sum(1 for pattern in bullet_patterns if re.search(pattern, all_text))
        if bullet_types > 1:
            issues.append("Use consistent bullet point formatting throughout resume.")
        
        return issues
    
    def _analyze_formatting_issues(self, sections: Dict) -> List[str]:
        """Analyze ATS-friendly formatting issues"""
        issues = []
        
        # Check contact information format
        contact = sections.get('contactInfo', {})
        if contact.get('email'):
            email = contact['email']
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                issues.append("Email format may not be ATS-friendly.")
        
        if contact.get('phone'):
            phone = contact['phone']
            # Check for consistent phone formatting
            if not re.match(r'^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$', phone):
                issues.append("Use standard phone number format (e.g., (555) 123-4567).")
        
        # Check for special characters that might confuse ATS
        all_text = sections.get('raw', '')
        problematic_chars = ['©', '®', '™', '§', '¶']
        if any(char in all_text for char in problematic_chars):
            issues.append("Remove special characters that may not be ATS-compatible.")
        
        # Check for tables or complex formatting indicators
        if '|' in all_text or '\t' in all_text:
            issues.append("Avoid tables and complex formatting for better ATS compatibility.")
        
        return issues
    
    def _prioritize_suggestions(self, recommendations: Dict, score_result: Dict) -> List[Dict]:
        """Prioritize recommendations based on impact"""
        priority_suggestions = []
        
        # High priority: Missing essential sections
        for missing in recommendations['missing_components']:
            if 'email' in missing.lower() or 'contact' in missing.lower():
                priority_suggestions.append({
                    'priority': 'high',
                    'category': 'structure',
                    'suggestion': missing,
                    'impact': 'Essential for ATS parsing and recruiter contact'
                })
            elif 'skills' in missing.lower():
                priority_suggestions.append({
                    'priority': 'high',
                    'category': 'content',
                    'suggestion': missing,
                    'impact': 'Critical for keyword matching and skill assessment'
                })
        
        # Medium priority: Content improvements
        content_issues = [issue for issue in recommendations['issues'] 
                         if any(keyword in issue.lower() for keyword in ['action', 'quantifiable', 'detail'])]
        for issue in content_issues:
            priority_suggestions.append({
                'priority': 'medium',
                'category': 'content',
                'suggestion': issue,
                'impact': 'Improves resume impact and readability'
            })
        
        # Low priority: Formatting and grammar
        formatting_issues = [issue for issue in recommendations['issues'] 
                           if any(keyword in issue.lower() for keyword in ['format', 'tense', 'bullet'])]
        for issue in formatting_issues:
            priority_suggestions.append({
                'priority': 'low',
                'category': 'formatting',
                'suggestion': issue,
                'impact': 'Enhances professional appearance and ATS compatibility'
            })
        
        return priority_suggestions
    
    def generate_keyword_suggestions(self, sections: Dict, job_role: str) -> List[str]:
        """Generate keyword suggestions based on job role"""
        # This would integrate with the scoring engine's keyword suggestions
        # For now, return basic suggestions based on common job roles
        
        job_role_lower = job_role.lower()
        suggestions = []
        
        if 'software' in job_role_lower or 'developer' in job_role_lower:
            suggestions = ['API development', 'Version control (Git)', 'Unit testing', 
                          'Code review', 'Agile methodology', 'Problem solving']
        elif 'data' in job_role_lower:
            suggestions = ['Statistical analysis', 'Data visualization', 'Machine learning',
                          'Data cleaning', 'Predictive modeling', 'Business intelligence']
        elif 'product' in job_role_lower:
            suggestions = ['Product roadmap', 'User research', 'A/B testing',
                          'Stakeholder management', 'Market analysis', 'Feature prioritization']
        else:
            suggestions = ['Project management', 'Team collaboration', 'Problem solving',
                          'Communication', 'Leadership', 'Process improvement']
        
        return suggestions