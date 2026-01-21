const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testProperResumeExtraction() {
    console.log('🧪 Testing Proper Resume Extraction');
    console.log('===================================');
    
    try {
        // Test with the actual resume text file
        const resumePath = 'Mahendra-Reddy-Resume.txt';
        
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
        
        // Validate extraction quality
        console.log('\n🔍 EXTRACTION QUALITY CHECK:');
        console.log('============================');
        
        // Check contact info
        const contactChecks = {
            'Name extracted': data.sections.contactInfo.name !== 'Name from Mahendra-Reddy-Resume.txt',
            'Email found': data.sections.contactInfo.email !== 'Not found',
            'Phone found': data.sections.contactInfo.phone !== 'Not found',
            'Location found': data.sections.contactInfo.location !== 'Location not found'
        };
        
        Object.entries(contactChecks).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
        });
        
        // Check sections have real content
        const sectionChecks = {
            'Education has real content': !data.sections.education.includes('Education details would be extracted here'),
            'Experience has real content': !data.sections.experience.includes('Experience details would be extracted here'),
            'Projects has real content': !data.sections.projects.includes('Project details would be extracted here'),
            'Certifications has real content': !data.sections.certifications.includes('Certifications would be extracted here'),
            'Skills detected': data.sections.skills.length > 5
        };
        
        Object.entries(sectionChecks).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
        });
        
        // Check for content duplication
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
                
                // Check for overlapping content (more than 20 characters)
                const content1 = section1.content.toLowerCase();
                const content2 = section2.content.toLowerCase();
                
                // Look for common substrings longer than 20 characters
                const words1 = content1.split(' ');
                const words2 = content2.split(' ');
                
                for (let k = 0; k < words1.length - 3; k++) {
                    const phrase = words1.slice(k, k + 4).join(' ');
                    if (phrase.length > 20 && content2.includes(phrase)) {
                        console.log(`⚠️  Duplication found between ${section1.name} and ${section2.name}:`);
                        console.log(`   Phrase: "${phrase}"`);
                        duplicationsFound = true;
                        break;
                    }
                }
            }
        }
        
        if (!duplicationsFound) {
            console.log('✅ No content duplication detected');
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

testProperResumeExtraction();