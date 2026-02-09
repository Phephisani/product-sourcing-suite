@echo off
echo ========================================================
echo   FINAL FIX DEPLOYMENT SCRIPT
echo ========================================================
echo.
echo We are going to push to BOTH 'main' and 'master' to be 100%% sure.
echo.

set /p repo_url="Paste your GitHub Repository URL here: "

echo.
echo [1/5] checking for render.yaml...
if exist render.yaml (
    echo FOUND render.yaml!
) else (
    echo ERROR: render.yaml is MISSING!
    pause
    exit
)

echo.
echo [2/5] Force configuring Git...
git init
git remote remove origin 2>nul
git remote add origin %repo_url%

echo.
echo [3/5] Adding and Committing files...
git add .
git commit -m "Final Fix Deploy"

echo.
echo [4/5] Pushing to MAIN...
git push -f origin main

echo.
echo [5/5] Pushing to MASTER...
git push -f origin HEAD:master

echo.
echo ========================================================
echo   DONE!
echo   1. Go to Render
echo   2. You can now choose EITHER 'main' or 'master'
echo   3. Click Apply
echo ========================================================
pause
