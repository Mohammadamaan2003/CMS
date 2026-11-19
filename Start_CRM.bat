@echo off
title IQRA Customer Management System
color 0b
echo ========================================================
echo    IQRA Customer Management System (CRM) Launcher
echo ========================================================
echo.

cd /d "%~dp0"

<<<<<<< HEAD
:: 0. Check if PostgreSQL (Port 5432) is running
netstat -aon | findstr ":5432" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running on port 5432.
) else (
    echo [1/3] Starting PostgreSQL on port 5432...
    start /b "" "%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" -l "%~dp0pgsql\data\logfile" -o "-p 5432" start
    timeout /t 2 /nobreak >nul
)

=======
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
:: 1. Check if Backend (Port 5000) is already running
netstat -aon | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend server is already running on port 5000.
) else (
<<<<<<< HEAD
    echo [2/3] Starting Backend Server on port 5000...
    start "CRM Backend (Port 5000)" cmd /k "node --max-old-space-size=4096 server/server.js"
=======
    echo [1/2] Starting Backend Server on port 5000...
    start "CRM Backend (Port 5000)" cmd /k "node server/server.js"
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
)

:: 2. Check if Frontend (Port 3000) is already running
netstat -aon | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend client is already running on port 3000.
) else (
<<<<<<< HEAD
    echo [3/3] Starting Frontend Client on port 3000...
=======
    echo [2/2] Starting Frontend Client on port 3000...
>>>>>>> eb5e33d5c7d4057832db0f1a87da7c2d9bbbed83
    start "CRM Frontend (Port 3000)" cmd /k "npm run dev --prefix client"
)

echo.
echo Waiting for services to respond...
timeout /t 3 /nobreak >nul

echo Opening CRM in your default browser...
start http://localhost:3000

echo.
echo ========================================================
echo  CRM is active and accessible!
echo  - Frontend Web UI: http://localhost:3000
echo  - Backend API:     http://localhost:5000
echo ========================================================
echo.
echo NOTE:
echo  1. Do NOT double-click 'index.html' directly in file explorer.
echo     Modern React apps must run through the web address:
echo     http://localhost:3000
echo  2. To stop all services, double-click "Stop_CRM.bat".
echo  3. To restart everything fresh, double-click "Restart_CRM.bat".
echo.
timeout /t 8
