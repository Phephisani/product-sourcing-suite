@echo off
echo ========================================================
echo   Product Sourcing Suite - GitHub Auto-Deployer
echo ========================================================
echo.
echo This script will upload your code to GitHub automatically.
echo.

:: 1. Initialize Git if not already done
if not exist .git (
    echo [1/5] Initializing Git repository...
    git init
) else (
    echo [1/5] Git repository already ready.
)

:: 2. Add all files
echo [2/5] Adding all files to staging...
git add .

:: 3. Commit
echo [3/5] Committing files...
git commit -m "Initial Deployment for Render"

:: 4. Ask for Repo URL
echo.
echo ========================================================
echo ACTION REQUIRED:
echo 1. Go to https://github.com/new
echo 2. Name your repo (e.g., 'sourcing-suite')
echo 3. Click 'Create repository'
echo 4. Copy the HTTPS URL (it ends in .git)
echo ========================================================
echo.
set /p repo_url="Paste your GitHub Repository URL here: "

:: 5. Add Remote and Push
echo [4/5] Linking to GitHub...
git remote remove origin 2>nul
git remote add origin %repo_url%
git branch -M main

echo [5/5] Pushing to GitHub...
echo (A browser window may pop up asking you to sign in. Please allow it.)
git push -u origin main

echo.
echo ========================================================
echo   SUCCESS! Your code is now on GitHub.
echo   Now go to Render.com and connect this repository.
echo ========================================================
pause
