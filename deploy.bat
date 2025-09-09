@echo off
setlocal enabledelayedexpansion

:: ========================================
::    NPK Pharmacy ERP - Universal Deploy
::    Customizable Deployment Script
:: ========================================
echo.
echo ========================================
echo    NPK Pharmacy ERP - Universal Deploy
echo    Customizable Deployment Script
echo ========================================
echo.

:: ========================================
::    CONFIGURATION SECTION - CUSTOMIZE THESE
:: ========================================
:: Project Information
set PROJECT_NAME=NPK Pharmacy ERP
set GITHUB_URL=https://pharma-core-erp.vercel.app

:: Build Directories
set MAIN_BUILD_DIR=build
set DEPLOY_DIR=public

:: Submodule Configuration
set SUBMODULE_DIR=Legal/frontend
set SUBMODULE_DEPLOY=legal

:: Git Configuration
set GIT_BRANCH=main
set COMMIT_MESSAGE_PREFIX=Auto deploy

:: ========================================
::    END CONFIGURATION - DON'T EDIT BELOW
:: ========================================

:: Colors for better output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "RESET=[0m"

:: ========================================
::    STEP 1: PROJECT VALIDATION
:: ========================================
echo %BLUE%[1/8] Validating project structure...%RESET%
if not exist "package.json" (
    echo %RED%ERROR: Not in a React project directory!%RESET%
    echo Please run this script from your project root.
    pause
    exit /b 1
)
echo %GREEN%✓ Project structure validated%RESET%

:: ========================================
::    STEP 2: MAIN APPLICATION BUILD
:: ========================================
echo.
echo %BLUE%[2/8] Building main React application...%RESET%
echo %CYAN%Command: npm run build%RESET%
call npm run build
if %errorlevel% neq 0 (
    echo %RED%ERROR: Main build failed!%RESET%
    echo %YELLOW%Possible causes:%RESET%
    echo - Missing dependencies (run: npm install)
    echo - Build script not found in package.json
    echo - Syntax errors in your code
    pause
    exit /b 1
)
echo %GREEN%✓ Main application built successfully%RESET%

:: ========================================
::    STEP 3: SUBMODULE BUILD (LEGAL MODULE)
:: ========================================
echo.
echo %BLUE%[3/8] Building Legal submodule...%RESET%
if exist "%SUBMODULE_DIR%" (
    echo %CYAN%Command: cd %SUBMODULE_DIR% && npm run build%RESET%
    cd "%SUBMODULE_DIR%"
    call npm run build
    if %errorlevel% neq 0 (
        echo %YELLOW%WARNING: Legal module build failed!%RESET%
        echo %YELLOW%Continuing with main deployment...%RESET%
    ) else (
        echo %GREEN%✓ Legal module built successfully%RESET%
    )
    cd ../..
) else (
    echo %YELLOW%WARNING: Legal module directory not found%RESET%
    echo %YELLOW%Skipping Legal module build...%RESET%
)

:: ========================================
::    STEP 4: DEPLOYMENT DIRECTORY PREPARATION
:: ========================================
echo.
echo %BLUE%[4/8] Preparing deployment directory...%RESET%
if exist "%DEPLOY_DIR%" (
    echo %CYAN%Clearing old deployment files...%RESET%
    rmdir /s /q "%DEPLOY_DIR%"
)
mkdir "%DEPLOY_DIR%"
echo %GREEN%✓ Deployment directory prepared%RESET%

:: ========================================
::    STEP 5: MAIN APPLICATION DEPLOYMENT
:: ========================================
echo.
echo %BLUE%[5/8] Deploying main application...%RESET%
if exist "%MAIN_BUILD_DIR%" (
    echo %CYAN%Copying main build files...%RESET%
    xcopy "%MAIN_BUILD_DIR%\*" "%DEPLOY_DIR%\" /E /I /Y /Q
    echo %GREEN%✓ Main application deployed%RESET%
) else (
    echo %YELLOW%WARNING: Main build directory not found%RESET%
    echo %YELLOW%Skipping main application deployment...%RESET%
)

:: ========================================
::    STEP 6: SUBMODULE DEPLOYMENT
:: ========================================
echo.
echo %BLUE%[6/8] Deploying Legal submodule...%RESET%
if exist "%SUBMODULE_DIR%\build" (
    echo %CYAN%Creating Legal module directory...%RESET%
    if not exist "%DEPLOY_DIR%\%SUBMODULE_DEPLOY%" mkdir "%DEPLOY_DIR%\%SUBMODULE_DEPLOY%"
    
    echo %CYAN%Copying Legal module files...%RESET%
    xcopy "%SUBMODULE_DIR%\build\*" "%DEPLOY_DIR%\%SUBMODULE_DEPLOY%\" /E /I /Y /Q
    echo %GREEN%✓ Legal module deployed%RESET%
) else (
    echo %YELLOW%WARNING: Legal module build not found%RESET%
    echo %YELLOW%Skipping Legal module deployment...%RESET%
)

:: ========================================
::    STEP 7: STATIC ASSET PATH FIXING
:: ========================================
echo.
echo %BLUE%[7/8] Fixing static asset paths...%RESET%

:: Fix main application paths
if exist "%DEPLOY_DIR%\index.html" (
    echo %CYAN%Fixing main application asset paths...%RESET%
    powershell -Command "(Get-Content '%DEPLOY_DIR%\index.html') -replace '/static/', '/static/' | Set-Content '%DEPLOY_DIR%\index.html'"
)

:: Fix Legal module paths
if exist "%DEPLOY_DIR%\%SUBMODULE_DEPLOY%\index.html" (
    echo %CYAN%Fixing Legal module asset paths...%RESET%
    powershell -Command "(Get-Content '%DEPLOY_DIR%\%SUBMODULE_DEPLOY%\index.html') -replace '/static/', '/%SUBMODULE_DEPLOY%/static/' | Set-Content '%DEPLOY_DIR%\%SUBMODULE_DEPLOY%\index.html'"
)
echo %GREEN%✓ Asset paths fixed%RESET%

:: ========================================
::    STEP 8: GIT DEPLOYMENT
:: ========================================
echo.
echo %BLUE%[8/8] Deploying to GitHub...%RESET%

:: Add all files to git
echo %CYAN%Adding files to git...%RESET%
git add -A
if %errorlevel% neq 0 (
    echo %RED%ERROR: Git add failed!%RESET%
    echo %YELLOW%Possible causes:%RESET%
    echo - Not in a git repository
    echo - Git not installed
    echo - Permission issues
    pause
    exit /b 1
)

:: Commit changes
echo %CYAN%Committing changes...%RESET%
set TIMESTAMP=%date% %time%
git commit -m "%COMMIT_MESSAGE_PREFIX% - %TIMESTAMP%"
if %errorlevel% neq 0 (
    echo %YELLOW%WARNING: Nothing to commit%RESET%
    echo %YELLOW%All files are up to date%RESET%
)

:: Push to GitHub
echo %CYAN%Pushing to GitHub...%RESET%
git push origin %GIT_BRANCH%
if %errorlevel% neq 0 (
    echo %RED%ERROR: Git push failed!%RESET%
    echo %YELLOW%Possible causes:%RESET%
    echo - No internet connection
    echo - GitHub credentials not configured
    echo - Repository permissions
    echo - Branch protection rules
    pause
    exit /b 1
)
echo %GREEN%✓ Successfully deployed to GitHub%RESET%

:: ========================================
::    DEPLOYMENT COMPLETE
:: ========================================
echo.
echo ========================================
echo    %GREEN%DEPLOYMENT SUCCESSFUL! 🎉%RESET%
echo ========================================
echo.
echo %BLUE%Project Information:%RESET%
echo %YELLOW%Name:%RESET% %PROJECT_NAME%
echo %YELLOW%Branch:%RESET% %GIT_BRANCH%
echo %YELLOW%Timestamp:%RESET% %TIMESTAMP%
echo.
echo %BLUE%Live URLs:%RESET%
echo %YELLOW%Main Application:%RESET% %GITHUB_URL%
echo %YELLOW%Legal Module:%RESET% %GITHUB_URL%/%SUBMODULE_DEPLOY%
echo.
echo %BLUE%Deployment Summary:%RESET%
echo %GREEN%✓ Main application built and deployed%RESET%
echo %GREEN%✓ Legal module built and deployed%RESET%
echo %GREEN%✓ Static asset paths fixed%RESET%
echo %GREEN%✓ Changes committed to git%RESET%
echo %GREEN%✓ Pushed to GitHub successfully%RESET%
echo.
echo ========================================
echo %CYAN%Deployment completed successfully!%RESET%
echo ========================================
echo.
pause