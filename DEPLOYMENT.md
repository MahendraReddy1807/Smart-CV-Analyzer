# Smart CV Analyzer - Render Deployment Guide

## Overview
This guide explains how to deploy the Smart CV Analyzer application on Render using the provided configuration files.

## Architecture
The application consists of three services:
1. **Frontend** (React/Vite) - Static site
2. **Backend** (Node.js/Express) - API server
3. **AI Service** (Python/FastAPI) - AI processing service

## Deployment Options

### Option 1: Deploy All Services (Recommended)
Deploy the complete application with all three services.

**Main file path for Render**: `render.yaml`

### Option 2: Deploy Individual Services

#### Frontend Only
- **Service Type**: Static Site
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: Your backend service URL

#### Backend Only
- **Service Type**: Web Service
- **Build Command**: `cd backend && npm ci`
- **Start Command**: `cd backend && npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `AI_SERVICE_URL`: Your AI service URL

#### AI Service Only
- **Service Type**: Web Service
- **Build Command**: `cd ai-service && pip install -r requirements.txt`
- **Start Command**: `cd ai-service && python main-enhanced.py`
- **Environment Variables**:
  - `PORT`: `10000`
  - `PYTHON_VERSION`: `3.9.16`

## Step-by-Step Deployment

### 1. Prepare Your Repository
Ensure all deployment files are committed to your GitHub repository:
- `render.yaml` (root level)
- `backend/package.json` (updated)
- `ai-service/requirements.txt`
- Environment files (`.env.production`)

### 2. Deploy on Render

#### Method A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository: `MahendraReddy1807/Smart-CV-Analyzer`
5. Render will automatically detect the `render.yaml` file
6. Click "Apply" to deploy all services

#### Method B: Manual Service Creation
1. Create each service individually on Render
2. Use the configuration details provided above
3. Set up environment variables for each service

### 3. Configure Environment Variables
After deployment, update the environment variables with the actual service URLs:

**Frontend**:
- `VITE_API_BASE_URL`: `https://smart-cv-analyzer-backend.onrender.com/api`

**Backend**:
- `AI_SERVICE_URL`: `https://smart-cv-analyzer-ai.onrender.com`

### 4. Verify Deployment
1. Check that all services are running
2. Test the health endpoints:
   - Backend: `https://smart-cv-analyzer-backend.onrender.com/api/health`
   - AI Service: `https://smart-cv-analyzer-ai.onrender.com/health`
3. Access the frontend application

## Service URLs (After Deployment)
- **Frontend**: `https://smart-cv-analyzer-frontend.onrender.com`
- **Backend API**: `https://smart-cv-analyzer-backend.onrender.com`
- **AI Service**: `https://smart-cv-analyzer-ai.onrender.com`

## Important Notes

### Free Tier Limitations
- Services may spin down after 15 minutes of inactivity
- Cold starts may take 30-60 seconds
- Consider upgrading to paid plans for production use

### File Upload Considerations
- Render has file size limits for uploads
- Consider using cloud storage (AWS S3, Cloudinary) for production

### Database
- Current setup uses in-memory storage
- For production, consider adding a database service (PostgreSQL, MongoDB)

### Monitoring
- Check service logs in Render dashboard
- Set up health check endpoints
- Monitor service performance

## Troubleshooting

### Common Issues
1. **Build Failures**: Check build logs and ensure all dependencies are listed
2. **Service Communication**: Verify environment variables and service URLs
3. **CORS Issues**: Ensure backend CORS configuration includes frontend URL
4. **Port Configuration**: Services must use PORT environment variable

### Debug Commands
```bash
# Check service health
curl https://smart-cv-analyzer-backend.onrender.com/api/health
curl https://smart-cv-analyzer-ai.onrender.com/health

# Test file upload
curl -X POST -F "file=@test.pdf" -F "jobRole=Software Engineer" \
  https://smart-cv-analyzer-backend.onrender.com/api/resume/upload
```

## Production Optimizations

### Performance
- Enable gzip compression
- Implement caching strategies
- Optimize bundle sizes
- Use CDN for static assets

### Security
- Set up proper CORS policies
- Implement rate limiting
- Add authentication if needed
- Use HTTPS everywhere

### Scalability
- Consider horizontal scaling
- Implement load balancing
- Use database for persistent storage
- Add monitoring and alerting

## Support
For deployment issues, check:
1. Render service logs
2. GitHub repository issues
3. Service health endpoints
4. Environment variable configuration