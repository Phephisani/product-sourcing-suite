const SCRAPER_API = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

export async function scrapeProduct(url: string) {
    // HYBRID MODE: 
    // 1. Takealot -> Use real local scraper (restores original functionality)
    // 2. Amazon -> Use Smart Scout Mock (new features)

    // Use Real Scraper for all platforms
    try {
        console.log(`Scraping product: ${url}`);
        const response = await fetch(`${SCRAPER_API}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error('Failed to scrape product');
        }

        return await response.json();
    } catch (error) {
        console.error('Scraper API Error:', error);
        throw error;
    }
}

export async function getHistory(productId: string) {
    try {
        const response = await fetch(`${SCRAPER_API}/history/${productId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch history:', error);
        return [];
    }
}

export async function saveHistory(productId: string, data: any) {
    try {
        await fetch(`${SCRAPER_API}/history/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}
