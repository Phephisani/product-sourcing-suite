import fetch from 'node-fetch';
import fs from 'fs';

async function saveFullResponse() {
    const plid = 'PLID90006504';
    const url = `https://api.takealot.com/rest/v-1-13-0/product-details/${plid}?platform=desktop`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const data = await response.json();
        fs.writeFileSync('takealot_full_api.json', JSON.stringify(data, null, 2));
        console.log('Saved to takealot_full_api.json');
    } catch (e) {
        console.error(e);
    }
}

saveFullResponse();
