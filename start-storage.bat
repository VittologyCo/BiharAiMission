@echo off
cd /d "%~dp0"
title Bihar AI - Storage Server & Ngrok Tunnel Manager
cls
echo ======================================================================
echo          BIHAR AI MISSION - STORAGE SERVER & TUNNEL MANAGER
echo ======================================================================
echo.

echo [1/3] Restoring saved PM2 processes...
call npx pm2 resurrect >nul 2>&1

echo [2/3] Verifying processes...
call npx pm2 describe bihar-storage >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting bihar-storage (server.js on port 5000)...
    call npx pm2 start server.js --name "bihar-storage"
)

call npx pm2 describe bihar-tunnel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting bihar-tunnel (ngrok on coach-latch-nugget.ngrok-free.dev)...
    call npx pm2 start .\ngrok.exe --name "bihar-tunnel" -- http --url=coach-latch-nugget.ngrok-free.dev 5000
)

call npx pm2 save >nul 2>&1

echo [3/3] Testing live health connection...
echo.
curl.exe -s -H "ngrok-skip-browser-warning: true" https://coach-latch-nugget.ngrok-free.dev/health
echo.
echo ======================================================================
call npx pm2 status
echo.
echo Storage server and tunnel are active!
echo Files upload to: %~dp0uploads
echo Public Domain:   https://coach-latch-nugget.ngrok-free.dev
echo ======================================================================
echo.
pause
