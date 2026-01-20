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
            name: 'Valid Resume (high-quality-resume.txt)',
            file: 'high-quality-resume.txt',
            shouldPass: true
        },
        {
            name: 'Valid Resume (test-resume.txt)',
            file: 'test-resume.txt',
            shouldPass: true
        },
        {
            name: 'Basic Resume (test-resume-basic.txt)',
            file: 'test-resume-basic.txt',
            shouldPass: false // This one is too basic
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);
        
        try {
            if (!fs.existsSync(testCase.file)) {
                console.log(`❌ File not found: ${testCase.file}\n`);
                continue;
            }
            
            const formData = new FormData();
            formData.append('file', fs.createReadStream(testCase.file), {
                filename: testCase.file,
                contentType: 'text/plain'
            });
            formData.append('jobRole', 'Software Engineer');
            
            const response = await axios.post('http://localhost:3001/api/resume/upload', formData, {
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
        }
        
        console.log('');
    }
    
    console.log('🎯 Validation testing completed!');
}

// Run the test
testValidation().catch(console.error);