"""
Test and fix PDF text extraction issues
"""

import os
import sys
sys.path.append('ai-service')

def test_pdf_extraction():
    """Test different PDF extraction methods"""
    
    pdf_file = 'Mahendra-Reddy-ML-Engineer.pdf'
    
    if not os.path.exists(pdf_file):
        print(f"❌ PDF file not found: {pdf_file}")
        return
    
    print(f"📄 Testing PDF extraction for: {pdf_file}")
    print(f"📊 File size: {os.path.getsize(pdf_file)} bytes")
    
    # Check if it's a valid PDF
    with open(pdf_file, 'rb') as f:
        header = f.read(10)
        print(f"📋 File header: {header}")
        
        if not header.startswith(b'%PDF'):
            print("❌ File does not appear to be a valid PDF")
            print("🔧 This might be a corrupted or fake PDF file")
            
            # Check if it's actually text content
            f.seek(0)
            try:
                content = f.read().decode('utf-8', errors='ignore')
                if len(content) > 50:
                    print("📝 File appears to contain text content:")
                    print(content[:200] + "..." if len(content) > 200 else content)
                    
                    # If it's actually resume text, we can work with it
                    if any(keyword in content.lower() for keyword in ['resume', 'experience', 'education', 'skills']):
                        print("✅ Content appears to be resume text")
                        return content
                    else:
                        print("❌ Content does not appear to be a resume")
                        return None
            except:
                print("❌ Cannot decode file as text")
                return None
        else:
            print("✅ Valid PDF header detected")
            
            # Try PyPDF2 extraction
            try:
                import PyPDF2
                from io import BytesIO
                
                f.seek(0)
                pdf_content = f.read()
                pdf_buffer = BytesIO(pdf_content)
                pdf_reader = PyPDF2.PdfReader(pdf_buffer)
                
                print(f"📄 PDF has {len(pdf_reader.pages)} pages")
                
                extracted_text = ""
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text.strip():
                        extracted_text += f"\n--- Page {page_num + 1} ---\n"
                        extracted_text += page_text
                
                if len(extracted_text.strip()) > 50:
                    print(f"✅ Successfully extracted {len(extracted_text)} characters")
                    print("📝 First 200 characters:")
                    print(extracted_text[:200])
                    return extracted_text
                else:
                    print("❌ PyPDF2 extracted insufficient text")
                    return None
                    
            except Exception as e:
                print(f"❌ PyPDF2 extraction failed: {e}")
                return None

if __name__ == "__main__":
    result = test_pdf_extraction()
    
    if result:
        print("\n🔧 Testing ATS classification on extracted content...")
        
        # Test with ATS classifier
        try:
            from ai_service.modules.resume_classifier import ATSResumeClassifier
            
            classifier = ATSResumeClassifier()
            classification = classifier.classify_document(result, 'Mahendra-Reddy-ML-Engineer.pdf')
            
            print(f"📊 Classification Result:")
            print(f"   Type: {classification['document_type']}")
            print(f"   ATS Score: {classification['ats_score']}")
            print(f"   Confidence: {classification['resume_confidence_score']}%")
            print(f"   Detected Sections: {classification['detected_sections']}")
            
        except ImportError:
            print("⚠️  Could not import ATS classifier for testing")
    else:
        print("\n❌ Could not extract usable content from PDF")
        print("💡 Suggestion: Try uploading the resume as a text file or a different PDF")