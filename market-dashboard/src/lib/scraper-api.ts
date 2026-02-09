const SCRAPER_API = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

export async function scrapeProduct(url: string) {
    // HYBRID MODE: 
    // 1. Takealot -> Use real local scraper (restores original functionality)
    // 2. Amazon -> Use Smart Scout Mock (new features)

    if (url.includes('takealot.com') || url.includes('takealot')) {
        try {
            console.log("Using Real Scraper for Takealot...");
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

    // AMAZON / OTHER SMART SCOUT MOCK
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Randomize success/fail (mostly success)
    const isSuccess = Math.random() > 0.1;
    if (!isSuccess) throw new Error("Connection timed out. Please try again.");

    // Generate Mock Data
    const price = 450 + Math.floor(Math.random() * 2000);
    const fees = {
        referral: Math.floor(price * 0.15),
        fba: Math.floor(80 + Math.random() * 50),
        total: 0 // calculated below
    }
    fees.total = fees.referral + fees.fba;

    const riskLevel = Math.random() > 0.8 ? "High" : Math.random() > 0.9 ? "Gated" : "Safe";

    return {
        title: "Premium Amazon Product (Simulated) - High Rated",
        price: price,
        priceText: `R ${price.toFixed(2)}`,
        image: `https://placehold.co/400?text=Amazon+Item+${Math.floor(Math.random() * 100)}`,
        rating: (3 + Math.random() * 2).toFixed(1),
        reviewCount: Math.floor(Math.random() * 5000).toString(),

        // Smart Scout Data
        fees: fees,
        riskLevel: riskLevel,
        salesVelocity: Math.floor(Math.random() * 500), // Est. monthly sales

        analysis: {
            sentiment: Math.floor(60 + Math.random() * 40),
            pros: [
                "Excellent battery life (40h+)",
                "Quality materials",
                "Fast shipping"
            ],
            cons: [
                "Slightly expensive",
                "Packaging could be better",
                "Manual is unclear"
            ],
            lastUpdated: new Date().toISOString()
        }
    };
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
