@echo off
title Share IQRA CRM Online
color 0a
echo ========================================================
echo       Share IQRA CRM Online (Cloudflare Tunnel)
echo ========================================================
echo.
echo Connecting your local CRM to a secure public URL...
echo Please wait a few seconds for the https://....trycloudflare.com link.
echo.
echo (To stop sharing, simply close this window)
echo ========================================================
echo.
cd /d "%~dp0"
"%~dp0cloudflared.exe" tunnel --url http://localhost:3000
pause
