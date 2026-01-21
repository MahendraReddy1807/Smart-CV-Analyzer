/**
 * Comprehensive test for resume validation
 * Tests both valid resumes and invalid content (certificates, social media, etc.)
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testResumeValidation() {
    console.log('🔧 Testing Comprehensive Resume Validation...\n');
    
    const testCases = [
        {
            name: 'Valid Resume (PDF)',
            file: 'Mahendra-Reddy-ML-Engineer.pdf',
            shouldPass: true,
            description: 'Real PDF resume file'
        },
        {
            name: 'Valid Resume (Text)',
            content: `Sarah Wilson
Senior Full Stack Developer
sarah.wilson@techcorp.com
(555) 234-5678
Seattle, WA

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5+ years of expertise in modern web technologies.

TECHNICAL SKILLS
Frontend: JavaScript, React, Angular, HTML5, CSS3
Backend: Node.js, Python, Java, Spring Boot
Databases: PostgreSQL, MongoDB, MySQL

EXPERIENCE
Senior Full Stack Developer | TechCorp Inc. | 2021-Present
• Led development of microservices architecture serving 1M+ users
• Implemented React-based dashboard reducing load times by 60%

EDUCATION
Bachelor of Science in Computer Science
University of Washington, 2015-2019`,
            filename: 'temp-valid-resume.txt',
            shouldPass: true,
            description: 'Complete resume with all sections'
        },
        {
            name: 'Certificate (Should be rejected)',
            content: `Certificate of Completion

This certifies that John Doe has successfully completed the course:
"Machine Learning Specialization"

Offered by Coursera in partnership with Stanford University
Date of Completion: December 2024

This certificate is awarded in recognition of the successful completion of all course requirements.

Coursera Certificate ID: ABC123XYZ`,
            filename: 'temp-certificate.txt',
            shouldPass: false,
            description: 'Course completion certificate'
        },
        {
            name: 'Social Media Post (Should be rejected)',
            content: `Congratulations!

You did it! Amazing work!

🎉 Party time! 🎉

This is so exciting! 
Celebrate with friends and family!

Haha, you're the best!
Like and share this post!

#celebration #party #congrats`,
            filename: 'temp-social.txt',
            shouldPass: false,
            description: 'Social media celebration post'
        },
        {
            name: 'Random Document (Should be rejected)',
            content: `Meeting Notes - Project Alpha

Date: January 21, 2025
Attendees: John, Sarah, Mike

Agenda:
1. Project timeline review
2. Budget discussion
3. Next steps

Action Items:
- John to update documentation
- Sarah to review code
- Mike to schedule follow-up`,
            filename: 'temp-meeting.txt',
            shouldPass: false,
            description: 'Meeting notes document'
        },
        {
            name: 'Minimal Resume (Should be rejected)',
            content: `John Doe
Looking for job

I worked at some company.
I know computers.`,
            filename: 'temp-minimal.txt',
            shouldPass: false,
            description: 'Too minimal, lacks essential resume elements'
        }
    ];
    
    let passCount = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);
        console.log(`   Description: ${testCase.description}`);
        
        try {
            let fileToTest = testCase.file;
            
            // If this is a content-based test case, create a temporary file
            if (testCase.content) {
                fs.writeFileSync(testCase.filename, testCase.content);
                fileToTest = testCase.filename;
            }
            
            if (!fs.existsSync(fileToTest)) {
                console.log(`❌ File not found: ${fileToTest}\n`);
                continue;
            }
            
            const formData = new FormData();
            formData.append('file', fs.createReadStream(fileToTest), {
                filename: fileToTest,
                contentType: fileToTest.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
            });
            formData.append('jobRole', 'Software Engineer');
            
            const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 30000
            });
            
            if (testCase.shouldPass) {
                console.log(`✅ PASS: Resume accepted (Score: ${response.data.overallScore || 'N/A'})`);
                passCount++;
            } else {
                console.log(`❌ FAIL: Invalid content was accepted when it should have been rejected`);
                console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
            }
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorData = error.response.data;
                if (testCase.shouldPass) {
                    console.log(`❌ FAIL: Valid resume rejected - ${errorData.message}`);
                    if (errorData.details) {
                        console.log(`   Details: ${errorData.details}`);
                    }
                } else {
                    console.log(`✅ PASS: Invalid content correctly rejected - ${errorData.message}`);
                    passCount++;
                }
            } else {
                console.log(`❌ ERROR: ${error.message}`);
            }
        } finally {
            // Clean up temporary files
            if (testCase.content && fs.existsSync(testCase.filename)) {
                fs.unlinkSync(testCase.filename);
            }
        }
        
        console.log('');
    }
    
    console.log(`🎯 Validation testing completed!`);
    console.log(`📊 Results: ${passCount}/${totalTests} tests passed`);
    
    if (passCount === totalTests) {
        console.log('🎉 All tests passed! Resume validation is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please review the validation logic.');
    }
}

// Run the test
testResumeValidation().catch(console.error);