
// Landed Cost Calculator Types
export interface LandedCostCalculation {
    productCost: number;
    exchangeRate: number;
    shippingCost: number;
    duties: number;
    importVat: number;
    clearanceFees: number;
    totalLandedCost: number;
    breakEvenPrice: number;
    suggestedRetailPrice: number;
    targetMargin: number;
}

export interface Supplier {
    id: string;
    name: string;
    country: string;
    status: 'researching' | 'sample_ordered' | 'po_issued' | 'active' | 'inactive';
    updatedAt: string;
    ratings?: {
        quality: number;
        communication: number;
        price: number;
    };
    vetting?: {
        hasTradeAssurance: boolean;
        acceptsPaypal: boolean;
        isVerifiedManufacturer: boolean;
        samplesVerified: boolean;
    };
    catalogs?: Array<{
        id: string;
        name: string;
        type: "pdf" | "excel" | "other";
        url: string;
        dateAdded: string;
    }>;
    savedProducts?: Array<{
        id: string;
        name: string;
        price: number;
        moq: number;
        sku?: string;
        image?: string | null;
        dateAdded: string;
    }>;
}
