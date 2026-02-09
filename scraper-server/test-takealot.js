async function test() {
    const url = 'https://www.takealot.com/front-row-kids-bike-seat/PLID73061331';
    console.log(`Testing scraper for: ${url}`);

    try {
        const response = await fetch('http://localhost:3001/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        console.log('--- FULL SCRAPER DATA ---');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

test();
