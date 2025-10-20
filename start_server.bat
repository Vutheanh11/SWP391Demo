@echo off
title ElectroMove Admin Dashboard Server
echo ========================================
echo   ElectroMove Admin Dashboard Server
echo ========================================
echo.
echo Starting Python server on localhost:3000...
echo.
echo Login Page: http://localhost:3000/login.html
echo Admin Dashboard: http://localhost:3000/admin.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python start_server.py

pause