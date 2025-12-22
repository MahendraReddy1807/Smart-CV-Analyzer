@echo off
echo ========================================
echo Testing Smart CV Analyzer Services
echo ========================================
echo.

echo [1/3] Testing AI Service (port 8002)...
curl -s http://localhost:8002/health
if %errorlevel% neq 0 (
    echo ❌ AI Service is not responding
) else (
    echo ✅ AI Service is running
)
echo.

echo [2/3] Testing Backend (port 5000)...
curl -s http://localhost:5000/api/health
if %errorlevel% neq 0 (
    echo ❌ Backend is not responding
) else (
    echo ✅ Backend is running
)
echo.

echo [3/3] Testing Frontend (port 3000)...
curl -s http://localhost:3000 > nul
if %errorlevel% neq 0 (
    echo ❌ Frontend is not responding
) else (
    echo ✅ Frontend is running
)
echo.

echo ========================================
echo Service Status Check Complete
echo ========================================
echo.
echo If any service shows ❌, make sure to:
echo 1. Run fix-python-env.bat first
echo 2. Run start-services.bat
echo 3. Wait 30 seconds for services to start
echo.
pause