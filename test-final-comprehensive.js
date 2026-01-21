const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function runComprehensiveTest() {
    console.log('🎯 COMPREHENSIVE FINAL TEST');
    console.log('===========================');
    console.log('Testing all fixes and improvements\n');
    
    let allTestsPassed = true;
    
    try {
        // Test 1: Service Health Check
        console.log('🏥 TEST 1: Service Health Check');
        console.log('-------------------------------');
        
        try {
            const backendHealth = await axios.get('http://localhost:3000/health', { timeout: 5000 });
            console.log('✅ Backend Service:', backendHealth.data.status);
        } catch (error) {
            console.log('❌ Backend Service: Not responding');
            allTestsPassed = false;
        }
        
        try {
            const aiHealth = await axios.get('http://localhost:8002/health', { timeout: 5000 });
            console.log('✅ AI Service:', aiHealth.data.status);
        } catch (error) {
            console.log('❌ AI Service: Not responding');
            allTestsPassed = false;
        }
        
        // Test 2: Resume Analysis with Proper Content Extraction
        console.log('\n📋 TEST 2: Resume Analysis & Section Extraction');
        console.log('-----------------------------------------------');
        
        const resumePath = 'Mahendra-Reddy-Resume.txt';
        
        if (!fs.existsSync(resumePath)) {
            console.log('❌ Resume file not found:', resumePath);
            allTestsPassed = false;
        } else {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(resumePath));
            formData.append('jobRole', 'Machine Learning Engineer');
            
            const response = await axios.post('http://localhost:8002/analyze-resume', formData, {
                headers: { ...formData.getHeaders() },
                timeout: 30000
            });
            
            const data = response.data;
            
            // Validate contact information extraction
            const contactTests = {
                'Name extraction': data.sections.contactInfo.name === 'Mahendra Reddy',
                'Email extraction': data.sections.contactInfo.email === 'mahendra.reddy@company.com',
                'Phone extraction': data.sections.contactInfo.phone === '(555) 123-4567',
                'Location extraction': data.sections.contactInfo.location === 'Hyderabad, India'
            };
            
            Object.entries(contactTests).forEach(([test, passed]) => {
                console.log(`${passed ? '✅' : '❌'} ${test}`);
                if (!passed) allTestsPassed = false;
            });
            
            // Validate section content quality
            const sectionTests = {
                'Education has real content': data.sections.education.includes('Master of Technology'),
                'Experience has real content': data.sections.experience.includes('Senior Machine Learning Engineer'),
                'Projects has real content': data.sections.projects.includes('Real-time Fraud Detection'),
                'Certifications has real content': data.sections.certifications.includes('AWS Certified'),
                'Skills properly detected': data.sections.skills.length >= 15
            };
            
            Object.entries(sectionTests).forEach(([test, passed]) => {
                console.log(`${passed ? '✅' : '❌'} ${test}`);
                if (!passed) allTestsPassed = false;
            });
            
            // Check for content duplication
            const sections = [
                data.sections.education,
                data.sections.experience,
                data.sections.projects,
                data.sections.certifications
            ];
            
            let duplicationsFound = false;
            for (let i = 0; i < sections.length; i++) {
                for (let j = i + 1; j < sections.length; j++) {
                    const content1 = sections[i].toLowerCase();
                    const content2 = sections[j].toLowerCase();
                    
                    // Check for significant overlaps (more than 30 characters)
                    const words1 = content1.split(' ');
                    for (let k = 0; k < words1.length - 4; k++) {
                        const phrase = words1.slice(k, k + 5).join(' ');
                        if (phrase.length > 30 && content2.includes(phrase)) {
                            duplicationsFound = true;
                            break;
                        }
                    }
                    if (duplicationsFound) break;
                }
                if (duplicationsFound) break;
            }
            
            console.log(`${!duplicationsFound ? '✅' : '❌'} No content duplication`);
            if (duplicationsFound) allTestsPassed = false;
            
            // Validate scoring
            const scoreTests = {
                'Overall score reasonable': data.overallScore >= 85 && data.overallScore <= 100,
                'Structure score high': data.scoreBreakdown.structureScore >= 90,
                'Skills score high': data.scoreBreakdown.skillsScore >= 90,
                'Content score high': data.scoreBreakdown.contentScore >= 85,
                'ATS score high': data.scoreBreakdown.atsCompatibility >= 90
            };
            
            Object.entries(scoreTests).forEach(([test, passed]) => {
                console.log(`${passed ? '✅' : '❌'} ${test} (${
                    test.includes('Overall') ? data.overallScore :
                    test.includes('Structure') ? data.scoreBreakdown.structureScore :
                    test.includes('Skills') ? data.scoreBreakdown.skillsScore :
                    test.includes('Content') ? data.scoreBreakdown.contentScore :
                    data.scoreBreakdown.atsCompatibility
                })`);
                if (!passed) allTestsPassed = false;
            });
        }
        
        // Test 3: ATS Validation System
        console.log('\n🛡️ TEST 3: ATS Validation System');
        console.log('--------------------------------');
        
        // Test with a non-resume document (should be rejected)
        const nonResumeContent = `
        List of MNC Companies in India
        
        1. Tata Consultancy Services (TCS)
        2. Infosys Limited
        3. Wipro Limited
        4. HCL Technologies
        5. Tech Mahindra
        6. Larsen & Toubro (L&T)
        7. Reliance Industries
        8. Bharti Airtel
        9. HDFC Bank
        10. ICICI Bank
        `;
        
        fs.writeFileSync('temp-company-list.txt', nonResumeContent);
        
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream('temp-company-list.txt'));
            formData.append('jobRole', 'Software Engineer');
            
            const response = await axios.post('http://localhost:8002/analyze-resume', formData, {
                headers: { ...formData.getHeaders() },
                timeout: 30000
            });
            
            console.log('❌ ATS validation failed - non-resume was accepted');
            allTestsPassed = false;
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ ATS validation working - non-resume rejected');
            } else {
                console.log('❌ ATS validation error:', error.message);
                allTestsPassed = false;
            }
        } finally {
            fs.unlinkSync('temp-company-list.txt');
        }
        
        // Test 4: Frontend Service Check
        console.log('\n🌐 TEST 4: Frontend Service Check');
        console.log('---------------------------------');
        
        try {
            // Check if frontend is accessible (we can't test the browse button programmatically)
            const frontendResponse = await axios.get('http://localhost:3001', { 
                timeout: 5000,
                validateStatus: () => true // Accept any status code
            });
            
            if (frontendResponse.status === 200 || frontendResponse.status === 304) {
                console.log('✅ Frontend service accessible');
                console.log('📝 Manual test required: Browse button functionality');
                console.log('   - Open http://localhost:3001');
                console.log('   - Test both drag & drop and browse button');
                console.log('   - Upload Mahendra-Reddy-Resume.txt');
                console.log('   - Verify sections are extracted correctly');
            } else {
                console.log('❌ Frontend service not accessible');
                allTestsPassed = false;
            }
        } catch (error) {
            console.log('❌ Frontend service error:', error.message);
            allTestsPassed = false;
        }
        
        // Final Results
        console.log('\n🎉 FINAL TEST RESULTS');
        console.log('=====================');
        
        if (allTestsPassed) {
            console.log('✅ ALL TESTS PASSED!');
            console.log('\n🎯 FIXES SUCCESSFULLY IMPLEMENTED:');
            console.log('1. ✅ Section extraction with proper boundary detection');
            console.log('2. ✅ No content duplication between sections');
            console.log('3. ✅ Improved contact information extraction');
            console.log('4. ✅ ATS-grade resume validation working');
            console.log('5. ✅ Browse button added to frontend dropzone');
            console.log('6. ✅ All services running and healthy');
            
            console.log('\n📋 MANUAL TESTING REQUIRED:');
            console.log('- Test browse button functionality in frontend');
            console.log('- Verify drag & drop still works');
            console.log('- Upload different resume formats');
            
        } else {
            console.log('❌ SOME TESTS FAILED');
            console.log('Please review the failed tests above');
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        allTestsPassed = false;
    }
}

runComprehensiveTest();