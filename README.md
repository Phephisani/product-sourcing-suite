# Product Sourcing Suite - Quick Start Guide

## Starting the Application

### Option 1: One-Click Startup (Recommended)
Double-click `start-servers.bat` in the root directory. This will:
- Start the Scraper Server on port 3001
- Start the Dashboard on port 5173
- Open both in separate command windows

### Option 2: Manual Startup
If you prefer to start them separately:

**Terminal 1 - Scraper Server:**
```bash
cd scraper-server
node server.js
```

**Terminal 2 - Dashboard:**
```bash
cd market-dashboard
npm run dev
```

## Accessing the Application

- **Dashboard**: http://localhost:5173
- **Scraper API**: http://localhost:3001

## Troubleshooting

### "Connection Refused" Error
This means one or both servers aren't running. Solutions:
1. Run `start-servers.bat` to start both servers
2. Check if port 5173 or 3001 is already in use
3. Restart the servers if they crashed

### Port Already in Use
If you see `EADDRINUSE` errors:
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Then restart the servers
```

## Features

### Takealot Products (Fully Supported)
- ✅ Product tracking with price history
- ✅ BSR and Category extraction
- ✅ Similar product recommendations
- ✅ Market intelligence metrics
- ✅ 1P vs 3P seller detection

### Amazon Products (Limited)
- ⚠️ Amazon.com blocks automated scraping
- ✅ Manual tracking supported
- ❌ Automatic data refresh not available
- 💡 Use Takealot for full intelligence features

## Market Intelligence Metrics

- **Est. Monthly Sales**: BSR-based sales velocity estimate
- **Listing Quality Score**: 100-point optimization score
- **Opportunity Score**: Market gap identification
- **1P vs 3P Share**: Platform vs seller distribution
