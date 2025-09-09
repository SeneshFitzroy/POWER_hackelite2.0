@echo off
echo ========================================
echo    NPK Pharmacy ERP - Sales Module
echo    Local Development Server
echo ========================================
echo.

:: Colors
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%Starting Sales Module on localhost...%RESET%
echo %YELLOW%URL: http://localhost:3000%RESET%
echo %YELLOW%Press Ctrl+C to stop the server%RESET%
echo.

call npm start

pause
