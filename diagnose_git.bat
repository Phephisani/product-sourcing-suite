@echo off
echo ========================================================
echo   DIAGNOSTIC SCRIPT
echo ========================================================
echo Running git checks... > diagnosis.log 2>&1

echo [GIT VERSION] >> diagnosis.log 2>&1
git --version >> diagnosis.log 2>&1

echo. >> diagnosis.log
echo [GIT REMOTE] >> diagnosis.log 2>&1
git remote -v >> diagnosis.log 2>&1

echo. >> diagnosis.log
echo [GIT STATUS] >> diagnosis.log 2>&1
git status >> diagnosis.log 2>&1

echo. >> diagnosis.log
echo [PUSH TEST - MAIN] >> diagnosis.log 2>&1
git push origin main --dry-run >> diagnosis.log 2>&1

echo. >> diagnosis.log
echo [PUSH TEST - MASTER] >> diagnosis.log 2>&1
git push origin master --dry-run >> diagnosis.log 2>&1

echo.
echo ========================================================
echo   DIAGNOSIS COMPLETE.
echo   I have created a file called 'diagnosis.log'.
echo   Please ask the AI to read it.
echo ========================================================
pause
