import React, { useState } from 'react';
import { resumeAPI, handleAPIError } from '../utils/api';

const DebugUpload = () => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testBackendHealth = async () => {
    try {
      addLog('Testing backend health...', 'info');
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      addLog(`✅ Backend health: ${data.message}`, 'success');
    } catch (error) {
      addLog(`❌ Backend health failed: ${error.message}`, 'error');
    }
  };

  const testAIHealth = async () => {
    try {
      addLog('Testing AI service health...', 'info');
      const response = await fetch('http://localhost:8002/health');
      const data = await response.json();
      addLog(`✅ AI service health: ${data.message}`, 'success');
    } catch (error) {
      addLog(`❌ AI service health failed: ${error.message}`, 'error');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      addLog('❌ No file selected', 'error');
      return;
    }

    if (!jobRole.trim()) {
      addLog('❌ No job role specified', 'error');
      return;
    }

    setIsUploading(true);
    setResult(null);
    
    try {
      addLog('🚀 Starting upload process...', 'info');
      addLog(`📁 File: ${file.name} (${file.size} bytes, ${file.type})`, 'info');
      addLog(`💼 Job Role: ${jobRole}`, 'info');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobRole', jobRole.trim());

      addLog('📤 Sending request to backend...', 'info');
      
      const response = await resumeAPI.uploadResume(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        addLog(`📊 Upload progress: ${progress}%`, 'info');
      });

      addLog('✅ Upload completed successfully!', 'success');
      addLog(`📋 Response ID: ${response.data._id}`, 'success');
      
      setResult(response.data);

    } catch (error) {
      addLog(`❌ Upload failed: ${error.message}`, 'error');
      addLog(`🔍 Error details: ${JSON.stringify(error.response?.data || error, null, 2)}`, 'error');
      
      if (error.code === 'ECONNREFUSED') {
        addLog('🔧 Connection refused - backend might not be running', 'error');
      } else if (error.code === 'ECONNABORTED') {
        addLog('⏰ Request timeout - backend might be slow', 'error');
      } else if (error.response?.status === 0) {
        addLog('🚫 CORS error - check browser console for details', 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResult(null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Debug Upload Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Health Checks</h3>
        <button onClick={testBackendHealth} style={{ margin: '5px', padding: '10px' }}>
          Test Backend Health
        </button>
        <button onClick={testAIHealth} style={{ margin: '5px', padding: '10px' }}>
          Test AI Service Health
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>File Upload</h3>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf"
          style={{ margin: '5px', padding: '10px' }}
        />
        <br />
        <input
          type="text"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="Job Role"
          style={{ margin: '5px', padding: '10px', width: '200px' }}
        />
        <br />
        <button 
          onClick={handleUpload} 
          disabled={isUploading}
          style={{ margin: '5px', padding: '10px', backgroundColor: isUploading ? '#ccc' : '#007bff', color: 'white', border: 'none' }}
        >
          {isUploading ? 'Uploading...' : 'Upload & Analyze'}
        </button>
        <button onClick={clearLogs} style={{ margin: '5px', padding: '10px' }}>
          Clear Logs
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Logs</h3>
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '10px', 
          height: '300px', 
          overflowY: 'scroll', 
          backgroundColor: '#f8f9fa',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ 
              color: log.type === 'error' ? 'red' : log.type === 'success' ? 'green' : 'black',
              marginBottom: '2px'
            }}>
              [{log.timestamp}] {log.message}
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Result</h3>
          <pre style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            backgroundColor: '#f8f9fa',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugUpload;