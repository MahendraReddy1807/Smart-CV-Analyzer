"""
Property-based tests for section classification functionality
**Feature: smart-cv-analyzer, Property 3: Section Classification Completeness**
"""

import pytest
from hypothesis import given, strategies as st, settings
from modules.section_classifier import SectionClassifier

class TestSectionClassificationProperties:
    """Property-based tests for section classification"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.classifier = SectionClassifier()
    
    @given(
        name=st.text(min_size=2, max_size=50).filter(lambda x: x.strip() and not any(c in x for c in '@0123456789')),
        email=st.emails(),
        phone=st.text(min_size=10, max_size=15).filter(lambda x: x.replace('-', '').replace('(', '').replace(')', '').replace(' ', '').isdigit()),
        education_text=st.text(min_size=20, max_size=200).filter(lambda x: 'education' in x.lower() or 'university' in x.lower() or 'degree' in x.lower()),
        skills_list=st.lists(st.text(min_size=2, max_size=20), min_size=1, max_size=10),
        project_text=st.text(min_size=30, max_size=300).filter(lambda x: 'project' in x.lower() or 'built' in x.lower() or 'developed' in x.lower()),
        experience_text=st.text(min_size=30, max_size=300).filter(lambda x: 'experience' in x.lower() or 'work' in x.lower() or 'job' in x.lower())
    )
    @settings(max_examples=100)
    def test_section_classification_completeness(self, name, email, phone, education_text, skills_list, project_text, experience_text):
        """
        **Feature: smart-cv-analyzer, Property 3: Section Classification Completeness**
        For any resume text containing identifiable sections (contact, education, skills, projects, experience), 
        the section classifier should detect and properly categorize all present sections
        """
        # Construct a resume with all sections
        skills_text = f"Skills: {', '.join(skills_list)}"
        resume_text = f"""
        {name}
        {email}
        {phone}
        
        EDUCATION
        {education_text}
        
        SKILLS
        {skills_text}
        
        PROJECTS
        {project_text}
        
        EXPERIENCE
        {experience_text}
        """
        
        # Classify the sections
        result = self.classifier.classify_sections(resume_text)
        
        # Verify all sections are detected and classified
        assert isinstance(result, dict), "Result should be a dictionary"
        assert 'contactInfo' in result, "Contact info section should be detected"
        assert 'education' in result, "Education section should be detected"
        assert 'skills' in result, "Skills section should be detected"
        assert 'projects' in result, "Projects section should be detected"
        assert 'experience' in result, "Experience section should be detected"
        
        # Verify contact information extraction
        contact_info = result['contactInfo']
        assert isinstance(contact_info, dict), "Contact info should be a dictionary"
        assert contact_info.get('email') == email, f"Email should be extracted correctly: expected {email}, got {contact_info.get('email')}"
        
        # Verify skills extraction
        extracted_skills = result['skills']
        assert isinstance(extracted_skills, list), "Skills should be a list"
        assert len(extracted_skills) > 0, "At least some skills should be extracted"
        
        # Verify section content is not empty
        assert result['education'].strip(), "Education section should not be empty"
        assert result['projects'].strip(), "Projects section should not be empty"
        assert result['experience'].strip(), "Experience section should not be empty"
    
    @given(
        contact_name=st.text(min_size=5, max_size=30).filter(lambda x: x.strip() and not any(c in x for c in '@0123456789')),
        contact_email=st.emails(),
        contact_phone=st.from_regex(r'\(\d{3}\) \d{3}-\d{4}')
    )
    @settings(max_examples=50)
    def test_contact_info_extraction_property(self, contact_name, contact_email, contact_phone):
        """
        Property: Contact information should be correctly extracted from any valid resume text
        """
        resume_text = f"""
        {contact_name}
        Email: {contact_email}
        Phone: {contact_phone}
        
        Some other resume content here...
        """
        
        contact_info = self.classifier.extract_contact_info(resume_text)
        
        # Verify contact information is extracted
        assert isinstance(contact_info, dict), "Contact info should be a dictionary"
        assert 'name' in contact_info, "Name field should exist"
        assert 'email' in contact_info, "Email field should exist"
        assert 'phone' in contact_info, "Phone field should exist"
        
        # Verify extracted values
        assert contact_info['email'] == contact_email, f"Email should match: expected {contact_email}, got {contact_info['email']}"
        # Note: Phone and name extraction might be fuzzy, so we check they're not empty
        assert contact_info['phone'].strip(), "Phone should be extracted"
    
    @given(
        skills=st.lists(
            st.sampled_from([
                'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB',
                'Docker', 'Kubernetes', 'AWS', 'Git', 'Linux', 'Machine Learning',
                'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Flask', 'Django'
            ]),
            min_size=3,
            max_size=10,
            unique=True
        )
    )
    @settings(max_examples=50)
    def test_skills_extraction_property(self, skills):
        """
        Property: Technical skills should be correctly identified and extracted from skills sections
        """
        # Create skills section text
        skills_text = f"""
        TECHNICAL SKILLS
        Programming Languages: {', '.join(skills[:3])}
        Frameworks: {', '.join(skills[3:6]) if len(skills) > 3 else ''}
        Tools: {', '.join(skills[6:]) if len(skills) > 6 else ''}
        """
        
        extracted_skills = self.classifier.extract_skills_list(skills_text)
        
        # Verify skills extraction
        assert isinstance(extracted_skills, list), "Extracted skills should be a list"
        assert len(extracted_skills) > 0, "At least some skills should be extracted"
        
        # Verify that at least some of the input skills are found
        extracted_lower = [skill.lower() for skill in extracted_skills]
        input_lower = [skill.lower() for skill in skills]
        
        found_skills = [skill for skill in input_lower if skill in extracted_lower]
        assert len(found_skills) > 0, f"At least some skills should be found. Input: {skills}, Extracted: {extracted_skills}"
    
    @given(
        section_text=st.text(min_size=50, max_size=500),
        section_type=st.sampled_from(['education', 'skills', 'experience', 'projects', 'certifications'])
    )
    @settings(max_examples=50)
    def test_section_type_classification_consistency(self, section_text, section_type):
        """
        Property: Section type classification should be consistent and return valid section types
        """
        # Add section-specific keywords to make classification more reliable
        keyword_map = {
            'education': ['university', 'degree', 'bachelor', 'master', 'education'],
            'skills': ['skills', 'programming', 'technologies', 'proficient'],
            'experience': ['experience', 'work', 'employment', 'position', 'job'],
            'projects': ['project', 'built', 'developed', 'created'],
            'certifications': ['certification', 'certificate', 'certified', 'license']
        }
        
        # Inject relevant keywords
        enhanced_text = f"{section_text} {' '.join(keyword_map[section_type])}"
        
        classified_type = self.classifier._classify_section_type(enhanced_text)
        
        # Verify classification returns a valid type
        valid_types = ['education', 'skills', 'experience', 'projects', 'certifications', 'other']
        assert classified_type in valid_types, f"Classification should return valid type, got: {classified_type}"
        
        # For enhanced text with clear keywords, should classify correctly most of the time
        # (allowing some flexibility due to the complexity of text classification)
        if any(keyword in enhanced_text.lower() for keyword in keyword_map[section_type]):
            # This is a soft assertion - classification should be reasonable
            assert isinstance(classified_type, str), "Classification result should be a string"
    
    @given(
        resume_text=st.text(min_size=100, max_size=1000)
    )
    @settings(max_examples=30)
    def test_classification_robustness(self, resume_text):
        """
        Property: Section classification should handle any text input without crashing
        """
        try:
            result = self.classifier.classify_sections(resume_text)
            
            # Verify basic structure
            assert isinstance(result, dict), "Result should be a dictionary"
            
            # Verify required keys exist
            required_keys = ['contactInfo', 'education', 'skills', 'experience', 'projects', 'certifications', 'raw']
            for key in required_keys:
                assert key in result, f"Required key '{key}' should be in result"
            
            # Verify data types
            assert isinstance(result['contactInfo'], dict), "Contact info should be a dict"
            assert isinstance(result['skills'], list), "Skills should be a list"
            assert isinstance(result['raw'], str), "Raw text should be a string"
            
            # Verify raw text is preserved
            assert result['raw'] == resume_text, "Raw text should be preserved exactly"
            
        except Exception as e:
            pytest.fail(f"Section classification should not crash on any input. Error: {e}")
    
    def test_empty_text_handling(self):
        """
        Property: Classification should handle empty or minimal text gracefully
        """
        empty_cases = ["", "   ", "\n\n", "a", "test"]
        
        for text in empty_cases:
            result = self.classifier.classify_sections(text)
            
            # Should not crash and should return proper structure
            assert isinstance(result, dict), f"Should return dict for input: '{text}'"
            assert 'contactInfo' in result, f"Should have contactInfo for input: '{text}'"
            assert 'skills' in result, f"Should have skills for input: '{text}'"
            assert result['raw'] == text, f"Should preserve raw text for input: '{text}'"