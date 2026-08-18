@echo off
REM CyberAI-Expert v8.0 - Model Training Script for Windows

echo ============================================================
echo CyberAI-Expert v8.0 - Training ML Models
echo ============================================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not available. Please install Python 3.8+
    pause
    exit /b 1
)

echo Checking datasets...
if not exist "datasets\NSL-KDD\KDDTrain+.txt" (
    echo WARNING: NSL-KDD dataset not found. Downloading...
    python scripts\download_datasets.py
)

echo.
echo Training Classical ML Models...
cd engine\models\classical
python train_classical.py

echo.
echo Training Deep Learning Models...
cd ..\deep_learning
python train_deep_learning.py

echo.
echo Training completed! Models saved in artifacts\ folders
echo ============================================================

cd ..\..\..
pause
