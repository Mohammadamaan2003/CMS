@echo off
title Stop IQRA Customer Management System
color 0c
echo ========================================================
echo    Stopping IQRA Customer Management System (CRM)...
echo ========================================================
echo.

echo Stopping processes listening on Port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping processes listening on Port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping PostgreSQL on Port 5432...
"%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" stop >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5432 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
if exist "%~dp0pgsql\data\postmaster.pid" del /f /q "%~dp0pgsql\data\postmaster.pid" >nul 2>&1

echo.
echo ========================================================
echo  All CRM services have been stopped.
echo ========================================================
echo.
timeout /t 3
