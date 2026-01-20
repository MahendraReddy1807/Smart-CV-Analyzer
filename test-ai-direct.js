const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Test AI service directly with non-resume content
const testAIDirect = () => {
  const form = new FormData();
  form.append('file', fs.createReadStream('test-congratulations.txt'));
  form.append('jobRole', 'Software Engineer');

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
      console.log('AI Service Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`AI Service Error: ${e.message}`);
  });

  form.pipe(req);
};

console.log('Testing AI service directly with non-resume content...\n');
testAIDirect();