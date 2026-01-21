/**
 * Test AI Service Status and Validation
 */

const axios = require('axios');

async function testAIServiceStatus() {
    console.log('🔍 Testing AI Service Status and Validation...\n');
    
    // Test 1: Check if AI service is running
    console.log('1. Testing AI Service Health...');
    try {
        const healthResponse = await axios.get('http://localhost:8002/health', { timeout: 5000 });
        console.log('✅ AI Service is running');
        console.log(`   Status: ${healthResponse.data.status}`);
        console.log(`   Message: ${healthResponse.data.message}`);
    } catch (error) {
        console.log('❌ AI Service is NOT running');
        console.log(`   Error: ${error.message}`);
        console.log('   This explains why the system is using mock responses!');
        return false;
    }
    
    // Test 2: Check backend health
    console.log('\n2. Testing Backend Health...');
    try {
        const backendResponse = await axios.get('http://localhost:5000/health', { timeout: 5000 });
        console.log('✅ Backend is running');
        console.log(`   Status: ${backendResponse.data.status}`);
    } catch (error) {
        console.log('❌ Backend is NOT running');
        console.log(`   Error: ${error.message}`);
        return false;
    }
    
    // Test 3: Test AI service validation directly
    console.log('\n3. Testing AI Service Validation Directly...');
    
    // Test with a certificate (should be rejected)
    const FormData = require('form-data');
    const fs = require('fs');
    
    // Create a test certificate
    const certificateContent = `Certificate of Completion

This certifies that John Doe has successfully completed the course:
"Smart India Hackathon 2024 - Permission Letter"

Date: January 21, 2025
Certificate ID: SIH-2024-789`;
    
    fs.writeFileSync('test-certificate.txt', certificateContent);
    
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream('test-certificate.txt'), {
            filename: 'SIH-Letter.txt',
            contentType: 'text/plain'
        });
        formData.append('jobRole', 'Software Engineer');
        
        const aiResponse = await axios.post('http://localhost:8002/analyze-resume', formData, {
            headers: formData.getHeaders(),
            timeout: 10000
        });
        
        console.log('❌ AI Service FAILED - Certificate was accepted!');
        console.log(`   Score: ${aiResponse.data.overallScore}`);
        console.log('   This should have been rejected!');
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ AI Service validation working - Certificate correctly rejected');
            console.log(`   Reason: ${error.response.data.detail?.message || error.response.data.message}`);
        } else {
            console.log('❌ Unexpected error from AI service');
            console.log(`   Error: ${error.message}`);
        }
    } finally {
        // Clean up
        if (fs.existsSync('test-certificate.txt')) {
            fs.unlinkSync('test-certificate.txt');
        }
    }
    
    // Test 4: Test backend validation
    console.log('\n4. Testing Backend Validation...');
    
    // Create another test certificate
    fs.writeFileSync('test-sih-letter.txt', certificateContent);
    
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream('test-sih-letter.txt'), {
            filename: 'SIH-Letter.txt',
            contentType: 'text/plain'
        });
        formData.append('jobRole', 'Machine Learning Engineer');
        
        const backendResponse = await axios.post('http://localhost:5000/api/resume/upload', formData, {
            headers: formData.getHeaders(),
            timeout: 10000
        });
        
        console.log('❌ Backend FAILED - Certificate was accepted!');
        console.log(`   Score: ${backendResponse.data.overallScore}`);
        console.log('   This explains the 77% score for SIH Letter!');
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ Backend validation working - Certificate correctly rejected');
            console.log(`   Reason: ${error.response.data.message}`);
        } else {
            console.log('❌ Unexpected error from backend');
            console.log(`   Error: ${error.message}`);
        }
    } finally {
        // Clean up
        if (fs.existsSync('test-sih-letter.txt')) {
            fs.unlinkSync('test-sih-letter.txt');
        }
    }
    
    return true;
}

// Run the test
testAIServiceStatus().then(success => {
    if (success) {
        console.log('\n🎯 Diagnosis Complete!');
        console.log('\n💡 Next Steps:');
        console.log('1. If AI Service is down: Start it with "python ai-service/main-minimal.py"');
        console.log('2. If validation is failing: Check the ATS validation logic');
        console.log('3. If mock system is being used: Fix the backend validation');
    }
}).catch(console.error);