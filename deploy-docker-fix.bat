@echo off
REM Docker Fix Deployment Script for Windows
REM Usage: deploy-docker-fix.bat

setlocal enabledelayedexpansion

echo ================================================
echo Docker Error Fix - Deployment Script for Windows
echo ================================================
echo.

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: docker-compose not found. Please install Docker Desktop.
    exit /b 1
)

echo Step 1: Stopping all containers...
docker-compose down
echo [OK] Containers stopped
echo.

echo Step 2: Rebuilding images without cache...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    exit /b 1
)
echo [OK] Images rebuilt successfully
echo.

echo Step 3: Starting services...
docker-compose up -d
echo [OK] Services started
echo.

echo Step 4: Waiting for services to be ready (30s)...
timeout /t 30 /nobreak
echo [OK] Ready
echo.

echo Step 5: Checking service status...
echo.
docker-compose ps
echo.

echo Step 6: Testing backend health...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is healthy
) else (
    echo [ERROR] Backend health check failed
    echo Checking logs...
    docker-compose logs backend | tail -20
)
echo.

echo Step 7: Testing frontend...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is accessible
) else (
    echo [ERROR] Frontend is not responding
    echo Checking logs...
    docker-compose logs frontend | tail -20
)
echo.

echo ================================================
echo [OK] Deployment Complete
echo ================================================
echo.
echo Services should now be running and healthy.
echo.
echo Access points:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.
echo Check status anytime with:
echo   docker-compose ps
echo.
echo View logs with:
echo   docker-compose logs -f [backend^|frontend]
echo.

pause
