import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use Stealth Plugin
puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
import fs from 'fs';
import path from 'path';

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


async function scrapeTakealot(page) {
    try {
        const url = await page.url();
        const plidMatch = url.match(/PLID[0-9]+/);

        if (plidMatch) {
            const plid = plidMatch[0];
            const apiUrl = `https://api.takealot.com/rest/v-1-11-0/product-details/${plid}?platform=desktop`;
            const apiRes = await page.evaluate(async (url) => {
                try {
                    const response = await fetch(url);
                    return await response.json();
                } catch (e) { return null; }
            }, apiUrl);

            if (apiRes && !apiRes.error && apiRes.core) {
                const core = apiRes.core;
                const gallery = apiRes.gallery || { images: [] };
                const firstItem = apiRes.buybox?.items?.[0] || {};

                let image = (gallery.images && gallery.images[0]) || '';
                image = image.replace('{size}', 'full');
                const price = firstItem.unadjusted_price || firstItem.price || 0;

                return {
                    title: core.title || '',
                    price: price,
                    priceText: price > 0 ? `R ${price}` : 'N/A',
                    image: image,
                    rating: apiRes.rating || '0',
                    reviewCount: apiRes.review_count?.toString() || '0',
                    category: core.category?.name || 'Unknown',
                    soldBy: firstItem.seller?.name || 'Takealot',
                    is1P: (firstItem.seller?.name || '').toLowerCase().includes('takealot'),
                    bsr: apiRes.sales_rank || 0,
                    source: 'Takealot',
                    recommendations: []
                };
            }
        }

        // Final page-based fallback if API fails
        const data = await page.evaluate(() => {
            const getPrice = () => {
                const el = document.querySelector('.buybox-price, .price, [data-testid="price"]');
                return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : 0;
            };
            return {
                title: document.querySelector('h1')?.textContent?.trim() || 'Unknown',
                price: getPrice(),
                image: document.querySelector('img.gallery-image')?.src || '',
                rating: '0',
                reviewCount: '0'
            };
        });

        return {
            ...data,
            priceText: `R ${data.price}`,
            source: 'Takealot',
            recommendations: []
        };
    } catch (e) {
        return { error: "Failed to scrape Takealot", details: e.message };
    }
}

// Helper: Extract Keywords
function extractKeywords(text) {
    if (!text) return [];

    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'it', 'for', 'with', 'on', 'that', 'this', 'my', 'as', 'was', 'but', 'not', 'are', 'have', 'be', 'very', 'good', 'great', 'product', 'buy', 'one', 'so', 'all', 'can', 'will', 'just', 'at', 'or', 'from', 'an', 'has', 'had', 'would', 'items', 'ordered', 'order', 'delivery', 'time', 'service', 'much', 'really', 'when', 'even', 'received', 'get', 'been', 'about', 'only', 'out', 'other', 'more', 'quality', 'bought', 'price', 'well', 'use', 'money', 'value', 'recommend', 'happy', 'purchase', 'fast', 'excellent', 'it’s', 'don’t', 'definitely']);

    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));

    const frequency = {};
    words.forEach(w => frequency[w] = (frequency[w] || 0) + 1);

    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
}

async function scrapeAmazon(page) {
    try {
        await page.waitForSelector('#productTitle, h1.product-title-word-break', { timeout: 30000 });

        const data = await page.evaluate(() => {
            const title = document.querySelector('#productTitle, h1.product-title-word-break')?.textContent?.trim() || '';
            const priceText = document.querySelector('.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice')?.textContent || '0';
            const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
            const image = document.querySelector('#landingImage, #imgBlkFront')?.src || '';
            const reviewCount = document.querySelector('#acrCustomerReviewText, #acrCustomerReviewLink')?.textContent || '0';
            const rating = document.querySelector('.a-icon-alt')?.textContent?.split(' ')[0] || '0';

            const merchantInfo = document.querySelector('#merchant-info, #sellerProfileTriggerId')?.textContent || '';
            let soldBy = 'Amazon';
            if (!merchantInfo.toLowerCase().includes('amazon')) {
                const match = merchantInfo.match(/Sold by\s+([^,]+)/i);
                if (match) soldBy = match[1].trim();
            }

            return { title, price, priceText, image, reviewCount, rating, soldBy };
        });

        return {
            ...data,
            is1P: data.soldBy.toLowerCase().includes('amazon'),
            source: 'Amazon'
        };
    } catch (e) {
        return { error: "Failed to parse Amazon page", details: e.message };
    }
}

app.listen(PORT, () => {
    console.log(`Scraper Server running on http://localhost:${PORT}`);
});

