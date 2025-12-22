@echo off
echo ========================================
echo Fixing Python Environment Issues
echo ========================================
echo.

cd ai-service

echo [1/3] Removing corrupted virtual environment...
if exist venv (
    echo Removing existing venv directory...
    rmdir /s /q venv
)

if exist .venv (
    echo Removing existing .venv directory...
    rmdir /s /q .venv
)

echo [2/3] Creating fresh virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python 3.8+ is installed
    pause
    exit /b 1
)

echo [3/3] Installing minimal dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements-minimal.txt

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo ========================================
echo Python environment fixed successfully!
echo ========================================
echo.
echo You can now run: start-services.bat
echo.
pause