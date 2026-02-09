import fetch from 'node-fetch';

async function test() {
    const url = 'https://www.takealot.com/onikuma-b100-wireless-gaming-headphones-with-mic-black/PLID95872818';
    console.log('Testing scraper for:', url);

    try {
        const res = await fetch('http://localhost:3001/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await res.json();
        console.log('--- MAIN PRODUCT ---');
        console.log('Title:', data.title);
        console.log('Price:', data.price);
        console.log('Review Count:', data.reviewCount);
        console.log('Rating:', data.rating);
        console.log('Sold By:', data.soldBy);
        console.log('Is 1P:', data.is1P);
        console.log('Promotion:', JSON.stringify(data.promotion, null, 2));

        console.log('\n--- RECOMMENDATIONS ---');
        console.log('Found:', data.recommendations?.length || 0);
        if (data.recommendations?.length > 0) {
            data.recommendations.slice(0, 3).forEach((rec, i) => {
                console.log(`[${i + 1}] ${rec.title.substring(0, 40)}... | R${rec.price} | Reviews: ${rec.reviewCount} | Seller: ${rec.soldBy}`);
            });
        }
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
