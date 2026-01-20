const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Test resume upload for ML Engineer
const testUpload = () => {
  const form = new FormData();
  form.append('file', fs.createReadStream('simple-pdf-test.txt'));
  form.append('jobRole', 'ML Engineer');

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
        console.log('\n🎯 ML ENGINEER RESUME TEST:');
        console.log('==========================================');
        console.log('- Analysis ID:', analysis._id);
        console.log('- Filename:', analysis.uploadedFileName);
        console.log('- Job Role:', analysis.jobRole);
        console.log('\n📊 EXTRACTED DATA:');
        console.log('- Name:', analysis.sections?.contactInfo?.name);
        console.log('- Email:', analysis.sections?.contactInfo?.email);
        console.log('- Phone:', analysis.sections?.contactInfo?.phone);
        console.log('- Location:', analysis.sections?.contactInfo?.location);
        console.log('- Skills Count:', analysis.sections?.skills?.length);
        console.log('- Skills:', analysis.sections?.skills?.slice(0, 10).join(', ') + '...');
        
        console.log('\n📈 SCORES:');
        console.log('==========================================');
        console.log('🎯 OVERALL SCORE:', analysis.overallScore + '%');
        console.log('📋 Structure Score:', analysis.scoreBreakdown?.structureScore + '%');
        console.log('🛠️  Skills Score:', analysis.scoreBreakdown?.skillsScore + '%');
        console.log('📝 Content Score:', analysis.scoreBreakdown?.contentScore + '%');
        console.log('🤖 ATS Compatibility:', analysis.scoreBreakdown?.atsCompatibility + '%');
        
        console.log('\n🎯 SUGGESTED ROLES:', analysis.suggestedRoles?.join(', '));
        
        console.log('\n✅ TEST COMPLETE!');
        console.log(`🌐 View in browser: http://localhost:3001/analysis/${analysis._id}`);
        
        // Provide guidance
        console.log('\n💡 GUIDANCE:');
        if (analysis.overallScore >= 85) {
          console.log('✅ Excellent scores! This resume should get high ratings.');
        } else if (analysis.overallScore >= 75) {
          console.log('✅ Good scores! This is a solid resume.');
        } else {
          console.log('⚠️  Lower scores may indicate the resume needs improvement or the file format is not being parsed correctly.');
        }
        
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

console.log('🧪 Testing ML Engineer resume with comprehensive skills...\n');
testUpload();