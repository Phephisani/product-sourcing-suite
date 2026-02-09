// Quick test to see what Amazon shows us
async function testWithScreenshot() {
    const puppeteer = await import('puppeteer-extra');
    const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    puppeteer.default.use(StealthPlugin());

    const browser = await puppeteer.default.launch({
        headless: false, // Show the browser
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        console.log('Navigating to Amazon...');
        await page.goto('https://www.amazon.com/JBL-Quantum-100-Wired-Over-Ear-Gaming-Headset/dp/B08447VX1P', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('Taking screenshot...');
        await page.screenshot({ path: 'amazon-page.png', fullPage: true });
        console.log('Screenshot saved as amazon-page.png');

        // Check what we got
        const title = await page.title();
        console.log('Page title:', title);

    } catch (e) {
        console.error('Error:', e.message);
        await page.screenshot({ path: 'amazon-error.png' });
        console.log('Error screenshot saved as amazon-error.png');
    }

    console.log('Browser will stay open for 10 seconds for you to inspect...');
    await new Promise(r => setTimeout(r, 10000));
    await browser.close();
}

testWithScreenshot();
