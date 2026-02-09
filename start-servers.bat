@echo off
echo ========================================
echo Starting Product Sourcing Suite
echo ========================================
echo.

echo [1/2] Starting Scraper Server on port 3001...
start "Scraper Server" cmd /k "cd scraper-server && node server.js"
timeout /t 2 /nobreak >nul

echo [2/2] Starting Dashboard on port 5173...
start "Dashboard" cmd /k "cd market-dashboard && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo Dashboard:      http://localhost:5173
echo Scraper API:    http://localhost:3001
echo ========================================
echo.
echo Press any key to exit this window...
echo (The servers will continue running in their own windows)
pause >nul
