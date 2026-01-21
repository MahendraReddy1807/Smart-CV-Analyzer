const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function debugResumeProcessingError() {
    console.log('🔍 DEBUGGING RESUME PROCESSING ERROR');
    console.log('===================================');
    
    try {
        // Test 1: Check service health
        console.log('\n🏥 Step 1: Checking Service Health');
        console.log('----------------------------------');
        
        try {
            const aiHealth = await axios.get('http://localhost:8002/health', { timeout: 5000 });
            console.log('✅ AI Service:', aiHealth.data.status);
        } catch (error) {
            console.log('❌ AI Service Error:', error.message);
            return;
        }
        
        try {
            const backendHealth = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
            console.log('✅ Backend Service:', backendHealth.data.status);
        } catch (error) {
            console.log('❌ Backend Service Error:', error.message);
            return;
        }
        
        // Test 2: Direct AI service test
        console.log('\n🤖 Step 2: Testing AI Service Directly');
        console.log('--------------------------------------');
        
        const resumePath = 'Mahendra-Reddy-Resume.txt';
        
        if (!fs.existsSync(resumePath)) {
            console.log('❌ Resume file not found:', resumePath);
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(resumePath));
        formData.append('jobRole', 'Machine Learning Engineer');
        
        try {
            console.log('📤 Sending request to AI service...');
            const aiResponse = await axios.post('http://localhost:8002/analyze-resume', formData, {
                headers: { ...formData.getHeaders() },
                timeout: 30000
            });
            
            console.log('✅ AI Service Response Status:', aiResponse.status);
            console.log('📊 Overall Score:', aiResponse.data.overallScore);
            console.log('👤 Name:', aiResponse.data.sections.contactInfo.name);
            console.log('📧 Email:', aiResponse.data.sections.contactInfo.email);
            
        } catch (error) {
            console.log('❌ AI Service Error:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.detail || error.message);
            console.log('   Full Error:', error.response?.data);
            return;
        }
        
        // Test 3: Backend API test
        console.log('\n🔗 Step 3: Testing Backend API');
        console.log('------------------------------');
        
        const backendFormData = new FormData();
        backendFormData.append('file', fs.createReadStream(resumePath));
        backendFormData.append('jobRole', 'Machine Learning Engineer');
        
        try {
            console.log('📤 Sending request to backend API...');
            const backendResponse = await axios.post('http://localhost:5000/api/resume/upload', backendFormData, {
                headers: { ...backendFormData.getHeaders() },
                timeout: 30000
            });
            
            console.log('✅ Backend Response Status:', backendResponse.status);
            console.log('📊 Analysis ID:', backendResponse.data._id);
            console.log('📈 Overall Score:', backendResponse.data.overallScore);
            
        } catch (error) {
            console.log('❌ Backend API Error:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
            console.log('   Detail:', error.response?.data?.detail);
            console.log('   Full Error:', error.response?.data);
            
            // If there's an error, let's check the backend logs
            console.log('\n📋 Backend might have detailed logs. Check the backend process output.');
            return;
        }
        
        console.log('\n🎉 SUCCESS: All tests passed!');
        console.log('The "Error processing resume" issue should be resolved.');
        console.log('\n📝 Next Steps:');
        console.log('1. Open frontend at http://localhost:3002');
        console.log('2. Try uploading a resume');
        console.log('3. Check if the error still occurs');
        
    } catch (error) {
        console.error('❌ Debugging failed:', error.message);
    }
}

debugResumeProcessingError();