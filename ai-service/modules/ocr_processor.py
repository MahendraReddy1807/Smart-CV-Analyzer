import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os
import re
import tempfile
from typing import Optional

class OCRProcessor:
    """Handles OCR processing for PDF and image files"""
    
    def __init__(self):
        # Configure tesseract path if needed (Windows)
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        pass
    
    def extract_text(self, file_path: str) -> str:
        """
        Extract text from PDF or image file using OCR
        
        Args:
            file_path: Path to the file to process
            
        Returns:
            Extracted text as string
            
        Raises:
            Exception: If OCR processing fails
        """
        try:
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.pdf':
                return self._extract_from_pdf(file_path)
            elif file_extension in ['.png', '.jpg', '.jpeg']:
                return self._extract_from_image(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            raise Exception(f"OCR processing failed: {str(e)}")
    
    def _extract_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        try:
            # Convert PDF pages to images
            pages = convert_from_path(pdf_path, dpi=300)
            extracted_text = ""
            
            for page_num, page in enumerate(pages):
                # Use OCR on each page
                page_text = pytesseract.image_to_string(
                    page, 
                    config='--oem 3 --psm 6'  # OCR Engine Mode 3, Page Segmentation Mode 6
                )
                extracted_text += f"\n--- Page {page_num + 1} ---\n"
                extracted_text += page_text
                
            return self.preprocess_extracted_text(extracted_text)
            
        except Exception as e:
            raise Exception(f"PDF OCR failed: {str(e)}")
    
    def _extract_from_image(self, image_path: str) -> str:
        """Extract text from image file"""
        try:
            # Open and process image
            image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Use OCR
            extracted_text = pytesseract.image_to_string(
                image,
                config='--oem 3 --psm 6'
            )
            
            return self.preprocess_extracted_text(extracted_text)
            
        except Exception as e:
            raise Exception(f"Image OCR failed: {str(e)}")
    
    def preprocess_extracted_text(self, raw_text: str) -> str:
        """
        Clean and preprocess extracted text
        
        Args:
            raw_text: Raw text from OCR
            
        Returns:
            Cleaned text
        """
        if not raw_text:
            return ""
        
        # Remove page markers
        text = re.sub(r'\n--- Page \d+ ---\n', '\n', raw_text)
        
        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        
        # Remove leading/trailing whitespace from lines
        lines = [line.strip() for line in text.split('\n')]
        text = '\n'.join(lines)
        
        # Remove empty lines at start and end
        text = text.strip()
        
        # Fix common OCR errors
        text = self._fix_common_ocr_errors(text)
        
        return text
    
    def _fix_common_ocr_errors(self, text: str) -> str:
        """Fix common OCR recognition errors"""
        
        # Common character substitutions
        corrections = {
            r'\b0(?=\d)': 'O',  # 0 -> O in words
            r'(?<=\d)O\b': '0',  # O -> 0 at end of numbers
            r'\bl(?=\w)': 'I',   # l -> I at start of words
            r'(?<=\w)I(?=\w)': 'l',  # I -> l in middle of words
            r'\brn\b': 'm',      # rn -> m
            r'\bvv\b': 'w',      # vv -> w
        }
        
        for pattern, replacement in corrections.items():
            text = re.sub(pattern, replacement, text)
        
        return text
    
    def validate_extraction_quality(self, text: str) -> dict:
        """
        Validate the quality of extracted text
        
        Args:
            text: Extracted text to validate
            
        Returns:
            Dictionary with quality metrics
        """
        if not text:
            return {
                "is_valid": False,
                "confidence": 0.0,
                "issues": ["No text extracted"]
            }
        
        issues = []
        confidence = 1.0
        
        # Check for minimum length
        if len(text.strip()) < 50:
            issues.append("Text too short - possible OCR failure")
            confidence -= 0.3
        
        # Check for excessive special characters (OCR artifacts)
        special_char_ratio = len(re.findall(r'[^\w\s\-.,()@]', text)) / len(text)
        if special_char_ratio > 0.1:
            issues.append("High ratio of special characters - possible OCR artifacts")
            confidence -= 0.2
        
        # Check for reasonable word structure
        words = text.split()
        if len(words) < 10:
            issues.append("Very few words detected")
            confidence -= 0.2
        
        # Check for email pattern (common in resumes)
        if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            issues.append("No email address detected - unusual for resume")
            confidence -= 0.1
        
        confidence = max(0.0, confidence)
        
        return {
            "is_valid": confidence > 0.5,
            "confidence": confidence,
            "issues": issues,
            "word_count": len(words),
            "character_count": len(text)
        }