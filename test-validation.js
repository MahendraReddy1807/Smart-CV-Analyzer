const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Test 1: Upload non-resume content (should be rejected)
const testNonResume = () => {
  console.log('🧪 TEST 1: Uploading non-resume content (should be REJECTED)...\n');
  
  const form = new FormData();
  form.append('file', fs.createReadStream('test-congratulations.txt'));
  form.append('jobRole', 'Software Engineer');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/upload',
    method: 'POST',
    headers: form.getHeaders()
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 400) {
          console.log('✅ SUCCESS: Non-resume content was properly REJECTED!');
          console.log('📋 Error Message:', response.message);
          console.log('📋 Details:', response.details);
          console.log('💡 Suggestions:', response.suggestions?.join(', '));
        } else {
          console.log('❌ FAILED: Non-resume content was accepted (should be rejected)');
          console.log('📊 Got analysis with score:', response.overallScore);
        }
      } catch (e) {
        console.error('❌ Error parsing response:', e.message);
        console.log('Raw response:', data);
      }
      
      // Run test 2 after a delay
      setTimeout(testValidResume, 2000);
    });
  });

  req.on('error', (e) => {
    console.error(`Upload Error: ${e.message}`);
  });

  form.pipe(req);
};

// Test 2: Upload valid resume content (should be accepted)
const testValidResume = () => {
  console.log('\n🧪 TEST 2: Uploading valid resume content (should be ACCEPTED)...\n');
  
  const form = new FormData();
  form.append('file', fs.createReadStream('test-resume.txt'));
  form.append('jobRole', 'Frontend Developer');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/upload',
    method: 'POST',
    headers: form.getHeaders()
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: Valid resume was properly ACCEPTED!');
          console.log('📊 Analysis ID:', response._id);
          console.log('📊 Overall Score:', response.overallScore + '%');
          console.log('👤 Name:', response.sections?.contactInfo?.name);
          console.log('🛠️  Skills:', response.sections?.skills?.length, 'detected');
        } else {
          console.log('❌ FAILED: Valid resume was rejected');
          console.log('📋 Error:', response.message);
        }
      } catch (e) {
        console.error('❌ Error parsing response:', e.message);
        console.log('Raw response:', data);
      }
      
      console.log('\n🎯 VALIDATION TEST COMPLETE!');
      console.log('==========================================');
    });
  });

  req.on('error', (e) => {
    console.error(`Upload Error: ${e.message}`);
  });

  form.pipe(req);
};

console.log('🔍 RESUME VALIDATION TEST');
console.log('==========================================');
testNonResume();