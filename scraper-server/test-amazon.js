async function testAmazonScraper() {
    const url = 'https://www.amazon.com/JBL-Quantum-100-Wired-Over-Ear-Gaming-Headset/dp/B08447VX1P'; // Standard JBL Quantum 100
    console.log(`Testing scraper for Amazon: ${url}`);

    try {
        const response = await fetch('http://localhost:3001/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        // console.log('Scraped Data:', JSON.stringify(data, null, 2));

        if (data.error) {
            console.error('Error:', data.error, data.details);
        } else {
            console.log('Verification:');
            console.log('- Title:', data.title);
            console.log('- BSR:', data.bsr);
            console.log('- Category:', data.category);
            console.log('- Recommendations Count:', data.recommendations?.length || 0);
            console.log('- Sold By:', data.soldBy);
            console.log('- Bullet Points:', data.bulletPointsCount);
        }
    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

testAmazonScraper();
