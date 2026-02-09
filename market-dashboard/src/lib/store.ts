/// <reference types="vite/client" />
import { useState, useEffect } from "react"

export interface Product {
    id: string
    name: string
    source: "Amazon" | "Takealot" | "Other"
    url: string
    currentPrice: number
    initialPrice: number
    displayPrice?: string
    rank?: number
    image?: string
    notes?: string
    dateAdded: string
    lastSynced?: string
    bsr?: number
    category?: string
    soldBy?: string
    is1P?: boolean
    imageCount?: number
    bulletPointsCount?: number
    reviewCount?: string
    rating?: string
    recommendations?: Array<{
        title: string
        price: string
        image: string
        url: string
        reviewCount: string
        rating?: string
        soldBy?: string
        is1P?: boolean
        sellerCount?: number
    }>

    // Phase 5: Takealot Intelligence
    estimatedFees?: {
        successFee: number
        fulfillmentFee: number
        storageFee: number
        total: number
    }
    promotion?: {
        isOnPromotion: boolean
        dealTags: string[] // e.g., "Daily Deal", "Unboxed Deal"
        savingsText?: string
    }

    // Smart Scout Features
    fees?: {
        referral: number
        fba: number
        total: number
    }
    profitability?: {
        costPrice: number
        netProfit: number
        margin: number
        roi: number
    }
    analysis?: {
        sentiment: number // 0-100
        pros: string[]
        cons: string[]
        lastUpdated: string
    }
    reviewKeywords?: Array<{
        word: string
        count: number
    }>
    riskLevel?: "Safe" | "Medium" | "High" | "Gated"
    salesVelocity?: number // Est. monthly sales
    monthlyRevenue?: number
    monthlyRevenueText?: string
    sellerCount?: number
    fulfillment?: string
    dimensions?: string
    weight?: string
    dateFirstAvailable?: string
    lqs?: number // Listing Quality Score
}

export interface Settings {
    userName: string
    refreshInterval: number // milliseconds
    currency: string
    theme: "dark" | "light"
    isIntelligenceLocked: boolean
}

export interface Supplier {
    id: string
    name: string
    contactPerson?: string
    email?: string
    phone?: string
    alibabaLink?: string
    website?: string
    status: "New" | "Contacted" | "Sample Ordered" | "Vetted" | "Blacklisted"
    notes?: string
    dateAdded: string
    products: string[] // IDs of products sourced from this supplier

    // New Feature: Supplier Scorecard
    ratings?: {
        quality: number // 1-5
        communication: number // 1-5
        price: number // 1-5
    }
    leadTime?: number // Average days

    // New Feature: Vetting Checklist
    vetting?: {
        hasTradeAssurance: boolean
        acceptsPaypal: boolean // specific payment method check
        isVerifiedManufacturer: boolean
        samplesVerified: boolean
    }

    // New Feature: Quote History
    quotes?: Array<{
        date: string
        productName: string
        moq: number
        unitPrice: number
        currency: string
    }>

    // New Feature: Product Catalog
    catalogs?: Array<{
        id: string
        name: string
        type: "pdf" | "excel" | "other"
        url: string
        dateAdded: string
    }>

    // Communication
    wechat?: string
    alibabaChatUrl?: string

    // Phase 5: Workflow Automation
    workflowStatus?: 'Researching' | 'Sample Requested' | 'Negotiating' | 'PO Issued' | 'Completed'
    savedProducts?: Array<{
        id: string
        name: string
        price: number
        moq: number
        sku?: string
        image?: string | null
        dateAdded: string
    }>
    orders?: Array<{
        id: string
        date: string
        status: 'Draft' | 'Sent' | 'Paid' | 'Shipped'
        totalAmount: number
        items: number
    }>
    location?: string // e.g. "Guangzhou, China"
}

export interface SourcingItem {
    id: string
    supplierId: string
    supplierName: string
    name: string
    reference?: string // SKU or Catalog Ref
    targetPrice?: number
    moq?: number
    image?: string
    status: "Selected" | "Inquiry Sent" | "Sample Ordered" | "Rejected"
    dateAdded: string
}

// Store Interface (Updated)
export function useProductStore() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    // Products State
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem("products")
        return saved ? JSON.parse(saved) : []
    })

    // Settings State
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem("settings")
        return saved ? JSON.parse(saved) : {
            userName: "Pheph",
            refreshInterval: 7200000, // 2 hours
            currency: "ZAR",
            theme: "dark",
            isIntelligenceLocked: true
        }
    })

    // Suppliers State
    const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
        const saved = localStorage.getItem("suppliers")
        return saved ? JSON.parse(saved) : []
    })

    // Sourcing Cart State
    const [sourcingCart, setSourcingCart] = useState<SourcingItem[]>(() => {
        const saved = localStorage.getItem("sourcingCart")
        return saved ? JSON.parse(saved) : []
    })

    // Cloud Sync State
    const [isSyncing, setIsSyncing] = useState(false)
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    // Helper: Sync to Server
    const syncToServer = async (collection: string, data: any) => {
        if (!isLoaded) return // Don't sync until we've finished initial load

        try {
            setIsSyncing(true)
            await fetch(`${API_URL}/api/data/${collection}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            setLastSyncTime(new Date())
        } catch (error) {
            console.error(`Sync error (${collection}):`, error)
        } finally {
            setIsSyncing(false)
        }
    }

    // Initial Load & Migration
    useEffect(() => {
        const loadAllData = async () => {
            console.log(`[Sync] Connecting to: ${API_URL}`);
            try {
                const collections = ['products', 'settings', 'suppliers', 'sourcingCart']

                for (const coll of collections) {
                    console.log(`[Sync] Checking ${coll}...`);
                    const res = await fetch(`${API_URL}/api/data/${coll}`)
                    const serverData = await res.json()

                    if (serverData && (Array.isArray(serverData) ? serverData.length > 0 : Object.keys(serverData).length > 0)) {
                        console.log(`[Sync] Found data on server for ${coll}.`);
                        if (coll === 'products') setProducts(serverData)
                        if (coll === 'settings') setSettings(serverData)
                        if (coll === 'suppliers') setSuppliers(serverData)
                        if (coll === 'sourcingCart') setSourcingCart(serverData)
                    } else {
                        console.log(`[Sync] Server ${coll} is empty. Checking local storage...`);
                        const localSaved = localStorage.getItem(coll)
                        if (localSaved) {
                            const localData = JSON.parse(localSaved)
                            if (localData && (Array.isArray(localData) ? localData.length > 0 : Object.keys(localData).length > 0)) {
                                console.warn(`[Sync] MIGRATING ${coll} TO CLOUD...`);
                                const pushRes = await fetch(`${API_URL}/api/data/${coll}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(localData)
                                })
                                if (pushRes.ok) {
                                    console.log(`[Sync] SUCCESS: ${coll} migrated to cloud.`);
                                } else {
                                    console.error(`[Sync] FAILED to migrate ${coll}. Status: ${pushRes.status}`);
                                }
                            }
                        }
                    }
                }
                setIsLoaded(true)
                console.log(`[Sync] Full synchronization complete.`);
            } catch (error) {
                console.error("[Sync] ERROR during initial load:", error)
                setIsLoaded(true)
            }
        }
        loadAllData()
    }, [])

    // Persistence to LocalStorage (as fallback) and Server
    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products))
        syncToServer('products', products)
    }, [products])

    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings))
        syncToServer('settings', settings)
    }, [settings])

    useEffect(() => {
        localStorage.setItem("suppliers", JSON.stringify(suppliers))
        syncToServer('suppliers', suppliers)
    }, [suppliers])

    useEffect(() => {
        localStorage.setItem("sourcingCart", JSON.stringify(sourcingCart))
        syncToServer('sourcingCart', sourcingCart)
    }, [sourcingCart])

    // Product Actions
    const addProduct = (product: Omit<Product, "id" | "dateAdded" | "initialPrice">) => {
        const newProduct: Product = {
            ...product,
            id: Math.random().toString(36).substr(2, 9),
            dateAdded: new Date().toISOString(),
            initialPrice: product.currentPrice
        }
        setProducts(prev => [newProduct, ...prev])
    }

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id))
    }

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }

    // Settings Actions
    const updateSettings = (updates: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...updates }))
    }

    const clearAllData = () => {
        if (confirm("Are you sure you want to delete all tracked products and suppliers? This cannot be undone.")) {
            setProducts([])
            setSuppliers([])
            setSourcingCart([])
        }
    }

    const importData = (importedProducts: Product[]) => {
        setProducts(prev => [...importedProducts, ...prev])
    }

    // Supplier Actions
    const addSupplier = (supplier: Omit<Supplier, "id" | "dateAdded" | "products">) => {
        const newSupplier: Supplier = {
            ...supplier,
            id: Math.random().toString(36).substr(2, 9),
            dateAdded: new Date().toISOString(),
            products: []
        }
        setSuppliers(prev => [newSupplier, ...prev])
    }

    const updateSupplier = (id: string, updates: Partial<Supplier>) => {
        setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    }

    const deleteSupplier = (id: string) => {
        setSuppliers(prev => prev.filter(s => s.id !== id))
    }

    // Sourcing Cart Actions
    const addToCart = (item: Omit<SourcingItem, "id" | "dateAdded" | "status">) => {
        const newItem: SourcingItem = {
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            dateAdded: new Date().toISOString(),
            status: "Selected"
        }
        setSourcingCart(prev => [newItem, ...prev])
    }

    const updateCartItem = (id: string, updates: Partial<SourcingItem>) => {
        setSourcingCart(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
    }

    const removeFromCart = (id: string) => {
        setSourcingCart(prev => prev.filter(i => i.id !== id))
    }

    return {
        products,
        addProduct,
        deleteProduct,
        updateProduct,
        settings,
        updateSettings,
        clearAllData,
        importData,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        sourcingCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        isSyncing,
        lastSyncTime,
        apiUrl: API_URL
    }
}
