import { useState } from "react"
import { useProductStore } from '@/lib/store';
import { scrapeProduct } from '@/lib/scraper-api';
import { calculateTakealotFees } from '@/lib/takealot-fees';
import {
    Plus,
    Search,
    Trash2,
    ExternalLink,
    RefreshCw,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    Star,
    Calculator,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductTracker() {
    const { products, addProduct, deleteProduct, updateProduct } = useProductStore()
    const [isAdding, setIsAdding] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
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
                promotion: data.promotion
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
                    bsr: data.bsr || undefined,
                    category: data.category || undefined,
                    soldBy: data.soldBy || undefined,
                    is1P: data.is1P,
                    imageCount: data.imageCount || undefined,
                    bulletPointsCount: data.bulletPointsCount || undefined
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

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.source.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
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

            {/* Product Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="glass-card group relative rounded-2xl overflow-hidden flex flex-col h-full ring-1 ring-white/10 hover:ring-emerald-500/50 transition-all duration-300">
                        {/* Status Header */}
                        {product.riskLevel && (
                            <div className={cn(
                                "absolute top-0 left-0 right-0 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-center shadow-lg backdrop-blur-md",
                                product.riskLevel === "Safe" ? "bg-emerald-500/20 text-emerald-400" :
                                    product.riskLevel === "Gated" ? "bg-rose-500/20 text-rose-400" :
                                        "bg-amber-500/20 text-amber-400"
                            )}>
                                {product.riskLevel === "Safe" ? "✓ Safe to Sell" : product.riskLevel === "Gated" ? "⚠ Gated / Restricted" : "⚠ IP Risk Detected"}
                            </div>
                        )}

                        {/* Image Area */}
                        <div className="aspect-[4/3] bg-white/5 p-4 relative overflow-hidden mt-6">
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
                        </div>

                        <div className="p-4 md:p-6 flex-1 flex flex-col space-y-4">
                            <div>
                                <h3 className="font-semibold text-white leading-tight mb-2 line-clamp-2 min-h-[2.5rem] text-sm md:text-base" title={product.name}>
                                    {product.name}
                                </h3>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xl font-bold text-white">
                                        {product.displayPrice || `R ${product.currentPrice.toFixed(2)}`}
                                    </span>
                                    {product.salesVelocity && (
                                        <span className="text-xs text-emerald-400 font-mono">
                                            ~{product.salesVelocity}/mo Sales
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Profit Calculator (Mini) */}
                            {product.fees && (
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

                            {/* AI Analysis Preview */}
                            {product.analysis && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                            AI Analysis
                                        </h4>
                                        <span className="text-[10px] text-white/50">{product.analysis.sentiment}/100 Score</span>
                                    </div>
                                    <div className="space-y-1">
                                        {product.analysis.pros.slice(0, 1).map((pro, i) => (
                                            <div key={i} className="flex gap-1.5 items-start text-[10px] text-zinc-400">
                                                <span className="text-emerald-500 mt-0.5">✓</span>
                                                {pro}
                                            </div>
                                        ))}
                                        {product.analysis.cons.slice(0, 1).map((con, i) => (
                                            <div key={i} className="flex gap-1.5 items-start text-[10px] text-zinc-400">
                                                <span className="text-rose-500 mt-0.5">✕</span>
                                                {con}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Review Insights */}
                            {product.reviewKeywords && product.reviewKeywords.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            Review Insights
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.reviewKeywords.map((kw, i) => (
                                            <span
                                                key={i}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/5 whitespace-nowrap"
                                                title={`${kw.count} mentions`}
                                            >
                                                {kw.word} <span className="text-zinc-500 ml-0.5 text-[9px]">({kw.count})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                                <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 text-xs font-medium text-muted-foreground hover:text-white flex items-center justify-center gap-1 py-1.5 hover:bg-white/5 rounded-lg transition-colors"
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
                                    {product.analysis ? "Re-Analyze" : "Scout"}
                                </button>

                                <button
                                    onClick={() => deleteProduct(product.id)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Stats Mini-grid (Restored for Takealot/Standard Data) */}
                            {(!product.analysis && (product.notes || product.rating)) && (
                                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5 border-dashed">
                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                        <div className="text-[10px] text-muted-foreground uppercase">Rating</div>
                                        <div className="text-xs font-medium text-white">
                                            {product.rating || product.notes?.match(/Rating: ([0-9.]+)/)?.[1] || '-'}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                        <div className="text-[10px] text-muted-foreground uppercase">Reviews</div>
                                        <div className="text-xs font-medium text-white">
                                            {product.reviewCount || product.notes?.match(/Reviews: ([0-9]+)/)?.[1] || '-'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recommendations Expand (Restored) */}
                        {product.recommendations && product.recommendations.length > 0 && (
                            <button
                                onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1 transition-colors border-t border-white/5"
                            >
                                Similar Items {expandedId === product.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                        )}

                        {expandedId === product.id && (
                            <div className="absolute inset-x-0 bottom-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-4 z-20 max-h-[80%] overflow-y-auto animate-in slide-in-from-bottom-10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${product.source === 'Takealot' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                {product.source}
                                            </span>
                                            {product.is1P && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-purple-500/20 text-purple-400">
                                                    {product.source === 'Takealot' ? 'Takealot' : 'Amazon'}
                                                </span>
                                            )}
                                            {product.promotion?.isOnPromotion && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse">
                                                    {product.promotion.dealTags[0] || 'DEAL'}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-white text-lg leading-tight mb-1">{product.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span>{product.category || 'Uncategorized'}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span>{product.rating || 'N/A'}</span>
                                                <span className="text-gray-500">({product.reviewCount || 0})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white mb-1 font-mono">
                                            {product.displayPrice}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {product.rank && (
                                                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Rank #{product.rank.toLocaleString()}
                                                </div>
                                            )}
                                            {product.estimatedFees && (
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Est. Success + Fulfillment Fees">
                                                    <Calculator className="w-3 h-3" />
                                                    Fees: R {product.estimatedFees.total.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {product.recommendations && (
                                    <>
                                        <div className="flex justify-between items-center mb-3 sticky top-0 bg-transparent">
                                            <h4 className="text-xs font-bold text-white uppercase">Recommendations</h4>
                                            <button onClick={() => setExpandedId(null)} className="text-muted-foreground hover:text-white"><ChevronDown className="h-4 w-4" /></button>
                                        </div>
                                        <div className="space-y-3">
                                            {product.recommendations.map((rec, i) => (
                                                <div key={i} className="flex gap-3 items-center bg-white/5 p-2 rounded-lg group/rec hover:bg-white/10 transition-colors">
                                                    <img src={rec.image} className="w-10 h-10 object-contain bg-white rounded flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-white line-clamp-1">{rec.title}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                            <span className="text-emerald-400 font-mono">{rec.price}</span>
                                                            <span>•</span>
                                                            <span>{rec.reviewCount} Reviews</span>
                                                            {rec.sellerCount && rec.sellerCount > 1 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-amber-400">{rec.sellerCount} Sellers</span>
                                                                </>
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
                                                            image: rec.image
                                                        })}
                                                        className="px-2 py-1 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded text-[10px] font-bold transition-all"
                                                    >
                                                        ADD
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {
                filteredProducts.length === 0 && !isAdding && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No products found</h3>
                        <p className="text-muted-foreground text-sm">Try adjusting your search or add a new product.</p>
                    </div>
                )
            }
        </div>
    )
}
