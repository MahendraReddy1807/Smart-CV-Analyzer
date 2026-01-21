/**
 * Test why company list is getting resume score
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testCompanyListIssue() {
    console.log('🔍 Testing Company List Issue...\n');
    
    // Create a sample company list that might be similar to comp.pdf
    const companyListContent = `Top MNC Companies in India

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

5. Tech Mahindra
   - Digital Solutions
   - Network Services
   - Software Engineering

6. Accenture India
   - Consulting Services
   - Technology Solutions
   - Digital Services

7. IBM India
   - Cloud Computing
   - Artificial Intelligence
   - Data Analytics

8. Microsoft India
   - Software Products
   - Cloud Services
   - Technology Solutions

9. Google India
   - Search Technology
   - Cloud Platform
   - Machine Learning

10. Amazon India
    - E-commerce Platform
    - Cloud Services (AWS)
    - Technology Innovation

These companies offer excellent career opportunities in:
- Software Development
- Data Science
- Machine Learning
- Cloud Computing
- Digital Transformation
- Engineering Services
- Technology Consulting

Contact Information:
For more details, visit company websites or career portals.
Email: careers@companies.com
Phone: +91-XXX-XXX-XXXX`;

    fs.writeFileSync('comp-test.txt', companyListContent);
    
    try {
        console.log('📋 Testing company list content...');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream('comp-test.txt'), {
            filename: 'comp.pdf',
            contentType: 'text/plain'
        });
        formData.append('jobRole', 'Machine Learning Engineer');
        
        const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });
        
        console.log('❌ CRITICAL ISSUE: Company list was accepted as resume!');
        console.log(`   📊 Score: ${response.data.overallScore}%`);
        console.log(`   📋 Sections: ${Object.keys(response.data.sections || {}).length}`);
        console.log(`   📝 Detected Sections: ${JSON.stringify(response.data.sections?.contactInfo || {}, null, 2)}`);
        
        // This should NOT happen - company lists should be rejected
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ CORRECT: Company list correctly rejected');
            console.log(`   📝 Reason: ${error.response.data.message}`);
            console.log(`   📊 ATS Score: ${error.response.data.ats_score || 'N/A'}`);
        } else {
            console.log('❌ Unexpected error');
            console.log(`   Error: ${error.message}`);
        }
    } finally {
        if (fs.existsSync('comp-test.txt')) {
            fs.unlinkSync('comp-test.txt');
        }
    }
}

testCompanyListIssue().catch(console.error);