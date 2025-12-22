@echo off
echo ========================================
echo Testing Complete Resume Upload Flow
echo ========================================
echo.

echo [1/4] Testing AI Service Health...
curl -s http://localhost:8002/health
if %errorlevel% neq 0 (
    echo ❌ AI Service is not responding on port 8002
    echo Please run: start-services.bat
    pause
    exit /b 1
) else (
    echo ✅ AI Service is healthy
)
echo.

echo [2/4] Testing Backend Health...
curl -s http://localhost:5000/api/health
if %errorlevel% neq 0 (
    echo ❌ Backend is not responding on port 5000
    echo Please run: start-services.bat
    pause
    exit /b 1
) else (
    echo ✅ Backend is healthy
)
echo.

echo [3/4] Testing Frontend...
curl -s http://localhost:3000 > nul
if %errorlevel% neq 0 (
    echo ❌ Frontend is not responding on port 3000
    echo Please run: start-services.bat
    pause
    exit /b 1
) else (
    echo ✅ Frontend is accessible
)
echo.

echo [4/4] Testing Backend-AI Service Connection...
echo Creating test file...
echo Sample resume content > test-resume.txt

echo Testing upload endpoint...
curl -s -X POST http://localhost:5000/api/resume/upload ^
  -F "file=@test-resume.txt" ^
  -F "jobRole=Software Engineer" > upload-test-result.json

if %errorlevel% neq 0 (
    echo ❌ Upload test failed
    echo Check that all services are running
) else (
    echo ✅ Upload endpoint is working
    echo Response saved to upload-test-result.json
)

echo Cleaning up test files...
if exist test-resume.txt del test-resume.txt

echo.
echo ========================================
echo Upload Flow Test Complete
echo ========================================
echo.
echo If all tests show ✅, your resume upload should work!
echo If any test shows ❌, follow the troubleshooting steps in README.md
echo.
pause