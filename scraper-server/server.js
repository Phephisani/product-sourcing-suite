import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use Stealth Plugin
puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 3001;
import fs from 'fs';
import path from 'path';
import { scrapeTakealot } from './engines/takealot.js';
import { scrapeAmazon } from './engines/amazon.js';

// Ensure data directory exists for centralized storage
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure history directory exists
const HISTORY_DIR = path.join(process.cwd(), 'history');
if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR);
}

// Helper for human-like delays
const delay = (ms) => new Promise(r => setTimeout(r, ms));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// HISTORY ENDPOINTS
app.get('/history/:id', (req, res) => {
    try {
        const { id } = req.params;
        const filePath = path.join(HISTORY_DIR, `${id}.json`);

        if (!fs.existsSync(filePath)) {
            return res.json([]); // Return empty array if no history yet
        }

        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading history:', error);
        res.status(500).json({ error: 'Failed to read history' });
    }
});

// DATA PERSISTENCE ENDPOINTS
app.get('/api/data/:collection', (req, res) => {
    try {
        const { collection } = req.params;
        const filePath = path.join(DATA_DIR, `${collection}.json`);

        if (!fs.existsSync(filePath)) {
            return res.json([]); // Return empty array if collection doesn't exist
        }

        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error(`Error reading collection ${req.params.collection}:`, error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/data/:collection', (req, res) => {
    try {
        const { collection } = req.params;
        const data = req.body;
        const filePath = path.join(DATA_DIR, `${collection}.json`);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        res.json({ success: true, collection });
    } catch (error) {
        console.error(`Error saving collection ${req.params.collection}:`, error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.post('/history/:id', (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = req.body; // Expect single snapshot object
        const filePath = path.join(HISTORY_DIR, `${id}.json`);

        let history = [];
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            history = JSON.parse(fileData);
        }

        // Add timestamp if not present
        if (!snapshot.date) {
            snapshot.date = new Date().toISOString();
        }

        history.push(snapshot);

        // Optional: Limit history size (e.g., last 365 entries)
        if (history.length > 365) {
            history = history.slice(-365);
        }

        fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
        res.json({ success: true, count: history.length });
    } catch (error) {
        console.error('Error saving history:', error);
        res.status(500).json({ error: 'Failed to save history' });
    }
});

app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Scraping URL: ${url}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        const page = await browser.newPage();

        // 1. Rotate User Agents for more realism
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
        ];
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        await page.setUserAgent(randomUA);

        // 2. Set realistic viewport (common resolutions)
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1536, height: 864 }
        ];
        const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
        await page.setViewport(randomViewport);

        // 3. Set Extra Headers to mimic real browser
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        });

        // 4. Random delay before navigating (2-4 seconds)
        console.log('Waiting before navigation...');
        await delay(Math.floor(Math.random() * 2000) + 2000);

        // 5. Navigate to page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // 6. Simulate human mouse movements
        console.log('Simulating mouse movements...');
        await page.mouse.move(100, 100);
        await delay(Math.floor(Math.random() * 500) + 300);
        await page.mouse.move(400, 300);
        await delay(Math.floor(Math.random() * 500) + 300);
        await page.mouse.move(800, 500);


        // 7. Realistic scrolling pattern (slow, with pauses)
        console.log('Scrolling like a human...');
        for (let i = 0; i < 8; i++) {
            await page.evaluate(() => window.scrollBy(0, 200));
            await delay(Math.floor(Math.random() * 800) + 400); // Random pause between scrolls
        }

        // Scroll to a natural reading position
        await page.evaluate(() => window.scrollTo(0, 600));

        // 8. Wait after scrolling (human reading time)
        await delay(Math.floor(Math.random() * 2000) + 2000);


        let data = {};

        if (url.includes('takealot.com')) {
            data = await scrapeTakealot(page);
        } else if (url.includes('amazon')) {
            data = await scrapeAmazon(page);
        } else {
            return res.status(400).json({ error: 'Only Takealot and Amazon are supported' });
        }

        console.log('Scraped Data Summary:', { title: data.title, recs: data.recommendations?.length || 0 });
        res.json(data);

    } catch (error) {
        console.error('Scraping Error:', error);
        res.status(500).json({ error: 'Failed to scrape product', details: error.message });
    } finally {
        if (browser) await browser.close();
    }
});



app.listen(PORT, () => {
    console.log(`Scraper Server running on http://localhost:${PORT}`);
});

