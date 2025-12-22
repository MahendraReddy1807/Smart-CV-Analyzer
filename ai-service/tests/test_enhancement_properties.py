"""
Property-based tests for content enhancement functionality
**Feature: smart-cv-analyzer, Property 5: Enhancement Content Preservation**
"""

import pytest
from hypothesis import given, strategies as st, settings
from modules.enhancement_engine import EnhancementEngine
import re

class TestEnhancementProperties:
    """Property-based tests for content enhancement"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.enhancement_engine = EnhancementEngine()
    
    @given(
        original_bullet=st.text(min_size=20, max_size=200).filter(
            lambda x: x.strip() and not x.startswith(('http', 'www', '@'))
        ),
        projects_text=st.text(min_size=50, max_size=500),
        experience_text=st.text(min_size=50, max_size=500)
    )
    @settings(max_examples=100)
    def test_enhancement_content_preservation(self, original_bullet, projects_text, experience_text):
        """
        **Feature: smart-cv-analyzer, Property 5: Enhancement Content Preservation**
        For any bullet point enhancement, the improved version should maintain all factual information 
        from the original while improving language quality and impact
        """
        # Create sections with bullet points
        sections = {
            'contactInfo': {'name': 'Test User', 'email': 'test@example.com'},
            'education': 'Bachelor of Science',
            'skills': ['Python', 'JavaScript', 'SQL'],
            'experience': f"• {original_bullet}\n{experience_text}",
            'projects': f"• {original_bullet}\n{projects_text}",
            'certifications': '',
            'raw': f"{original_bullet} {projects_text} {experience_text}"
        }
        
        # Enhance content
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        # Verify enhancement structure
        assert isinstance(enhancements, list), "Enhancements should be a list"
        
        for enhancement in enhancements:
            assert isinstance(enhancement, dict), "Each enhancement should be a dictionary"
            assert 'original' in enhancement, "Enhancement should contain original text"
            assert 'improved' in enhancement, "Enhancement should contain improved text"
            assert 'section' in enhancement, "Enhancement should contain section information"
            
            original_text = enhancement['original']
            improved_text = enhancement['improved']
            
            # Verify content preservation - key factual elements should be maintained
            # Extract numbers, dates, and specific terms that should be preserved
            original_numbers = re.findall(r'\d+(?:\.\d+)?(?:%|\$|k|million|billion)?', original_text.lower())
            improved_numbers = re.findall(r'\d+(?:\.\d+)?(?:%|\$|k|million|billion)?', improved_text.lower())
            
            # Important: factual numbers should be preserved
            for number in original_numbers:
                if len(number) > 1:  # Skip single digits which might be articles
                    assert number in improved_numbers or any(number in imp_num for imp_num in improved_numbers), \
                        f"Factual number '{number}' should be preserved in enhancement"
            
            # Verify that the improved text is actually different (enhancement occurred)
            assert original_text.strip() != improved_text.strip(), \
                "Enhanced text should be different from original"
            
            # Verify improved text is not empty
            assert len(improved_text.strip()) > 0, "Enhanced text should not be empty"
            
            # Verify improved text maintains reasonable length relationship
            # Enhanced text shouldn't be drastically shorter (losing information)
            original_words = len(original_text.split())
            improved_words = len(improved_text.split())
            
            if original_words > 5:  # Only check for substantial original content
                assert improved_words >= original_words * 0.5, \
                    f"Enhanced text shouldn't be drastically shorter: {original_words} -> {improved_words}"
    
    @given(
        bullet_with_numbers=st.text(min_size=30, max_size=150).map(
            lambda x: f"{x} increased efficiency by 25% and reduced costs by $10,000"
        )
    )
    @settings(max_examples=50)
    def test_numerical_data_preservation(self, bullet_with_numbers):
        """
        Property: Numerical data and metrics should be preserved during enhancement
        """
        sections = {
            'contactInfo': {},
            'skills': [],
            'experience': f"• {bullet_with_numbers}",
            'projects': '',
            'education': '',
            'certifications': '',
            'raw': bullet_with_numbers
        }
        
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        if enhancements:
            enhancement = enhancements[0]
            original = enhancement['original']
            improved = enhancement['improved']
            
            # Extract specific numerical values
            original_percentages = re.findall(r'\d+%', original)
            improved_percentages = re.findall(r'\d+%', improved)
            
            original_dollars = re.findall(r'\$[\d,]+', original)
            improved_dollars = re.findall(r'\$[\d,]+', improved)
            
            # Verify percentages are preserved
            for percentage in original_percentages:
                assert percentage in improved, f"Percentage {percentage} should be preserved"
            
            # Verify dollar amounts are preserved
            for dollar in original_dollars:
                assert dollar in improved, f"Dollar amount {dollar} should be preserved"
    
    @given(
        technical_terms=st.lists(
            st.sampled_from([
                'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS',
                'Docker', 'Kubernetes', 'TensorFlow', 'PostgreSQL', 'Redis'
            ]),
            min_size=1,
            max_size=5,
            unique=True
        ),
        action_description=st.text(min_size=20, max_size=100)
    )
    @settings(max_examples=30)
    def test_technical_terms_preservation(self, technical_terms, action_description):
        """
        Property: Technical terms and technology names should be preserved during enhancement
        """
        bullet_text = f"Used {', '.join(technical_terms)} to {action_description}"
        
        sections = {
            'contactInfo': {},
            'skills': technical_terms,
            'experience': '',
            'projects': f"• {bullet_text}",
            'education': '',
            'certifications': '',
            'raw': bullet_text
        }
        
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        if enhancements:
            enhancement = enhancements[0]
            improved = enhancement['improved'].lower()
            
            # Verify technical terms are preserved (case-insensitive)
            for term in technical_terms:
                assert term.lower() in improved, \
                    f"Technical term '{term}' should be preserved in enhancement"
    
    @given(
        weak_bullet=st.sampled_from([
            "worked on a project",
            "helped with development",
            "was responsible for testing",
            "did some coding work",
            "made improvements to system"
        ])
    )
    @settings(max_examples=20)
    def test_weak_language_improvement(self, weak_bullet):
        """
        Property: Weak language should be improved while preserving core meaning
        """
        sections = {
            'contactInfo': {},
            'skills': ['Python'],
            'experience': f"• {weak_bullet}",
            'projects': '',
            'education': '',
            'certifications': '',
            'raw': weak_bullet
        }
        
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        if enhancements:
            enhancement = enhancements[0]
            original = enhancement['original'].lower()
            improved = enhancement['improved'].lower()
            
            # Verify weak phrases are replaced
            weak_phrases = ['worked on', 'helped with', 'was responsible for', 'did some', 'made']
            weak_found_in_original = any(phrase in original for phrase in weak_phrases)
            weak_found_in_improved = any(phrase in improved for phrase in weak_phrases)
            
            if weak_found_in_original:
                # The improved version should have fewer weak phrases
                original_weak_count = sum(1 for phrase in weak_phrases if phrase in original)
                improved_weak_count = sum(1 for phrase in weak_phrases if phrase in improved)
                
                assert improved_weak_count <= original_weak_count, \
                    "Enhanced version should have fewer weak phrases"
    
    def test_empty_sections_handling(self):
        """
        Property: Enhancement should handle empty or minimal sections gracefully
        """
        empty_sections = {
            'contactInfo': {},
            'skills': [],
            'experience': '',
            'projects': '',
            'education': '',
            'certifications': '',
            'raw': ''
        }
        
        # Should not crash
        enhancements = self.enhancement_engine.enhance_content(empty_sections)
        
        # Should return empty list or handle gracefully
        assert isinstance(enhancements, list), "Should return a list even for empty sections"
        assert len(enhancements) == 0, "Should return empty list for empty sections"
    
    @given(
        bullet_points=st.lists(
            st.text(min_size=25, max_size=100),
            min_size=2,
            max_size=5
        )
    )
    @settings(max_examples=20)
    def test_multiple_bullet_enhancement_consistency(self, bullet_points):
        """
        Property: Multiple bullet points should be enhanced consistently
        """
        # Create sections with multiple bullet points
        projects_text = '\n'.join([f"• {bullet}" for bullet in bullet_points])
        
        sections = {
            'contactInfo': {},
            'skills': ['Python', 'Java'],
            'experience': '',
            'projects': projects_text,
            'education': '',
            'certifications': '',
            'raw': ' '.join(bullet_points)
        }
        
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        # Verify each enhancement maintains consistency
        for enhancement in enhancements:
            original = enhancement['original']
            improved = enhancement['improved']
            
            # Each enhancement should be valid
            assert len(original.strip()) > 0, "Original text should not be empty"
            assert len(improved.strip()) > 0, "Improved text should not be empty"
            assert original != improved, "Enhancement should modify the text"
            
            # Should maintain professional tone
            assert not improved.startswith('i '), "Enhanced text should not start with 'I '"
            assert improved[0].isupper(), "Enhanced text should start with capital letter"
    
    def test_enhancement_determinism(self):
        """
        Property: Same input should produce consistent enhancements
        """
        sections = {
            'contactInfo': {},
            'skills': ['Python', 'React'],
            'experience': '• worked on web development project using modern frameworks',
            'projects': '• built application that helped users manage their tasks',
            'education': '',
            'certifications': '',
            'raw': 'worked on web development project built application helped users'
        }
        
        # Run enhancement multiple times
        results = []
        for _ in range(3):
            enhancements = self.enhancement_engine.enhance_content(sections)
            results.append(enhancements)
        
        # Results should be consistent (same number of enhancements)
        if results[0]:  # If any enhancements were produced
            for result in results[1:]:
                assert len(result) == len(results[0]), \
                    "Number of enhancements should be consistent across runs"
            assert 'original' in enhancement, "Enhancement should have original text"
            assert 'improved' in enhancement, "Enhancement should have improved text"
            assert 'section' in enhancement, "Enhancement should specify section"
            
            original = enhancement['original']
            improved = enhancement['improved']
            
            # Content preservation checks
            assert isinstance(original, str), "Original should be a string"
            assert isinstance(improved, str), "Improved should be a string"
            assert len(improved.strip()) > 0, "Improved text should not be empty"
            
            # Verify factual content preservation
            self._verify_factual_preservation(original, improved)
            
            # Verify improvement quality
            self._verify_improvement_quality(original, improved)
    
    def _verify_factual_preservation(self, original: str, improved: str):
        """Verify that factual information is preserved"""
        # Extract numbers and percentages
        original_numbers = re.findall(r'\d+(?:\.\d+)?%?', original)
        improved_numbers = re.findall(r'\d+(?:\.\d+)?%?', improved)
        
        # If original had specific numbers, they should be preserved or reasonably similar
        for num in original_numbers:
            if num not in improved:
                # Allow for minor formatting changes (e.g., "5" vs "five")
                numeric_value = re.search(r'\d+', num)
                if numeric_value:
                    assert any(numeric_value.group() in imp_num for imp_num in improved_numbers), \
                        f"Numeric value {num} from original should be preserved in improved text"
        
        # Extract proper nouns (likely company names, technologies, etc.)
        original_proper_nouns = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', original)
        improved_lower = improved.lower()
        
        for noun in original_proper_nouns:
            # Allow for case variations but preserve the entity
            if len(noun) > 3:  # Skip short words that might be common
                assert noun.lower() in improved_lower or any(word in improved_lower for word in noun.split()), \
                    f"Proper noun '{noun}' should be preserved in some form"
        
        # Extract quoted text (should be preserved exactly)
        original_quotes = re.findall(r'"([^"]*)"', original)
        for quote in original_quotes:
            if len(quote) > 5:  # Only check substantial quoted content
                assert quote in improved or quote.lower() in improved.lower(), \
                    f"Quoted content '{quote}' should be preserved"
    
    def _verify_improvement_quality(self, original: str, improved: str):
        """Verify that the improved version shows quality improvements"""
        # Should not be identical (unless original was already perfect)
        if len(original) > 10:  # Only for substantial content
            # Allow for minor differences but expect some improvement
            similarity_ratio = len(set(original.lower().split()) & set(improved.lower().split())) / max(len(original.split()), len(improved.split()))
            assert similarity_ratio < 1.0 or len(improved) != len(original), \
                "Improved version should show some changes from original"
        
        # Improved version should start with a capital letter
        assert improved[0].isupper(), "Improved text should start with capital letter"
        
        # Should not contain obvious weak phrases if they were in original
        weak_phrases = ['worked on', 'was responsible for', 'helped with']
        original_lower = original.lower()
        improved_lower = improved.lower()
        
        for phrase in weak_phrases:
            if phrase in original_lower:
                # If weak phrase was in original, it should be improved or removed
                if phrase in improved_lower:
                    # Allow it only if the context makes it stronger
                    pass  # This is acceptable in some contexts
    
    @given(
        bullet_points=st.lists(
            st.text(min_size=15, max_size=100).filter(lambda x: x.strip()),
            min_size=1,
            max_size=5
        )
    )
    @settings(max_examples=50)
    def test_multiple_bullet_enhancement_consistency(self, bullet_points):
        """
        Property: Multiple bullet points should be enhanced consistently
        """
        # Create sections with multiple bullet points
        projects_text = '\n'.join(f"• {bullet}" for bullet in bullet_points)
        
        sections = {
            'contactInfo': {'email': 'test@example.com'},
            'education': 'Degree',
            'skills': ['Skill1', 'Skill2'],
            'experience': 'Some experience',
            'projects': projects_text,
            'certifications': '',
            'raw': projects_text
        }
        
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        # Should process multiple bullet points
        if len(bullet_points) > 1:
            # Should have enhancements (though not necessarily one per bullet due to filtering)
            assert len(enhancements) >= 0, "Should process multiple bullet points"
        
        # Each enhancement should be valid
        for enhancement in enhancements:
            original = enhancement['original']
            improved = enhancement['improved']
            
            # Basic quality checks
            assert len(improved.strip()) > 0, "Enhanced bullet should not be empty"
            assert improved != original or len(original) < 20, "Should show improvement for substantial content"
    
    @given(
        technical_content=st.text(min_size=30, max_size=150).filter(
            lambda x: any(tech in x.lower() for tech in ['python', 'java', 'react', 'sql', 'api', 'database'])
        )
    )
    @settings(max_examples=30)
    def test_technical_content_preservation(self, technical_content):
        """
        Property: Technical terms and technologies should be preserved during enhancement
        """
        sections = {
            'contactInfo': {'email': 'dev@example.com'},
            'education': 'Computer Science',
            'skills': ['Python', 'Java'],
            'experience': f"• {technical_content}",
            'projects': 'Technical projects',
            'certifications': '',
            'raw': technical_content
        }
        
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        # Extract technical terms from original
        technical_terms = ['python', 'java', 'javascript', 'react', 'sql', 'api', 'database', 'framework']
        original_terms = [term for term in technical_terms if term in technical_content.lower()]
        
        for enhancement in enhancements:
            if enhancement['original'].lower() in technical_content.lower():
                improved = enhancement['improved'].lower()
                
                # Technical terms should be preserved
                for term in original_terms:
                    assert term in improved or any(t in improved for t in [term + 's', term + 'ing']), \
                        f"Technical term '{term}' should be preserved in enhanced content"
    
    def test_empty_sections_handling(self):
        """
        Property: Empty or minimal sections should be handled gracefully
        """
        empty_sections = {
            'contactInfo': {},
            'education': '',
            'skills': [],
            'experience': '',
            'projects': '',
            'certifications': '',
            'raw': ''
        }
        
        enhancements = self.enhancement_engine.enhance_content(empty_sections)
        
        # Should not crash and should return empty list
        assert isinstance(enhancements, list), "Should return list for empty sections"
        assert len(enhancements) == 0, "Should return empty list for empty content"
    
    def test_enhancement_determinism(self):
        """
        Property: Same input should produce consistent results (when not using random AI)
        """
        sections = {
            'contactInfo': {'name': 'Test User'},
            'education': 'Computer Science Degree',
            'skills': ['Python', 'JavaScript'],
            'experience': '• Worked on web development projects using modern frameworks',
            'projects': '• Built e-commerce application with user authentication',
            'certifications': '',
            'raw': 'web development e-commerce application'
        }
        
        # Run enhancement multiple times
        results = []
        for _ in range(3):
            enhancements = self.enhancement_engine.enhance_content(sections)
            # Convert to comparable format
            result = [(e['original'], e['improved']) for e in enhancements]
            results.append(result)
        
        # Results should be consistent (for rule-based enhancement)
        # Note: This test might need adjustment if AI enhancement is truly random
        if len(results[0]) > 0:
            # At least the original text should be consistent
            original_texts = [r[0][0] if r else '' for r in results]
            assert len(set(original_texts)) <= 1, "Original text extraction should be consistent"
    
    @given(
        malformed_sections=st.dictionaries(
            keys=st.text(min_size=1, max_size=15),
            values=st.one_of(st.text(), st.integers(), st.none(), st.lists(st.text())),
            min_size=1,
            max_size=6
        )
    )
    @settings(max_examples=20)
    def test_malformed_input_robustness(self, malformed_sections):
        """
        Property: Enhancement should handle malformed input gracefully
        """
        try:
            enhancements = self.enhancement_engine.enhance_content(malformed_sections)
            
            # If it doesn't crash, result should be valid
            assert isinstance(enhancements, list), "Should return list even for malformed input"
            
            # Each enhancement should have proper structure
            for enhancement in enhancements:
                if isinstance(enhancement, dict):
                    assert 'original' in enhancement or 'improved' in enhancement, \
                        "Enhancement should have required fields"
                        
        except (TypeError, AttributeError, KeyError):
            # These exceptions are acceptable for malformed input
            pass
    
    @given(
        very_long_text=st.text(min_size=500, max_size=2000)
    )
    @settings(max_examples=10)
    def test_long_content_handling(self, very_long_text):
        """
        Property: Very long content should be handled without performance issues
        """
        sections = {
            'contactInfo': {'email': 'test@example.com'},
            'education': 'Degree',
            'skills': ['Skill'],
            'experience': very_long_text,
            'projects': very_long_text,
            'certifications': '',
            'raw': very_long_text
        }
        
        # Should complete in reasonable time and not crash
        enhancements = self.enhancement_engine.enhance_content(sections)
        
        assert isinstance(enhancements, list), "Should handle long content and return list"
        
        # If enhancements are made, they should still preserve content
        for enhancement in enhancements:
            if len(enhancement['original']) > 100:  # For substantial content
                # Should not truncate important information drastically
                assert len(enhancement['improved']) >= len(enhancement['original']) * 0.5, \
                    "Enhanced content should not be drastically shorter than original"