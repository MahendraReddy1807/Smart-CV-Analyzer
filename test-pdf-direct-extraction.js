const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testPDFDirectExtraction() {
    console.log('🔍 Testing PDF Direct Extraction');
    console.log('================================');
    
    try {
        // Test with a simple text file first to see if the service works
        console.log('📝 Testing with text resume first...');
        
        const textResume = `MAHENDRA REDDY TAPPETA
Email: mahendra.reddy@example.com
Phone: 7416001477
Location: Mandya, Karnataka

EDUCATION
PES College of Engineering, Mandya
B.E. in Computer Science Engineering (AI & ML)
Sep 2023 - Sep 2027
CGPA: 7.91

Narayana Junior College, Kadapa
Pre-University [MPC]
July 2021 - April 2023
Percentage: 88.40%

EXPERIENCE
AIML Virtual Internship – AICTE & Eduskills (supported by Google)
July 2024 – Sept 2024
• Applied Python libraries such as Pandas, Scikit-learn, and NumPy in project tasks
• Completed a Google-supported virtual internship and developed a cricket analytics system

PROJECTS
Indian Cricket Player Performance Analysis
Apr 2025 – Jun 2025
• Scraped player statistics from Cricbuzz for formats like ODI, T20, and IPL
• Performed Exploratory Data Analysis (EDA) and visualized insights using Power BI
• Tools: Python, BeautifulSoup, Pandas, Power BI

SKILLS
Python, C++, SQL, MySQL, Git, Machine Learning, Data Science, AI, Pandas, NumPy, Go, Power BI, Excel

CERTIFICATIONS
AIML Virtual Internship – AICTE & Eduskills (supported by Google)
July 2024 – Sept 2024`;

        // Write to temporary file
        fs.writeFileSync('temp-resume.txt', textResume);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream('temp-resume.txt'));
        formData.append('jobRole', 'Machine Learning Engineer');
        
        console.log('🚀 Sending text resume to AI service...');
        
        const response = await axios.post('http://localhost:8002/analyze-resume', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });
        
        console.log('✅ Text resume response received');
        const data = response.data;
        
        console.log('\n📋 TEXT RESUME EXTRACTION RESULTS:');
        console.log('==================================');
        
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
        
        // Clean up
        fs.unlinkSync('temp-resume.txt');
        
        console.log('\n🎉 Text resume test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testPDFDirectExtraction();