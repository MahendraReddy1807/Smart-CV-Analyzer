/**
 * Test script to verify that only PDF files are accepted
 */

const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testFileValidation() {
    console.log('🔧 Testing PDF-only file validation...\n');
    
    const backendUrl = 'http://localhost:5000';
    
    // Test 1: Try to upload a PDF file (should work)
    console.log('📄 Test 1: Uploading PDF file...');
    try {
        const pdfExists = fs.existsSync('Mahendra-Reddy-ML-Engineer.pdf');
        if (pdfExists) {
            const form = new FormData();
            form.append('file', fs.createReadStream('Mahendra-Reddy-ML-Engineer.pdf'));
            form.append('jobRole', 'Software Engineer');
            
            const response = await axios.post(`${backendUrl}/api/resume/upload`, form, {
                headers: form.getHeaders(),
                timeout: 10000
            });
            
            console.log('✅ PDF upload successful');
        } else {
            console.log('⚠️ PDF test file not found, skipping PDF test');
        }
    } catch (error) {
        if (error.response) {
            console.log(`❌ PDF upload failed: ${error.response.status} - ${error.response.data.error || error.response.data}`);
        } else {
            console.log(`❌ PDF upload failed: ${error.message}`);
        }
    }
    
    // Test 2: Try to upload a fake PNG file (should fail)
    console.log('\n🖼️ Test 2: Attempting to upload PNG file (should be rejected)...');
    try {
        // Create a fake PNG file for testing
        const fakeImageContent = 'This is not a real PNG file';
        fs.writeFileSync('test-fake-image.png', fakeImageContent);
        
        const form = new FormData();
        form.append('file', fs.createReadStream('test-fake-image.png'), {
            filename: 'test-fake-image.png',
            contentType: 'image/png'
        });
        form.append('jobRole', 'Software Engineer');
        
        const response = await axios.post(`${backendUrl}/api/resume/upload`, form, {
            headers: form.getHeaders(),
            timeout: 10000
        });
        
        console.log('❌ PNG upload should have been rejected but was accepted');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ PNG upload correctly rejected');
        } else {
            console.log(`⚠️ Unexpected error: ${error.message}`);
        }
    } finally {
        // Clean up test file
        if (fs.existsSync('test-fake-image.png')) {
            fs.unlinkSync('test-fake-image.png');
        }
    }
    
    console.log('\n🎯 File validation test completed!');
}

// Run the test
testFileValidation().catch(console.error);