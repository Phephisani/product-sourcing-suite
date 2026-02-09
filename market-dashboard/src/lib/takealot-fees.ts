export interface TakealotFees {
    successFee: number;
    fulfillmentFee: number;
    storageFee: number;
    total: number;
}

// 2024/2025 Standard Fee Schedule (Simplified for MVP)
// Source: Average estimation based on typical categories
const SUCCESS_FEES: Record<string, number> = {
    'Electronics': 0.08,    // 8%
    'Home & Kitchen': 0.10, // 10%
    'Toys': 0.10,           // 10%
    'Beauty': 0.12,         // 12%
    'Books': 0.10,          // 10%
    'Fashion': 0.15,        // 15%
    'default': 0.10         // 10% average fallback
};

export function calculateTakealotFees(price: number, category: string = 'default'): TakealotFees {
    // 1. Success Fee (Commission)
    // Find roughly matching category key
    const foundKey = Object.keys(SUCCESS_FEES).find(k =>
        category.toLowerCase().includes(k.toLowerCase())
    ) || 'default';

    const feeRate = SUCCESS_FEES[foundKey];
    const successFee = price * feeRate;

    // 2. Fulfillment Fee (Weight-based - Simplified)
    // Assuming "Standard Small/Medium" parcel for most sourced items
    const fulfillmentFee = 45.00; // R45 flat approx for standard items

    // 3. Storage Fee (Monthly - Simplified)
    // Assuming fast turnover, minimal storage cost per unit
    const storageFee = 5.00;

    // Total
    // Note: VAT is usually on top of these services, but sticking to net cost for simplicity or gross depending on seller preference
    // We will treat these as VAT inclusive for simpler "profit in hand" calc
    const total = successFee + fulfillmentFee + storageFee;

    return {
        successFee,
        fulfillmentFee,
        storageFee,
        total
    };
}
