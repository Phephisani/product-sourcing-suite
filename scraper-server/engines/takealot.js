import fs from 'fs';
import { estimateMonthlySales, calculateLQS } from './utils.js';

/**
 * PROTECTED LOGIC - TAKEALOT SCRAPER ENGINE
 * Contains core logic for extracting Deep Intelligence metrics from Takealot.
 */

export async function scrapeTakealot(page) {
    try {
        await page.waitForSelector('.core, .product-title, h1', { timeout: 30000 });
        const url = page.url();
        const plidMatch = url.match(/PLID\d+/);

        if (plidMatch) {
            const plid = plidMatch[0];
            const apiUrl = `https://api.takealot.com/rest/v-1-13-0/product-details/${plid}?platform=desktop`;

            // Fetch product details and recommendations in parallel
            const result = await page.evaluate(async (plid, detailsUrl) => {
                try {
                    const headers = {
                        'accept': 'application/json, text/plain, */*',
                        'x-platform': 'desktop'
                    };
                    const [detailsRes, recsRes] = await Promise.all([
                        fetch(detailsUrl, { headers }).then(r => r.json()),
                        fetch(`https://api.takealot.com/rest/v-1-13-0/product-details/${plid}/recommendations?platform=desktop`, { headers }).then(r => r.json()).catch(() => ({ sections: [] }))
                    ]);

                    // Return both for processing and potential server-side logging
                    return { details: detailsRes, recommendations: recsRes };
                } catch (e) { return { error: e.message }; }
            }, plid, apiUrl);

            if (result && result.details && !result.details.error && result.details.core) {
                // Log result to a debug file to see why metrics might be missing
                fs.appendFileSync('scraper-debug.log', `--- ${new Date().toISOString()} ---\n` + JSON.stringify(result.details, null, 2) + '\n\n');

                const details = result.details;
                const core = details.core;
                const gallery = details.gallery || { images: [] };
                const firstItem = details.buybox?.items?.[0] || {};

                let image = (gallery.images && gallery.images[0]) || '';
                image = image.replace('{size}', 'full');
                const price = firstItem.price || 0;
                const unadjustedPrice = firstItem.unadjusted_price || 0;

                // Extract Promotion Info - Also check badges
                const promotions = details.promotions || [];
                const firstItemPromos = firstItem.promotions || [];
                const badges = details.badges?.items || [];
                const savingBadge = badges.find(b => b.type === 'saving');

                const allPromos = [...promotions, ...firstItemPromos];

                const promotion = {
                    isOnPromotion: allPromos.length > 0 || (unadjustedPrice > price) || !!savingBadge,
                    dealTags: [
                        ...allPromos.map(p => p.name || p.text),
                        savingBadge?.value
                    ].filter(Boolean),
                    savingsText: firstItem.savings_percentage ? `${firstItem.savings_percentage}% OFF` : (savingBadge?.value || '')
                };

                // Jungle Scout Style Metrics for Takealot
                const sellerCount = details.buybox?.total_offers_count || 1;
                const fulfillment = firstItem.seller?.name?.toLowerCase().includes('takealot') ? 'Takealot' : '3rd Party';

                // Specs for Dimensions/Weight
                const specs = details.product_information?.tabular_specifications?.[0]?.rows || [];
                const weightSpec = specs.find(r => r.name.toLowerCase().includes('weight'));
                const dimSpec = specs.find(r => r.name.toLowerCase().includes('dimensions'));

                const weight = weightSpec ? weightSpec.value : '--';
                const dimensions = dimSpec ? dimSpec.value : '--';

                // Process recommendations - handles multiple section structures
                let rawItems = [];
                if (result.recommendations?.sections) {
                    rawItems = result.recommendations.sections.flatMap(s => s.items || []);
                } else if (Array.isArray(result.recommendations)) {
                    rawItems = result.recommendations;
                }

                const recommendations = rawItems
                    .filter(item => item && item.plid)
                    .map(item => ({
                        title: item.title,
                        price: `R ${item.price}`,
                        image: (item.image_url || '').replace('{size}', 'full'),
                        url: `https://www.takealot.com/${item.slug}/${item.plid}`,
                        reviewCount: item.review_count?.toString() || '0',
                        rating: item.rating || '0'
                    })).slice(0, 10);

                const productData = {
                    title: core.title || '',
                    price: price,
                    priceText: price > 0 ? `R ${price}` : 'N/A',
                    image: image,
                    rating: details.rating || '0',
                    reviewCount: details.review_count?.toString() || '0',
                    category: core.category?.name || 'Unknown',
                    soldBy: firstItem.seller?.name || 'Takealot',
                    is1P: (firstItem.seller?.name || '').toLowerCase().includes('takealot'),
                    bsr: details.sales_rank || 0,
                    source: 'Takealot',
                    recommendations: recommendations,
                    promotion: promotion,
                    sellerCount,
                    fulfillment,
                    dimensions,
                    weight,
                    imageCount: gallery.images?.length || 0,
                    bulletPointsCount: (core.short_description || '').split('\n').filter(Boolean).length
                };

                const salesVelocity = estimateMonthlySales(productData.bsr, productData.category);
                const monthlyRevenue = salesVelocity * productData.price;

                return {
                    ...productData,
                    salesVelocity,
                    monthlyRevenue,
                    monthlyRevenueText: `R ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                    lqs: calculateLQS(productData)
                };
            }
        }

        // Final page-based fallback
        const data = await page.evaluate(() => {
            const getPrice = () => {
                const el = document.querySelector('.buybox-price, .price, [data-testid="price"]');
                return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : 0;
            };
            return {
                title: document.querySelector('h1')?.textContent?.trim() || 'Unknown',
                price: getPrice(),
                image: document.querySelector('img.gallery-image, [data-testid="product-image"]')?.src || '',
                rating: '0',
                reviewCount: '0'
            };
        });

        return {
            ...data,
            priceText: `R ${data.price}`,
            source: 'Takealot',
            recommendations: []
        };
    } catch (e) {
        return { error: "Failed to scrape Takealot", details: e.message };
    }
}

