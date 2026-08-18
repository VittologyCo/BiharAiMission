@echo off
:: Ensure working directory is set to the folder where this batch file is located
cd /d "%~dp0"

title Bihar AI Mission - Application Starter
cls
echo ========================================================
echo         Starting Bihar AI Mission Application
echo ========================================================
echo.

:: Launch Frontend React App
echo [1/2] Starting Development Server...
start "Bihar AI - Application" cmd /k "cd /d "%~dp0" && echo Starting Dev Server... && npm start"

:: Launch Browser Windows for Main Site and Admin Dashboard
echo [2/2] Launching Browser Windows...
ping 127.0.0.1 -n 6 >nul
start http://localhost:3000
start http://localhost:3000/admin

echo.
echo ========================================================
echo   Success! Application server started.
echo   - Main Website:     http://localhost:3000
echo   - Admin Dashboard:  http://localhost:3000/admin
echo ========================================================
echo.
pause
