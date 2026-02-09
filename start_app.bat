@echo off
echo Starting Product Sourcing Suite...

:: Start the Scraper Server in a new window
echo Starting Scraper Server (Port 3001)...
start "Scraper Server" cmd /k "cd scraper-server && node server.js"

:: Wait a moment for backend to initialize
timeout /t 3

:: Start the Market Dashboard in a new window
echo Starting Market Dashboard (Port 5173)...
start "Market Dashboard" cmd /k "cd market-dashboard && npm run dev"

echo.
echo Application started! 
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
echo.
echo Please leave these windows open while using the app.
pause
