"""
Property-based tests for enhanced resume generation functionality
**Feature: smart-cv-analyzer, Property 8: Enhanced Resume Generation**
"""

import pytest
from hypothesis import given, strategies as st, settings
from modules.resume_generator import ResumeGenerator
import os
import tempfile
from PyPDF2 import PdfReader
from io import BytesIO

class TestResumeGenerationProperties:
    """Property-based tests for resume generation"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.resume_generator = ResumeGenerator()
    
    @given(
        analysis_data=st.fixed_dictionaries({
            'uploadedFileName': st.text(min_size=1, max_size=100),
            'jobRole': st.text(min_size=1, max_size=50),
            'sections': st.fixed_dictionaries({
                'contactInfo': st.fixed_dictionaries({
                    'name': st.one_of(st.none(), st.text(min_size=1, max_size=50)),
                    'email': st.one_of(st.none(), st.emails()),
                    'phone': st.one_of(st.none(), st.text(min_size=10, max_size=15)),
                    'location': st.one_of(st.none(), st.text(min_size=1, max_size=100))
                }),
                'education': st.text(max_size=500),
                'skills': st.lists(st.text(min_size=1, max_size=30), max_size=20),
                'experience': st.text(max_size=1000),
                'projects': st.text(max_size=1000),
                'certifications': st.text(max_size=300)
            }),
            'overallScore': st.integers(min_value=0, max_value=100),
            'enhancedBullets': st.lists(
                st.fixed_dictionaries({
                    'original': st.text(min_size=10, max_size=200),
                    'improved': st.text(min_size=10, max_size=300),
                    'section': st.sampled_from(['projects', 'experience', 'general'])
                }),
                max_size=5
            )
        }),
        accepted_enhancements=st.lists(st.text(min_size=1, max_size=20), max_size=10)
    )
    @settings(max_examples=50)
    def test_enhanced_resume_generation(self, analysis_data, accepted_enhancements):
        """
        **Feature: smart-cv-analyzer, Property 8: Enhanced Resume Generation**
        For any analysis with applied enhancements, generating the enhanced resume should produce 
        a valid PDF document containing all accepted improvements and maintaining ATS-friendly formatting
        """
        try:
            # Generate enhanced resume
            pdf_bytes = self.resume_generator.generate_enhanced_resume(
                analysis_data, 
                accepted_enhancements
            )
            
            # Verify PDF is generated
            assert isinstance(pdf_bytes, bytes), "Generated resume should be bytes"
            assert len(pdf_bytes) > 0, "Generated PDF should not be empty"
            
            # Verify PDF is valid by attempting to read it
            pdf_buffer = BytesIO(pdf_bytes)
            try:
                pdf_reader = PdfReader(pdf_buffer)
                assert len(pdf_reader.pages) > 0, "PDF should have at least one page"
                
                # Extract text from first page to verify content
                first_page = pdf_reader.pages[0]
                page_text = first_page.extract_text()
                
                # Verify essential content is present
                contact_info = analysis_data['sections']['contactInfo']
                if contact_info.get('name'):
                    assert contact_info['name'] in page_text, "Name should be present in PDF"
                if contact_info.get('email'):
                    assert contact_info['email'] in page_text, "Email should be present in PDF"
                
                # Verify skills are present if they exist
                skills = analysis_data['sections']['skills']
                if skills:
                    # At least some skills should be present
                    skills_found = any(skill in page_text for skill in skills[:3])  # Check first 3 skills
                    assert skills_found, "Some skills should be present in PDF"
                
            except Exception as pdf_error:
                pytest.fail(f"Generated PDF is not valid: {pdf_error}")
            
        except Exception as e:
            pytest.fail(f"Resume generation should not fail for valid input: {e}")
    
    @given(
        minimal_data=st.fixed_dictionaries({
            'uploadedFileName': st.just('test.pdf'),
            'jobRole': st.just('software engineer'),
            'sections': st.fixed_dictionaries({
                'contactInfo': st.just({'name': 'Test User', 'email': 'test@example.com'}),
                'education': st.just(''),
                'skills': st.just([]),
                'experience': st.just(''),
                'projects': st.just(''),
                'certifications': st.just('')
            }),
            'overallScore': st.just(50),
            'enhancedBullets': st.just([])
        })
    )
    @settings(max_examples=10)
    def test_minimal_resume_generation(self, minimal_data):
        """
        Property: Resume generation should work even with minimal data
        """
        pdf_bytes = self.resume_generator.generate_enhanced_resume(minimal_data, [])
        
        assert isinstance(pdf_bytes, bytes), "Should generate PDF bytes"
        assert len(pdf_bytes) > 0, "PDF should not be empty"
        
        # Verify PDF is readable
        pdf_buffer = BytesIO(pdf_bytes)
        pdf_reader = PdfReader(pdf_buffer)
        assert len(pdf_reader.pages) > 0, "Should have at least one page"
        
        # Should contain at least the name
        page_text = pdf_reader.pages[0].extract_text()
        assert 'Test User' in page_text, "Should contain the user's name"
    
    @given(
        comprehensive_data=st.fixed_dictionaries({
            'uploadedFileName': st.just('comprehensive_resume.pdf'),
            'jobRole': st.just('senior software engineer'),
            'sections': st.fixed_dictionaries({
                'contactInfo': st.just({
                    'name': 'John Doe',
                    'email': 'john.doe@example.com',
                    'phone': '(555) 123-4567',
                    'location': 'New York, NY'
                }),
                'education': st.just('Master of Science in Computer Science, MIT, 2020'),
                'skills': st.just(['Python', 'JavaScript', 'React', 'Node.js', 'Docker', 'AWS']),
                'experience': st.just('• Senior Software Engineer at Tech Corp (2020-2023)\n• Led team of 5 developers\n• Improved system performance by 40%'),
                'projects': st.just('• Built scalable web application serving 100k+ users\n• Developed microservices architecture'),
                'certifications': st.just('AWS Certified Solutions Architect, Google Cloud Professional')
            }),
            'overallScore': st.just(85),
            'enhancedBullets': st.just([
                {
                    'original': 'worked on web application',
                    'improved': 'developed and deployed scalable web application serving 100,000+ users',
                    'section': 'projects'
                }
            ])
        })
    )
    @settings(max_examples=5)
    def test_comprehensive_resume_generation(self, comprehensive_data):
        """
        Property: Comprehensive resume data should generate well-structured PDF
        """
        pdf_bytes = self.resume_generator.generate_enhanced_resume(comprehensive_data, ['projects_0'])
        
        assert len(pdf_bytes) > 1000, "Comprehensive resume should be substantial in size"
        
        # Verify PDF content
        pdf_buffer = BytesIO(pdf_bytes)
        pdf_reader = PdfReader(pdf_buffer)
        page_text = pdf_reader.pages[0].extract_text()
        
        # Verify all major sections are present
        assert 'John Doe' in page_text, "Name should be present"
        assert 'john.doe@example.com' in page_text, "Email should be present"
        assert 'Python' in page_text, "Skills should be present"
        assert 'MIT' in page_text, "Education should be present"
        assert 'Tech Corp' in page_text, "Experience should be present"
        assert 'AWS Certified' in page_text, "Certifications should be present"
    
    def test_ats_optimized_generation(self):
        """
        Property: ATS-optimized resume should follow best practices
        """
        analysis_data = {
            'uploadedFileName': 'ats_resume.pdf',
            'jobRole': 'data scientist',
            'sections': {
                'contactInfo': {
                    'name': 'Jane Smith',
                    'email': 'jane.smith@example.com',
                    'phone': '(555) 987-6543'
                },
                'education': 'PhD in Data Science, Stanford University',
                'skills': ['Python', 'R', 'Machine Learning', 'TensorFlow', 'SQL'],
                'experience': '• Data Scientist at AI Company\n• Developed ML models improving accuracy by 25%',
                'projects': '• Built recommendation system using collaborative filtering',
                'certifications': 'Google Cloud ML Engineer'
            },
            'overallScore': 90,
            'enhancedBullets': []
        }
        
        pdf_bytes = self.resume_generator.generate_ats_optimized_resume(analysis_data)
        
        assert isinstance(pdf_bytes, bytes), "Should generate PDF bytes"
        assert len(pdf_bytes) > 0, "PDF should not be empty"
        
        # Verify PDF structure
        pdf_buffer = BytesIO(pdf_bytes)
        pdf_reader = PdfReader(pdf_buffer)
        page_text = pdf_reader.pages[0].extract_text()
        
        # ATS-friendly elements should be present
        assert 'Jane Smith' in page_text, "Name should be prominent"
        assert 'Core Competencies' in page_text or 'Skills' in page_text, "Skills section should be present"
        assert 'Professional Experience' in page_text or 'Experience' in page_text, "Experience section should be present"
    
    @given(
        file_operations_data=st.fixed_dictionaries({
            'uploadedFileName': st.text(min_size=1, max_size=50),
            'sections': st.fixed_dictionaries({
                'contactInfo': st.just({'name': 'Test User'}),
                'education': st.just('Test Education'),
                'skills': st.just(['Python']),
                'experience': st.just('Test Experience'),
                'projects': st.just(''),
                'certifications': st.just('')
            }),
            'overallScore': st.integers(min_value=0, max_value=100),
            'enhancedBullets': st.just([])
        })
    )
    @settings(max_examples=20)
    def test_file_operations(self, file_operations_data):
        """
        Property: File operations should work correctly for any valid data
        """
        # Generate PDF
        pdf_bytes = self.resume_generator.generate_enhanced_resume(file_operations_data, [])
        
        # Save to file
        filename = f"test_{file_operations_data['uploadedFileName']}.pdf"
        file_path = self.resume_generator.save_resume_to_file(pdf_bytes, filename)
        
        try:
            # Verify file was created
            assert os.path.exists(file_path), "File should be created"
            assert os.path.getsize(file_path) > 0, "File should not be empty"
            
            # Verify file content matches generated bytes
            with open(file_path, 'rb') as f:
                file_content = f.read()
            assert file_content == pdf_bytes, "File content should match generated bytes"
            
        finally:
            # Clean up
            if os.path.exists(file_path):
                os.remove(file_path)
    
    def test_metadata_generation(self):
        """
        Property: Metadata should accurately reflect resume content
        """
        analysis_data = {
            'uploadedFileName': 'metadata_test.pdf',
            'sections': {
                'contactInfo': {'name': 'Test User', 'email': 'test@example.com'},
                'education': 'Bachelor Degree',
                'skills': ['Python', 'Java', 'SQL'],
                'experience': 'Software Engineer with 3 years experience',
                'projects': 'Built web application',
                'certifications': 'AWS Certified'
            },
            'overallScore': 75,
            'enhancedBullets': [
                {'original': 'worked on project', 'improved': 'developed project', 'section': 'projects'}
            ]
        }
        
        metadata = self.resume_generator.get_resume_metadata(analysis_data)
        
        # Verify metadata accuracy
        assert isinstance(metadata, dict), "Metadata should be a dictionary"
        assert metadata['has_contact_info'] == True, "Should detect contact info"
        assert metadata['skills_count'] == 3, "Should count skills correctly"
        assert metadata['has_experience'] == True, "Should detect experience"
        assert metadata['has_projects'] == True, "Should detect projects"
        assert metadata['has_education'] == True, "Should detect education"
        assert metadata['has_certifications'] == True, "Should detect certifications"
        assert metadata['enhancement_count'] == 1, "Should count enhancements"
        assert metadata['overall_score'] == 75, "Should preserve overall score"
        assert metadata['ats_optimized'] == True, "Should indicate ATS optimization"
    
    def test_error_handling_robustness(self):
        """
        Property: Resume generation should handle edge cases gracefully
        """
        edge_cases = [
            # Empty data
            {
                'uploadedFileName': '',
                'sections': {'contactInfo': {}, 'education': '', 'skills': [], 'experience': '', 'projects': '', 'certifications': ''},
                'overallScore': 0,
                'enhancedBullets': []
            },
            # Missing sections
            {
                'uploadedFileName': 'test.pdf',
                'sections': {},
                'overallScore': 50,
                'enhancedBullets': []
            },
            # Very long content
            {
                'uploadedFileName': 'long_content.pdf',
                'sections': {
                    'contactInfo': {'name': 'Test User'},
                    'education': 'A' * 1000,
                    'skills': ['Skill' + str(i) for i in range(50)],
                    'experience': 'B' * 2000,
                    'projects': 'C' * 1500,
                    'certifications': 'D' * 500
                },
                'overallScore': 100,
                'enhancedBullets': []
            }
        ]
        
        for edge_case in edge_cases:
            try:
                pdf_bytes = self.resume_generator.generate_enhanced_resume(edge_case, [])
                assert isinstance(pdf_bytes, bytes), f"Should generate bytes for edge case: {edge_case.get('uploadedFileName', 'unknown')}"
                assert len(pdf_bytes) > 0, "Generated PDF should not be empty"
                
                # Verify PDF is readable
                pdf_buffer = BytesIO(pdf_bytes)
                pdf_reader = PdfReader(pdf_buffer)
                assert len(pdf_reader.pages) > 0, "Should have at least one page"
                
            except Exception as e:
                pytest.fail(f"Should handle edge case gracefully, but got error: {e}")
    
    def test_enhancement_application_consistency(self):
        """
        Property: Enhancements should be applied consistently when accepted
        """
        analysis_data = {
            'uploadedFileName': 'enhancement_test.pdf',
            'sections': {
                'contactInfo': {'name': 'Test User'},
                'education': '',
                'skills': [],
                'experience': '',
                'projects': '• worked on machine learning project\n• built web application',
                'certifications': ''
            },
            'overallScore': 60,
            'enhancedBullets': [
                {
                    'original': 'worked on machine learning project',
                    'improved': 'developed and deployed machine learning model improving accuracy by 15%',
                    'section': 'projects'
                },
                {
                    'original': 'built web application',
                    'improved': 'architected and developed scalable web application with 99.9% uptime',
                    'section': 'projects'
                }
            ]
        }
        
        # Test with no enhancements accepted
        pdf_no_enhancements = self.resume_generator.generate_enhanced_resume(analysis_data, [])
        
        # Test with all enhancements accepted
        pdf_with_enhancements = self.resume_generator.generate_enhanced_resume(
            analysis_data, 
            ['projects_0', 'projects_1']
        )
        
        # Both should generate valid PDFs
        assert isinstance(pdf_no_enhancements, bytes), "Should generate PDF without enhancements"
        assert isinstance(pdf_with_enhancements, bytes), "Should generate PDF with enhancements"
        
        # PDFs should be different when enhancements are applied
        assert pdf_no_enhancements != pdf_with_enhancements, "PDFs should differ when enhancements are applied"
        
        # Verify enhanced content is in the enhanced PDF
        pdf_buffer = BytesIO(pdf_with_enhancements)
        pdf_reader = PdfReader(pdf_buffer)
        enhanced_text = pdf_reader.pages[0].extract_text()
        
        # Enhanced text should contain improved versions
        assert 'developed and deployed machine learning model' in enhanced_text, "Should contain enhanced content"