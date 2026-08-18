@echo off
REM CyberAI-Expert v8.0 - Deployment Script for Windows
REM Requires Docker Desktop for Windows

echo ============================================================
echo CyberAI-Expert v8.0 - Deployment on Windows
echo ============================================================

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Deploying CyberAI-Expert platform...
docker compose up -d

echo ============================================================
echo Services are starting... Please wait 2-3 minutes.
echo ============================================================
echo.
echo Access URLs:
echo   SOC Platform: http://localhost:80
echo   API Docs: http://localhost:8000/api/docs
echo   Grafana: http://localhost:3000 (admin / CyberAI_Grafana_2024!)
echo   Kibana: http://localhost:5601
echo   Kafka UI: http://localhost:8090
echo   MLflow: http://localhost:5050
echo   MinIO: http://localhost:9001 (cyberai-minio / MinIO_CyberAI_S3cure_2024!)
echo   Superset: http://localhost:8088 (admin / CyberAI_Superset_2024!)
echo.
echo To stop: docker compose down
echo To stop with data removal: docker compose down -v
echo ============================================================

pause
