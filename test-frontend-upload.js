// Simple JavaScript test to verify upload functionality
// Run this in browser console at http://localhost:3000

console.log('🔧 Testing Frontend Upload Functionality');

// Test 1: Check if fetch works
async function testFetch() {
    try {
        console.log('📡 Testing fetch to backend...');
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        console.log('✅ Backend fetch successful:', data);
        return true;
    } catch (error) {
        console.error('❌ Backend fetch failed:', error);
        return false;
    }
}

// Test 2: Test file upload
async function testUpload() {
    try {
        console.log('📤 Testing file upload...');
        
        // Create a test file
        const testContent = 'Test resume content for upload';
        const testFile = new File([testContent], 'test-resume.txt', { type: 'text/plain' });
        
        // Create form data
        const formData = new FormData();
        formData.append('file', testFile);
        formData.append('jobRole', 'Software Engineer');
        
        console.log('📋 Form data created:', {
            file: testFile.name,
            size: testFile.size,
            type: testFile.type
        });
        
        // Send upload request
        const response = await fetch('http://localhost:5000/api/resume/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Upload successful:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Upload failed:', error);
        return null;
    }
}

// Test 3: Check CORS
async function testCORS() {
    try {
        console.log('🌐 Testing CORS...');
        const response = await fetch('http://localhost:5000/api/health', {
            method: 'OPTIONS',
            headers: {
                'Origin': window.location.origin,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        console.log('✅ CORS preflight successful:', response.status);
        return true;
    } catch (error) {
        console.error('❌ CORS preflight failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive upload tests...');
    console.log('Current URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    
    const results = {
        fetch: await testFetch(),
        cors: await testCORS(),
        upload: await testUpload()
    };
    
    console.log('📊 Test Results:', results);
    
    if (results.fetch && results.cors && results.upload) {
        console.log('🎉 All tests passed! Upload should work.');
    } else {
        console.log('⚠️ Some tests failed. Check the errors above.');
    }
    
    return results;
}

// Auto-run tests
runAllTests();

// Export functions for manual testing
window.uploadTests = {
    testFetch,
    testUpload,
    testCORS,
    runAllTests
};

console.log('💡 You can run individual tests by calling:');
console.log('   uploadTests.testFetch()');
console.log('   uploadTests.testUpload()');
console.log('   uploadTests.testCORS()');
console.log('   uploadTests.runAllTests()');