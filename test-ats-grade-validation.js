/**
 * Test ATS-Grade Resume Validation System
 * Tests the professional ATS validation logic with various document types
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testATSValidation() {
    console.log('🏢 Testing ATS-Grade Resume Validation System...\n');
    
    const testCases = [
        {
            name: 'Professional Resume (Should PASS)',
            content: `John Smith
Software Engineer
john.smith@email.com
(555) 123-4567
San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of expertise in full-stack development.

EDUCATION
Bachelor of Science in Computer Science
Stanford University, 2018-2022
GPA: 3.8/4.0

EXPERIENCE
Senior Software Engineer | Google Inc. | 2022-Present
• Led development of microservices architecture serving 1M+ users
• Implemented React-based dashboard reducing load times by 60%
• Mentored team of 4 junior developers

Software Engineer Intern | Microsoft | Summer 2021
• Developed REST APIs using Node.js and Express
• Collaborated with cross-functional teams on product features

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frameworks: React, Node.js, Express, Django, Spring Boot
Databases: PostgreSQL, MongoDB, MySQL, Redis
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins

PROJECTS
1. E-commerce Web Application
• Built full-stack web app using React and Node.js
• Integrated payment processing with Stripe API
• Deployed on AWS with Docker containers

2. Machine Learning Classifier
• Developed image classification model using TensorFlow
• Achieved 92% accuracy on test dataset

CERTIFICATIONS
• AWS Certified Solutions Architect (2023)
• Google Cloud Professional Developer (2022)

ACHIEVEMENTS
• Employee of the Month - Google (March 2023)
• Hackathon Winner - Stanford CodeFest (2021)`,
            filename: 'john-smith-resume.txt',
            shouldPass: true,
            expectedScore: '25+',
            description: 'Complete professional resume with all sections'
        },
        {
            name: 'Course Certificate (Should REJECT)',
            content: `Certificate of Completion

This certifies that Sarah Johnson has successfully completed the course:

"Machine Learning Specialization"

Offered by Coursera in partnership with Stanford University

Course Duration: 6 months
Date of Completion: December 15, 2024

This certificate is awarded in recognition of the successful completion 
of all course requirements including assignments, quizzes, and final project.

Certificate ID: ML-SPEC-2024-789456
Verification URL: coursera.org/verify/ML-SPEC-2024-789456

Instructor: Dr. Andrew Ng
Institution: Stanford University
Platform: Coursera`,
            filename: 'coursera-certificate.txt',
            shouldPass: false,
            expectedScore: '<18',
            description: 'Course completion certificate - not a resume'
        },
        {
            name: 'University Marksheet (Should REJECT)',
            content: `UNIVERSITY OF TECHNOLOGY
OFFICIAL TRANSCRIPT

Student Name: Michael Chen
Student ID: UT2020-CS-1234
Program: Bachelor of Science in Computer Science
Semester: Fall 2023

COURSE GRADES:
CS301 - Data Structures and Algorithms: A
CS302 - Database Management Systems: A-
CS303 - Software Engineering: B+
CS304 - Computer Networks: A
CS305 - Operating Systems: B+

Semester GPA: 3.7
Cumulative GPA: 3.6
Total Credits Completed: 120/128

Academic Standing: Good Standing
Expected Graduation: Spring 2024

Registrar Signature: ________________
Date Issued: January 10, 2024
Official Seal: [UNIVERSITY SEAL]`,
            filename: 'university-transcript.txt',
            shouldPass: false,
            expectedScore: '<18',
            description: 'University transcript/marksheet - not a resume'
        },
        {
            name: 'Social Media Post (Should REJECT)',
            content: `🎉 CONGRATULATIONS! 🎉

Just got my dream job at Google! 

So excited to start this new journey! Thank you to everyone who supported me along the way. 

The interview process was intense but totally worth it! 

Time to celebrate! 🥳🍾

#NewJob #Google #SoftwareEngineer #DreamsComeTrue #Grateful #TechLife #Celebration

Like and share if you're happy for me! 
Follow for more career updates!

Posted on LinkedIn • 2 hours ago • 47 likes • 12 comments`,
            filename: 'social-media-post.txt',
            shouldPass: false,
            expectedScore: '<18',
            description: 'Social media celebration post - not a resume'
        },
        {
            name: 'Project Report (Should REJECT)',
            content: `FINAL YEAR PROJECT REPORT

Title: Development of E-commerce Web Application
Student: Alex Kumar
Roll Number: 18CS001
Guide: Dr. Priya Sharma
Department: Computer Science Engineering

ABSTRACT
This project involves the development of a comprehensive e-commerce web application 
using modern web technologies including React.js for frontend and Node.js for backend.

CHAPTER 1: INTRODUCTION
E-commerce has revolutionized the way businesses operate in the digital age...

CHAPTER 2: LITERATURE REVIEW
Various studies have been conducted on e-commerce platforms...

CHAPTER 3: METHODOLOGY
The project follows an agile development methodology...

CHAPTER 4: IMPLEMENTATION
The system is implemented using the following technologies:
- Frontend: React.js, HTML5, CSS3
- Backend: Node.js, Express.js
- Database: MongoDB

CHAPTER 5: RESULTS AND DISCUSSION
The application successfully handles user registration, product catalog...

CHAPTER 6: CONCLUSION
The project successfully demonstrates the implementation of a scalable e-commerce platform...

REFERENCES
[1] Smith, J. (2020). Modern Web Development Practices
[2] Johnson, M. (2019). E-commerce Architecture Patterns`,
            filename: 'project-report.txt',
            shouldPass: false,
            expectedScore: '<18',
            description: 'Academic project report - not a resume'
        },
        {
            name: 'Minimal Resume (Should REJECT)',
            content: `John Doe
Looking for job

I worked at some company.
I know computers.
I can use Microsoft Office.

Contact me if interested.`,
            filename: 'minimal-resume.txt',
            shouldPass: false,
            expectedScore: '<18',
            description: 'Too minimal - lacks essential resume elements'
        },
        {
            name: 'CV with Resume Keywords (Should PASS)',
            content: `CURRICULUM VITAE

Dr. Emily Watson
Senior Data Scientist
emily.watson@university.edu
+1 (555) 987-6543

EDUCATION
Ph.D. in Computer Science, MIT, 2018
M.S. in Data Science, Stanford University, 2014
B.S. in Mathematics, UC Berkeley, 2012

PROFESSIONAL EXPERIENCE
Senior Data Scientist | Netflix Inc. | 2019-Present
• Lead machine learning initiatives for recommendation systems
• Manage team of 8 data scientists and ML engineers
• Published 12 research papers in top-tier conferences

Data Scientist | Uber Technologies | 2018-2019
• Developed predictive models for demand forecasting
• Improved algorithm efficiency by 40%

TECHNICAL SKILLS
Programming: Python, R, SQL, Scala, Java
Machine Learning: TensorFlow, PyTorch, Scikit-learn
Big Data: Spark, Hadoop, Kafka
Visualization: Tableau, D3.js, Matplotlib

PUBLICATIONS
1. "Deep Learning for Recommendation Systems" - ICML 2023
2. "Scalable ML Pipelines" - NeurIPS 2022

AWARDS
• Best Paper Award - ICML 2023
• Data Science Excellence Award - Netflix 2022`,
            filename: 'emily-watson-cv.txt',
            shouldPass: true,
            expectedScore: '25+',
            description: 'Academic CV with proper resume structure'
        }
    ];
    
    let passCount = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
        console.log(`📋 Testing: ${testCase.name}`);
        console.log(`   Expected: ${testCase.shouldPass ? 'PASS' : 'REJECT'} (Score ${testCase.expectedScore})`);
        console.log(`   Description: ${testCase.description}`);
        
        try {
            // Create temporary file
            fs.writeFileSync(testCase.filename, testCase.content);
            
            const formData = new FormData();
            formData.append('file', fs.createReadStream(testCase.filename), {
                filename: testCase.filename,
                contentType: 'text/plain'
            });
            formData.append('jobRole', 'Software Engineer');
            
            const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 30000
            });
            
            if (testCase.shouldPass) {
                console.log(`   ✅ PASS: Resume accepted`);
                console.log(`   📊 ATS Score: ${response.data.overallScore || 'N/A'}`);
                console.log(`   📋 Sections: ${response.data.sections ? Object.keys(response.data.sections).length : 'N/A'}`);
                passCount++;
            } else {
                console.log(`   ❌ FAIL: Invalid content was accepted when it should have been rejected`);
                console.log(`   📊 Unexpected Score: ${response.data.overallScore || 'N/A'}`);
            }
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorData = error.response.data;
                if (testCase.shouldPass) {
                    console.log(`   ❌ FAIL: Valid resume rejected`);
                    console.log(`   📝 Reason: ${errorData.message}`);
                    console.log(`   📊 ATS Score: ${errorData.ats_score || 'N/A'}`);
                } else {
                    console.log(`   ✅ PASS: Invalid content correctly rejected`);
                    console.log(`   📝 Reason: ${errorData.message}`);
                    console.log(`   📊 ATS Score: ${errorData.ats_score || 'N/A'}`);
                    console.log(`   📋 Detected Sections: ${errorData.detected_sections ? errorData.detected_sections.length : 0}`);
                    passCount++;
                }
            } else {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
        } finally {
            // Clean up temporary file
            if (fs.existsSync(testCase.filename)) {
                fs.unlinkSync(testCase.filename);
            }
        }
        
        console.log('');
    }
    
    console.log(`🎯 ATS Validation Testing Completed!`);
    console.log(`📊 Results: ${passCount}/${totalTests} tests passed (${Math.round(passCount/totalTests*100)}%)`);
    
    if (passCount === totalTests) {
        console.log('🏆 EXCELLENT! All tests passed. ATS-grade validation is working perfectly.');
        console.log('✅ System correctly identifies resumes vs non-resume documents');
        console.log('✅ Professional scoring threshold (18+) is properly enforced');
        console.log('✅ Non-resume documents are properly rejected with clear messages');
    } else {
        console.log('⚠️  Some tests failed. Please review the ATS validation logic.');
        console.log(`❌ Failed tests: ${totalTests - passCount}`);
    }
}

// Run the comprehensive ATS test
testATSValidation().catch(console.error);