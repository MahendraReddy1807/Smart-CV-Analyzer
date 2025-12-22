import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import resumeRoutes from './routes/resume.js';
import userRoutes from './routes/user.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/user', userRoutes);

// Health check with service dependencies
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    message: 'Smart CV Analyzer API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      aiService: 'unknown'
    }
  };

  // Check database connection
  try {
    const mongoose = await import('mongoose');
    health.services.database = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (error) {
    health.services.database = 'error';
  }

  // Check AI service connection
  try {
    const axios = (await import('axios')).default;
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    await axios.get(`${aiServiceUrl}/health`, { timeout: 5000 });
    health.services.aiService = 'connected';
  } catch (error) {
    health.services.aiService = 'disconnected';
  }

  // Determine overall status
  const allServicesHealthy = Object.values(health.services).every(status => status === 'connected');
  if (!allServicesHealthy) {
    health.status = 'DEGRADED';
    health.message = 'Some services are unavailable';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});