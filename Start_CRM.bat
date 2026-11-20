@echo off
title IQRA Customer Management System
color 0b
echo ========================================================
echo    IQRA Customer Management System (CRM) Launcher
echo ========================================================
echo.

cd /d "%~dp0"

:: 0. Check if PostgreSQL (Port 5432) is running
netstat -aon | findstr ":5432" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running on port 5432.
) else (
    echo [1/3] Preparing and starting PostgreSQL on port 5432...
    if not exist "%~dp0pgsql\data\pg_notify" mkdir "%~dp0pgsql\data\pg_notify"
    if not exist "%~dp0pgsql\data\pg_tblspc" mkdir "%~dp0pgsql\data\pg_tblspc"
    if not exist "%~dp0pgsql\data\pg_replslot" mkdir "%~dp0pgsql\data\pg_replslot"
    if not exist "%~dp0pgsql\data\pg_commit_ts" mkdir "%~dp0pgsql\data\pg_commit_ts"
    if not exist "%~dp0pgsql\data\pg_dynshmem" mkdir "%~dp0pgsql\data\pg_dynshmem"
    if not exist "%~dp0pgsql\data\pg_snapshots" mkdir "%~dp0pgsql\data\pg_snapshots"
    if not exist "%~dp0pgsql\data\pg_stat" mkdir "%~dp0pgsql\data\pg_stat"
    if not exist "%~dp0pgsql\data\pg_stat_tmp" mkdir "%~dp0pgsql\data\pg_stat_tmp"
    if not exist "%~dp0pgsql\data\pg_twophase" mkdir "%~dp0pgsql\data\pg_twophase"
    if not exist "%~dp0pgsql\data\pg_wal\archive_status" mkdir "%~dp0pgsql\data\pg_wal\archive_status"
    if not exist "%~dp0pgsql\data\pg_wal\summaries" mkdir "%~dp0pgsql\data\pg_wal\summaries"
    if not exist "%~dp0pgsql\data\pg_logical\mappings" mkdir "%~dp0pgsql\data\pg_logical\mappings"
    if not exist "%~dp0pgsql\data\pg_logical\snapshots" mkdir "%~dp0pgsql\data\pg_logical\snapshots"
    if exist "%~dp0pgsql\data\postmaster.pid" del /f /q "%~dp0pgsql\data\postmaster.pid" >nul 2>&1
    start /b "" "%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" -l "%~dp0pgsql\data\logfile" -o "-p 5432" start
    timeout /t 3 /nobreak >nul
)

:: 1. Check if Backend (Port 5000) is already running
netstat -aon | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend server is already running on port 5000.
) else (
    echo [2/3] Starting Backend Server on port 5000...
    start "CRM Backend (Port 5000)" cmd /k "node --max-old-space-size=4096 server/server.js"
)

:: 2. Check if Frontend (Port 3000) is already running
netstat -aon | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend client is already running on port 3000.
) else (
    echo [3/3] Starting Frontend Client on port 3000...
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
