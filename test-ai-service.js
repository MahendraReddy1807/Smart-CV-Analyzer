const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Test AI service directly
const testAIService = () => {
  const form = new FormData();
  
  // Check if the actual PDF resume exists, otherwise skip test
  if (fs.existsSync('Mahendra-Reddy-ML-Engineer.pdf')) {
    form.append('file', fs.createReadStream('Mahendra-Reddy-ML-Engineer.pdf'));
  } else {
    console.log('❌ No test resume file found. Please ensure Mahendra-Reddy-ML-Engineer.pdf exists.');
    return;
  }
  
  form.append('jobRole', 'Frontend Developer');

  const options = {
    hostname: 'localhost',
    port: 8002,
    path: '/analyze-resume',
    method: 'POST',
    headers: form.getHeaders()
  };

  const req = http.request(options, (res) => {
    console.log(`AI Service Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const analysis = JSON.parse(data);
        console.log('\n✅ AI Service Response:');
        console.log('- Parsed Text Length:', analysis.parsedText?.length || 0);
        console.log('- Parsed Text Preview:', analysis.parsedText?.substring(0, 100) + '...');
        console.log('- Name:', analysis.sections?.contactInfo?.name);
        console.log('- Email:', analysis.sections?.contactInfo?.email);
        console.log('- Phone:', analysis.sections?.contactInfo?.phone);
        console.log('- Location:', analysis.sections?.contactInfo?.location);
        console.log('- Skills:', analysis.sections?.skills);
        console.log('- Education:', analysis.sections?.education);
        console.log('- Experience:', analysis.sections?.experience);
      } catch (e) {
        console.error('❌ Failed to parse AI service response:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`AI Service Error: ${e.message}`);
  });

  form.pipe(req);
};

console.log('Testing AI service directly...\n');
testAIService();