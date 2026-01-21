/**
 * Debug backend ATS validation function
 */

// Copy the validation function from backend
function validateResumeContentATS(text, filename) {
  const textLower = text.toLowerCase();
  const filenameLower = filename ? filename.toLowerCase() : '';
  
  console.log('=== ATS VALIDATION DEBUG ===');
  console.log('Input text length:', text.length);
  console.log('First 200 chars:', text.substring(0, 200));
  console.log('Filename:', filename);
  
  // ATS Resume Categories with professional scoring
  const resumeCategories = {
    CORE_RESUME_IDENTITY: {
      keywords: ['resume', 'cv', 'curriculum vitae', 'bio-data', 'biodata', 'professional profile', 'career summary', 'profile summary'],
      weight: 10,
      categoryBonus: 3
    },
    EDUCATION_SIGNALS: {
      keywords: ['education', 'qualification', 'academic', 'degree', 'b.e', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 'diploma', 'cgpa', 'gpa', 'percentage', 'university', 'college', 'school', 'bachelor', 'master', 'phd', 'doctorate'],
      weight: 1,
      categoryBonus: 3
    },
    EXPERIENCE_SIGNALS: {
      keywords: ['experience', 'work experience', 'employment', 'internship', 'intern', 'job role', 'designation', 'company', 'organization', 'responsibilities', 'worked at', 'position', 'role', 'employment history', 'work history'],
      weight: 1,
      categoryBonus: 3
    },
    SKILLS_SIGNALS: {
      keywords: ['skills', 'technical skills', 'soft skills', 'programming', 'languages', 'frameworks', 'tools', 'technologies', 'python', 'java', 'sql', 'html', 'css', 'javascript', 'machine learning', 'data science', 'competencies'],
      weight: 1,
      categoryBonus: 3
    },
    PROJECTS_ACHIEVEMENTS: {
      keywords: ['projects', 'mini project', 'major project', 'final year project', 'achievements', 'awards', 'certifications', 'hackathon', 'competition', 'portfolio', 'accomplishments'],
      weight: 1,
      categoryBonus: 3
    },
    CONTACT_IDENTITY: {
      keywords: ['email', 'phone', 'mobile', 'contact', 'linkedin', 'github', 'portfolio', 'address', 'location'],
      weight: 1,
      categoryBonus: 3
    },
    RESUME_SECTIONS: {
      keywords: ['objective', 'career objective', 'summary', 'profile', 'strengths', 'hobbies', 'interests', 'declaration', 'references', 'personal details', 'about me'],
      weight: 1,
      categoryBonus: 3
    }
  };
  
  let totalScore = 0;
  let detectedSections = [];
  let foundKeywords = [];
  
  // Check each category
  Object.entries(resumeCategories).forEach(([categoryName, categoryData]) => {
    let categoryKeywordCount = 0;
    let keywordsFoundInCategory = [];
    
    categoryData.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        keywordsFoundInCategory.push(keyword);
        categoryKeywordCount += matches.length;
        foundKeywords.push(...matches);
      }
    });
    
    if (keywordsFoundInCategory.length > 0) {
      detectedSections.push(categoryName.replace(/_/g, ' '));
      
      // Add points for keywords
      let keywordPoints = categoryKeywordCount * categoryData.weight;
      
      // Add category bonus
      let categoryBonus = categoryData.categoryBonus;
      
      // Special handling for CORE_RESUME_IDENTITY
      if (categoryName === 'CORE_RESUME_IDENTITY') {
        keywordPoints += 10; // Extra 10 points for core identity
      }
      
      totalScore += keywordPoints + categoryBonus;
      
      console.log(`Category ${categoryName}: found ${keywordsFoundInCategory.length} keywords, score +${keywordPoints + categoryBonus}`);
    }
  });
  
  // Check filename for resume indicators
  const resumeFilenameIndicators = ['resume', 'cv', 'curriculum', 'vitae'];
  const filenameScore = resumeFilenameIndicators.filter(indicator => 
    filenameLower.includes(indicator)
  ).length * 2;
  
  totalScore += filenameScore;
  
  // Check for contact information
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i.test(text);
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text);
  
  if (hasEmail) totalScore += 2;
  if (hasPhone) totalScore += 2;
  
  console.log(`Final score: ${totalScore}, sections: ${detectedSections.length}, email: ${hasEmail}, phone: ${hasPhone}`);
  console.log(`Detected sections: ${detectedSections.join(', ')}`);
  
  const ATS_THRESHOLD = 18;
  
  return {
    isValid: totalScore >= ATS_THRESHOLD,
    reason: totalScore >= ATS_THRESHOLD ? 
      `Document meets ATS resume criteria with score ${totalScore}/${ATS_THRESHOLD}` :
      `Document does not meet ATS resume criteria (score: ${totalScore}/${ATS_THRESHOLD})`,
    atsScore: totalScore,
    detectedSections: detectedSections
  };
}

// Test with resume content
const resumeContent = `John Smith
Software Engineer
john.smith@email.com
(555) 123-4567
San Francisco, CA

EDUCATION
Bachelor of Science in Computer Science
Stanford University, 2020-2024
GPA: 3.8/4.0

EXPERIENCE
Software Engineer Intern | Google Inc. | Summer 2023
• Developed React components for user dashboard
• Implemented REST APIs using Node.js and Express

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java
Frameworks: React, Node.js, Express
Databases: PostgreSQL, MongoDB

PROJECTS
E-commerce Web Application
• Built full-stack web app using React and Node.js`;

console.log('Testing resume content:');
const result = validateResumeContentATS(resumeContent, 'john-smith-resume.txt');
console.log('Result:', result);

// Test with certificate
const certificateContent = `Smart India Hackathon 2024
Permission Letter

This letter grants permission to participate in the hackathon.`;

console.log('\n\nTesting certificate content:');
const result2 = validateResumeContentATS(certificateContent, 'SIH-Letter.txt');
console.log('Result:', result2);