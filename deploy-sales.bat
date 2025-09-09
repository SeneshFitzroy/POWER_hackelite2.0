@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    NPK Pharmacy ERP - Sales Module
echo    Fast Deployment Script
echo ========================================
echo.

:: Colors
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%[1/4] Building main React application...%RESET%
call npm run build
if %errorlevel% neq 0 (
    echo %RED%ERROR: Build failed!%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ Build successful!%RESET%

echo.
echo %BLUE%[2/4] Preparing deployment...%RESET%
if exist "public" rmdir /s /q "public"
mkdir "public"
xcopy "build\*" "public\" /E /I /Y /Q
echo %GREEN%✓ Files copied!%RESET%

echo.
echo %BLUE%[3/4] Deploying to GitHub...%RESET%
git add -A
git commit -m "Deploy Sales Module - %date% %time%"
git push origin main
echo %GREEN%✓ Deployed!%RESET%

echo.
echo ========================================
echo    %GREEN%SALES MODULE DEPLOYED! 🎉%RESET%
echo    Live at: https://pharma-core-erp.vercel.app
echo ========================================
pause
