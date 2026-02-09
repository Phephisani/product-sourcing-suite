@echo off
echo ========================================================
echo   DEPLOY TO MASTER SCRIPT
echo ========================================================
echo.
echo Render sees 'master', so we will give it 'master'.
echo.

set /p repo_url="Paste your GitHub Repository URL here: "

echo.
echo [1/4] Configuring Git...
git remote remove origin 2>nul
git remote add origin %repo_url%

echo [2/4] Preparing files...
git add .
git commit -m "Deploy to Master"

echo [3/4] Switching to MASTER...
git branch -M master

echo [4/4] Pushing to GitHub (MASTER)...
git push -f origin master

echo.
echo ========================================================
echo   DONE!
echo   Go to Render -> Select 'master' branch -> Apply Blueprint
echo ========================================================
pause
