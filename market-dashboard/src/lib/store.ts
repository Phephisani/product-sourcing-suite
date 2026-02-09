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
}

export interface Settings {
    userName: string
    refreshInterval: number // milliseconds
    currency: string
    theme: "dark" | "light"
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
            theme: "dark"
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

    // Persistence
    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products))
    }, [products])

    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings))
    }, [settings])

    useEffect(() => {
        localStorage.setItem("suppliers", JSON.stringify(suppliers))
    }, [suppliers])

    useEffect(() => {
        localStorage.setItem("sourcingCart", JSON.stringify(sourcingCart))
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
        removeFromCart
    }
}
