@echo off
echo ========================================
echo Smart CV Analyzer - Service Startup
echo ========================================
echo.

echo [1/4] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo [2/4] Setting up AI Service...
cd ai-service

echo Recreating virtual environment...
if exist venv rmdir /s /q venv
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Upgrading pip and setuptools...
python -m pip install --upgrade pip setuptools wheel

echo Installing dependencies with OCR support...
pip install -r requirements.txt

echo Starting AI Service on port 8002...
start "AI Service" cmd /k "cd /d %cd% && venv\Scripts\activate.bat && python main-minimal.py"

cd ..
timeout /t 5

echo [3/4] Starting Backend on port 5000...
cd backend
start "Backend" cmd /k "cd /d %cd% && npm run dev"

cd ..
timeout /t 3

echo [4/4] Starting Frontend on port 3000...
cd frontend
start "Frontend" cmd /k "cd /d %cd% && npm run dev"

cd ..

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo Frontend:   http://localhost:3000
echo Backend:    http://localhost:5000/api/health
echo AI Service: http://localhost:8002/health
echo.
echo Wait 30 seconds for all services to fully start
echo Then test the resume upload functionality
echo.
pause