@echo off
echo ========================================================
echo   FORCE DEPLOYMENT SCRIPT
echo ========================================================
echo.
echo This script will FORCE your code to GitHub, overwriting any errors.
echo.

set /p repo_url="Paste your GitHub Repository URL here: "

echo.
echo [1/4] Configuring Git...
git remote remove origin 2>nul
git remote add origin %repo_url%

echo [2/4] Preparing files...
git add .
git commit -m "Force deploy for Render"

echo [3/4] Enforcing MAIN branch...
git branch -M main

echo [4/4] FORCE Pushing to GitHub...
echo (If asked to sign in, please do so)
git push -f origin main

echo.
echo ========================================================
echo   DONE!
echo   Go to Render -> Select 'main' branch -> Apply Blueprint
echo ========================================================
pause
