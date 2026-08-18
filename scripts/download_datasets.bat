@echo off
REM CyberAI-Expert v8.0 - Download Datasets Script for Windows

echo ============================================================
echo CyberAI-Expert v8.0 - Downloading Datasets
echo ============================================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not available. Please install Python 3.8+
    pause
    exit /b 1
)

echo Downloading and preparing datasets...
python scripts\download_datasets.py

echo ============================================================
echo Dataset download completed!
echo ============================================================
echo.
echo Next steps:
echo 1. Download CIC-IDS2017 from: https://www.unb.ca/cic/datasets/ids-2017.html
echo 2. Download UNSW-NB15 from: https://www.unsw.adfa.edu.au/unsw-canberra-cyber-security/
echo 3. Extract to datasets\ folder
echo 4. Run training: python engine\models\classical\train_classical.py
echo ============================================================

pause
