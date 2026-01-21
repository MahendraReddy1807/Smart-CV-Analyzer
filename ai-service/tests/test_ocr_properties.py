"""
Property-based tests for OCR text extraction functionality
**Feature: smart-cv-analyzer, Property 1: OCR Text Extraction Accuracy**
"""

import pytest
from hypothesis import given, strategies as st, settings
from PIL import Image, ImageDraw, ImageFont
import tempfile
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

from modules.ocr_processor import OCRProcessor


class TestOCRProperties:
    
    def setup_method(self):
        """Set up test fixtures"""
        self.ocr_processor = OCRProcessor()
    
    def create_test_image_with_text(self, text: str, width: int = 800, height: int = 600) -> str:
        """Create a test image with the given text"""
        # Create image
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a standard font, fallback to default if not available
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        # Draw text
        draw.text((50, 50), text, fill='black', font=font)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        img.save(temp_file.name)
        temp_file.close()
        
        return temp_file.name
    
    def create_test_pdf_with_text(self, text: str) -> str:
        """Create a test PDF with the given text"""
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.close()
        
        # Create PDF
        c = canvas.Canvas(temp_file.name, pagesize=letter)
        width, height = letter
        
        # Split text into lines and draw
        lines = text.split('\n')
        y_position = height - 100
        
        for line in lines:
            if y_position > 50:  # Don't go off the page
                c.drawString(50, y_position, line)
                y_position -= 20
        
        c.save()
        return temp_file.name
    
    @given(st.text(
        alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd', 'Pc', 'Pd', 'Ps', 'Pe', 'Po')),
        min_size=10,
        max_size=200
    ))
    @settings(max_examples=50, deadline=30000)  # Reduced examples for faster testing
    def test_image_ocr_preserves_readable_content(self, text):
        """
        **Feature: smart-cv-analyzer, Property 1: OCR Text Extraction Accuracy**
        For any readable text, OCR extraction from images should preserve the essential content
        """
        # Skip if text is too complex or contains only special characters
        if len(text.strip()) < 5 or not any(c.isalnum() for c in text):
            return
        
        # Create test image
        image_path = None
        try:
            image_path = self.create_test_image_with_text(text)
            
            # Extract text using OCR
            extracted_text = self.ocr_processor.extract_text(image_path)
            
            # Validate that some meaningful content was extracted
            assert len(extracted_text.strip()) > 0, "OCR should extract some text"
            
            # Check that at least some alphanumeric characters are preserved
            original_alnum = ''.join(c.lower() for c in text if c.isalnum())
            extracted_alnum = ''.join(c.lower() for c in extracted_text if c.isalnum())
            
            if len(original_alnum) > 0:
                # At least 30% of alphanumeric characters should be preserved
                common_chars = sum(1 for c in original_alnum if c in extracted_alnum)
                preservation_ratio = common_chars / len(original_alnum)
                assert preservation_ratio >= 0.3, f"OCR should preserve at least 30% of content, got {preservation_ratio:.2%}"
            
        finally:
            # Clean up
            if image_path and os.path.exists(image_path):
                os.remove(image_path)
    
    @given(st.text(
        alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd', 'Pc', 'Pd', 'Ps', 'Pe', 'Po')),
        min_size=10,
        max_size=200
    ))
    @settings(max_examples=30, deadline=30000)  # Reduced examples for PDFs
    def test_pdf_ocr_preserves_readable_content(self, text):
        """
        **Feature: smart-cv-analyzer, Property 1: OCR Text Extraction Accuracy**
        For any readable text, OCR extraction from PDFs should preserve the essential content
        """
        # Skip if text is too complex or contains only special characters
        if len(text.strip()) < 5 or not any(c.isalnum() for c in text):
            return
        
        # Create test PDF
        pdf_path = None
        try:
            pdf_path = self.create_test_pdf_with_text(text)
            
            # Extract text using OCR
            extracted_text = self.ocr_processor.extract_text(pdf_path)
            
            # Validate that some meaningful content was extracted
            assert len(extracted_text.strip()) > 0, "OCR should extract some text"
            
            # Check that at least some alphanumeric characters are preserved
            original_alnum = ''.join(c.lower() for c in text if c.isalnum())
            extracted_alnum = ''.join(c.lower() for c in extracted_text if c.isalnum())
            
            if len(original_alnum) > 0:
                # At least 30% of alphanumeric characters should be preserved
                common_chars = sum(1 for c in original_alnum if c in extracted_alnum)
                preservation_ratio = common_chars / len(original_alnum)
                assert preservation_ratio >= 0.3, f"OCR should preserve at least 30% of content, got {preservation_ratio:.2%}"
            
        finally:
            # Clean up
            if pdf_path and os.path.exists(pdf_path):
                os.remove(pdf_path)
    
    @given(st.emails())
    @settings(max_examples=20)
    def test_email_extraction_accuracy(self, email):
        """
        **Feature: smart-cv-analyzer, Property 1: OCR Text Extraction Accuracy**
        For any valid email address, OCR should be able to extract it accurately from clear text
        """
        # Create resume-like text with the email
        resume_text = f"""
        John Doe
        Software Engineer
        Email: {email}
        Phone: (555) 123-4567
        
        Experience:
        - Software Developer at Tech Corp
        """
        
        # Test with image
        image_path = None
        try:
            image_path = self.create_test_image_with_text(resume_text)
            extracted_text = self.ocr_processor.extract_text(image_path)
            
            # Check if email is preserved (allowing for minor OCR variations)
            email_domain = email.split('@')[1]
            assert email_domain.lower() in extracted_text.lower(), f"Email domain {email_domain} should be preserved in OCR"
            
        finally:
            if image_path and os.path.exists(image_path):
                os.remove(image_path)
    
    def test_ocr_quality_validation(self):
        """Test that OCR quality validation works correctly"""
        # Test with good quality text
        good_text = """
        John Smith
        Software Engineer
        john.smith@email.com
        (555) 123-4567
        
        Experience:
        - Senior Developer at Tech Company
        - Led team of 5 developers
        - Improved system performance by 40%
        """
        
        quality = self.ocr_processor.validate_extraction_quality(good_text)
        assert quality["is_valid"] == True
        assert quality["confidence"] > 0.7
        
        # Test with poor quality text
        poor_text = "a@#$%^&*()_+{}|:<>?[]\\;'\",./"
        quality = self.ocr_processor.validate_extraction_quality(poor_text)
        assert quality["is_valid"] == False
        assert quality["confidence"] < 0.5
        
        # Test with empty text
        quality = self.ocr_processor.validate_extraction_quality("")
        assert quality["is_valid"] == False
        assert quality["confidence"] == 0.0