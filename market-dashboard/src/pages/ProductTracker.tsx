import { useState } from "react"
import { useProductStore } from '@/lib/store';
import { scrapeProduct } from '@/lib/scraper-api';
import { calculateTakealotFees } from '@/lib/takealot-fees';
import {
    Plus,
    Search,
    Trash2,
    ExternalLink,
    LayoutGrid,
    List,
    RefreshCw,
    Brain,
    Lock,
    Star,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeepIntelligenceOverlay } from '@/components/DeepIntelligenceOverlay';

export function ProductTracker() {
    const { products, addProduct, deleteProduct, updateProduct, settings, updateSettings } = useProductStore()
    const [isAdding, setIsAdding] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [platformFilter, setPlatformFilter] = useState<"All" | "Amazon" | "Takealot">("All")
    const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid")
    const [inspectingId, setInspectingId] = useState<string | null>(null)

    const [newProduct, setNewProduct] = useState({
        name: "",
        url: "",
        price: "",
        source: "Takealot" as "Amazon" | "Takealot" | "Other"
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSyncingAll, setIsSyncingAll] = useState(false)


    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = await scrapeProduct(newProduct.url); // Use newProduct.url for scraping

            if (data.error) {
                alert(`Error: ${data.error}. Make sure the URL is valid and the system is online.`);
                setIsSubmitting(false);
                return;
            }

            const fees = calculateTakealotFees(data.price || Number(newProduct.price), data.category);

            addProduct({
                name: data.title || newProduct.name,
                url: newProduct.url,
                currentPrice: data.price || Number(newProduct.price),
                displayPrice: data.priceText,
                source: newProduct.url.includes('takealot') ? 'Takealot' : (newProduct.url.includes('amazon') ? 'Amazon' : 'Other'),
                image: data.image || "https://placehold.co/100?text=Product",
                rank: data.bsr,
                category: data.category,
                soldBy: data.soldBy,
                is1P: data.is1P,
                reviewCount: data.reviewCount,
                rating: data.rating,
                recommendations: data.recommendations,
                estimatedFees: fees,
                promotion: data.promotion,
                salesVelocity: data.salesVelocity
            });
            setNewProduct({ name: "", url: "", price: "", source: "Takealot" });
            setIsAdding(false);
        } catch (err: any) {
            console.error(err);
            alert("Failed to connect to the scraper. Please ensure start-servers.bat is running.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFetchDetails = async (productId: string, url: string) => {
        if (settings.isIntelligenceLocked) {
            console.log("Intelligence is locked. Skipping sync.");
            return;
        }
        setLoadingId(productId)
        try {
            const data = await scrapeProduct(url)
            console.log("Scraped Data received in UI:", data);

            if (data.error || !data.title || data.title.includes('Oops!')) {
                updateProduct(productId, {
                    notes: `Sync failed: ${data.error || 'Invalid product data'}`
                })
            } else {
                updateProduct(productId, {
                    name: data.title || undefined,
                    currentPrice: data.price || undefined,
                    displayPrice: data.priceText || undefined,
                    image: data.image || undefined,
                    notes: `Synced: ${new Date().toLocaleTimeString()}`,
                    recommendations: data.recommendations || undefined,
                    rating: data.rating || undefined,
                    reviewCount: data.reviewCount || undefined,
                    bsr: typeof data.bsr === 'number' ? data.bsr : undefined,
                    category: data.category || undefined,
                    soldBy: data.soldBy || undefined,
                    is1P: data.is1P,
                    imageCount: data.imageCount || undefined,
                    bulletPointsCount: data.bulletPointsCount || undefined,
                    salesVelocity: data.salesVelocity || undefined,
                    promotion: data.promotion || undefined,
                    monthlyRevenue: data.monthlyRevenue || undefined,
                    monthlyRevenueText: data.monthlyRevenueText || undefined,
                    sellerCount: data.sellerCount || undefined,
                    fulfillment: data.fulfillment || undefined,
                    dimensions: data.dimensions || undefined,
                    weight: data.weight || undefined,
                    dateFirstAvailable: data.dateFirstAvailable || undefined,
                    lqs: data.lqs || undefined
                })
            }
        } catch (error) {
            updateProduct(productId, {
                notes: 'Failed to fetch details. Check scraper server.'
            })
        } finally {
            setLoadingId(null)
        }
    }
    const handleSyncAll = async () => {
        if (products.length === 0) return;
        setIsSyncingAll(true);
        for (const product of products) {
            await handleFetchDetails(product.id, product.url);
        }
        setIsSyncingAll(false);
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.source.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = platformFilter === "All" || p.source === platformFilter;
        return matchesSearch && matchesPlatform;
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    {/* Platform Filter */}
                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value as any)}
                        className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [&>option]:text-black"
                    >
                        <option value="All">All Platforms</option>
                        <option value="Takealot">Takealot Only</option>
                        <option value="Amazon">Amazon Only</option>
                    </select>
                    <div className="flex bg-black/20 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setViewLayout("grid")}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                viewLayout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewLayout("list")}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                viewLayout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Intelligence Lock Toggle */}
                    <button
                        onClick={() => updateSettings({ isIntelligenceLocked: !settings.isIntelligenceLocked })}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                            settings.isIntelligenceLocked
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                        )}
                    >
                        {settings.isIntelligenceLocked ? <Lock className="h-3 w-3" /> : <RefreshCw className="h-3 w-3 animate-spin-slow" />}
                        {settings.isIntelligenceLocked ? "Intel Locked" : "Intel Active"}
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleSyncAll}
                        disabled={isSyncingAll || products.length === 0}
                        className={cn(
                            "w-full sm:w-auto px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10",
                            isSyncingAll && "opacity-50 cursor-wait"
                        )}
                    >
                        <RefreshCw className={cn("h-4 w-4", isSyncingAll && "animate-spin")} />
                        {isSyncingAll ? "Syncing..." : "Sync All"}
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Add Product Form */}
            {isAdding && (
                <div className="glass-panel p-6 rounded-2xl animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Track New Product</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4 space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Product Name</label>
                            <input
                                placeholder="e.g. Philips Air Fryer"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Price (R)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={newProduct.price}
                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="md:col-span-4 space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">URL</label>
                            <input
                                placeholder="https://..."
                                value={newProduct.url}
                                onChange={e => setNewProduct({ ...newProduct, url: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Source</label>
                            <select
                                value={newProduct.source}
                                onChange={e => setNewProduct({ ...newProduct, source: e.target.value as any })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 [&>option]:text-black"
                            >
                                <option value="Takealot">Takealot</option>
                                <option value="Amazon">Amazon</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-12 flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-muted-foreground" disabled={isSubmitting}>Cancel</button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    isSubmitting && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                                {isSubmitting ? "Scraping..." : "Track Item"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product Grid/List */}
            <div className={cn(
                viewLayout === "grid"
                    ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "space-y-4"
            )}>
                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        className={cn(
                            "glass-card group relative rounded-2xl overflow-hidden flex ring-1 ring-white/10 hover:ring-emerald-500/50 transition-all duration-300",
                            viewLayout === "grid" ? "flex-col h-full" : "flex-row h-40"
                        )}
                    >
                        {/* Status Header (Only in Grid) */}
                        {viewLayout === "grid" && product.riskLevel && (
                            <div className={cn(
                                "absolute top-0 left-0 right-0 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-center shadow-lg backdrop-blur-md",
                                product.riskLevel === "Safe" ? "bg-emerald-500/20 text-emerald-400" :
                                    product.riskLevel === "Gated" ? "bg-rose-500/20 text-rose-400" :
                                        "bg-amber-500/20 text-amber-400"
                            )}>
                                {product.riskLevel === "Safe" ? "✓ Safe to Sell" : product.riskLevel === "Gated" ? "⚠ Gated / Restricted" : "⚠ IP Risk Detected"}
                            </div>
                        )}

                        {/* Deep Intelligence Overlay */}
                        {inspectingId === product.id && (
                            <DeepIntelligenceOverlay product={product} onClose={() => setInspectingId(null)} />
                        )}

                        {/* Image Area */}
                        <div
                            className={cn(
                                "bg-white/5 relative overflow-hidden group/img",
                                viewLayout === "grid" ? "aspect-[4/3] p-4 mt-6" : "w-40 p-4"
                            )}
                            onMouseEnter={() => setInspectingId(product.id)}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            />
                            <div className="absolute top-3 right-3">
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border",
                                    product.source === "Amazon" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                )}>
                                    {product.source}
                                </span>
                            </div>

                            {/* Deep Intelligence Badge */}
                            {(product.sellerCount || product.bsr) ? (
                                <div
                                    className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-md px-2 py-1 rounded-md border border-amber-500/30 group-hover:bg-amber-500/40 transition-all cursor-help z-10 shadow-lg shadow-amber-500/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setInspectingId(product.id);
                                    }}
                                >
                                    <Brain className="w-3 h-3 text-amber-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter">JS INTEL</span>
                                </div>
                            ) : (
                                <div
                                    className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-zinc-950/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/5 transition-all opacity-60 grayscale cursor-pointer hover:opacity-100 hover:grayscale-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFetchDetails(product.id, product.url);
                                    }}
                                    title="Click to sync and unlock JS Intel"
                                >
                                    <Brain className="w-3 h-3 text-zinc-400 group-hover:text-amber-500/50" />
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter group-hover:text-zinc-300">Sync Required</span>
                                </div>
                            )}
                        </div>

                        <div className={cn(
                            "p-4 flex-1 flex flex-col",
                            viewLayout === "grid" ? "md:p-6 space-y-4" : "flex-row gap-6 items-center"
                        )}>
                            <div className={viewLayout === "grid" ? "" : "flex-1 min-w-0"}>
                                <h3 className={cn(
                                    "font-semibold text-white leading-tight mb-2 line-clamp-2 min-h-[2.5rem] text-sm md:text-base",
                                    viewLayout === "list" && "min-h-0 text-lg"
                                )} title={product.name}>
                                    {product.name}
                                </h3>
                                <div className="flex items-baseline justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold text-white">
                                            {product.displayPrice || `R ${product.currentPrice.toFixed(2)}`}
                                        </span>
                                        {product.rating && (
                                            <div className="flex items-center gap-1 text-yellow-400 text-xs mt-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span>{product.rating}</span>
                                                <span className="text-muted-foreground">({product.reviewCount})</span>
                                            </div>
                                        )}
                                    </div>
                                    {product.salesVelocity && (
                                        <span className="text-xs text-emerald-400 font-mono">
                                            ~{product.salesVelocity}/mo Sales
                                        </span>
                                    )}
                                </div>
                                {product.promotion?.isOnPromotion && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {product.promotion.dealTags.map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/20 animate-pulse">
                                                {tag}
                                            </span>
                                        ))}
                                        {product.promotion.savingsText && (
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                                                {product.promotion.savingsText}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stats Area (BSR / Category) */}
                            <div className={cn(
                                "flex flex-wrap gap-2",
                                viewLayout === "list" && "hidden md:flex"
                            )}>
                                {product.bsr && (
                                    <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-zinc-400 border border-white/10">
                                        Rank: #{product.bsr.toLocaleString()}
                                    </span>
                                )}
                                {product.category && (
                                    <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-zinc-400 border border-white/10">
                                        {product.category}
                                    </span>
                                )}
                            </div>

                            {/* Profit Calculator (Mini) - Only in Grid for now to save space in List */}
                            {viewLayout === "grid" && product.fees && (
                                <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/5">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Est. Fees (FBA+Ref)</span>
                                        <span className="text-white">R {product.fees.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground w-8">Cost:</span>
                                        <input
                                            type="number"
                                            placeholder="Buy Price"
                                            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-emerald-500/50 outline-none"
                                            onChange={(e) => {
                                                const cost = parseFloat(e.target.value) || 0
                                                const fees = product.fees?.total || 0
                                                const profit = product.currentPrice - cost - fees
                                                const roi = cost > 0 ? (profit / cost) * 100 : 0

                                                updateProduct(product.id, {
                                                    profitability: { costPrice: cost, netProfit: profit, margin: 0, roi: roi }
                                                })
                                            }}
                                            value={product.profitability?.costPrice || ""}
                                        />
                                    </div>
                                    {product.profitability && product.profitability.costPrice > 0 && (
                                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                            <span className={cn("text-xs font-bold", product.profitability.netProfit > 0 ? "text-emerald-400" : "text-rose-400")}>
                                                Net: R {product.profitability.netProfit.toFixed(2)}
                                            </span>
                                            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", product.profitability.roi > 30 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white")}>
                                                {product.profitability.roi.toFixed(0)}% ROI
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className={cn(
                                "flex items-center gap-2 mt-auto pt-4 border-t border-white/5",
                                viewLayout === "list" && "border-none pt-0 mt-0"
                            )}>
                                <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 text-xs font-medium text-muted-foreground hover:text-white flex items-center justify-center gap-1 py-1.5 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Visit <ExternalLink className="h-3 w-3" />
                                </a>

                                <button
                                    onClick={() => handleFetchDetails(product.id, product.url)}
                                    disabled={loadingId === product.id}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors flex items-center gap-2 px-3",
                                        product.analysis ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    )}
                                >
                                    <RefreshCw className={cn("h-4 w-4", loadingId === product.id && "animate-spin")} />
                                    <span className="hidden sm:inline">Sync</span>
                                </button>

                                <button
                                    onClick={() => deleteProduct(product.id)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                {product.recommendations && product.recommendations.length > 0 && (
                                    <button
                                        onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium uppercase transition-colors",
                                            expandedId === product.id ? "bg-emerald-500 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        Similar {expandedId === product.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Recommendations Drawer (Grid mode overlay) */}
                        {expandedId === product.id && (
                            <div className="absolute inset-0 bg-zinc-950/98 backdrop-blur-xl z-30 p-4 overflow-y-auto animate-in fade-in zoom-in-95">
                                <div className="flex justify-between items-center mb-4 sticky top-0 bg-zinc-950/50 py-1 backdrop-blur-sm">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Similar Products</h4>
                                    <button onClick={() => setExpandedId(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                        <ChevronDown className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {product.recommendations?.map((rec, i) => (
                                        <div key={i} className="flex gap-3 items-center bg-white/5 p-2 rounded-lg group/rec hover:bg-emerald-500/10 transition-colors border border-white/5">
                                            <img src={rec.image} className="w-10 h-10 object-contain bg-white rounded flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-medium text-white line-clamp-1">{rec.title}</p>
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    <span className="text-emerald-400 font-mono">{rec.price}</span>
                                                    {rec.rating !== '0' && (
                                                        <span className="text-yellow-400 flex items-center gap-0.5">
                                                            ★{rec.rating}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addProduct({
                                                    name: rec.title,
                                                    url: rec.url,
                                                    currentPrice: parseFloat(rec.price.replace(/[^0-9.]/g, '')) || 0,
                                                    displayPrice: rec.price,
                                                    source: product.source,
                                                    image: rec.image,
                                                    reviewCount: rec.reviewCount,
                                                    rating: rec.rating
                                                })}
                                                className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded text-[10px] font-bold transition-all"
                                            >
                                                ADD
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && !isAdding && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No products found</h3>
                    <p className="text-muted-foreground text-sm">Try adjusting your search or add a new product.</p>
                </div>
            )}
        </div>
    )
}
