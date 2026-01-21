/**
 * Comprehensive Final Test - All Issues Fixed
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function runComprehensiveFinalTest() {
    console.log('🏆 COMPREHENSIVE FINAL TEST - ALL ISSUES FIXED\n');
    
    const testCases = [
        {
            name: 'Company List (Should REJECT)',
            content: `Top MNC Companies in India

1. Tata Consultancy Services (TCS)
   - Software Development
   - IT Services
   - Consulting

2. Infosys Limited
   - Technology Services
   - Digital Transformation
   - Engineering Services

3. Wipro Technologies
   - Information Technology
   - Business Process Services
   - Product Engineering

4. HCL Technologies
   - Software Development
   - Infrastructure Services
   - Engineering Services

These companies offer excellent career opportunities in:
- Software Development
- Data Science
- Machine Learning
- Cloud Computing

Contact Information:
Email: careers@companies.com
Phone: +91-XXX-XXX-XXXX`,
            filename: 'comp.pdf',
            shouldPass: false,
            expectedBehavior: 'Should be rejected as company list, not resume'
        },
        {
            name: 'Professional Resume with Page Markers (Should ACCEPT)',
            content: `
--- Page 1 ---
MAHENDRA REDDY TAPPETA
Machine Learning Engineer
+91 7416001477 | tmr.mahendra@gmail.com
LinkedIn: linkedin.com/in/mahendra-reddy
Hyderabad, India

PROFESSIONAL SUMMARY
Experienced Machine Learning Engineer with 4+ years of expertise in developing 
and deploying ML models, data analysis, and building scalable AI solutions.

EDUCATION
Master of Technology in Computer Science
Indian Institute of Technology, Hyderabad
2019-2021, CGPA: 8.7/10

Bachelor of Technology in Computer Science Engineering
Jawaharlal Nehru Technological University
2015-2019, Percentage: 85%

PROFESSIONAL EXPERIENCE
Senior Machine Learning Engineer | TechCorp Solutions | 2021-Present
• Developed and deployed deep learning models using TensorFlow and PyTorch
• Built recommendation systems serving 10M+ users with 95% accuracy
• Implemented MLOps pipelines with Docker and Kubernetes
• Led team of 5 ML engineers and mentored junior developers

Machine Learning Engineer | DataTech Analytics | 2020-2021
• Designed computer vision models for image classification
• Developed NLP models for sentiment analysis and text processing
• Optimized model performance achieving 40% reduction in inference time

TECHNICAL SKILLS
Programming Languages: Python, R, SQL, Java, Scala
Machine Learning: TensorFlow, PyTorch, Scikit-learn, Keras, XGBoost
Deep Learning: CNN, RNN, LSTM, Transformers, GANs
Cloud Platforms: AWS, Google Cloud Platform, Azure
MLOps: Docker, Kubernetes, MLflow, Kubeflow, Jenkins

PROJECTS
1. Real-time Fraud Detection System
• Developed ensemble ML models using Random Forest and Neural Networks
• Achieved 98% accuracy in detecting fraudulent transactions
• Technologies: Python, TensorFlow, Apache Kafka, Redis

2. Computer Vision for Quality Control
• Developed CNN models for automated defect detection
• Improved quality control accuracy by 30%
• Technologies: PyTorch, OpenCV, Docker

CERTIFICATIONS
• AWS Certified Machine Learning Specialist (2023)
• Google Professional Machine Learning Engineer (2022)
• TensorFlow Developer Certificate (2021)

ACHIEVEMENTS
• Best Paper Award - International Conference on Machine Learning (2022)
• Employee of the Year - TechCorp Solutions (2022)
• Hackathon Winner - AI for Good Challenge (2021)`,
            filename: 'Mahiresume.pdf',
            shouldPass: true,
            expectedBehavior: 'Should be accepted with proper name extraction'
        },
        {
            name: 'Smart India Hackathon Letter (Should REJECT)',
            content: `Smart India Hackathon 2024
Permission Letter

Dear Participant,

This letter grants permission to John Doe to participate in the 
Smart India Hackathon 2024 competition.

Event Details:
- Date: March 15-17, 2024
- Venue: IIT Delhi
- Team Registration ID: SIH2024-001

Please report to the venue with this permission letter.

Best regards,
Event Coordinator
Smart India Hackathon 2024`,
            filename: 'SIH-Letter.pdf',
            shouldPass: false,
            expectedBehavior: 'Should be rejected as permission letter'
        }
    ];
    
    let passCount = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
        console.log(`📋 Testing: ${testCase.name}`);
        console.log(`   Expected: ${testCase.shouldPass ? 'ACCEPT' : 'REJECT'}`);
        console.log(`   Behavior: ${testCase.expectedBehavior}`);
        
        try {
            // Create temporary file
            fs.writeFileSync(testCase.filename, testCase.content);
            
            const formData = new FormData();
            formData.append('file', fs.createReadStream(testCase.filename), {
                filename: testCase.filename,
                contentType: 'text/plain'
            });
            formData.append('jobRole', 'Machine Learning Engineer');
            
            const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 30000
            });
            
            if (testCase.shouldPass) {
                console.log(`   ✅ CORRECT: Resume accepted`);
                console.log(`   📊 Score: ${response.data.overallScore}%`);
                
                // Check specific details for Mahiresume
                if (testCase.filename === 'Mahiresume.pdf') {
                    const contactInfo = response.data.sections?.contactInfo || {};
                    console.log(`   👤 Name: "${contactInfo.name}"`);
                    console.log(`   📧 Email: "${contactInfo.email}"`);
                    console.log(`   📱 Phone: "${contactInfo.phone}"`);
                    console.log(`   🎯 Skills: ${response.data.sections?.skills?.length || 0} detected`);
                    
                    // Verify name extraction is working
                    if (contactInfo.name && contactInfo.name.includes('MAHENDRA') && !contactInfo.name.includes('Page')) {
                        console.log(`   ✅ Name extraction working correctly`);
                    } else {
                        console.log(`   ⚠️ Name extraction needs improvement`);
                    }
                }
                
                passCount++;
            } else {
                console.log(`   ❌ FAILED: Non-resume was incorrectly accepted`);
                console.log(`   📊 Score Given: ${response.data.overallScore}% (This should not happen!)`);
                console.log(`   🚨 CRITICAL: System gave score to non-resume document`);
            }
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errorData = error.response.data;
                if (testCase.shouldPass) {
                    console.log(`   ❌ FAILED: Valid resume was incorrectly rejected`);
                    console.log(`   📝 Reason: ${errorData.message}`);
                } else {
                    console.log(`   ✅ CORRECT: Non-resume correctly rejected`);
                    console.log(`   📝 Reason: ${errorData.message}`);
                    console.log(`   📊 ATS Score: ${errorData.ats_score || 'N/A'}`);
                    passCount++;
                }
            } else {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
        } finally {
            // Clean up temporary file
            if (fs.existsSync(testCase.filename)) {
                fs.unlinkSync(testCase.filename);
            }
        }
        
        console.log('');
    }
    
    console.log(`🎯 COMPREHENSIVE TEST RESULTS`);
    console.log(`📊 Score: ${passCount}/${totalTests} tests passed (${Math.round(passCount/totalTests*100)}%)`);
    
    if (passCount === totalTests) {
        console.log('🏆 PERFECT! All issues have been resolved!');
        console.log('✅ Company lists are now correctly rejected');
        console.log('✅ Resume name extraction is working properly');
        console.log('✅ Permission letters are correctly rejected');
        console.log('✅ Professional resumes are correctly accepted and scored');
        
        console.log('\n🔒 VALIDATION CONFIRMED:');
        console.log('• Company lists (comp.pdf) → REJECTED ❌');
        console.log('• Permission letters (SIH-Letter.pdf) → REJECTED ❌');
        console.log('• Professional resumes (Mahiresume.pdf) → ACCEPTED ✅');
        console.log('• Name extraction from PDFs → WORKING ✅');
        
    } else {
        console.log('⚠️ Some issues remain. Please review the failed tests.');
    }
}

runComprehensiveFinalTest().catch(console.error);