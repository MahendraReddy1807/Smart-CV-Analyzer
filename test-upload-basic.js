const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Test resume upload with basic/poor quality resume
const testUpload = () => {
  const form = new FormData();
  form.append('file', fs.createReadStream('test-resume-basic.txt'));
  form.append('jobRole', 'Software Developer');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/upload',
    method: 'POST',
    headers: form.getHeaders()
  };

  const req = http.request(options, (res) => {
    console.log(`Upload Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const analysis = JSON.parse(data);
        console.log('\n✅ Resume Analysis Results (Basic Resume):');
        console.log('- Analysis ID:', analysis._id);
        console.log('- Filename:', analysis.uploadedFileName);
        console.log('- Job Role:', analysis.jobRole);
        console.log('\n📊 Extracted Data:');
        console.log('- Name:', analysis.sections?.contactInfo?.name);
        console.log('- Email:', analysis.sections?.contactInfo?.email);
        console.log('- Phone:', analysis.sections?.contactInfo?.phone);
        console.log('- Location:', analysis.sections?.contactInfo?.location);
        console.log('- Skills Count:', analysis.sections?.skills?.length);
        console.log('- Skills:', analysis.sections?.skills?.join(', '));
        console.log('- Education:', analysis.sections?.education);
        console.log('- Experience:', analysis.sections?.experience);
        console.log('\n📈 Scores:');
        console.log('- Overall Score:', analysis.overallScore);
        console.log('- Skills Score:', analysis.scoreBreakdown?.skillsScore);
        console.log('- Structure Score:', analysis.scoreBreakdown?.structureScore);
        console.log('- Content Score:', analysis.scoreBreakdown?.contentScore);
        console.log('- ATS Score:', analysis.scoreBreakdown?.atsCompatibility);
        
        console.log('\n🎯 Suggested Roles:', analysis.suggestedRoles?.join(', '));
        
        console.log('\n✅ Test completed successfully!');
        console.log(`\nView results at: http://localhost:3001/analysis/${analysis._id}`);
      } catch (e) {
        console.error('❌ Failed to parse response:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Upload Error: ${e.message}`);
  });

  form.pipe(req);
};

console.log('Testing resume upload with basic/poor quality resume...\n');
testUpload();