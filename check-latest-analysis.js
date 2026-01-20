const http = require('http');

// Get the latest analysis to see what scores it has
const checkLatestAnalysis = (analysisId) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/resume/analysis/${analysisId}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const analysis = JSON.parse(data);
        console.log(`\n📊 ANALYSIS ID ${analysisId} SCORES:`);
        console.log('=====================================');
        console.log('📄 File:', analysis.uploadedFileName);
        console.log('🎯 Job Role:', analysis.jobRole);
        console.log('👤 Name:', analysis.sections?.contactInfo?.name);
        console.log('📧 Email:', analysis.sections?.contactInfo?.email);
        console.log('🛠️  Skills:', analysis.sections?.skills?.length, 'skills detected');
        console.log('\n📈 SCORES:');
        console.log('🎯 Overall Score:', analysis.overallScore + '%');
        console.log('📋 Structure:', analysis.scoreBreakdown?.structureScore + '%');
        console.log('🛠️  Skills:', analysis.scoreBreakdown?.skillsScore + '%');
        console.log('📝 Content:', analysis.scoreBreakdown?.contentScore + '%');
        console.log('🤖 ATS:', analysis.scoreBreakdown?.atsCompatibility + '%');
        console.log('\n🌐 View at: http://localhost:3001/analysis/' + analysisId);
        console.log('=====================================\n');
      } catch (e) {
        console.error(`❌ Analysis ${analysisId} not found or error:`, e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Error checking analysis ${analysisId}:`, e.message);
  });

  req.end();
};

console.log('🔍 Checking recent analyses...\n');

// Check the last few analyses
for (let i = 6; i >= 1; i--) {
  setTimeout(() => checkLatestAnalysis(i), (6-i) * 500);
}