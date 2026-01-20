const http = require('http');

// Test frontend accessibility
const testFrontend = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Frontend Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Frontend Response Length:', data.length);
      if (data.includes('<title>')) {
        console.log('✅ Frontend is serving HTML content');
      } else {
        console.log('❌ Frontend response does not contain HTML');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Frontend Error: ${e.message}`);
  });

  req.end();
};

// Test backend API
const testBackend = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/analysis/1',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Backend Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const analysis = JSON.parse(data);
        console.log('✅ Backend Analysis Data:');
        console.log('- Skills Count:', analysis.sections?.skills?.length || 0);
        console.log('- Enhancements Count:', analysis.enhancedBullets?.length || 0);
        console.log('- Issues Count:', analysis.issues?.length || 0);
        console.log('- Has Contact Info:', !!analysis.sections?.contactInfo);
        console.log('- Has Education:', !!analysis.sections?.education);
        console.log('- Has Experience:', !!analysis.sections?.experience);
        console.log('- Has Projects:', !!analysis.sections?.projects);
        console.log('- Has Certifications:', !!analysis.sections?.certifications);
      } catch (e) {
        console.error('❌ Backend response is not valid JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Backend Error: ${e.message}`);
  });

  req.end();
};

console.log('Testing Smart CV Analyzer Services...\n');
testFrontend();
setTimeout(testBackend, 1000);