/**
 * Test improved name extraction
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testNameExtraction() {
    console.log('🔍 Testing Improved Name Extraction...\n');
    
    // Test with a resume that has page markers (similar to PDF extraction)
    const resumeWithPageMarkers = `
--- Page 1 ---
MAHENDRA REDDY TAPPETA
Machine Learning Engineer
+91 7416001477 | tmr.mahendra@gmail.com
LinkedIn: linkedin.com/in/mahendra-reddy

PROFESSIONAL SUMMARY
Experienced Machine Learning Engineer with 4+ years of expertise.

EDUCATION
Master of Technology in Computer Science
Indian Institute of Technology, Hyderabad
2019-2021, CGPA: 8.7/10

EXPERIENCE
Senior ML Engineer | TechCorp Solutions | 2021-Present
• Developed deep learning models using TensorFlow and PyTorch
• Built recommendation systems serving 10M+ users

TECHNICAL SKILLS
Programming: Python, R, SQL, Java
ML Frameworks: TensorFlow, PyTorch, Scikit-learn
Cloud: AWS, Google Cloud Platform, Azure

PROJECTS
Real-time Fraud Detection System
• Achieved 98% accuracy in detecting fraudulent transactions
• Technologies: Python, TensorFlow, Apache Kafka`;

    fs.writeFileSync('test-mahendra-resume.txt', resumeWithPageMarkers);
    
    try {
        console.log('📋 Testing name extraction from resume with page markers...');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream('test-mahendra-resume.txt'), {
            filename: 'Mahiresume.pdf',
            contentType: 'text/plain'
        });
        formData.append('jobRole', 'Machine Learning Engineer');
        
        const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });
        
        console.log('✅ Resume processed successfully');
        console.log(`   📊 Score: ${response.data.overallScore}%`);
        console.log(`   👤 Extracted Name: "${response.data.sections?.contactInfo?.name}"`);
        console.log(`   📧 Email: "${response.data.sections?.contactInfo?.email}"`);
        console.log(`   📱 Phone: "${response.data.sections?.contactInfo?.phone}"`);
        console.log(`   📍 Location: "${response.data.sections?.contactInfo?.location}"`);
        console.log(`   🎯 Skills: ${response.data.sections?.skills?.length || 0} detected`);
        
        // Check if name extraction improved
        const extractedName = response.data.sections?.contactInfo?.name;
        if (extractedName && extractedName.includes('MAHENDRA') && !extractedName.includes('Page')) {
            console.log('✅ Name extraction IMPROVED - correctly extracted full name');
        } else {
            console.log('❌ Name extraction still has issues');
            console.log(`   Expected: "MAHENDRA REDDY TAPPETA"`);
            console.log(`   Got: "${extractedName}"`);
        }
        
    } catch (error) {
        console.log('❌ Error processing resume');
        console.log(`   Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data.message}`);
        }
    } finally {
        if (fs.existsSync('test-mahendra-resume.txt')) {
            fs.unlinkSync('test-mahendra-resume.txt');
        }
    }
}

testNameExtraction().catch(console.error);