// Vercel Serverless Function - Health Check
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'OK',
    message: 'Smart CV Analyzer API is running (Vercel Serverless)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}