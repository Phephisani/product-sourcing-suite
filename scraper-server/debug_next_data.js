import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

async function debug() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const url = 'https://www.takealot.com/portable-a4-thermal-printer-wireless-inkless-200dpi-label-maker/PLID98646766';

    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const nextData = await page.evaluate(() => {
        const el = document.getElementById('__NEXT_DATA__');
        return el ? JSON.parse(el.innerText) : null;
    });

    if (nextData) {
        fs.writeFileSync('next_data_dump.json', JSON.stringify(nextData, null, 2));
        console.log('Dumped __NEXT_DATA__ to next_data_dump.json');

        try {
            const pods = nextData.props?.pageProps?.initialState?.productDetails?.pods || [];
            console.log('Found pods:', pods.map(p => ({ title: p.title, pod_type: p.pod_type })));

            const youMightLikePod = pods.find(p => p.pod_type === 'recommendations' && p.title === 'You Might Also Like');
            if (youMightLikePod) {
                console.log('Found You Might Also Like Pod!');
                console.log('Products count:', youMightLikePod.data?.products?.length || 0);
            } else {
                console.log('You Might Also Like pod NOT found in productDetails.pods');
                // Check if it's elsewhere
                const findRecommendations = (obj, path = '') => {
                    if (!obj || typeof obj !== 'object') return;
                    if (obj.pod_type === 'recommendations') {
                        console.log('Found recommendations pod at:', path);
                    }
                    Object.keys(obj).forEach(k => findRecommendations(obj[k], path + '.' + k));
                };
                findRecommendations(nextData);
            }
        } catch (e) {
            console.error('Error traverse nextData:', e);
        }
    } else {
        console.log('__NEXT_DATA__ not found');
    }

    await browser.close();
}

debug();
