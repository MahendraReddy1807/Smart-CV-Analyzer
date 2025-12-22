"""
Property-based tests for keyword analysis functionality
**Feature: smart-cv-analyzer, Property 6: Keyword Gap Analysis**
"""

import pytest
from hypothesis import given, strategies as st, settings
from modules.keyword_analyzer import KeywordAnalyzer

class TestKeywordAnalysisProperties:
    """Property-based tests for keyword analysis"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.keyword_analyzer = KeywordAnalyzer()
    
    @given(
        resume_skills=st.lists(
            st.sampled_from([
                'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB',
                'Docker', 'Kubernetes', 'AWS', 'Git', 'Machine Learning', 'TensorFlow',
                'Django', 'Flask', 'PostgreSQL', 'Redis', 'Linux', 'Agile', 'Scrum'
            ]),
            min_size=0,
            max_size=15,
            unique=True
        ),
        job_role=st.sampled_from([
            'software engineer', 'data scientist', 'product manager',
            'frontend developer', 'backend developer', 'devops engineer'
        ]),
        experience_text=st.text(min_size=50, max_size=500),
        projects_text=st.text(min_size=50, max_size=500)
    )
    @settings(max_examples=100)
    def test_keyword_gap_analysis(self, resume_skills, job_role, experience_text, projects_text):
        """
        **Feature: smart-cv-analyzer, Property 6: Keyword Gap Analysis**
        For any resume and target job role combination, if the resume lacks keywords relevant to that job role, 
        the system should identify and suggest those missing keywords
        """
        # Create resume sections
        sections = {
            'contactInfo': {'name': 'Test User', 'email': 'test@example.com'},
            'education': 'Bachelor of Science in Computer Science',
            'skills': resume_skills,
            'experience': experience_text,
            'projects': projects_text,
            'certifications': '',
            'raw': f"{' '.join(resume_skills)} {experience_text} {projects_text}"
        }
        
        # Perform keyword analysis
        analysis_result = self.keyword_analyzer.analyze_keywords(sections, job_role)
        
        # Verify analysis structure
        assert isinstance(analysis_result, dict), "Analysis result should be a dictionary"
        assert 'job_role' in analysis_result, "Result should contain job_role"
        assert 'keyword_matches' in analysis_result, "Result should contain keyword_matches"
        assert 'missing_keywords' in analysis_result, "Result should contain missing_keywords"
        assert 'recommendations' in analysis_result, "Result should contain recommendations"
        
        # Verify job role is preserved
        assert analysis_result['job_role'] == job_role, f"Job role should be preserved: expected {job_role}, got {analysis_result['job_role']}"
        
        # Verify keyword gap identification
        missing_keywords = analysis_result['missing_keywords']
        assert isinstance(missing_keywords, dict), "Missing keywords should be a dictionary"
        
        # If there are missing keywords, they should be relevant to the job role
        for category, missing_list in missing_keywords.items():
            assert isinstance(missing_list, list), f"Missing keywords for {category} should be a list"
            for keyword in missing_list:
                assert isinstance(keyword, str), f"Each missing keyword should be a string, got {type(keyword)}"
                assert len(keyword.strip()) > 0, "Missing keywords should not be empty strings"
        
        # Verify recommendations are generated when there are gaps
        recommendations = analysis_result['recommendations']
        assert isinstance(recommendations, list), "Recommendations should be a list"
        
        # If there are missing keywords, there should be recommendations
        total_missing = sum(len(missing_list) for missing_list in missing_keywords.values())
        if total_missing > 0:
            assert len(recommendations) > 0, "Should have recommendations when keywords are missing"
        
        # Verify coverage percentage is valid
        coverage = analysis_result.get('coverage_percentage', 0)
        assert isinstance(coverage, (int, float)), "Coverage percentage should be numeric"
        assert 0 <= coverage <= 100, f"Coverage percentage should be between 0 and 100, got {coverage}"
    
    @given(
        job_role=st.sampled_from(['software engineer', 'data scientist', 'frontend developer']),
        matching_skills=st.lists(
            st.text(min_size=3, max_size=20),
            min_size=1,
            max_size=10
        )
    )
    @settings(max_examples=50)
    def test_keyword_matching_accuracy(self, job_role, matching_skills):
        """
        Property: Keywords that exist in the resume should be correctly identified as matches
        """
        # Create resume with specific skills that should match
        resume_text = f"I have experience with {', '.join(matching_skills)}"
        sections = {
            'contactInfo': {'email': 'test@example.com'},
            'skills': matching_skills,
            'experience': resume_text,
            'projects': '',
            'education': '',
            'certifications': '',
            'raw': resume_text
        }
        
        analysis_result = self.keyword_analyzer.analyze_keywords(sections, job_role)
        
        # Verify that skills present in resume are not marked as missing
        missing_keywords = analysis_result['missing_keywords']
        keyword_matches = analysis_result['keyword_matches']
        
        # Check that the analysis doesn't contradict itself
        for category, matches in keyword_matches.items():
            missing_in_category = missing_keywords.get(category, [])
            for matched_keyword in matches:
                assert matched_keyword not in missing_in_category, \
                    f"Keyword '{matched_keyword}' cannot be both matched and missing"
    
    @given(
        empty_resume=st.just({
            'contactInfo': {},
            'education': '',
            'skills': [],
            'experience': '',
            'projects': '',
            'certifications': '',
            'raw': ''
        }),
        job_role=st.sampled_from(['software engineer', 'data scientist', 'product manager'])
    )
    @settings(max_examples=20)
    def test_empty_resume_gap_analysis(self, empty_resume, job_role):
        """
        Property: Empty resumes should identify significant keyword gaps
        """
        analysis_result = self.keyword_analyzer.analyze_keywords(empty_resume, job_role)
        
        # Empty resume should have many missing keywords
        missing_keywords = analysis_result['missing_keywords']
        total_missing = sum(len(missing_list) for missing_list in missing_keywords.values())
        
        assert total_missing > 0, "Empty resume should have missing keywords"
        
        # Coverage should be very low
        coverage = analysis_result['coverage_percentage']
        assert coverage < 50, f"Empty resume should have low coverage, got {coverage}%"
        
        # Should have recommendations
        recommendations = analysis_result['recommendations']
        assert len(recommendations) > 0, "Empty resume should generate recommendations"
    
    @given(
        job_role=st.text(min_size=1, max_size=50)
    )
    @settings(max_examples=30)
    def test_unknown_job_role_handling(self, job_role):
        """
        Property: System should handle unknown job roles gracefully
        """
        sections = {
            'contactInfo': {'email': 'test@example.com'},
            'skills': ['Python', 'JavaScript', 'SQL'],
            'experience': 'Software developer with 3 years experience',
            'projects': 'Built web applications',
            'education': 'Computer Science degree',
            'certifications': '',
            'raw': 'Python JavaScript SQL Software developer web applications'
        }
        
        try:
            analysis_result = self.keyword_analyzer.analyze_keywords(sections, job_role)
            
            # Should not crash and should return valid structure
            assert isinstance(analysis_result, dict), "Should return valid analysis structure"
            assert 'missing_keywords' in analysis_result, "Should contain missing_keywords"
            assert 'recommendations' in analysis_result, "Should contain recommendations"
            assert 'coverage_percentage' in analysis_result, "Should contain coverage_percentage"
            
            # Coverage should be valid
            coverage = analysis_result['coverage_percentage']
            assert 0 <= coverage <= 100, f"Coverage should be valid percentage, got {coverage}"
            
        except Exception as e:
            pytest.fail(f"Should handle unknown job role gracefully, but got error: {e}")
    
    @given(
        ats_keywords=st.lists(
            st.sampled_from([
                'achieved', 'analyzed', 'built', 'created', 'developed', 'improved',
                'leadership', 'communication', 'teamwork', 'problem solving'
            ]),
            min_size=0,
            max_size=10,
            unique=True
        )
    )
    @settings(max_examples=30)
    def test_ats_compatibility_scoring(self, ats_keywords):
        """
        Property: ATS compatibility scoring should reflect presence of ATS-friendly keywords
        """
        # Create resume with ATS keywords
        resume_text = f"I have {' and '.join(ats_keywords)} experience in various projects"
        sections = {
            'contactInfo': {'name': 'John Doe', 'email': 'john@example.com', 'phone': '555-1234'},
            'skills': ['Python', 'Java'],
            'experience': resume_text,
            'projects': 'Built multiple applications',
            'education': 'Bachelor degree',
            'certifications': '',
            'raw': resume_text
        }
        
        analysis_result = self.keyword_analyzer.analyze_keywords(sections, 'software engineer')
        
        # Verify ATS score is present and valid
        ats_score = analysis_result.get('ats_compatibility_score', 0)
        assert isinstance(ats_score, (int, float)), "ATS score should be numeric"
        assert 0 <= ats_score <= 100, f"ATS score should be between 0 and 100, got {ats_score}"
        
        # More ATS keywords should generally lead to higher scores
        if len(ats_keywords) > 5:
            assert ats_score > 30, f"Resume with many ATS keywords should score reasonably well, got {ats_score}"
    
    def test_keyword_analysis_consistency(self):
        """
        Property: Same input should produce consistent results
        """
        sections = {
            'contactInfo': {'name': 'Jane Doe', 'email': 'jane@example.com'},
            'skills': ['Python', 'React', 'SQL', 'Docker'],
            'experience': 'Senior software engineer with 5 years experience developing web applications',
            'projects': 'Built scalable microservices using Python and Docker',
            'education': 'Master of Computer Science',
            'certifications': 'AWS Certified',
            'raw': 'Python React SQL Docker Senior software engineer web applications microservices'
        }
        job_role = 'software engineer'
        
        # Run analysis multiple times
        results = []
        for _ in range(3):
            result = self.keyword_analyzer.analyze_keywords(sections, job_role)
            results.append(result)
        
        # Results should be identical
        first_result = results[0]
        for result in results[1:]:
            assert result['coverage_percentage'] == first_result['coverage_percentage'], \
                "Coverage percentage should be consistent"
            assert result['ats_compatibility_score'] == first_result['ats_compatibility_score'], \
                "ATS score should be consistent"
            assert len(result['recommendations']) == len(first_result['recommendations']), \
                "Number of recommendations should be consistent"
        }
        
        # Analyze keywords
        analysis = self.keyword_analyzer.analyze_keywords(sections, job_role)
        
        # Verify analysis structure
        assert isinstance(analysis, dict), "Analysis should return a dictionary"
        assert 'job_role' in analysis, "Analysis should include job role"
        assert 'keyword_matches' in analysis, "Analysis should include keyword matches"
        assert 'missing_keywords' in analysis, "Analysis should include missing keywords"
        assert 'recommendations' in analysis, "Analysis should include recommendations"
        
        # Verify job role is preserved
        assert analysis['job_role'] == job_role, f"Job role should be preserved: expected {job_role}, got {analysis['job_role']}"
        
        # Verify keyword matching logic
        keyword_matches = analysis['keyword_matches']
        missing_keywords = analysis['missing_keywords']
        
        assert isinstance(keyword_matches, dict), "Keyword matches should be a dictionary"
        assert isinstance(missing_keywords, dict), "Missing keywords should be a dictionary"
        
        # For each category, verify that keywords are either matched or missing (not both)
        for category in keyword_matches.keys():
            if category in missing_keywords:
                matched_set = set(kw.lower() for kw in keyword_matches[category])
                missing_set = set(kw.lower() for kw in missing_keywords[category])
                
                # No keyword should be both matched and missing
                overlap = matched_set.intersection(missing_set)
                assert len(overlap) == 0, f"Keywords cannot be both matched and missing in category {category}: {overlap}"
        
        # Verify coverage percentage is valid
        coverage = analysis.get('coverage_percentage', 0)
        assert 0 <= coverage <= 100, f"Coverage percentage should be between 0 and 100, got {coverage}"
        
        # If resume has relevant skills, some keywords should be matched
        resume_text_lower = ' '.join(resume_skills).lower()
        if any(skill.lower() in resume_text_lower for skill in ['python', 'java', 'javascript', 'react']):
            total_matches = sum(len(matches) for matches in keyword_matches.values())
            assert total_matches > 0, "Resume with relevant skills should have some keyword matches"
    
    @given(
        job_role=st.sampled_from(['software engineer', 'data scientist', 'devops engineer']),
        empty_resume=st.just({
            'contactInfo': {},
            'education': '',
            'skills': [],
            'experience': '',
            'projects': '',
            'certifications': '',
            'raw': ''
        })
    )
    @settings(max_examples=20)
    def test_empty_resume_keyword_analysis(self, job_role, empty_resume):
        """
        Property: Empty resumes should have comprehensive missing keyword lists
        """
        analysis = self.keyword_analyzer.analyze_keywords(empty_resume, job_role)
        
        # Empty resume should have many missing keywords
        missing_keywords = analysis['missing_keywords']
        total_missing = sum(len(missing) for missing in missing_keywords.values())
        assert total_missing > 0, "Empty resume should have missing keywords for any job role"
        
        # Coverage should be very low or zero
        coverage = analysis['coverage_percentage']
        assert coverage <= 10, f"Empty resume should have low coverage, got {coverage}%"
        
        # Should have recommendations
        recommendations = analysis['recommendations']
        assert len(recommendations) > 0, "Empty resume should generate recommendations"
    
    @given(
        comprehensive_skills=st.just([
            'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB',
            'Docker', 'Kubernetes', 'AWS', 'Git', 'Machine Learning', 'TensorFlow',
            'Django', 'Flask', 'PostgreSQL', 'Redis', 'Linux', 'Agile', 'Scrum',
            'CI/CD', 'Microservices', 'REST API', 'GraphQL', 'Testing'
        ]),
        job_role=st.sampled_from(['software engineer', 'backend developer']),
        detailed_experience=st.just(
            "Senior Software Engineer with 5 years experience developing scalable web applications "
            "using Python, Django, and React. Built microservices architecture on AWS with Docker "
            "and Kubernetes. Implemented CI/CD pipelines and automated testing frameworks."
        )
    )
    @settings(max_examples=10)
    def test_comprehensive_resume_keyword_analysis(self, comprehensive_skills, job_role, detailed_experience):
        """
        Property: Comprehensive resumes should have high keyword coverage and fewer missing keywords
        """
        sections = {
            'contactInfo': {'name': 'Senior Developer', 'email': 'dev@example.com'},
            'education': 'Master of Science in Computer Science',
            'skills': comprehensive_skills,
            'experience': detailed_experience,
            'projects': 'Built multiple full-stack applications using modern technologies',
            'certifications': 'AWS Certified Solutions Architect',
            'raw': f"{' '.join(comprehensive_skills)} {detailed_experience}"
        }
        
        analysis = self.keyword_analyzer.analyze_keywords(sections, job_role)
        
        # Should have high coverage
        coverage = analysis['coverage_percentage']
        assert coverage >= 30, f"Comprehensive resume should have decent coverage, got {coverage}%"
        
        # Should have many keyword matches
        total_matches = sum(len(matches) for matches in analysis['keyword_matches'].values())
        assert total_matches >= 10, f"Comprehensive resume should have many matches, got {total_matches}"
        
        # ATS compatibility should be high
        ats_score = analysis['ats_compatibility_score']
        assert ats_score >= 60, f"Comprehensive resume should have good ATS score, got {ats_score}"
    
    @given(
        job_role=st.text(min_size=1, max_size=100).filter(lambda x: x.strip()),
        basic_sections=st.just({
            'contactInfo': {'email': 'test@example.com'},
            'education': 'Bachelor Degree',
            'skills': ['Communication', 'Teamwork'],
            'experience': 'Some work experience',
            'projects': 'Personal projects',
            'certifications': '',
            'raw': 'basic resume content'
        })
    )
    @settings(max_examples=50)
    def test_arbitrary_job_role_handling(self, job_role, basic_sections):
        """
        Property: System should handle any job role input gracefully
        """
        try:
            analysis = self.keyword_analyzer.analyze_keywords(basic_sections, job_role)
            
            # Should not crash and return valid structure
            assert isinstance(analysis, dict), "Should return dictionary for any job role"
            assert 'job_role' in analysis, "Should preserve job role"
            assert 'keyword_matches' in analysis, "Should have keyword matches structure"
            assert 'missing_keywords' in analysis, "Should have missing keywords structure"
            
            # Coverage should be valid percentage
            coverage = analysis.get('coverage_percentage', 0)
            assert 0 <= coverage <= 100, f"Coverage should be valid percentage, got {coverage}"
            
        except Exception as e:
            pytest.fail(f"Should handle arbitrary job role gracefully. Job role: '{job_role}', Error: {e}")
    
    @given(
        target_keywords=st.lists(
            st.sampled_from(['python', 'java', 'react', 'sql', 'docker', 'aws']),
            min_size=1,
            max_size=5,
            unique=True
        ),
        job_role=st.just('software engineer')
    )
    @settings(max_examples=30)
    def test_keyword_inclusion_detection(self, target_keywords, job_role):
        """
        Property: If specific keywords are included in resume, they should be detected as matches
        """
        # Create resume with target keywords
        skills_with_targets = target_keywords + ['communication', 'teamwork']
        experience_with_targets = f"Experienced with {', '.join(target_keywords)} and other technologies"
        
        sections = {
            'contactInfo': {'email': 'test@example.com'},
            'education': 'Computer Science Degree',
            'skills': skills_with_targets,
            'experience': experience_with_targets,
            'projects': f"Built projects using {target_keywords[0]}",
            'certifications': '',
            'raw': f"{' '.join(skills_with_targets)} {experience_with_targets}"
        }
        
        analysis = self.keyword_analyzer.analyze_keywords(sections, job_role)
        
        # Check that target keywords are detected
        all_matches = []
        for category_matches in analysis['keyword_matches'].values():
            all_matches.extend([kw.lower() for kw in category_matches])
        
        for keyword in target_keywords:
            assert keyword.lower() in all_matches or any(keyword.lower() in match.lower() for match in all_matches), \
                f"Keyword '{keyword}' should be detected in matches. Found matches: {all_matches}"
    
    def test_keyword_analysis_consistency(self):
        """
        Property: Same input should produce consistent results
        """
        sections = {
            'contactInfo': {'name': 'Test User', 'email': 'test@example.com'},
            'education': 'Computer Science Degree',
            'skills': ['Python', 'JavaScript', 'SQL'],
            'experience': 'Software developer with Python and JavaScript experience',
            'projects': 'Built web applications using modern frameworks',
            'certifications': '',
            'raw': 'Python JavaScript SQL software developer web applications'
        }
        job_role = 'software engineer'
        
        # Run analysis multiple times
        results = []
        for _ in range(3):
            analysis = self.keyword_analyzer.analyze_keywords(sections, job_role)
            results.append({
                'coverage': analysis['coverage_percentage'],
                'total_matches': sum(len(matches) for matches in analysis['keyword_matches'].values()),
                'ats_score': analysis['ats_compatibility_score']
            })
        
        # Results should be identical
        first_result = results[0]
        for result in results[1:]:
            assert result['coverage'] == first_result['coverage'], "Coverage should be consistent"
            assert result['total_matches'] == first_result['total_matches'], "Match count should be consistent"
            assert result['ats_score'] == first_result['ats_score'], "ATS score should be consistent"
    
    @given(
        malformed_sections=st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.text(), st.integers(), st.none(), st.lists(st.text())),
            min_size=1,
            max_size=8
        ),
        job_role=st.text(min_size=1, max_size=50)
    )
    @settings(max_examples=20)
    def test_malformed_input_robustness(self, malformed_sections, job_role):
        """
        Property: System should handle malformed input gracefully
        """
        try:
            analysis = self.keyword_analyzer.analyze_keywords(malformed_sections, job_role)
            
            # If it doesn't crash, verify basic structure
            if isinstance(analysis, dict):
                coverage = analysis.get('coverage_percentage', 0)
                assert 0 <= coverage <= 100, "Coverage should be valid even for malformed input"
                
        except (TypeError, AttributeError, KeyError):
            # These exceptions are acceptable for malformed input
            pass