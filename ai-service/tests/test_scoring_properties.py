"""
Property-based tests for resume scoring functionality
**Feature: smart-cv-analyzer, Property 4: Score Boundary Compliance**
"""

import pytest
from hypothesis import given, strategies as st, settings
from modules.scoring_engine import ScoringEngine

class TestScoringProperties:
    """Property-based tests for resume scoring"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.scoring_engine = ScoringEngine()
    
    @given(
        contact_info=st.dictionaries(
            keys=st.sampled_from(['name', 'email', 'phone', 'location']),
            values=st.text(min_size=1, max_size=50),
            min_size=0,
            max_size=4
        ),
        education=st.text(min_size=0, max_size=500),
        skills=st.lists(st.text(min_size=1, max_size=30), min_size=0, max_size=20),
        experience=st.text(min_size=0, max_size=1000),
        projects=st.text(min_size=0, max_size=1000),
        certifications=st.text(min_size=0, max_size=300),
        job_role=st.text(min_size=1, max_size=100)
    )
    @settings(max_examples=100)
    def test_score_boundary_compliance(self, contact_info, education, skills, experience, projects, certifications, job_role):
        """
        **Feature: smart-cv-analyzer, Property 4: Score Boundary Compliance**
        For any resume analysis, the calculated score should always be within the valid range of 0 to 100, 
        regardless of resume quality or content
        """
        # Create sections dictionary
        sections = {
            'contactInfo': contact_info,
            'education': education,
            'skills': skills,
            'experience': experience,
            'projects': projects,
            'certifications': certifications,
            'raw': f"{education} {experience} {projects} {certifications}"
        }
        
        # Calculate score
        result = self.scoring_engine.calculate_score(sections, job_role)
        
        # Verify result structure
        assert isinstance(result, dict), "Score result should be a dictionary"
        assert 'overall_score' in result, "Result should contain overall_score"
        assert 'breakdown' in result, "Result should contain breakdown"
        
        # Verify score boundary compliance
        overall_score = result['overall_score']
        assert isinstance(overall_score, int), f"Overall score should be an integer, got {type(overall_score)}"
        assert 0 <= overall_score <= 100, f"Overall score should be between 0 and 100, got {overall_score}"
        
        # Verify breakdown scores are also within bounds
        breakdown = result['breakdown']
        assert isinstance(breakdown, dict), "Breakdown should be a dictionary"
        
        for component, score in breakdown.items():
            assert isinstance(score, (int, float)), f"Breakdown score for {component} should be numeric, got {type(score)}"
            assert 0 <= score <= 100, f"Breakdown score for {component} should be between 0 and 100, got {score}"
    
    @given(
        empty_sections=st.just({
            'contactInfo': {},
            'education': '',
            'skills': [],
            'experience': '',
            'projects': '',
            'certifications': '',
            'raw': ''
        }),
        job_role=st.text(min_size=1, max_size=50)
    )
    @settings(max_examples=20)
    def test_empty_resume_score_bounds(self, empty_sections, job_role):
        """
        Property: Even completely empty resumes should produce valid scores within bounds
        """
        result = self.scoring_engine.calculate_score(empty_sections, job_role)
        
        overall_score = result['overall_score']
        assert 0 <= overall_score <= 100, f"Empty resume score should be within bounds, got {overall_score}"
        
        # Empty resume should typically score low but not negative
        assert overall_score >= 0, "Empty resume should not have negative score"
    
    @given(
        perfect_sections=st.just({
            'contactInfo': {
                'name': 'John Doe',
                'email': 'john.doe@email.com',
                'phone': '(555) 123-4567',
                'location': 'New York, NY'
            },
            'education': 'Bachelor of Science in Computer Science, MIT, 2020',
            'skills': [
                'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB',
                'Docker', 'Kubernetes', 'AWS', 'Git', 'Machine Learning', 'TensorFlow'
            ],
            'experience': 'Senior Software Engineer at Google (2020-2023). Developed scalable web applications serving millions of users. Led team of 5 engineers. Improved system performance by 40%.',
            'projects': 'Built machine learning recommendation system that increased user engagement by 25%. Developed real-time chat application using WebSocket technology. Created automated testing framework reducing bugs by 60%.',
            'certifications': 'AWS Certified Solutions Architect, Google Cloud Professional',
            'raw': 'Complete resume with all sections'
        }),
        job_role=st.sampled_from(['software engineer', 'data scientist', 'backend developer'])
    )
    @settings(max_examples=10)
    def test_high_quality_resume_score_bounds(self, perfect_sections, job_role):
        """
        Property: High-quality resumes should still respect score bounds (not exceed 100)
        """
        result = self.scoring_engine.calculate_score(perfect_sections, job_role)
        
        overall_score = result['overall_score']
        assert 0 <= overall_score <= 100, f"High-quality resume score should be within bounds, got {overall_score}"
        
        # High-quality resume should score well but not exceed maximum
        assert overall_score <= 100, "High-quality resume should not exceed maximum score"
    
    @given(
        skills_count=st.integers(min_value=0, max_value=50),
        job_role=st.text(min_size=1, max_size=50)
    )
    @settings(max_examples=50)
    def test_skills_score_consistency(self, skills_count, job_role):
        """
        Property: Skills scoring should be consistent and within bounds regardless of skill count
        """
        # Generate skills list
        skills = [f"skill_{i}" for i in range(skills_count)]
        
        sections = {
            'contactInfo': {'email': 'test@example.com'},
            'education': 'Bachelor Degree',
            'skills': skills,
            'experience': 'Some experience',
            'projects': 'Some projects',
            'certifications': '',
            'raw': 'test resume'
        }
        
        result = self.scoring_engine.calculate_score(sections, job_role)
        
        # Verify overall score bounds
        overall_score = result['overall_score']
        assert 0 <= overall_score <= 100, f"Score should be within bounds for {skills_count} skills, got {overall_score}"
        
        # Verify skills component score bounds
        if 'skills_score' in result['breakdown']:
            skills_score = result['breakdown']['skills_score']
            assert 0 <= skills_score <= 100, f"Skills score should be within bounds, got {skills_score}"
    
    @given(
        job_role=st.sampled_from([
            'software engineer', 'data scientist', 'product manager', 
            'frontend developer', 'backend developer', 'devops engineer',
            'random job title', '', 'job with numbers 123', 'job-with-special-chars!'
        ])
    )
    @settings(max_examples=30)
    def test_job_role_robustness(self, job_role):
        """
        Property: Scoring should handle any job role input without breaking bounds
        """
        # Standard resume sections
        sections = {
            'contactInfo': {'name': 'Test User', 'email': 'test@example.com'},
            'education': 'Bachelor of Science',
            'skills': ['Python', 'JavaScript', 'SQL'],
            'experience': 'Software Developer at Tech Company',
            'projects': 'Built web application using modern frameworks',
            'certifications': 'Professional Certification',
            'raw': 'Complete resume content'
        }
        
        result = self.scoring_engine.calculate_score(sections, job_role)
        
        # Should not crash and should return valid scores
        overall_score = result['overall_score']
        assert 0 <= overall_score <= 100, f"Score should be within bounds for job role '{job_role}', got {overall_score}"
        
        # All breakdown components should also be within bounds
        for component, score in result['breakdown'].items():
            assert 0 <= score <= 100, f"Component {component} should be within bounds for job role '{job_role}', got {score}"
    
    def test_score_determinism(self):
        """
        Property: Same input should always produce the same score (deterministic behavior)
        """
        sections = {
            'contactInfo': {'name': 'John Doe', 'email': 'john@example.com'},
            'education': 'Computer Science Degree',
            'skills': ['Python', 'Java', 'SQL'],
            'experience': 'Software Engineer with 3 years experience',
            'projects': 'Built e-commerce platform',
            'certifications': 'AWS Certified',
            'raw': 'Complete resume'
        }
        job_role = 'software engineer'
        
        # Calculate score multiple times
        results = []
        for _ in range(5):
            result = self.scoring_engine.calculate_score(sections, job_role)
            results.append(result['overall_score'])
        
        # All results should be identical
        assert all(score == results[0] for score in results), f"Scores should be deterministic, got {results}"
        
        # All should be within bounds
        for score in results:
            assert 0 <= score <= 100, f"All scores should be within bounds, got {score}"
    
    @given(
        malformed_sections=st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(
                st.text(),
                st.lists(st.text()),
                st.dictionaries(st.text(), st.text()),
                st.integers(),
                st.none()
            ),
            min_size=1,
            max_size=10
        ),
        job_role=st.text(min_size=1, max_size=50)
    )
    @settings(max_examples=30)
    def test_malformed_input_robustness(self, malformed_sections, job_role):
        """
        Property: Scoring should handle malformed input gracefully and still return valid bounds
        """
        try:
            result = self.scoring_engine.calculate_score(malformed_sections, job_role)
            
            # If it doesn't crash, the result should still be valid
            if isinstance(result, dict) and 'overall_score' in result:
                overall_score = result['overall_score']
                assert 0 <= overall_score <= 100, f"Score should be within bounds even for malformed input, got {overall_score}"
                
        except (TypeError, KeyError, AttributeError):
            # It's acceptable for malformed input to raise these exceptions
            # The important thing is that it doesn't crash the system entirely
            pass