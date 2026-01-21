/**
 * Test detailed information extraction (education, experience, projects, certifications)
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testDetailedExtraction() {
    console.log('🔍 Testing Detailed Information Extraction...\n');
    
    // Create a comprehensive resume with clear sections
    const comprehensiveResume = `MAHENDRA REDDY TAPPETA
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

Data Science Intern | AI Innovations Lab | Summer 2020
• Conducted exploratory data analysis on large datasets
• Built predictive models for customer churn prediction

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
• Processed 1M+ transactions daily with sub-100ms latency
• Technologies: Python, TensorFlow, Apache Kafka, Redis

2. Computer Vision for Quality Control
• Developed CNN models for automated defect detection in manufacturing
• Improved quality control accuracy by 30%
• Deployed on edge devices for real-time processing
• Technologies: PyTorch, OpenCV, Docker, Raspberry Pi

3. Intelligent Chatbot for Customer Support
• Built NLP-based chatbot using BERT and transformer models
• Reduced customer support tickets by 45%
• Integrated with existing CRM systems
• Technologies: Python, Transformers, Flask, MongoDB

CERTIFICATIONS
• AWS Certified Machine Learning Specialist (2023)
• Google Professional Machine Learning Engineer (2022)
• TensorFlow Developer Certificate (2021)
• Microsoft Azure AI Engineer Associate (2021)

ACHIEVEMENTS
• Best Paper Award - International Conference on Machine Learning (2022)
• Employee of the Year - TechCorp Solutions (2022)
• Hackathon Winner - AI for Good Challenge (2021)
• Published 3 research papers in top-tier ML conferences`;

    fs.writeFileSync('comprehensive-resume-test.txt', comprehensiveResume);
    
    try {
        console.log('📋 Testing comprehensive resume with detailed sections...');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream('comprehensive-resume-test.txt'), {
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
        console.log(`📊 Overall Score: ${response.data.overallScore}%`);
        
        const sections = response.data.sections || {};
        
        // Test Contact Information
        console.log('\n👤 CONTACT INFORMATION:');
        console.log(`   Name: "${sections.contactInfo?.name}"`);
        console.log(`   Email: "${sections.contactInfo?.email}"`);
        console.log(`   Phone: "${sections.contactInfo?.phone}"`);
        console.log(`   Location: "${sections.contactInfo?.location}"`);
        
        // Test Education Extraction
        console.log('\n🎓 EDUCATION:');
        const education = sections.education;
        if (education && education !== "Education details would be extracted here") {
            console.log('✅ Education extracted successfully:');
            console.log(`   ${education.substring(0, 200)}${education.length > 200 ? '...' : ''}`);
        } else {
            console.log('❌ Education extraction failed - showing placeholder');
        }
        
        // Test Experience Extraction
        console.log('\n💼 EXPERIENCE:');
        const experience = sections.experience;
        if (experience && experience !== "Experience details would be extracted here") {
            console.log('✅ Experience extracted successfully:');
            console.log(`   ${experience.substring(0, 200)}${experience.length > 200 ? '...' : ''}`);
        } else {
            console.log('❌ Experience extraction failed - showing placeholder');
        }
        
        // Test Projects Extraction
        console.log('\n🚀 PROJECTS:');
        const projects = sections.projects;
        if (projects && projects !== "Project details would be extracted here") {
            console.log('✅ Projects extracted successfully:');
            console.log(`   ${projects.substring(0, 200)}${projects.length > 200 ? '...' : ''}`);
        } else {
            console.log('❌ Projects extraction failed - showing placeholder');
        }
        
        // Test Certifications Extraction
        console.log('\n🏆 CERTIFICATIONS:');
        const certifications = sections.certifications;
        if (certifications && certifications !== "Certifications would be extracted here") {
            console.log('✅ Certifications extracted successfully:');
            console.log(`   ${certifications.substring(0, 200)}${certifications.length > 200 ? '...' : ''}`);
        } else {
            console.log('❌ Certifications extraction failed - showing placeholder');
        }
        
        // Test Skills
        console.log('\n🛠️ SKILLS:');
        const skills = sections.skills || [];
        console.log(`   Detected ${skills.length} skills: ${skills.slice(0, 10).join(', ')}${skills.length > 10 ? '...' : ''}`);
        
        // Summary
        const extractionResults = {
            education: education !== "Education details would be extracted here",
            experience: experience !== "Experience details would be extracted here", 
            projects: projects !== "Project details would be extracted here",
            certifications: certifications !== "Certifications would be extracted here"
        };
        
        const successCount = Object.values(extractionResults).filter(Boolean).length;
        console.log(`\n📊 EXTRACTION SUMMARY: ${successCount}/4 sections extracted successfully`);
        
        if (successCount === 4) {
            console.log('🎉 ALL SECTIONS EXTRACTED SUCCESSFULLY!');
        } else {
            console.log('⚠️ Some sections still showing placeholders');
            Object.entries(extractionResults).forEach(([section, success]) => {
                console.log(`   ${section}: ${success ? '✅' : '❌'}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Error processing resume');
        console.log(`   Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data.message}`);
        }
    } finally {
        if (fs.existsSync('comprehensive-resume-test.txt')) {
            fs.unlinkSync('comprehensive-resume-test.txt');
        }
    }
}

testDetailedExtraction().catch(console.error);