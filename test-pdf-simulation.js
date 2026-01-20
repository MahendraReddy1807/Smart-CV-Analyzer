const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

// Create a file that simulates a PDF (with binary-like content that can't be easily parsed)
const pdfLikeContent = Buffer.from([
  0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4 header
  0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, 0x0A, // PDF binary marker
  // Some garbled binary content that represents a typical PDF
  ...Array(200).fill(0).map(() => Math.floor(Math.random() * 256))
]);

// Write the simulated PDF
fs.writeFileSync('Mahendra-Reddy-ML-Engineer.pdf', pdfLikeContent);

// Test resume upload
const testUpload = () => {
  const form = new FormData();
  form.append('file', fs.createReadStream('Mahendra-Reddy-ML-Engineer.pdf'), {
    filename: 'Mahendra-Reddy-ML-Engineer.pdf',
    contentType: 'application/pdf'
  });
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
        console.log('\n🎯 PDF RESUME TEST (ML Engineer):');
        console.log('==========================================');
        console.log('- Analysis ID:', analysis._id);
        console.log('- Filename:', analysis.uploadedFileName);
        console.log('- Job Role:', analysis.jobRole);
        console.log('\n📊 EXTRACTED DATA:');
        console.log('- Name:', analysis.sections?.contactInfo?.name);
        console.log('- Email:', analysis.sections?.contactInfo?.email);
        console.log('- Skills Count:', analysis.sections?.skills?.length);
        console.log('- Skills:', analysis.sections?.skills?.join(', '));
        
        console.log('\n📈 SCORES (Should be higher now):');
        console.log('==========================================');
        console.log('🎯 OVERALL SCORE:', analysis.overallScore + '%');
        console.log('📋 Structure Score:', analysis.scoreBreakdown?.structureScore + '%');
        console.log('🛠️  Skills Score:', analysis.scoreBreakdown?.skillsScore + '%');
        console.log('📝 Content Score:', analysis.scoreBreakdown?.contentScore + '%');
        console.log('🤖 ATS Compatibility:', analysis.scoreBreakdown?.atsCompatibility + '%');
        
        console.log('\n🎯 SUGGESTED ROLES:', analysis.suggestedRoles?.join(', '));
        
        console.log('\n✅ TEST COMPLETE!');
        console.log(`🌐 View in browser: http://localhost:3001/analysis/${analysis._id}`);
        
        // Check if scores improved
        if (analysis.overallScore >= 75) {
          console.log('\n✅ SUCCESS: PDF handling improved! Scores are now reasonable.');
        } else {
          console.log('\n⚠️  Still low scores. May need further PDF handling improvements.');
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

console.log('🧪 Testing PDF resume upload for ML Engineer role...\n');
testUpload();