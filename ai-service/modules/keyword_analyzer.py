import re
from typing import Dict, List, Set, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class KeywordAnalyzer:
    """Advanced keyword analysis and job role matching"""
    
    def __init__(self):
        # Comprehensive job role keywords database
        self.job_keywords = {
            'software engineer': {
                'core': ['programming', 'software development', 'coding', 'algorithms', 'data structures'],
                'languages': ['python', 'java', 'javascript', 'c++', 'c#', 'go', 'rust', 'typescript'],
                'frameworks': ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring'],
                'tools': ['git', 'docker', 'kubernetes', 'jenkins', 'jira', 'vscode', 'intellij'],
                'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'],
                'cloud': ['aws', 'azure', 'gcp', 'cloud computing', 'microservices'],
                'methodologies': ['agile', 'scrum', 'tdd', 'ci/cd', 'devops', 'code review']
            },
            'data scientist': {
                'core': ['machine learning', 'data analysis', 'statistics', 'data mining', 'predictive modeling'],
                'languages': ['python', 'r', 'sql', 'scala', 'julia'],
                'libraries': ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras'],
                'tools': ['jupyter', 'tableau', 'power bi', 'excel', 'spark', 'hadoop'],
                'databases': ['sql', 'nosql', 'mongodb', 'cassandra', 'bigquery'],
                'cloud': ['aws', 'azure', 'gcp', 'databricks', 'snowflake'],
                'methods': ['regression', 'classification', 'clustering', 'deep learning', 'nlp', 'computer vision']
            },
            'product manager': {
                'core': ['product strategy', 'product roadmap', 'user research', 'market analysis'],
                'skills': ['stakeholder management', 'requirements gathering', 'prioritization', 'leadership'],
                'tools': ['jira', 'confluence', 'figma', 'miro', 'slack', 'trello', 'asana'],
                'analytics': ['google analytics', 'mixpanel', 'amplitude', 'a/b testing', 'metrics'],
                'methodologies': ['agile', 'scrum', 'lean', 'design thinking', 'user stories'],
                'business': ['market research', 'competitive analysis', 'go-to-market', 'pricing strategy']
            },
            'frontend developer': {
                'core': ['frontend development', 'user interface', 'user experience', 'responsive design'],
                'languages': ['javascript', 'typescript', 'html', 'css', 'sass', 'less'],
                'frameworks': ['react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt.js'],
                'tools': ['webpack', 'vite', 'babel', 'npm', 'yarn', 'git'],
                'styling': ['css3', 'flexbox', 'grid', 'bootstrap', 'tailwind', 'material-ui'],
                'testing': ['jest', 'cypress', 'testing library', 'selenium', 'unit testing']
            },
            'backend developer': {
                'core': ['backend development', 'server-side', 'api development', 'system architecture'],
                'languages': ['python', 'java', 'node.js', 'go', 'c#', 'php', 'ruby'],
                'frameworks': ['express', 'django', 'flask', 'spring', 'laravel', 'rails'],
                'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra'],
                'tools': ['docker', 'kubernetes', 'jenkins', 'git', 'postman', 'swagger'],
                'concepts': ['rest api', 'graphql', 'microservices', 'authentication', 'security', 'scalability']
            },
            'devops engineer': {
                'core': ['devops', 'infrastructure', 'automation', 'deployment', 'monitoring'],
                'cloud': ['aws', 'azure', 'gcp', 'cloud infrastructure', 'serverless'],
                'tools': ['docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'puppet'],
                'monitoring': ['prometheus', 'grafana', 'elk stack', 'datadog', 'new relic'],
                'scripting': ['bash', 'python', 'powershell', 'yaml', 'json'],
                'concepts': ['ci/cd', 'infrastructure as code', 'containerization', 'orchestration']
            },
            'ui/ux designer': {
                'core': ['user experience', 'user interface', 'design thinking', 'user research'],
                'tools': ['figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'invision'],
                'skills': ['wireframing', 'prototyping', 'user testing', 'information architecture'],
                'methods': ['design systems', 'accessibility', 'responsive design', 'interaction design'],
                'research': ['user interviews', 'usability testing', 'personas', 'journey mapping']
            },
            'marketing manager': {
                'core': ['digital marketing', 'marketing strategy', 'brand management', 'campaign management'],
                'channels': ['social media', 'email marketing', 'content marketing', 'seo', 'sem', 'ppc'],
                'tools': ['google analytics', 'hubspot', 'mailchimp', 'hootsuite', 'salesforce'],
                'skills': ['market research', 'customer segmentation', 'lead generation', 'conversion optimization'],
                'metrics': ['roi', 'ctr', 'conversion rate', 'customer acquisition cost', 'lifetime value']
            }
        }
        
        # ATS-friendly keywords
        self.ats_keywords = {
            'action_verbs': [
                'achieved', 'analyzed', 'built', 'collaborated', 'created', 'delivered',
                'designed', 'developed', 'enhanced', 'established', 'executed',
                'implemented', 'improved', 'increased', 'led', 'managed', 'optimized',
                'organized', 'reduced', 'resolved', 'streamlined', 'transformed'
            ],
            'soft_skills': [
                'leadership', 'communication', 'teamwork', 'problem solving',
                'critical thinking', 'adaptability', 'time management', 'collaboration'
            ],
            'certifications': [
                'certified', 'certification', 'license', 'accredited', 'qualified'
            ]
        }
        
        # Initialize TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            lowercase=True,
            ngram_range=(1, 2),  # Include bigrams
            max_features=1000
        )
    
    def analyze_keywords(self, sections: Dict, job_role: str) -> Dict:
        """
        Comprehensive keyword analysis for resume and job role matching
        
        Args:
            sections: Classified resume sections
            job_role: Target job role
            
        Returns:
            Dictionary with keyword analysis results
        """
        # Extract all text content
        resume_text = self._extract_resume_text(sections)
        
        # Get job role keywords
        role_keywords = self._get_job_role_keywords(job_role)
        
        # Perform keyword matching
        keyword_matches = self._match_keywords(resume_text, role_keywords)
        
        # Calculate keyword density
        keyword_density = self._calculate_keyword_density(resume_text, role_keywords)
        
        # Identify missing keywords
        missing_keywords = self._identify_missing_keywords(resume_text, role_keywords)
        
        # Assess ATS compatibility
        ats_score = self._assess_ats_compatibility(resume_text, sections)
        
        # Generate recommendations
        recommendations = self._generate_keyword_recommendations(
            keyword_matches, missing_keywords, job_role
        )
        
        return {
            'job_role': job_role,
            'keyword_matches': keyword_matches,
            'keyword_density': keyword_density,
            'missing_keywords': missing_keywords,
            'ats_compatibility_score': ats_score,
            'recommendations': recommendations,
            'total_keywords_found': sum(len(matches) for matches in keyword_matches.values()),
            'coverage_percentage': self._calculate_coverage_percentage(keyword_matches, role_keywords)
        }
    
    def _extract_resume_text(self, sections: Dict) -> str:
        """Extract all relevant text from resume sections"""
        text_parts = []
        
        # Add skills as text
        if sections.get('skills'):
            text_parts.append(' '.join(sections['skills']))
        
        # Add other sections
        for section in ['experience', 'projects', 'education', 'certifications']:
            if sections.get(section):
                text_parts.append(str(sections[section]))
        
        return ' '.join(text_parts).lower()
    
    def _get_job_role_keywords(self, job_role: str) -> Dict[str, List[str]]:
        """Get keywords for the specified job role"""
        job_role_lower = job_role.lower()
        
        # Find exact match first
        for role, keywords in self.job_keywords.items():
            if role in job_role_lower:
                return keywords
        
        # Find partial matches
        for role, keywords in self.job_keywords.items():
            role_words = role.split()
            if any(word in job_role_lower for word in role_words):
                return keywords
        
        # Return generic keywords if no match found
        return {
            'core': ['experience', 'skills', 'knowledge', 'expertise'],
            'tools': ['software', 'technology', 'systems'],
            'skills': ['communication', 'teamwork', 'leadership', 'problem solving']
        }
    
    def _match_keywords(self, resume_text: str, role_keywords: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """Match keywords between resume and job role requirements"""
        matches = {}
        
        for category, keywords in role_keywords.items():
            category_matches = []
            for keyword in keywords:
                if keyword.lower() in resume_text:
                    category_matches.append(keyword)
            matches[category] = category_matches
        
        return matches
    
    def _calculate_keyword_density(self, resume_text: str, role_keywords: Dict[str, List[str]]) -> Dict[str, float]:
        """Calculate keyword density for each category"""
        density = {}
        word_count = len(resume_text.split())
        
        if word_count == 0:
            return {category: 0.0 for category in role_keywords.keys()}
        
        for category, keywords in role_keywords.items():
            keyword_count = sum(resume_text.count(keyword.lower()) for keyword in keywords)
            density[category] = round((keyword_count / word_count) * 100, 2)
        
        return density
    
    def _identify_missing_keywords(self, resume_text: str, role_keywords: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """Identify missing keywords by category"""
        missing = {}
        
        for category, keywords in role_keywords.items():
            missing_in_category = []
            for keyword in keywords:
                if keyword.lower() not in resume_text:
                    missing_in_category.append(keyword)
            missing[category] = missing_in_category
        
        return missing
    
    def _assess_ats_compatibility(self, resume_text: str, sections: Dict) -> int:
        """Assess ATS compatibility based on various factors"""
        score = 0
        max_score = 100
        
        # Check for action verbs (20 points)
        action_verb_count = sum(1 for verb in self.ats_keywords['action_verbs'] 
                               if verb in resume_text)
        score += min(20, action_verb_count * 2)
        
        # Check for soft skills (15 points)
        soft_skill_count = sum(1 for skill in self.ats_keywords['soft_skills'] 
                              if skill in resume_text)
        score += min(15, soft_skill_count * 3)
        
        # Check section structure (25 points)
        required_sections = ['contactInfo', 'education', 'skills', 'experience']
        section_score = sum(5 for section in required_sections 
                           if sections.get(section))
        score += section_score
        
        # Check contact information completeness (20 points)
        contact = sections.get('contactInfo', {})
        if contact.get('email'):
            score += 10
        if contact.get('phone'):
            score += 5
        if contact.get('name'):
            score += 5
        
        # Check for quantifiable achievements (20 points)
        number_patterns = [r'\d+%', r'\$\d+', r'\d+\s*(?:years?|months?)', r'\d+\s*(?:projects?|users?)']
        quantifiable_count = sum(1 for pattern in number_patterns 
                                if re.search(pattern, resume_text))
        score += min(20, quantifiable_count * 5)
        
        return min(score, max_score)
    
    def _generate_keyword_recommendations(self, keyword_matches: Dict, missing_keywords: Dict, job_role: str) -> List[Dict]:
        """Generate specific keyword recommendations"""
        recommendations = []
        
        for category, missing in missing_keywords.items():
            if missing:
                # Prioritize core keywords
                priority = 'high' if category == 'core' else 'medium'
                
                # Limit recommendations to avoid overwhelming
                top_missing = missing[:5] if len(missing) > 5 else missing
                
                recommendations.append({
                    'category': category,
                    'priority': priority,
                    'keywords': top_missing,
                    'suggestion': f"Consider adding {category} keywords to better match {job_role} requirements",
                    'impact': f"Adding these keywords could improve your match score for {job_role} positions"
                })
        
        return recommendations
    
    def _calculate_coverage_percentage(self, keyword_matches: Dict, role_keywords: Dict) -> float:
        """Calculate overall keyword coverage percentage"""
        total_possible = sum(len(keywords) for keywords in role_keywords.values())
        total_matched = sum(len(matches) for matches in keyword_matches.values())
        
        if total_possible == 0:
            return 0.0
        
        return round((total_matched / total_possible) * 100, 1)
    
    def get_keyword_suggestions_by_priority(self, analysis_result: Dict) -> Dict[str, List[str]]:
        """Get keyword suggestions organized by priority"""
        suggestions = {
            'high_priority': [],
            'medium_priority': [],
            'low_priority': []
        }
        
        for rec in analysis_result.get('recommendations', []):
            priority = rec.get('priority', 'medium')
            keywords = rec.get('keywords', [])
            
            if priority == 'high':
                suggestions['high_priority'].extend(keywords)
            elif priority == 'medium':
                suggestions['medium_priority'].extend(keywords)
            else:
                suggestions['low_priority'].extend(keywords)
        
        return suggestions
    
    def calculate_semantic_similarity(self, resume_text: str, job_description: str) -> float:
        """Calculate semantic similarity between resume and job description using TF-IDF"""
        try:
            documents = [resume_text, job_description]
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return round(similarity * 100, 2)  # Convert to percentage
        except Exception:
            return 0.0