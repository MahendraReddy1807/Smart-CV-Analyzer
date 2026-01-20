/**
 * Test PDF upload with the fixed validation
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testPDFUpload() {
    console.log('🔧 Testing PDF Upload with Fixed Validation...\n');
    
    // Test with the actual PDF file mentioned in the error
    const testFile = 'Mahendra-Reddy-ML-Engineer.pdf';
    
    if (!fs.existsSync(testFile)) {
        console.log(`❌ Test file not found: ${testFile}`);
        console.log('Available PDF files:');
        const files = fs.readdirSync('.').filter(f => f.endsWith('.pdf'));
        files.forEach(f => console.log(`  - ${f}`));
        return;
    }
    
    console.log(`📄 Testing with: ${testFile}`);
    
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFile), {
            filename: testFile,
            contentType: 'application/pdf'
        });
        formData.append('jobRole', 'ML Engineer');
        
        console.log('🚀 Uploading PDF file...');
        
        const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 60000
        });
        
        console.log('✅ SUCCESS: PDF upload accepted!');
        console.log(`📊 Analysis ID: ${response.data._id}`);
        console.log(`📈 Overall Score: ${response.data.overallScore || 'N/A'}`);
        console.log(`🎯 Name: ${response.data.sections?.contactInfo?.name || 'N/A'}`);
        console.log(`📧 Email: ${response.data.sections?.contactInfo?.email || 'N/A'}`);
        console.log(`📍 Location: ${response.data.sections?.contactInfo?.location || 'N/A'}`);
        console.log(`🔧 Skills Count: ${response.data.sections?.skills?.length || 0}`);
        
        if (response.data.sections?.skills && response.data.sections.skills.length > 0) {
            console.log(`🛠️  Top Skills: ${response.data.sections.skills.slice(0, 5).join(', ')}`);
        }
        
        console.log(`\n🌐 View results at: http://localhost:3000/analysis/${response.data._id}`);
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorData = error.response.data;
            console.log('❌ VALIDATION ERROR:');
            console.log(`   Message: ${errorData.message}`);
            if (errorData.details) {
                console.log(`   Details: ${errorData.details}`);
            }
            if (errorData.suggestions) {
                console.log('   Suggestions:');
                errorData.suggestions.forEach(s => console.log(`     • ${s}`));
            }
        } else {
            console.log(`❌ ERROR: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
    }
}

// Run the test
testPDFUpload().catch(console.error);