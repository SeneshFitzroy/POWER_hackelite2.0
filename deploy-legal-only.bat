@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    NPK Pharmacy ERP - Legal Module Only
echo    Fast Deployment Script
echo ========================================
echo.

:: Colors
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%[1/4] Building Legal module...%RESET%
cd Legal/frontend
call npm run build
if %errorlevel% neq 0 (
    echo %RED%ERROR: Legal build failed!%RESET%
    pause
    exit /b 1
)
cd ../..
echo %GREEN%✓ Legal module built!%RESET%

echo.
echo %BLUE%[2/4] Preparing Legal deployment...%RESET%
if exist "public/legal" rmdir /s /q "public/legal"
mkdir "public/legal"
xcopy "Legal/frontend/build\*" "public/legal\" /E /I /Y /Q
echo %GREEN%✓ Legal files copied!%RESET%

echo.
echo %BLUE%[3/4] Fixing asset paths...%RESET%
powershell -Command "(Get-Content 'public/legal/index.html') -replace '/static/', '/legal/static/' | Set-Content 'public/legal/index.html'"
echo %GREEN%✓ Paths fixed!%RESET%

echo.
echo %BLUE%[4/4] Deploying to GitHub...%RESET%
git add -A
git commit -m "Deploy Legal Module - %date% %time%"
git push origin main
echo %GREEN%✓ Deployed!%RESET%

echo.
echo ========================================
echo    %GREEN%LEGAL MODULE DEPLOYED! 🎉%RESET%
echo    Live at: https://pharma-core-erp.vercel.app/legal
echo ========================================
pause
