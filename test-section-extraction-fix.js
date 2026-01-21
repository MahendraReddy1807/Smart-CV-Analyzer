const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testSectionExtractionFix() {
    console.log('🧪 Testing Section Extraction Fix');
    console.log('================================');
    
    try {
        // Test with Mahendra's resume
        const resumePath = 'Mahendra-Reddy-ML-Engineer.pdf';
        
        if (!fs.existsSync(resumePath)) {
            console.log('❌ Resume file not found:', resumePath);
            return;
        }
        
        console.log('📁 Testing with:', resumePath);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(resumePath));
        formData.append('jobRole', 'Machine Learning Engineer');
        
        console.log('🚀 Sending request to AI service...');
        
        const response = await axios.post('http://localhost:8002/analyze-resume', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });
        
        console.log('✅ Response received');
        console.log('📊 Status:', response.status);
        
        const data = response.data;
        
        // Test section extraction quality
        console.log('\n📋 SECTION EXTRACTION RESULTS:');
        console.log('==============================');
        
        console.log('\n👤 CONTACT INFO:');
        console.log('Name:', data.sections.contactInfo.name);
        console.log('Email:', data.sections.contactInfo.email);
        console.log('Phone:', data.sections.contactInfo.phone);
        console.log('Location:', data.sections.contactInfo.location);
        
        console.log('\n🎓 EDUCATION:');
        console.log(data.sections.education);
        
        console.log('\n💼 EXPERIENCE:');
        console.log(data.sections.experience);
        
        console.log('\n🚀 PROJECTS:');
        console.log(data.sections.projects);
        
        console.log('\n🏆 CERTIFICATIONS:');
        console.log(data.sections.certifications);
        
        console.log('\n🔧 SKILLS:');
        console.log(data.sections.skills);
        
        console.log('\n📈 SCORES:');
        console.log('Overall Score:', data.overallScore);
        console.log('Score Breakdown:', data.scoreBreakdown);
        
        // Check for content duplication issues
        console.log('\n🔍 DUPLICATION CHECK:');
        console.log('====================');
        
        const sections = [
            { name: 'Education', content: data.sections.education },
            { name: 'Experience', content: data.sections.experience },
            { name: 'Projects', content: data.sections.projects },
            { name: 'Certifications', content: data.sections.certifications }
        ];
        
        let duplicationsFound = false;
        
        for (let i = 0; i < sections.length; i++) {
            for (let j = i + 1; j < sections.length; j++) {
                const section1 = sections[i];
                const section2 = sections[j];
                
                // Check for overlapping content
                const content1 = section1.content.toLowerCase();
                const content2 = section2.content.toLowerCase();
                
                // Look for common phrases (more than 10 words)
                const words1 = content1.split(' ').filter(w => w.length > 3);
                const words2 = content2.split(' ').filter(w => w.length > 3);
                
                const commonWords = words1.filter(word => words2.includes(word));
                
                if (commonWords.length > 5) {
                    console.log(`⚠️  Potential duplication between ${section1.name} and ${section2.name}:`);
                    console.log(`   Common words: ${commonWords.slice(0, 5).join(', ')}...`);
                    duplicationsFound = true;
                }
            }
        }
        
        if (!duplicationsFound) {
            console.log('✅ No significant content duplication detected');
        }
        
        // Check email extraction
        console.log('\n📧 EMAIL EXTRACTION TEST:');
        console.log('=========================');
        if (data.sections.contactInfo.email !== 'Not found') {
            console.log('✅ Email successfully extracted:', data.sections.contactInfo.email);
        } else {
            console.log('❌ Email not found - this needs investigation');
        }
        
        console.log('\n🎉 Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testSectionExtractionFix();