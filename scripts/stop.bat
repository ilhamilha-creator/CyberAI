@echo off
REM CyberAI-Expert v8.0 - Stop Script for Windows

echo ============================================================
echo Stopping CyberAI-Expert platform...
echo ============================================================

docker compose down

echo Platform stopped.
echo.
echo To stop with data removal: docker compose down -v
echo ============================================================

pause
