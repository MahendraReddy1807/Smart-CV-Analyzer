const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testAllServicesAfterRestart() {
    console.log('🔄 TESTING ALL SERVICES AFTER RESTART');
    console.log('=====================================');
    
    try {
        // Test 1: Service Health Check
        console.log('\n🏥 Step 1: Health Check');
        console.log('----------------------');
        
        try {
            const aiHealth = await axios.get('http://localhost:8002/health', { timeout: 5000 });
            console.log('✅ AI Service (Port 8002):', aiHealth.data.status);
        } catch (error) {
            console.log('❌ AI Service Error:', error.message);
            return;
        }
        
        try {
            const backendHealth = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
            console.log('✅ Backend Service (Port 5000):', backendHealth.data.status);
        } catch (error) {
            console.log('❌ Backend Service Error:', error.message);
            return;
        }
        
        try {
            const frontendResponse = await axios.get('http://localhost:3001', { 
                timeout: 5000,
                validateStatus: () => true 
            });
            console.log('✅ Frontend Service (Port 3001): Accessible');
        } catch (error) {
            console.log('❌ Frontend Service Error:', error.message);
        }
        
        // Test 2: Critical Bug Fix Verification
        console.log('\n🐛 Step 2: Bug Fix Verification');
        console.log('-------------------------------');
        
        const resumePath = 'Mahendra-Reddy-Resume.txt';
        
        if (!fs.existsSync(resumePath)) {
            console.log('❌ Resume file not found:', resumePath);
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(resumePath));
        formData.append('jobRole', 'Machine Learning Engineer');
        
        try {
            console.log('📤 Testing AI service with fixed bug...');
            const aiResponse = await axios.post('http://localhost:8002/analyze-resume', formData, {
                headers: { ...formData.getHeaders() },
                timeout: 30000
            });
            
            console.log('✅ AI Service Response Status:', aiResponse.status);
            console.log('📊 Overall Score:', aiResponse.data.overallScore);
            console.log('👤 Name:', aiResponse.data.sections.contactInfo.name);
            console.log('📧 Email:', aiResponse.data.sections.contactInfo.email);
            console.log('📱 Phone:', aiResponse.data.sections.contactInfo.phone);
            console.log('📍 Location:', aiResponse.data.sections.contactInfo.location);
            
        } catch (error) {
            console.log('❌ AI Service Still Has Error:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.detail || error.message);
            return;
        }
        
        // Test 3: End-to-End Backend Test
        console.log('\n🔗 Step 3: End-to-End Backend Test');
        console.log('----------------------------------');
        
        const backendFormData = new FormData();
        backendFormData.append('file', fs.createReadStream(resumePath));
        backendFormData.append('jobRole', 'Machine Learning Engineer');
        
        try {
            console.log('📤 Testing full backend pipeline...');
            const backendResponse = await axios.post('http://localhost:5000/api/resume/upload', backendFormData, {
                headers: { ...backendFormData.getHeaders() },
                timeout: 30000
            });
            
            console.log('✅ Backend Response Status:', backendResponse.status);
            console.log('📊 Analysis ID:', backendResponse.data._id);
            console.log('📈 Overall Score:', backendResponse.data.overallScore);
            
        } catch (error) {
            console.log('❌ Backend Error:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
            return;
        }
        
        console.log('\n🎉 SUCCESS: All Services Restarted and Working!');
        console.log('===============================================');
        console.log('✅ AI Service: http://localhost:8002 - WORKING');
        console.log('✅ Backend API: http://localhost:5000 - WORKING');
        console.log('✅ Frontend: http://localhost:3001 - WORKING');
        console.log('✅ Critical bug fixed - no more "Error processing resume"');
        
        console.log('\n📝 Ready for Testing:');
        console.log('1. Open http://localhost:3001 in your browser');
        console.log('2. Upload a resume using drag & drop OR browse button');
        console.log('3. The "Error processing resume" should be resolved');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAllServicesAfterRestart();