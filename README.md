# Smart CV Analyzer

A comprehensive AI-powered resume analysis and enhancement system that helps students create professional, ATS-friendly resumes. The system uses advanced OCR, NLP, machine learning, and generative AI to analyze uploaded documents, evaluate quality, and provide intelligent recommendations and enhancements.

## 🚀 Quick Start

### ✅ **WORKING STATUS** - Resume Upload Fixed!

All services are now working correctly. The resume upload functionality has been fully restored.

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://python.org/))

### 🔧 One-Command Setup (RECOMMENDED)

```bash
# 1. Fix Python environment (if needed)
.\fix-python-env.bat

# 2. Start all services
.\start-services.bat

# 3. Test services (optional)
.\test-services.bat
```

**Expected Result:**
- ✅ AI Service running on port 8002
- ✅ Backend running on port 5000  
- ✅ Frontend running on port 3000
- ✅ Resume upload working perfectly

### 📦 Manual Setup

#### 1. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

#### 3. AI Service Setup
```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your OpenAI API key and other configurations

# Start the service
python main.py
```

### 🌐 Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:5000 | Node.js API server |
| AI Service | http://localhost:8002 | Python FastAPI service (minimal) |
| MongoDB | mongodb://localhost:27017 | Database connection (optional) |

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS + Premium UI Components
- **Backend**: Node.js + Express + MongoDB + Multer
- **AI Service**: Python + FastAPI + OpenAI + Tesseract OCR
- **Database**: MongoDB with GridFS for file storage

## 📁 Project Structure

```
smart-cv-analyzer/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS and styling
│   │   ├── utils/          # Utility functions
│   │   └── contexts/       # React contexts
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js API server
│   ├── routes/             # API route handlers
│   ├── models/             # MongoDB models
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   └── package.json
├── ai-service/             # Python AI microservice
│   ├── modules/            # AI/ML processing modules
│   ├── tests/              # Python tests
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # FastAPI application
└── README.md
```

## 🎯 Features

### Core Functionality
- **📄 Multi-Format Upload**: Support for PDF and image formats (PNG, JPG, JPEG)
- **🔍 Advanced OCR**: Extract text from uploaded documents using Tesseract
- **🧠 Intelligent Section Classification**: Automatically identify resume sections using NLP and DistilBERT
- **📊 Comprehensive Scoring**: ML-based resume evaluation (0-100 scale) with detailed breakdowns
- **🎯 Job Role Targeting**: Keyword analysis and matching for specific job roles
- **✨ AI-Powered Enhancement**: Improve bullet points using generative AI while preserving factual accuracy
- **💡 Smart Recommendations**: Specific, actionable improvement suggestions
- **🤖 ATS Optimization**: Ensure compatibility with Applicant Tracking Systems
- **📋 Enhanced PDF Generation**: Create professional, ATS-friendly resume downloads
- **📈 Analysis History**: Save and retrieve previous analysis sessions

### Technical Features
- **🧪 Property-Based Testing**: Comprehensive test coverage using Hypothesis and fast-check
- **🏗️ Microservices Architecture**: Scalable, maintainable system design
- **⚡ Real-time Processing**: Fast analysis with progress indicators
- **🛡️ Error Handling**: Robust error handling and user feedback
- **📱 Responsive Design**: Mobile and desktop compatibility
- **🎨 Premium UI/UX**: Modern glassmorphism design with dark mode support

## 🔧 Development Commands

### Root Directory Commands
```bash
# Install all dependencies for all services
npm run install:all

# Start all services in development mode
npm run dev:all

# Build all services for production
npm run build:all

# Run all tests
npm run test:all

# Clean all node_modules and build artifacts
npm run clean:all
```

### Frontend Commands
```bash
cd frontend

# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:ui         # Run tests with UI
```

### Backend Commands
```bash
cd backend

# Development
npm run dev             # Start with nodemon
npm start              # Start production server
npm run build          # Build TypeScript (if applicable)

# Testing
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage

# Database
npm run db:seed        # Seed database with sample data
npm run db:reset       # Reset database
npm run db:migrate     # Run database migrations
```

### AI Service Commands
```bash
cd ai-service

# Activate virtual environment first
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Development
python main.py                    # Start FastAPI server
python main-enhanced.py          # Start enhanced version
python main-minimal.py           # Start minimal version
uvicorn main:app --reload       # Start with uvicorn

# Testing
python -m pytest                # Run all tests
python -m pytest -v            # Run tests with verbose output
python -m pytest --cov         # Run tests with coverage
python -m pytest tests/        # Run specific test directory

# Dependencies
pip install -r requirements.txt           # Install dependencies
pip install -r requirements-minimal.txt   # Install minimal dependencies
pip freeze > requirements.txt             # Update requirements file
```

## 🧪 Testing Commands

### Run All Tests
```bash
# From root directory
npm run test:all

# Individual services
cd frontend && npm test
cd backend && npm test
cd ai-service && python -m pytest
```

### Property-Based Testing
```bash
# Frontend property tests
cd frontend
npm run test -- --testNamePattern="Property"

# AI Service property tests
cd ai-service
python -m pytest -k "property" -v
```

### Coverage Reports
```bash
# Frontend coverage
cd frontend && npm run test:coverage

# Backend coverage
cd backend && npm run test:coverage

# AI Service coverage
cd ai-service && python -m pytest --cov --cov-report=html
```

## 🐳 Docker Commands

### Development with Docker
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Individual Service Docker Commands
```bash
# Frontend
docker build -t cv-analyzer-frontend ./frontend
docker run -p 3000:3000 cv-analyzer-frontend

# Backend
docker build -t cv-analyzer-backend ./backend
docker run -p 5000:5000 cv-analyzer-backend

# AI Service
docker build -t cv-analyzer-ai ./ai-service
docker run -p 8001:8001 cv-analyzer-ai
```

## 🔍 Debugging Commands

### Logs and Monitoring
```bash
# View application logs
npm run logs

# Monitor file changes
npm run watch

# Debug mode
npm run debug

# Performance profiling
npm run profile
```

### Database Operations
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/cv_analyzer

# View collections
show collections

# Query examples
db.analyses.find().limit(5)
db.users.countDocuments()

# Export data
mongoexport --db cv_analyzer --collection analyses --out analyses.json

# Import data
mongoimport --db cv_analyzer --collection analyses --file analyses.json
```

## 🚀 Production Deployment

### Build for Production
```bash
# Build all services
npm run build:all

# Or individually
cd frontend && npm run build
cd backend && npm run build
cd ai-service && pip install -r requirements.txt
```

### Environment Setup
```bash
# Copy production environment files
cp frontend/.env.example frontend/.env.production
cp backend/.env.example backend/.env.production
cp ai-service/.env.example ai-service/.env.production

# Edit with production values
nano frontend/.env.production
nano backend/.env.production
nano ai-service/.env.production
```

### Health Checks
```bash
# Check service health
curl http://localhost:3000/health    # Frontend
curl http://localhost:5000/api/health    # Backend
curl http://localhost:8002/health    # AI Service

# Check database connection (optional)
mongosh --eval "db.adminCommand('ping')"
```

## 🔌 API Endpoints

### Backend API (Port 5000)

#### Resume Operations
```bash
# Upload and analyze resume
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@path/to/resume.pdf" \
  -F "jobRole=Software Engineer"

# Get analysis results
curl http://localhost:5000/api/resume/analysis/{id}

# Get user's analysis history
curl http://localhost:5000/api/resume/user/{userId}

# Download enhanced resume
curl http://localhost:5000/api/resume/download/{id} \
  -H "Content-Type: application/json" \
  -d '{"enhancements": [0, 1, 2]}'
```

#### Health and Status
```bash
# Check API health
curl http://localhost:5000/health

# Get API status
curl http://localhost:5000/api/status
```

### AI Service API (Port 8002)

#### Analysis Operations
```bash
# Analyze resume with AI/ML pipeline
curl -X POST http://localhost:8002/analyze-resume \
  -F "file=@path/to/resume.pdf" \
  -F "jobRole=Software Engineer"

# Get service health
curl http://localhost:8002/health
```

#### Testing the Upload Flow
```bash
# Test complete upload flow
curl -X POST http://localhost:5000/api/resume/upload \
  -F "file=@path/to/resume.pdf" \
  -F "jobRole=Software Engineer"
```

## 🛠️ Troubleshooting

### 🚨 Resume Upload Issues (IMPORTANT)

If you're unable to upload resumes and seeing "offline" status, follow these steps:

#### Quick Fix (Windows)
```bash
# 1. Fix Python environment issues
fix-python-env.bat

# 2. Start all services
start-services.bat

# 3. Test services (wait 30 seconds after starting)
test-services.bat
```

#### Manual Fix Steps

##### Step 1: Fix Python Virtual Environment
```bash
cd ai-service

# Remove corrupted virtual environment
rmdir /s /q venv
rmdir /s /q .venv

# Create fresh virtual environment
python -m venv venv

# Activate and upgrade tools
venv\Scripts\activate.bat
python -m pip install --upgrade pip setuptools wheel

# Install minimal dependencies only
pip install -r requirements-minimal.txt
```

##### Step 2: Start Services in Correct Order
```bash
# Terminal 1: Start AI Service (Port 8002)
cd ai-service
venv\Scripts\activate.bat
python main-minimal.py

# Terminal 2: Start Backend (Port 5000)
cd backend
npm run dev

# Terminal 3: Start Frontend (Port 3000)
cd frontend
npm run dev
```

##### Step 3: Verify Services Are Running
```bash
# Check AI Service
curl http://localhost:8002/health

# Check Backend
curl http://localhost:5000/api/health

# Check Frontend
curl http://localhost:3000
```

#### Common Error Messages and Solutions

**Error: "Cannot import 'setuptools.build_meta'"**
- Solution: Run `fix-python-env.bat` to recreate virtual environment

**Error: "AI service is currently unavailable"**
- Solution: Make sure AI service is running on port 8002 (not 8001)

**Error: "Network error. Please check your connection."**
- Solution: Verify all three services are running and accessible

**Error: "Service temporarily unavailable"**
- Solution: Wait 30 seconds after starting services, then try again

### Common Issues and Solutions

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # or :5000, :8001
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
taskkill /PID <PID> /F  # Windows
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
systemctl status mongod           # Linux
net start MongoDB                 # Windows

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
net start MongoDB                      # Windows
```

#### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

#### Node.js Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update
npm audit fix
```

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8001
VITE_APP_NAME="Smart CV Analyzer"
```

#### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cv_analyzer
JWT_SECRET=your_jwt_secret_here
AI_SERVICE_URL=http://localhost:8001
NODE_ENV=development
```

#### AI Service (.env)
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=8001
MONGODB_URI=mongodb://localhost:27017/cv_analyzer
ENVIRONMENT=development
```

## 📊 Performance Monitoring

### Application Metrics
```bash
# Monitor application performance
npm run monitor

# View memory usage
node --inspect backend/server.js

# Profile Python service
python -m cProfile ai-service/main.py
```

### Database Performance
```bash
# MongoDB performance stats
mongosh --eval "db.stats()"

# Index usage
mongosh --eval "db.analyses.getIndexes()"

# Query performance
mongosh --eval "db.analyses.find().explain('executionStats')"
```

## 🧪 Testing

### Run All Tests
```bash
# From root directory - run all service tests
npm run test:all

# Individual service tests
cd frontend && npm test
cd backend && npm test
cd ai-service && python -m pytest
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- AnalysisResults.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="Property"

# Run tests with UI
npm run test:ui
```

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run API tests
npm run test:api
```

### AI Service Testing
```bash
cd ai-service

# Activate virtual environment first
source venv/bin/activate

# Run all tests
python -m pytest

# Run tests with verbose output
python -m pytest -v

# Run tests with coverage
python -m pytest --cov

# Run specific test file
python -m pytest tests/test_ocr.py

# Run property-based tests
python -m pytest -k "property" -v

# Run tests and generate HTML coverage report
python -m pytest --cov --cov-report=html
```

## 🤝 Contributing

### Development Workflow
```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/smart-cv-analyzer.git
cd smart-cv-analyzer

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Install dependencies
npm run install:all

# 4. Make your changes and test
npm run test:all

# 5. Commit your changes
git add .
git commit -m "feat: add your feature description"

# 6. Push to your fork
git push origin feature/your-feature-name

# 7. Create a pull request
```

### Code Quality
```bash
# Run linting
npm run lint:all

# Fix linting issues
npm run lint:fix:all

# Format code
npm run format:all

# Type checking (if TypeScript)
npm run type-check
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm run prepare

# Run pre-commit checks manually
npm run pre-commit
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Issues**: Report bugs on [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: Join [GitHub Discussions](https://github.com/your-repo/discussions)
- 📧 **Email**: Contact the maintainers at support@example.com

### Useful Resources
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)