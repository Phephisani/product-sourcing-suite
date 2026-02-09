import fetch from 'node-fetch';

async function test() {
    const url = 'https://www.takealot.com/portable-a4-thermal-printer-wireless-inkless-200dpi-label-maker/PLID98646766';
    console.log('Testing scraper for:', url);

    try {
        const res = await fetch('http://localhost:3001/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await res.json();
        console.log('Response Title:', data.title);
        console.log('Recommendations Found:', data.recommendations?.length || 0);
        if (data.recommendations?.length > 0) {
            console.log('First Recommendation:', data.recommendations[0].title);
        }
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
