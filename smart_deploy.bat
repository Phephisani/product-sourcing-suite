@echo off
setlocal
echo ========================================================
echo   SMART DEPLOYMENT SCRIPT (Finding Git...)
echo ========================================================
echo.

:: 1. SEARCH FOR GIT
set "GIT_PATH="

if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"
) else if exist "C:\Program Files\Git\bin\git.exe" (
    set "GIT_PATH=C:\Program Files\Git\bin\git.exe"
) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "GIT_PATH=C:\Program Files (x86)\Git\cmd\git.exe"
) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set "GIT_PATH=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
)

if "%GIT_PATH%"=="" (
    echo [ERROR] Could not find Git installed on your computer.
    echo Please try restarting your computer to finish the installation.
    pause
    exit /b
)

echo FOUND GIT AT: "%GIT_PATH%"
echo.

:: 2. VERIFY RENDER.YAML
if not exist render.yaml (
    echo [ERROR] render.yaml is MISSING!
    pause
    exit /b
) else (
    echo [OK] render.yaml found.
)

:: 3. GET URL
set /p repo_url="Paste your GitHub Repository URL here: "

:: 4. RUN GIT COMMANDS using the specific path
echo.
echo [1/5] Configuring Git...
"%GIT_PATH%" init
"%GIT_PATH%" remote remove origin 2>nul
"%GIT_PATH%" remote add origin %repo_url%

echo [2/5] Adding files (This takes a moment)...
"%GIT_PATH%" add .

echo [3/5] Committing...
"%GIT_PATH%" commit -m "Smart Deploy"

echo [4/5] Enforcing MAIN branch...
"%GIT_PATH%" branch -M main

echo [5/5] PUSHING TO GITHUB...
"%GIT_PATH%" push -f origin main

echo.
echo ========================================================
echo   SUCCESS! Code sent to 'main' branch.
echo   Now go to Render -> Select 'main' -> Apply
echo ========================================================
pause
