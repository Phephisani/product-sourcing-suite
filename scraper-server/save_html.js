import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

async function saveHtml() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const url = 'https://www.takealot.com/portable-a4-thermal-printer-wireless-inkless-200dpi-label-maker/PLID98646766';

    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const html = await page.content();
    fs.writeFileSync('takealot_page.html', html);
    console.log('Saved HTML to takealot_page.html');

    await browser.close();
}

saveHtml();
