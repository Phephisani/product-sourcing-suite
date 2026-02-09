import { estimateMonthlySales, calculateLQS } from './utils.js';

/**
 * PROTECTED LOGIC - AMAZON SCRAPER ENGINE
 * Contains core logic for extracting Deep Intelligence metrics from Amazon.
 */

export async function scrapeAmazon(page) {
    try {
        await page.waitForSelector('#productTitle, h1.product-title-word-break', { timeout: 30000 });

        const data = await page.evaluate(() => {
            const title = document.querySelector('#productTitle, h1.product-title-word-break')?.textContent?.trim() || '';
            const priceText = document.querySelector('.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice')?.textContent || '0';
            const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

            // Robust Image Extraction (Amazon)
            const imgSelectors = [
                '#landingImage',
                '#imgBlkFront',
                '#main-image',
                '#ebooks-img-canvas img',
                '#img-canvas img',
                '.a-dynamic-image',
                '#magnifierCanvas img',
                '[data-action="main-image-click"] img'
            ];

            let image = '';
            for (const selector of imgSelectors) {
                const el = document.querySelector(selector);
                if (el) {
                    const dataHires = el.getAttribute('data-old-hires') || el.getAttribute('data-a-dynamic-image') || el.getAttribute('src');
                    if (dataHires && dataHires.startsWith('{')) {
                        try {
                            const urls = Object.keys(JSON.parse(dataHires));
                            image = urls[urls.length - 1]; // Use highest res
                        } catch (e) { image = el.src; }
                    } else if (dataHires) {
                        image = dataHires;
                    }
                    if (image && !image.includes('pixel') && !image.includes('transparent')) break;
                }
            }
            // Fallback: Check all images if still empty
            if (!image) {
                const allImgs = Array.from(document.querySelectorAll('img'));
                const largeImg = allImgs.find(img => img.width > 200 && !img.src.includes('pixel'));
                image = largeImg ? largeImg.src : '';
            }

            const reviewCountText = document.querySelector('#acrCustomerReviewText, #acrCustomerReviewLink')?.textContent || '0';
            const reviewCount = reviewCountText.replace(/[^0-9]/g, '');

            const ratingText = document.querySelector('.a-icon-alt, #acrCustomerReviewText')?.textContent || '0';
            const rating = ratingText.match(/([0-9.]+)[ ]*out of/)?.[1] || '0';

            const merchantInfo = document.querySelector('#merchant-info, #sellerProfileTriggerId')?.textContent || '';
            let soldBy = 'Amazon';
            if (!merchantInfo.toLowerCase().includes('amazon')) {
                const match = merchantInfo.match(/Sold by\s+([^,]+)/i);
                if (match) soldBy = match[1].trim();
            }

            // Extract BSR and Category
            const detailsText = document.body.innerText;
            const bsrMatch = detailsText.match(/#([0-9,]+)\s+in\s+([^s(]+)/i);
            const bsr = bsrMatch ? parseInt(bsrMatch[1].replace(/,/g, '')) : 0;
            const category = bsrMatch ? bsrMatch[2].trim() : 'Unknown';

            // New JS Metrics: Sellers, Fulfillment, Dimensions, Date
            const sellerCountMsg = document.querySelector('#olp_feature_div, .olp-text-link')?.textContent || '';
            const sellersMatch = sellerCountMsg.match(/([0-9]+)/);
            const sellerCount = sellersMatch ? parseInt(sellersMatch[1]) : 1;

            const isFBA = !!document.querySelector('#SSO_FBALabel, #fbaUpsellFeature');
            const fulfillment = isFBA ? 'FBA' : (soldBy.toLowerCase().includes('amazon') ? 'AMZ' : 'FBM');

            // Product Dimensions/Weight
            const dimMatch = detailsText.match(/([0-9.]+ x [0-9.]+ x [0-9.]+)\s*(inches|cm|mm)?/i);
            const weightMatch = detailsText.match(/([0-9.]+)\s*(pounds|ounces|kg|grams|g)/i);
            const dimensions = dimMatch ? dimMatch[0] : '--';
            const weight = weightMatch ? weightMatch[0] : '--';

            const dateMatch = detailsText.match(/Date First Available[ \t:]+([^;\n]+)/i);
            const dateFirstAvailable = dateMatch ? dateMatch[1].trim() : '--';

            return {
                title, price, priceText, image, reviewCount, rating, soldBy, bsr, category,
                sellerCount, fulfillment, dimensions, weight, dateFirstAvailable
            };
        });

        const salesVelocity = estimateMonthlySales(data.bsr, data.category);
        const monthlyRevenue = salesVelocity * data.price;

        return {
            ...data,
            is1P: data.soldBy.toLowerCase().includes('amazon'),
            source: 'Amazon',
            salesVelocity,
            monthlyRevenue,
            monthlyRevenueText: `R ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            recommendations: [],
            lqs: calculateLQS({ ...data, imageCount: 0, bulletPointsCount: 0 }) // Basic LQS for Amazon fallback
        };
    } catch (e) {
        return { error: "Failed to parse Amazon page", details: e.message };
    }
}
