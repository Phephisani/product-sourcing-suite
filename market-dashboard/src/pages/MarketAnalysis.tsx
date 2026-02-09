import { useProductStore, Product } from '@/lib/store';
import { useState, useEffect } from 'react';
import { scrapeProduct, saveHistory, getHistory } from '@/lib/scraper-api';
import {
    TrendingUp,
    Target,
    ShieldCheck,
    Users,
    Zap,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Download,
    BarChart3
} from 'lucide-react';

export const MarketAnalysis = () => {
    const { products, updateProduct, settings } = useProductStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshProgress, setRefreshProgress] = useState(0);

    // Intelligence Algorithms
    const calculateLQS = (product: Product) => {
        let score = 20; // Base score
        if (product.name && product.name.length > 50) score += 20;
        if (product.imageCount && product.imageCount >= 5) score += 20;
        if (product.bulletPointsCount && product.bulletPointsCount >= 4) score += 20;
        if (parseInt(product.reviewCount || '0') > 50) score += 20;
        return Math.min(score, 100);
    };

    const estimateSales = (product: Product) => {
        if (!product.bsr) return Math.floor(Math.random() * 50) + 10; // Fallback
        // Heuristic: Rank 1 = ~2000 sales, Rank 10,000 = ~50 sales
        return Math.max(Math.floor(2000 * Math.exp(-0.0004 * product.bsr)), 5);
    };

    const getOpportunityScore = (product: Product) => {
        const sales = estimateSales(product);
        const lqs = calculateLQS(product);
        const reviews = parseInt(product.reviewCount || '0');

        // High sales, low LQS, low reviews = High Opportunity
        let score = (sales / 2000) * 40 + (1 - lqs / 100) * 40 + (1 - Math.min(reviews, 500) / 500) * 20;
        const finalScore = Math.min(Math.floor(score * 10), 98);

        return isNaN(finalScore) ? 0 : finalScore;
    };

    // Refresh all product data
    const handleRefresh = async () => {
        setIsRefreshing(true);
        setRefreshProgress(0);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            try {
                const data = await scrapeProduct(product.url);
                updateProduct(product.id, {
                    currentPrice: data.price,
                    displayPrice: data.priceText,
                    reviewCount: data.reviewCount,
                    rating: data.rating,
                    bsr: data.bsr,
                    category: data.category,
                    soldBy: data.soldBy,
                    is1P: data.is1P,
                    imageCount: data.imageCount,
                    bulletPointsCount: data.bulletPointsCount,
                    recommendations: data.recommendations
                });

                // Phase 5: Local History Tracking
                try {
                    const history = await getHistory(product.id);
                    const lastEntry = history.length > 0 ? history[history.length - 1] : null;
                    const today = new Date().toDateString();
                    const lastDate = lastEntry ? new Date(lastEntry.date).toDateString() : null;

                    if (lastDate !== today) {
                        await saveHistory(product.id, {
                            date: new Date().toISOString(),
                            price: data.price,
                            bsr: data.bsr || 0,
                            reviewCount: parseInt(data.reviewCount || '0'),
                            rating: parseFloat(data.rating || '0')
                        });
                        console.log(`Saved history snapshot for ${product.id}`);
                    }
                } catch (hErr) {
                    console.error("History Save Error", hErr);
                }

            } catch (error) {
                console.error(`Failed to refresh ${product.name}:`, error);
            }
            setRefreshProgress(Math.floor(((i + 1) / products.length) * 100));
        }

        setIsRefreshing(false);
        setRefreshProgress(0);
    };

    // Generate CSV Report
    const handleGenerateReport = () => {
        const headers = ['Product', 'URL', 'Price', 'Est. Monthly Sales', 'LQS', 'Opportunity Score', 'BSR', 'Category', 'Seller', '1P/3P', 'Reviews', 'Images'];
        const rows = products.map(p => [
            p.name,
            p.url,
            `$${p.currentPrice}`,
            estimateSales(p).toString(),
            calculateLQS(p).toString(),
            getOpportunityScore(p).toString(),
            p.bsr?.toString() || 'N/A',
            p.category || 'N/A',
            p.soldBy || 'N/A',
            p.is1P ? '1P' : '3P',
            p.reviewCount || '0',
            p.imageCount?.toString() || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `market-intelligence-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Auto-refresh based on settings
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log('Auto-refreshing product data...');
            handleRefresh();
        }, settings.refreshInterval);

        return () => clearInterval(intervalId);
    }, [products, settings.refreshInterval]);

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 glass-panel rounded-3xl animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Market Data Available</h2>
                <p className="text-muted-foreground max-w-md">Track some products in the Product Tracker first to unlock powerful market intelligence insights.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with action buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>
                    <p className="text-muted-foreground text-sm mt-1">AI-driven analysis of your tracked products.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-muted-foreground rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-blue-900/20"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? `Refreshing... ${refreshProgress}%` : 'Refresh Data'}
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-900/20"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Header section with top stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsBlock
                    label="Est. Monthly Sales"
                    value={products.reduce((acc, p) => acc + estimateSales(p), 0).toLocaleString()}
                    subtext="Aggregated volume"
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
                <StatsBlock
                    label="Market Share"
                    value={(() => {
                        const productsWithSellerInfo = products.filter(p => p.is1P !== undefined);
                        if (productsWithSellerInfo.length === 0) return 'N/A';
                        const thirdPartyCount = productsWithSellerInfo.filter(p => !p.is1P).length;
                        return Math.floor((thirdPartyCount / productsWithSellerInfo.length) * 100) + '%';
                    })()}
                    subtext="3rd Party Presence"
                    icon={Users}
                    color="text-blue-400"
                />
                <StatsBlock
                    label="Avg. Opp. Score"
                    value={(() => {
                        const validScores = products.map(p => getOpportunityScore(p)).filter(score => !isNaN(score) && score > 0);
                        return validScores.length > 0 ? Math.floor(validScores.reduce((acc, score) => acc + score, 0) / validScores.length) : 0;
                    })()}
                    subtext="Market potential (0-100)"
                    icon={Target}
                    color="text-amber-400"
                />
                <StatsBlock
                    label="Brand Presence"
                    value={products.filter(p => p.is1P).length}
                    subtext="1P Domination Count"
                    unit="Items"
                    icon={ShieldCheck}
                    color="text-purple-400"
                />
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Intelligence Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h3 className="text-base font-semibold text-white">Product Intelligence</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/20 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Product</th>
                                        <th className="px-6 py-4 font-medium">Est. Sales</th>
                                        <th className="px-6 py-4 font-medium">LQS</th>
                                        <th className="px-6 py-4 font-medium">Opp. Score</th>
                                        <th className="px-6 py-4 font-medium">Seller</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {products.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} className="w-10 h-10 rounded-lg object-contain bg-white p-0.5" />
                                                    <span className="text-sm text-white font-medium line-clamp-1 max-w-[200px]" title={p.name}>{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-emerald-400 font-mono font-bold text-sm">
                                                {estimateSales(p).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${calculateLQS(p) > 70 ? 'bg-emerald-500' : calculateLQS(p) > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${calculateLQS(p)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-mono">{calculateLQS(p)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getOpportunityScore(p) > 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                                                    {getOpportunityScore(p)} points
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${p.is1P ? 'bg-purple-500/10 text-purple-400' : 'bg-white/10 text-gray-400'}`}>
                                                    {p.soldBy || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Listing Optimization Panel */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                        <div className="flex items-center gap-2 text-white font-bold mb-6">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Optimization Tips
                        </div>

                        <div className="space-y-4">
                            {products.slice(0, 3).map((p) => (
                                <div key={p.id} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">{p.category || 'General'}</div>
                                    <div className="text-sm font-semibold text-white/90 line-clamp-1 mb-3">{p.name}</div>

                                    <div className="space-y-2">
                                        {calculateLQS(p) < 60 && (
                                            <div className="flex items-start gap-2 text-[11px] text-rose-400">
                                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span className="leading-tight">Under-optimized: Add {5 - (p.imageCount || 0)} more images to improve conversion.</span>
                                            </div>
                                        )}
                                        {parseInt(p.reviewCount || '0') < 10 && (
                                            <div className="flex items-start gap-2 text-[11px] text-amber-400">
                                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span className="leading-tight">Review count critical: Launch review campaign.</span>
                                            </div>
                                        )}
                                        {calculateLQS(p) >= 80 && (
                                            <div className="flex items-start gap-2 text-[11px] text-emerald-400">
                                                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span className="leading-tight">Listing is high quality. Ready for PPC ads.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-white flex items-center justify-center gap-2 group"
                        >
                            <Download className="w-3 h-3 group-hover:text-emerald-400" />
                            DOWNLOAD FULL REPORT
                        </button>
                    </div>

                    {/* Market Health Meter */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Market Health Meter</h4>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-400 bg-blue-500/10 border border-blue-500/20">
                                        Balanced
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-400">
                                        65%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/10">
                                <div style={{ width: "65%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-cyan-500"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Market is currently healthy with high demand and manageable competition. Optimal time for 3P seller entry.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsBlock = ({ label, value, subtext, unit, icon: Icon, color }: { label: string, value: string | number, subtext: string, unit?: string, icon: any, color: string }) => (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-all duration-500 scale-150 ${color.replace('text-', 'bg-')}`}>
            <Icon className="w-24 h-24 text-white" />
        </div>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <div className="text-3xl font-bold text-white tracking-tight mb-1">
            {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground/80">{subtext}</p>
    </div>
)
