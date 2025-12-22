import re
import os
from typing import Dict, List
import openai
from dotenv import load_dotenv

load_dotenv()

class EnhancementEngine:
    """AI-powered content enhancement using generative AI"""
    
    def __init__(self):
        # Initialize OpenAI client
        self.client = None
        if os.getenv('OPENAI_API_KEY'):
            try:
                openai.api_key = os.getenv('OPENAI_API_KEY')
                self.client = openai
            except Exception as e:
                print(f"Warning: Could not initialize OpenAI client: {e}")
        
        # Fallback enhancement patterns for when AI is not available
        self.enhancement_patterns = {
            'weak_verbs': {
                'worked on': ['developed', 'built', 'created', 'implemented'],
                'helped with': ['contributed to', 'collaborated on', 'supported'],
                'was responsible for': ['managed', 'led', 'oversaw', 'coordinated'],
                'did': ['executed', 'performed', 'completed', 'delivered'],
                'made': ['created', 'developed', 'built', 'designed'],
                'used': ['utilized', 'leveraged', 'employed', 'applied']
            },
            'action_verbs': [
                'achieved', 'analyzed', 'built', 'collaborated', 'created', 'delivered',
                'designed', 'developed', 'enhanced', 'established', 'executed',
                'implemented', 'improved', 'increased', 'led', 'managed', 'optimized',
                'organized', 'reduced', 'resolved', 'streamlined', 'transformed'
            ]
        }
    
    def enhance_content(self, sections: Dict) -> List[Dict]:
        """
        Enhance resume content using AI
        
        Args:
            sections: Classified resume sections
            
        Returns:
            List of enhancement suggestions with original and improved versions
        """
        enhancements = []
        
        # Extract bullet points from projects and experience
        bullet_points = self._extract_bullet_points(sections)
        
        for bullet_point in bullet_points:
            if len(bullet_point.strip()) > 10:  # Only enhance substantial content
                enhanced = self._enhance_bullet_point(bullet_point)
                if enhanced and enhanced != bullet_point:
                    enhancements.append({
                        'original': bullet_point.strip(),
                        'improved': enhanced.strip(),
                        'section': self._identify_section(bullet_point, sections)
                    })
        
        return enhancements
    
    def _extract_bullet_points(self, sections: Dict) -> List[str]:
        """Extract bullet points from resume sections"""
        bullet_points = []
        
        # Extract from projects section
        if sections.get('projects'):
            projects_bullets = self._parse_bullets(sections['projects'])
            bullet_points.extend(projects_bullets)
        
        # Extract from experience section
        if sections.get('experience'):
            experience_bullets = self._parse_bullets(sections['experience'])
            bullet_points.extend(experience_bullets)
        
        return bullet_points
    
    def _parse_bullets(self, text: str) -> List[str]:
        """Parse bullet points from text"""
        # Common bullet point patterns
        bullet_patterns = [
            r'•\s*(.+?)(?=\n•|\n[A-Z]|\n\n|$)',
            r'-\s*(.+?)(?=\n-|\n[A-Z]|\n\n|$)',
            r'\*\s*(.+?)(?=\n\*|\n[A-Z]|\n\n|$)',
            r'◦\s*(.+?)(?=\n◦|\n[A-Z]|\n\n|$)',
            r'(?:^|\n)\s*(.+?)(?=\n|$)'  # Fallback for lines
        ]
        
        bullets = []
        for pattern in bullet_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
            for match in matches:
                cleaned = match.strip()
                if len(cleaned) > 20 and not cleaned.startswith(('Education', 'Experience', 'Skills', 'Projects')):
                    bullets.append(cleaned)
        
        return bullets
    
    def _enhance_bullet_point(self, bullet_point: str) -> str:
        """Enhance a single bullet point"""
        # Try AI enhancement first
        if self.client:
            ai_enhanced = self._ai_enhance_bullet(bullet_point)
            if ai_enhanced:
                return ai_enhanced
        
        # Fallback to rule-based enhancement
        return self._rule_based_enhance(bullet_point)
    
    def _ai_enhance_bullet(self, bullet_point: str) -> str:
        """Enhance bullet point using OpenAI"""
        try:
            prompt = f"""
            Rewrite this resume bullet point to be more impactful and professional:
            
            Original: {bullet_point}
            
            Guidelines:
            - Use strong action verbs
            - Include quantifiable metrics when possible (but don't make up numbers)
            - Make it more specific and results-oriented
            - Keep the factual content accurate
            - Limit to 1-2 sentences
            - Start with an action verb
            
            Enhanced version:
            """
            
            response = self.client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional resume writer helping improve bullet points."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            enhanced = response.choices[0].message.content.strip()
            
            # Basic validation
            if len(enhanced) > 20 and enhanced != bullet_point:
                return enhanced
                
        except Exception as e:
            print(f"AI enhancement failed: {e}")
        
        return None
    
    def _rule_based_enhance(self, bullet_point: str) -> str:
        """Enhance bullet point using rule-based approach"""
        enhanced = bullet_point
        
        # Replace weak verbs with stronger alternatives
        for weak_verb, strong_verbs in self.enhancement_patterns['weak_verbs'].items():
            if weak_verb in enhanced.lower():
                # Use the first strong verb as replacement
                enhanced = re.sub(
                    re.escape(weak_verb), 
                    strong_verbs[0], 
                    enhanced, 
                    flags=re.IGNORECASE
                )
        
        # Ensure it starts with an action verb
        if not self._starts_with_action_verb(enhanced):
            # Try to add an action verb at the beginning
            if enhanced.lower().startswith('i '):
                enhanced = enhanced[2:]  # Remove "I "
            
            # Add a generic action verb if none is present
            if not any(verb in enhanced.lower()[:20] for verb in self.enhancement_patterns['action_verbs']):
                enhanced = f"Developed {enhanced.lower()}"
        
        # Capitalize first letter
        enhanced = enhanced[0].upper() + enhanced[1:] if enhanced else enhanced
        
        # Remove redundant phrases
        redundant_phrases = [
            'in order to', 'was able to', 'had the opportunity to',
            'was tasked with', 'was given the responsibility'
        ]
        
        for phrase in redundant_phrases:
            enhanced = re.sub(phrase, '', enhanced, flags=re.IGNORECASE)
        
        # Clean up extra spaces
        enhanced = re.sub(r'\s+', ' ', enhanced).strip()
        
        return enhanced
    
    def _starts_with_action_verb(self, text: str) -> bool:
        """Check if text starts with an action verb"""
        first_word = text.split()[0].lower() if text.split() else ''
        return first_word in [verb.lower() for verb in self.enhancement_patterns['action_verbs']]
    
    def _identify_section(self, bullet_point: str, sections: Dict) -> str:
        """Identify which section a bullet point belongs to"""
        if sections.get('projects') and bullet_point in sections['projects']:
            return 'projects'
        elif sections.get('experience') and bullet_point in sections['experience']:
            return 'experience'
        else:
            return 'unknown'
    
    def enhance_grammar(self, text: str) -> str:
        """Enhance grammar and style of text"""
        if not text:
            return text
        
        enhanced = text
        
        # Fix common grammar issues
        grammar_fixes = [
            (r'\bi\s+', ''),  # Remove "I " at beginning of sentences
            (r'\s+', ' '),    # Fix multiple spaces
            (r'\.+', '.'),    # Fix multiple periods
            (r',+', ','),     # Fix multiple commas
        ]
        
        for pattern, replacement in grammar_fixes:
            enhanced = re.sub(pattern, replacement, enhanced, flags=re.IGNORECASE)
        
        # Ensure proper capitalization
        sentences = enhanced.split('.')
        enhanced_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                sentence = sentence[0].upper() + sentence[1:] if len(sentence) > 1 else sentence.upper()
                enhanced_sentences.append(sentence)
        
        enhanced = '. '.join(enhanced_sentences)
        
        return enhanced.strip()
    
    def suggest_power_words(self, text: str) -> List[str]:
        """Suggest power words to replace weak language"""
        suggestions = []
        text_lower = text.lower()
        
        # Identify weak words and suggest replacements
        weak_to_strong = {
            'good': ['excellent', 'outstanding', 'exceptional'],
            'bad': ['challenging', 'problematic', 'suboptimal'],
            'big': ['substantial', 'significant', 'extensive'],
            'small': ['focused', 'targeted', 'streamlined'],
            'many': ['numerous', 'multiple', 'extensive'],
            'some': ['several', 'various', 'selected']
        }
        
        for weak_word, strong_words in weak_to_strong.items():
            if weak_word in text_lower:
                suggestions.extend(strong_words)
        
        return list(set(suggestions))  # Remove duplicates