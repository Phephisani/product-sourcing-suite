/**
 * PROTECTED LOGIC - SCRAPER UTILS
 * Core estimation and scoring logic for marketplace intelligence.
 */

// Helper: Estimate Monthly Sales based on BSR (Rough estimate for SA market)
function estimateMonthlySales(bsr, category) {
    if (!bsr || bsr <= 0) return 0;
    // VERY rough heuristic for SA market
    if (bsr < 100) return Math.floor(500 + Math.random() * 200);
    if (bsr < 500) return Math.floor(200 + Math.random() * 100);
    if (bsr < 2000) return Math.floor(50 + Math.random() * 50);
    if (bsr < 10000) return Math.floor(10 + Math.random() * 20);
    return Math.floor(Math.random() * 5);
}

// Helper: Calculate Listing Quality Score (LQS) - Scale 1-10
function calculateLQS(data) {
    let score = 0;

    // Image Count (Target: 7+)
    if (data.imageCount >= 7) score += 2;
    else if (data.imageCount >= 3) score += 1;

    // Rating (Target: 4.5+)
    const rating = parseFloat(data.rating) || 0;
    if (rating >= 4.5) score += 2;
    else if (rating >= 4.0) score += 1;

    // Reviews (Target: 100+)
    const reviews = parseInt(data.reviewCount) || 0;
    if (reviews >= 1000) score += 2;
    else if (reviews >= 100) score += 1;

    // Bullet Points (Target: 5+)
    if (data.bulletPointsCount >= 5) score += 2;
    else if (data.bulletPointsCount >= 3) score += 1;

    // Title Length (Target: 150+ chars)
    if (data.title?.length >= 150) score += 2;
    else if (data.title?.length >= 80) score += 1;

    return Math.max(1, Math.min(10, score));
}

export {
    estimateMonthlySales,
    calculateLQS
};
