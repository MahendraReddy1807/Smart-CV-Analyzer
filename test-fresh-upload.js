const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Create a high-quality resume with many skills
const highQualityResume = `Sarah Wilson
Senior Full Stack Developer
sarah.wilson@techcorp.com
(555) 234-5678
Seattle, WA

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5+ years of expertise in modern web technologies, 
cloud architecture, and agile development practices.

TECHNICAL SKILLS
Frontend: JavaScript, TypeScript, React, Angular, Vue.js, HTML5, CSS3, SASS, Bootstrap
Backend: Node.js, Express, Python, Django, Flask, Java, Spring Boot, C#, .NET
Databases: PostgreSQL, MongoDB, MySQL, Redis, Elasticsearch
Cloud & DevOps: AWS, Azure, Docker, Kubernetes, Jenkins, CI/CD, Terraform
Tools: Git, GitHub, GitLab, Jira, Confluence, VS Code, IntelliJ

EXPERIENCE
Senior Full Stack Developer | TechCorp Inc. | 2021-Present
• Led development of microservices architecture serving 1M+ users
• Implemented React-based dashboard reducing load times by 60%
• Designed RESTful APIs handling 10K+ requests per minute
• Mentored team of 4 junior developers

Full Stack Developer | StartupXYZ | 2019-2021
• Built e-commerce platform using React, Node.js, and PostgreSQL
• Integrated payment systems (Stripe, PayPal) processing $2M+ annually
• Optimized database queries improving performance by 40%
• Implemented automated testing reducing bugs by 75%

EDUCATION
Bachelor of Science in Computer Science
University of Washington, 2015-2019
GPA: 3.8/4.0

CERTIFICATIONS
• AWS Certified Solutions Architect (2023)
• Google Cloud Professional Developer (2022)
• Certified Kubernetes Administrator (2021)

PROJECTS
1. Real-time Chat Application
• Built using React, Socket.io, Node.js, and MongoDB
• Supports 1000+ concurrent users with message encryption
• Deployed on AWS with auto-scaling capabilities

2. AI-Powered Analytics Dashboard
• Developed using Python, TensorFlow, and React
• Processes 100GB+ data daily with machine learning insights
• Reduced manual analysis time by 80%`;

// Write the resume to a file
fs.writeFileSync('high-quality-resume.txt', highQualityResume);

// Test resume upload
const testUpload = () => {
  const form = new FormData();
  form.append('file', fs.createReadStream('high-quality-resume.txt'));
  form.append('jobRole', 'Full Stack Developer');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/upload',
    method: 'POST',
    headers: form.getHeaders()
  };

  const req = http.request(options, (res) => {
    console.log(`Upload Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const analysis = JSON.parse(data);
        console.log('\n🎯 HIGH-QUALITY RESUME TEST RESULTS:');
        console.log('==========================================');
        console.log('- Analysis ID:', analysis._id);
        console.log('- Filename:', analysis.uploadedFileName);
        console.log('- Job Role:', analysis.jobRole);
        console.log('\n📊 EXTRACTED DATA:');
        console.log('- Name:', analysis.sections?.contactInfo?.name);
        console.log('- Email:', analysis.sections?.contactInfo?.email);
        console.log('- Phone:', analysis.sections?.contactInfo?.phone);
        console.log('- Location:', analysis.sections?.contactInfo?.location);
        console.log('- Skills Count:', analysis.sections?.skills?.length);
        console.log('- First 10 Skills:', analysis.sections?.skills?.slice(0, 10).join(', '));
        
        console.log('\n📈 DETAILED SCORES:');
        console.log('==========================================');
        console.log('🎯 OVERALL SCORE:', analysis.overallScore + '%');
        console.log('📋 Structure Score:', analysis.scoreBreakdown?.structureScore + '%');
        console.log('🛠️  Skills Score:', analysis.scoreBreakdown?.skillsScore + '%');
        console.log('📝 Content Score:', analysis.scoreBreakdown?.contentScore + '%');
        console.log('🤖 ATS Compatibility:', analysis.scoreBreakdown?.atsCompatibility + '%');
        
        console.log('\n🎯 SUGGESTED ROLES:', analysis.suggestedRoles?.join(', '));
        
        console.log('\n✅ ANALYSIS COMPLETE!');
        console.log(`🌐 View in browser: http://localhost:3001/analysis/${analysis._id}`);
        
        // Check if scores are reasonable for high-quality resume
        if (analysis.overallScore < 80) {
          console.log('\n⚠️  WARNING: Overall score seems low for high-quality resume!');
          console.log('Expected: 80%+, Got:', analysis.overallScore + '%');
        } else {
          console.log('\n✅ Scores look appropriate for high-quality resume!');
        }
        
      } catch (e) {
        console.error('❌ Failed to parse response:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Upload Error: ${e.message}`);
  });

  form.pipe(req);
};

console.log('🧪 Testing with HIGH-QUALITY resume (30+ skills, complete sections)...\n');
testUpload();