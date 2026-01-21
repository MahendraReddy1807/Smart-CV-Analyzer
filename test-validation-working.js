/**
 * Test if validation is now working with both services running
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testValidationWorking() {
    console.log('🔧 Testing Validation with Services Running...\n');
    
    // Test 1: Test with a certificate (should be rejected)
    console.log('1. Testing Certificate Rejection...');
    
    const certificateContent = `Smart India Hackathon 2024
Permission Letter

This letter grants permission to John Doe to participate in the 
Smart India Hackathon 2024 event.

Event Details:
- Date: March 15-17, 2024
- Venue: IIT Delhi
- Team: TechInnovators
- Problem Statement: AI for Healthcare

This permission is granted subject to the terms and conditions
of the hackathon guidelines.

Authorized by:
Dr. Rajesh Kumar
Event Coordinator
Smart India Hackathon 2024`;
    
    fs.writeFileSync('SIH-Letter.txt', certificateContent);
    
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream('SIH-Letter.txt'), {
            filename: 'SIH-Letter.txt',
            contentType: 'text/plain'
        });
        formData.append('jobRole', 'Machine Learning Engineer');
        
        const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
            headers: formData.getHeaders(),
            timeout: 15000
        });
        
        console.log('❌ VALIDATION FAILED - Certificate was accepted!');
        console.log(`   Score: ${response.data.overallScore}%`);
        console.log('   This should have been rejected!');
        console.log('   Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ VALIDATION WORKING - Certificate correctly rejected');
            console.log(`   Status: ${error.response.data.status}`);
            console.log(`   Message: ${error.response.data.message}`);
            console.log(`   Details: ${error.response.data.details}`);
        } else {
            console.log('❌ Unexpected error');
            console.log(`   Error: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data:`, error.response.data);
            }
        }
    } finally {
        if (fs.existsSync('SIH-Letter.txt')) {
            fs.unlinkSync('SIH-Letter.txt');
        }
    }
    
    // Test 2: Test with a proper resume (should be accepted)
    console.log('\n2. Testing Resume Acceptance...');
    
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
• Collaborated with cross-functional teams on product features

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frameworks: React, Node.js, Express, Django
Databases: PostgreSQL, MongoDB, MySQL
Cloud: AWS, Docker, Kubernetes

PROJECTS
E-commerce Web Application
• Built full-stack web app using React and Node.js
• Integrated payment processing with Stripe API
• Deployed on AWS with Docker containers

CERTIFICATIONS
• AWS Certified Developer Associate (2023)
• Google Cloud Professional Developer (2022)`;
    
    fs.writeFileSync('john-smith-resume.txt', resumeContent);
    
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream('john-smith-resume.txt'), {
            filename: 'john-smith-resume.txt',
            contentType: 'text/plain'
        });
        formData.append('jobRole', 'Software Engineer');
        
        const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
            headers: formData.getHeaders(),
            timeout: 15000
        });
        
        console.log('✅ VALIDATION WORKING - Resume correctly accepted');
        console.log(`   Score: ${response.data.overallScore}%`);
        console.log(`   Sections detected: ${Object.keys(response.data.sections || {}).length}`);
        
    } catch (error) {
        console.log('❌ VALIDATION FAILED - Valid resume was rejected');
        console.log(`   Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data.message}`);
        }
    } finally {
        if (fs.existsSync('john-smith-resume.txt')) {
            fs.unlinkSync('john-smith-resume.txt');
        }
    }
}

testValidationWorking().catch(console.error);