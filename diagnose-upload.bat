@echo off
echo ========================================
echo Diagnosing Upload Issues
echo ========================================
echo.

echo [1/5] Testing Frontend Access...
curl -s -I http://localhost:3000 | findstr "HTTP"
if %errorlevel% neq 0 (
    echo ❌ Frontend not accessible on http://localhost:3000
    echo Trying IPv6...
    curl -s -I http://[::1]:3000 | findstr "HTTP"
    if %errorlevel% neq 0 (
        echo ❌ Frontend not accessible on IPv6 either
    ) else (
        echo ✅ Frontend accessible on IPv6: http://[::1]:3000
        echo Try accessing: http://[::1]:3000 in your browser
    )
) else (
    echo ✅ Frontend accessible on http://localhost:3000
)
echo.

echo [2/5] Testing Backend API directly...
curl -s http://localhost:5000/api/health
echo.
echo.

echo [3/5] Testing AI Service directly...
curl -s http://localhost:8002/health
echo.
echo.

echo [4/5] Testing CORS headers...
curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:5000/api/resume/upload
echo.
echo.

echo [5/5] Testing upload endpoint with simple data...
echo Creating test file...
echo "Test resume content" > test-resume.txt

echo Testing upload...
curl -X POST http://localhost:5000/api/resume/upload ^
  -F "file=@test-resume.txt" ^
  -F "jobRole=Software Engineer" ^
  -v

echo.
echo Cleaning up...
if exist test-resume.txt del test-resume.txt

echo.
echo ========================================
echo Diagnosis Complete
echo ========================================
echo.
echo If you see any errors above, that's the issue.
echo If everything looks good, the problem might be:
echo 1. Browser cache - try Ctrl+F5 to hard refresh
echo 2. Browser blocking localhost - try http://127.0.0.1:3000
echo 3. Antivirus/Firewall blocking connections
echo.
pause