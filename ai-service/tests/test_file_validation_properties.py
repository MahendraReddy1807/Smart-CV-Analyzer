"""
Property-based tests for file format validation functionality
**Feature: smart-cv-analyzer, Property 2: File Format Validation**
"""

import pytest
from hypothesis import given, strategies as st, settings
import tempfile
import os
from modules.ocr_processor import OCRProcessor


class TestFileValidationProperties:
    
    def setup_method(self):
        """Set up test fixtures"""
        self.ocr_processor = OCRProcessor()
    
    def create_temp_file_with_extension(self, extension: str, content: bytes = b"dummy content") -> str:
        """Create a temporary file with the specified extension"""
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=extension)
        temp_file.write(content)
        temp_file.close()
        return temp_file.name
    
    @given(st.sampled_from(['.pdf', '.PDF']))
    @settings(max_examples=20)
    def test_valid_file_formats_accepted(self, extension):
        """
        **Feature: smart-cv-analyzer, Property 2: File Format Validation**
        For any supported file format, the OCR processor should accept the file for processing
        """
        temp_file = None
        try:
            # Create a temporary file with valid extension
            temp_file = self.create_temp_file_with_extension(extension)
            
            # The file should be accepted (no exception should be raised for format)
            # Note: OCR might fail due to content, but format should be accepted
            try:
                result = self.ocr_processor.extract_text(temp_file)
                # If we get here, format was accepted (content might be empty/invalid)
                assert True, f"File with extension {extension} should be accepted"
            except ValueError as e:
                if "Unsupported file format" in str(e):
                    pytest.fail(f"Valid format {extension} was rejected: {e}")
                # Other errors (like OCR failures) are acceptable for this test
            except Exception:
                # OCR processing errors are acceptable - we're only testing format validation
                pass
                
        finally:
            if temp_file and os.path.exists(temp_file):
                os.remove(temp_file)
    
    @given(st.sampled_from([
        '.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
        '.mp3', '.mp4', '.avi', '.zip', '.rar', '.exe', '.bat',
        '.html', '.css', '.js', '.py', '.java', '.cpp', '.h',
        '.xml', '.json', '.csv', '.sql', '.log', '.tmp'
    ]))
    @settings(max_examples=30)
    def test_invalid_file_formats_rejected(self, extension):
        """
        **Feature: smart-cv-analyzer, Property 2: File Format Validation**
        For any unsupported file format, the OCR processor should reject the file with appropriate error
        """
        temp_file = None
        try:
            # Create a temporary file with invalid extension
            temp_file = self.create_temp_file_with_extension(extension)
            
            # The file should be rejected with ValueError
            with pytest.raises(ValueError) as exc_info:
                self.ocr_processor.extract_text(temp_file)
            
            # Verify the error message indicates unsupported format
            assert "Unsupported file format" in str(exc_info.value), \
                f"Expected 'Unsupported file format' error for {extension}, got: {exc_info.value}"
            
        finally:
            if temp_file and os.path.exists(temp_file):
                os.remove(temp_file)
    
    @given(st.text(min_size=1, max_size=10).filter(lambda x: not x.startswith('.')))
    @settings(max_examples=20)
    def test_files_without_extension_rejected(self, filename):
        """
        **Feature: smart-cv-analyzer, Property 2: File Format Validation**
        For any file without a proper extension, the OCR processor should reject it
        """
        temp_file = None
        try:
            # Create a temporary file without extension
            temp_file = tempfile.NamedTemporaryFile(delete=False, prefix=filename, suffix='')
            temp_file.write(b"dummy content")
            temp_file.close()
            
            # The file should be rejected
            with pytest.raises(ValueError) as exc_info:
                self.ocr_processor.extract_text(temp_file.name)
            
            assert "Unsupported file format" in str(exc_info.value)
            
        finally:
            if temp_file and os.path.exists(temp_file.name):
                os.remove(temp_file.name)
    
    def test_case_insensitive_format_validation(self):
        """Test that file format validation is case-insensitive"""
        extensions_to_test = [
            ('.pdf', True), ('.PDF', True), ('.Pdf', True),
            ('.png', False), ('.PNG', False), ('.Png', False),
            ('.jpg', False), ('.JPG', False), ('.Jpg', False),
            ('.jpeg', False), ('.JPEG', False), ('.Jpeg', False),
            ('.txt', False), ('.TXT', False), ('.Txt', False)
        ]
        
        for extension, should_be_valid in extensions_to_test:
            temp_file = None
            try:
                temp_file = self.create_temp_file_with_extension(extension)
                
                if should_be_valid:
                    # Should not raise ValueError for unsupported format
                    try:
                        self.ocr_processor.extract_text(temp_file)
                    except ValueError as e:
                        if "Unsupported file format" in str(e):
                            pytest.fail(f"Valid format {extension} was rejected")
                    except Exception:
                        # Other exceptions are fine for this test
                        pass
                else:
                    # Should raise ValueError for unsupported format
                    with pytest.raises(ValueError) as exc_info:
                        self.ocr_processor.extract_text(temp_file)
                    assert "Unsupported file format" in str(exc_info.value)
                    
            finally:
                if temp_file and os.path.exists(temp_file):
                    os.remove(temp_file)
    
    def test_empty_filename_handling(self):
        """Test handling of empty or invalid file paths"""
        # Test empty string
        with pytest.raises(Exception):  # Could be ValueError or FileNotFoundError
            self.ocr_processor.extract_text("")
        
        # Test non-existent file
        with pytest.raises(Exception):  # Could be ValueError or FileNotFoundError
            self.ocr_processor.extract_text("non_existent_file.pdf")
    
    @given(st.sampled_from(['.pdf']))
    def test_supported_formats_consistency(self, extension):
        """
        **Feature: smart-cv-analyzer, Property 2: File Format Validation**
        For any supported format, the validation should be consistent across multiple calls
        """
        temp_file = None
        try:
            temp_file = self.create_temp_file_with_extension(extension)
            
            # Test multiple times to ensure consistency
            results = []
            for _ in range(3):
                try:
                    self.ocr_processor.extract_text(temp_file)
                    results.append("accepted")
                except ValueError as e:
                    if "Unsupported file format" in str(e):
                        results.append("rejected")
                    else:
                        results.append("other_error")
                except Exception:
                    results.append("other_error")
            
            # All results should be the same (either all accepted or all rejected)
            assert len(set(results)) == 1, f"Inconsistent validation results for {extension}: {results}"
            
            # For supported formats, should not be rejected due to format
            assert "rejected" not in results, f"Supported format {extension} was rejected"
            
        finally:
            if temp_file and os.path.exists(temp_file):
                os.remove(temp_file)