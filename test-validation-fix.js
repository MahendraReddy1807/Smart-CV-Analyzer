/**
 * Test script to verify the resume validation fix
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testValidation() {
    console.log('🔧 Testing Resume Validation Fix...\n');
    
    const testCases = [
        {
            name: 'Valid Resume (PDF)',
            file: 'Mahendra-Reddy-ML-Engineer.pdf',
            shouldPass: true
        },
        {
            name: 'Invalid Certificate Content (create temporary)',
            content: `Certificate of Completion

This certifies that John Doe has successfully completed the course:
"Machine Learning Specialization"
Offered by Coursera in partnership with Stanford University
Date of Completion: December 2024
Coursera Certificate ID: ABC123XYZ`,
            filename: 'temp-certificate.txt',
            shouldPass: false // This should be rejected as it's a certificate
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);
        
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
            } else {
                console.log(`⚠️  UNEXPECTED: Resume was accepted when it should have been rejected`);
            }
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorData = error.response.data;
                if (testCase.shouldPass) {
                    console.log(`❌ FAIL: Resume rejected - ${errorData.message}`);
                    if (errorData.details) {
                        console.log(`   Details: ${errorData.details}`);
                    }
                } else {
                    console.log(`✅ PASS: Resume correctly rejected - ${errorData.message}`);
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
    
    console.log('🎯 Validation testing completed!');
}

// Run the test
testValidation().catch(console.error);