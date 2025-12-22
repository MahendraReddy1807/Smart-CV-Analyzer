import os
from typing import Dict, List
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import black, darkblue, gray
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from io import BytesIO
import tempfile

class ResumeGenerator:
    """Generate enhanced resume documents in PDF format"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Set up custom styles for ATS-friendly formatting"""
        # Header style for name
        self.styles.add(ParagraphStyle(
            name='ResumeHeader',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=6,
            alignment=TA_CENTER,
            textColor=darkblue,
            fontName='Helvetica-Bold'
        ))
        
        # Contact info style
        self.styles.add(ParagraphStyle(
            name='ContactInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=12,
            alignment=TA_CENTER,
            textColor=black
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceBefore=12,
            spaceAfter=6,
            textColor=darkblue,
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=darkblue,
            borderPadding=2
        ))
        
        # Bullet point style
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=3,
            leftIndent=20,
            bulletIndent=10,
            bulletFontName='Symbol'
        ))
        
        # Skills style
        self.styles.add(ParagraphStyle(
            name='Skills',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        ))
    
    def generate_enhanced_resume(self, analysis_data: Dict, accepted_enhancements: List[str] = None) -> bytes:
        """
        Generate enhanced resume PDF incorporating improvements
        
        Args:
            analysis_data: Complete analysis data from the system
            accepted_enhancements: List of enhancement IDs that user accepted
            
        Returns:
            PDF bytes for download
        """
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Build document content
        story = []
        
        # Add header (name and contact info)
        story.extend(self._build_header(analysis_data.get('sections', {})))
        
        # Add sections in ATS-friendly order
        sections_order = ['education', 'skills', 'experience', 'projects', 'certifications']
        
        for section_name in sections_order:
            section_content = self._build_section(
                section_name, 
                analysis_data.get('sections', {}), 
                analysis_data.get('enhancedBullets', []),
                accepted_enhancements or []
            )
            if section_content:
                story.extend(section_content)
        
        # Build PDF
        doc.build(story)
        
        # Get PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
    
    def _build_header(self, sections: Dict) -> List:
        """Build resume header with contact information"""
        story = []
        contact_info = sections.get('contactInfo', {})
        
        # Name
        name = contact_info.get('name', 'Your Name')
        story.append(Paragraph(name, self.styles['ResumeHeader']))
        
        # Contact details
        contact_parts = []
        if contact_info.get('email'):
            contact_parts.append(contact_info['email'])
        if contact_info.get('phone'):
            contact_parts.append(contact_info['phone'])
        if contact_info.get('location'):
            contact_parts.append(contact_info['location'])
        
        if contact_parts:
            contact_text = ' | '.join(contact_parts)
            story.append(Paragraph(contact_text, self.styles['ContactInfo']))
        
        story.append(Spacer(1, 12))
        return story
    
    def _build_section(self, section_name: str, sections: Dict, enhancements: List[Dict], accepted_enhancements: List[str]) -> List:
        """Build a resume section with enhanced content"""
        story = []
        section_data = sections.get(section_name, '')
        
        if not section_data and section_name != 'skills':
            return story
        
        # Section header
        header_text = section_name.replace('_', ' ').title()
        story.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        if section_name == 'skills':
            story.extend(self._build_skills_section(sections.get('skills', [])))
        elif section_name in ['experience', 'projects']:
            story.extend(self._build_experience_section(
                section_data, enhancements, accepted_enhancements, section_name
            ))
        else:
            # Simple text sections (education, certifications)
            story.extend(self._build_text_section(section_data))
        
        story.append(Spacer(1, 8))
        return story
    
    def _build_skills_section(self, skills: List[str]) -> List:
        """Build skills section with proper formatting"""
        story = []
        
        if not skills:
            return story
        
        # Group skills for better presentation
        skills_text = ', '.join(skills)
        story.append(Paragraph(skills_text, self.styles['Skills']))
        
        return story
    
    def _build_experience_section(self, section_text: str, enhancements: List[Dict], accepted_enhancements: List[str], section_name: str) -> List:
        """Build experience/projects section with enhanced bullet points"""
        story = []
        
        if not section_text:
            return story
        
        # Apply enhancements to the text
        enhanced_text = self._apply_enhancements(
            section_text, enhancements, accepted_enhancements, section_name
        )
        
        # Split into bullet points
        lines = enhanced_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Format as bullet point if it starts with bullet markers
            if line.startswith(('•', '-', '*')):
                # Remove bullet marker and clean up
                clean_line = line[1:].strip()
                if clean_line:
                    bullet_text = f"• {clean_line}"
                    story.append(Paragraph(bullet_text, self.styles['BulletPoint']))
            else:
                # Regular paragraph
                story.append(Paragraph(line, self.styles['Normal']))
        
        return story
    
    def _build_text_section(self, section_text: str) -> List:
        """Build simple text section"""
        story = []
        
        if not section_text:
            return story
        
        # Split into paragraphs
        paragraphs = section_text.split('\n\n')
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if paragraph:
                story.append(Paragraph(paragraph, self.styles['Normal']))
        
        return story
    
    def _apply_enhancements(self, original_text: str, enhancements: List[Dict], accepted_enhancements: List[str], section_name: str) -> str:
        """Apply accepted enhancements to the text"""
        enhanced_text = original_text
        
        # Apply enhancements for this section
        for i, enhancement in enumerate(enhancements):
            enhancement_id = f"{section_name}_{i}"
            
            # Check if this enhancement was accepted
            if (enhancement_id in accepted_enhancements and 
                enhancement.get('section') == section_name):
                
                original = enhancement.get('original', '')
                improved = enhancement.get('improved', '')
                
                if original and improved:
                    enhanced_text = enhanced_text.replace(original, improved)
        
        return enhanced_text
    
    def generate_ats_optimized_resume(self, analysis_data: Dict) -> bytes:
        """
        Generate ATS-optimized resume with best practices
        
        Args:
            analysis_data: Complete analysis data
            
        Returns:
            PDF bytes optimized for ATS parsing
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        story = []
        sections = analysis_data.get('sections', {})
        
        # Header
        story.extend(self._build_header(sections))
        
        # Professional Summary (if available)
        if sections.get('summary'):
            story.append(Paragraph('Professional Summary', self.styles['SectionHeader']))
            story.append(Paragraph(sections['summary'], self.styles['Normal']))
            story.append(Spacer(1, 8))
        
        # Core Competencies (Skills)
        if sections.get('skills'):
            story.append(Paragraph('Core Competencies', self.styles['SectionHeader']))
            skills_text = ' • '.join(sections['skills'])
            story.append(Paragraph(skills_text, self.styles['Skills']))
            story.append(Spacer(1, 8))
        
        # Professional Experience
        if sections.get('experience'):
            story.append(Paragraph('Professional Experience', self.styles['SectionHeader']))
            story.extend(self._build_ats_experience(sections['experience']))
            story.append(Spacer(1, 8))
        
        # Projects
        if sections.get('projects'):
            story.append(Paragraph('Key Projects', self.styles['SectionHeader']))
            story.extend(self._build_ats_experience(sections['projects']))
            story.append(Spacer(1, 8))
        
        # Education
        if sections.get('education'):
            story.append(Paragraph('Education', self.styles['SectionHeader']))
            story.append(Paragraph(sections['education'], self.styles['Normal']))
            story.append(Spacer(1, 8))
        
        # Certifications
        if sections.get('certifications'):
            story.append(Paragraph('Certifications', self.styles['SectionHeader']))
            story.append(Paragraph(sections['certifications'], self.styles['Normal']))
            story.append(Spacer(1, 8))
        
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
    
    def _build_ats_experience(self, experience_text: str) -> List:
        """Build ATS-optimized experience section"""
        story = []
        
        # Split into bullet points and optimize
        lines = experience_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Ensure bullet points start with action verbs
            if line.startswith(('•', '-', '*')):
                clean_line = line[1:].strip()
                if clean_line:
                    # Ensure it starts with capital letter
                    clean_line = clean_line[0].upper() + clean_line[1:] if clean_line else clean_line
                    bullet_text = f"• {clean_line}"
                    story.append(Paragraph(bullet_text, self.styles['BulletPoint']))
            else:
                story.append(Paragraph(line, self.styles['Normal']))
        
        return story
    
    def save_resume_to_file(self, pdf_bytes: bytes, filename: str = None) -> str:
        """
        Save resume PDF to temporary file
        
        Args:
            pdf_bytes: PDF content as bytes
            filename: Optional filename
            
        Returns:
            Path to saved file
        """
        if not filename:
            filename = f"enhanced_resume_{os.urandom(8).hex()}.pdf"
        
        # Create temporary file
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, filename)
        
        with open(file_path, 'wb') as f:
            f.write(pdf_bytes)
        
        return file_path
    
    def get_resume_metadata(self, analysis_data: Dict) -> Dict:
        """Get metadata about the generated resume"""
        sections = analysis_data.get('sections', {})
        
        return {
            'total_sections': len([s for s in sections.values() if s]),
            'has_contact_info': bool(sections.get('contactInfo', {}).get('email')),
            'skills_count': len(sections.get('skills', [])),
            'has_experience': bool(sections.get('experience')),
            'has_projects': bool(sections.get('projects')),
            'has_education': bool(sections.get('education')),
            'has_certifications': bool(sections.get('certifications')),
            'enhancement_count': len(analysis_data.get('enhancedBullets', [])),
            'overall_score': analysis_data.get('overallScore', 0),
            'ats_optimized': True
        }