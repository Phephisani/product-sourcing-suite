import fetch from 'node-fetch';

async function testApi() {
    const plid = 'PLID90006504';
    const url = `https://api.takealot.com/rest/v-1-13-0/product-details/${plid}?platform=desktop`;

    console.log(`Testing API: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status}`);
            return;
        }

        const data = await response.json();

        if (data.buybox) {
            console.log('Buybox Prices:', data.buybox.prices);
            console.log('Buybox Pretty Price:', data.buybox.pretty_price);
        }

        if (data.core) {
            console.log('Title:', data.core.title);
            console.log('Images:', data.core.images);
        }

        if (data.reviews) {
            if (data.reviews.summary) {
                console.log('Reviews Summary:', data.reviews.summary);
            }
        }

    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testApi();
