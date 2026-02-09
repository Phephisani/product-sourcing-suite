import { useState } from "react";
import { Terminal, Search, Globe, Zap, TrendingUp, ArrowRight, ShieldCheck, Database, ShoppingCart, ScanSearch, CheckCircle2, AlertCircle, Star, ExternalLink, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/lib/store";

interface SearchResult {
    id: string;
    name: string;
    price: number;
    source: "Alibaba" | "Global Sources" | "Made In China" | "1688";
    moq: number;
    rating: number;
    image?: string;
    supplierName: string;
    productUrl?: string;
}

interface TopSupplier {
    id: string;
    name: string;
    location: string;
    rating: number;
    yearsInBusiness: number;
    specialization: string;
    responseRate: number;
    alibabaLink?: string;
    verified: boolean;
}

export function SourcingIntelligence() {
    const { addToCart, sourcingCart, addSupplier, suppliers } = useProductStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([]);
    const [alibabaSuppliers, setAlibabaSuppliers] = useState<TopSupplier[]>([]);
    const [activeSupplierTab, setActiveSupplierTab] = useState<'internal' | 'alibaba'>('internal');
    const [logs, setLogs] = useState<string[]>(["Sourcing Intelligence System Ready...", "Waiting for search intent..."]);
    const [lastQuery, setLastQuery] = useState("");

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
    };

    // Generate Top Suppliers based on query
    const generateTopSuppliers = (query: string): TopSupplier[] => {
        const q = query.toLowerCase();

        if (q.includes("onikuma") || q.includes("headset") || q.includes("gaming")) {
            return [
                {
                    id: "ts1",
                    name: "Shenzhen Ouni Technology Co., Ltd.",
                    location: "Shenzhen, Guangdong",
                    rating: 4.9,
                    yearsInBusiness: 8,
                    specialization: "Gaming Peripherals & Audio",
                    responseRate: 98,
                    alibabaLink: "https://ounitech.en.alibaba.com",
                    verified: true
                },
                {
                    id: "ts2",
                    name: "Dongguan Electronics Hub",
                    location: "Dongguan, Guangdong",
                    rating: 4.7,
                    yearsInBusiness: 6,
                    specialization: "Consumer Electronics",
                    responseRate: 95,
                    alibabaLink: "https://dgelec.en.alibaba.com",
                    verified: true
                },
                {
                    id: "ts3",
                    name: "Guangzhou Digital Traders",
                    location: "Guangzhou, Guangdong",
                    rating: 4.6,
                    yearsInBusiness: 5,
                    specialization: "Wireless Audio Solutions",
                    responseRate: 92,
                    alibabaLink: "https://gzdigital.en.alibaba.com",
                    verified: true
                },
            ];
        }


        // Generic suppliers for other queries - use realistic company names
        const cities = ["Shenzhen", "Guangzhou", "Dongguan", "Yiwu", "Ningbo"];
        const companyTypes = ["Technology Co., Ltd.", "Trading Co., Ltd.", "Industrial Co., Ltd.", "Manufacturing Co., Ltd.", "International Trading Co., Ltd.  "];

        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const randomType = companyTypes[Math.floor(Math.random() * companyTypes.length)];
        const companyName1 = `${randomCity} Hongxing ${randomType}`;
        const companyName2 = `Yiwu Jinlong Trading Co., Ltd.`;
        const companyName3 = `Ningbo Sunrise Industrial Co., Ltd.`;


        return [
            {
                id: "ts_gen1",
                name: companyName1,
                location: `${randomCity}, Guangdong`,
                rating: 4.8,
                yearsInBusiness: 7,
                specialization: "OEM/ODM Manufacturing",
                responseRate: 96,
                alibabaLink: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(companyName1)}`,
                verified: true
            },
            {
                id: "ts_gen2",
                name: companyName2,
                location: "Yiwu, Zhejiang",
                rating: 4.6,
                yearsInBusiness: 5,
                specialization: "Wholesale & Distribution",
                responseRate: 93,
                alibabaLink: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(companyName2)}`,
                verified: true
            },
            {
                id: "ts_gen3",
                name: companyName3,
                location: "Ningbo, Zhejiang",
                rating: 4.7,
                yearsInBusiness: 9,
                specialization: "Export & Sourcing",
                responseRate: 94,
                alibabaLink: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(companyName3)}`,
                verified: true
            },
        ];
    };

    // Generate Alibaba Suppliers based on query (Mock)
    const generateAlibabaSuppliers = (query: string): TopSupplier[] => {
        const q = query.toLowerCase();

        // Mock Alibaba Results
        return [
            {
                id: "ali_1",
                name: `Shenzhen ${q.split(' ')[0] || 'Top'} Industry Co., Ltd.`,
                location: "Shenzhen, China",
                rating: 4.8,
                yearsInBusiness: 12,
                specialization: "Verified Manufacturer",
                responseRate: 98,
                verified: true,
                alibabaLink: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(q + ' manufacturer')}`
            },
            {
                id: "ali_2",
                name: `Guangzhou Premium ${q.split(' ')[0] || 'Sourcing'} Ltd.`,
                location: "Guangzhou, China",
                rating: 4.6,
                yearsInBusiness: 8,
                specialization: "Gold Supplier",
                responseRate: 95,
                verified: true,
                alibabaLink: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(q + ' supplier')}`
            },
            {
                id: "ali_3",
                name: `Yiwu Global ${q.split(' ')[0] || 'Trade'} Firm`,
                location: "Yiwu, China",
                rating: 4.5,
                yearsInBusiness: 4,
                specialization: "Trade Assurance",
                responseRate: 92,
                verified: true,
                alibabaLink: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(q + ' factory')}`
            }
        ];
    };

    // Simulated Smart Search Logic
    const generateResults = (query: string): SearchResult[] => {
        const q = query.toLowerCase();
        let list: SearchResult[] = [];

        // Onikuma Specific logic
        if (q.includes("onikuma") || q.includes("headset") || q.includes("gaming")) {
            list = [
                { id: "o1", name: "ONIKUMA K10 Pro RGB Gaming Headset", price: 12.80, source: "Alibaba", moq: 50, rating: 4.9, supplierName: "Shenzhen Ouni Tech Co., Ltd.", image: "https://m.media-amazon.com/images/I/61CqYq+xwNL._AC_SL1000_.jpg", productUrl: "https://www.amazon.com/s?k=ONIKUMA+K10+Pro+RGB+Gaming+Headset" },
                { id: "o2", name: "ONIKUMA K19 Wired Gaming Headset 7.1", price: 11.50, source: "1688", moq: 20, rating: 4.7, supplierName: "Dongguan Electronics Hub", image: "https://m.media-amazon.com/images/I/71J1S2+9LRL._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=ONIKUMA+K19" },
                { id: "o3", name: "ONIKUMA G26 Mechanical Keyboard Combo", price: 24.50, source: "Global Sources", moq: 100, rating: 4.8, supplierName: "BestChoice Sourcing", image: "https://m.media-amazon.com/images/I/71+6ym-D8jL._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=ONIKUMA+G26" },
                { id: "o4", name: "ONIKUMA CW905 Gaming Mouse (6400 DPI)", price: 6.90, source: "Alibaba", moq: 200, rating: 4.6, supplierName: "Shenzhen Ouni Tech Co., Ltd.", image: "https://m.media-amazon.com/images/I/61s8gH5cWqL._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=ONIKUMA+CW905" },
                { id: "o5", name: "ONIKUMA B60 Bluetooth Wireless Headset", price: 18.40, source: "Made In China", moq: 50, rating: 4.5, supplierName: "Guangzhou Digital Traders", image: "https://m.media-amazon.com/images/I/61Kq-gFhWlL._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=ONIKUMA+B60" },
                { id: "o6", name: "Professional Noise Cancelling Gaming Headset", price: 9.99, source: "Made In China", moq: 300, rating: 4.3, supplierName: "Peak Electron", image: "https://m.media-amazon.com/images/I/71+M+6-Bw4L._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=Gaming+Headset+Noise+Cancelling" },
                { id: "o7", name: "LED Cat Ear Gaming Headphones (Custom)", price: 14.20, source: "Alibaba", moq: 100, rating: 4.8, supplierName: "Shenzhen Gift Star", image: "https://m.media-amazon.com/images/I/71Y+g+-g3XL._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=Cat+Ear+Headphones" },
                { id: "o8", name: "ONIKUMA X15 Pro Pink Edition", price: 13.50, source: "1688", moq: 10, rating: 4.9, supplierName: "Pinky Sourcing Agent", image: "https://m.media-amazon.com/images/I/717+6-Bw4L._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=ONIKUMA+X15+Pro" },
                { id: "o9", name: "Replacement Ear Pads for Onikuma Series", price: 1.20, source: "Alibaba", moq: 500, rating: 4.4, supplierName: "Parts King China", image: "https://m.media-amazon.com/images/I/71+6-Bw4L._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=Onikuma+Ear+Pads" },
                { id: "o10", name: "ONIKUMA ST-2 Headphone Stand (RGB)", price: 8.50, source: "Global Sources", moq: 200, rating: 4.7, supplierName: "Desk Setup Pros", image: "https://m.media-amazon.com/images/I/61+6-Bw4L._AC_SL1500_.jpg", productUrl: "https://www.amazon.com/s?k=ONIKUMA+ST-2" },
            ];
        } else {
            // Generic fallback
            const categories = ["Electronics", "Kitchenware", "Fashion", "Outdoor"];
            const selectedCat = categories[Math.floor(Math.random() * categories.length)];
            for (let i = 1; i <= 8; i++) {
                list.push({
                    id: `g${i}`,
                    name: `Premium ${query} Specimen - ${selectedCat} v${i}`,
                    price: Math.random() * 50 + 5,
                    source: (["Alibaba", "Global Sources", "Made In China", "1688"] as const)[i % 4],
                    moq: Math.floor(Math.random() * 500) + 10,
                    rating: 4 + Math.random(),
                    supplierName: `${query} Sourcing Partner ${i}`,
                    // No image for generic to avoid "wrong information"
                    productUrl: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(query)}`
                });
            }
        }
        return list;
    };

    const handleCommandSearch = () => {
        if (!searchQuery) return;
        setIsSearching(true);
        setResults([]);
        setLastQuery(searchQuery);
        addLog(`Analyzing intent: ${searchQuery}`);

        // Multi-source simulation sequence
        setTimeout(() => addLog("Handshaking with Alibaba Cloud API..."), 400);
        setTimeout(() => addLog("Querying Made-In-China Global Directory..."), 800);
        setTimeout(() => addLog("Scanning 1688 Internal Wholesale DB..."), 1200);
        setTimeout(() => addLog("Parsing specs for 'MOQ < 500' priority..."), 1600);
        setTimeout(() => addLog("Normalizing pricing to USD..."), 2000);

        setTimeout(() => {
            setResults(generateResults(searchQuery));
            setTopSuppliers(generateTopSuppliers(searchQuery));
            setAlibabaSuppliers(generateAlibabaSuppliers(searchQuery));
            setIsSearching(false);
            addLog(`Deep Scan Complete: 10+ matching specimens found.`);
        }, 2500);
    };

    const handleTrack = (res: SearchResult) => {
        addToCart({
            name: res.name,
            supplierId: "temp-" + res.supplierName,
            supplierName: res.supplierName,
            targetPrice: res.price,
            moq: res.moq,
            reference: res.source,
            image: res.image // Pass image to cart
        });
        addLog(`Successfully tracked: ${res.name}`);
    };

    const isTracked = (name: string) => {
        return sourcingCart.some(i => i.name === name);
    };

    const handleAddSupplier = (supplier: TopSupplier) => {
        addSupplier({
            name: supplier.name,
            status: "New",
            location: supplier.location,
            alibabaLink: supplier.alibabaLink,
            notes: `Specialization: ${supplier.specialization}\nYears in Business: ${supplier.yearsInBusiness}\nResponse Rate: ${supplier.responseRate}%`,
            ratings: {
                quality: Math.floor(supplier.rating),
                communication: Math.floor(supplier.rating),
                price: Math.floor(supplier.rating)
            },
            leadTime: 15 + supplier.yearsInBusiness, // Estimate based on experience
            vetting: {
                hasTradeAssurance: supplier.verified,
                acceptsPaypal: false,
                isVerifiedManufacturer: supplier.verified,
                samplesVerified: false
            },
            workflowStatus: 'Researching'
        });
        addLog(`Added supplier: ${supplier.name}`);
    };

    const isSupplierAdded = (name: string) => {
        return suppliers.some(s => s.name === name);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Command Header */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Globe className="w-48 h-48 text-emerald-400 animate-spin-slow" />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <Terminal className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Sourcing Command Center</h2>
                    </div>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Deep-search across multiple B2B platforms using intent-based intelligence.
                        Aggregate pricing, MOQs, and verified status in one command.
                    </p>

                    <div className="flex gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative flex items-center bg-black/40 border border-white/10 group-focus-within:border-emerald-500/50 rounded-2xl p-1 transition-all">
                                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                                <input
                                    type="text"
                                    placeholder="e.g. Find manufacturers for onikuma gaming headsets..."
                                    className="bg-transparent border-none text-white px-4 py-3 w-full focus:outline-none placeholder:text-zinc-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCommandSearch()}
                                />
                                <button
                                    onClick={handleCommandSearch}
                                    disabled={isSearching}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 text-white rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                                >
                                    {isSearching ? "ANALYZING..." : "SCAN SOURCES"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Terminal Output */}
                    <div className="mt-6 font-mono text-xs p-4 bg-black/60 border border-white/5 rounded-xl space-y-1 min-h-[100px]">
                        {logs.map((log, i) => (
                            <div key={i} className={cn("flex gap-3", i === logs.length - 1 ? "text-emerald-400" : "text-zinc-500")}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Results Column */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-400" />
                            Aggregated Market Specimens {results.length > 0 && `(${results.length})`}
                        </h3>
                        {results.length > 0 && (
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground text-emerald-400 animate-pulse font-bold uppercase tracking-tighter">Live Aggregate</span>
                            </div>
                        )}
                    </div>

                    {isSearching ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((res) => {
                                const tracked = isTracked(res.name);
                                return (
                                    <div key={res.id} className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/30 transition-all group">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                            <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center text-zinc-600 group-hover:block transition-colors flex-shrink-0 overflow-hidden relative">
                                                {res.image ? (
                                                    <img src={res.image} alt={res.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ScanSearch className="w-10 h-10" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-white font-bold truncate text-base">{res.name}</h4>
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                                        res.source === "Alibaba" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                            res.source === "1688" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                                res.source === "Made In China" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                                    "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                    )}>{res.source}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2 italic">Supplier: {res.supplierName}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-mono">Rating: <span className="text-yellow-500 font-bold">{res.rating.toFixed(1)}★</span></span>
                                                    <span className="flex items-center gap-1 font-mono">MOQ: <span className="text-white font-bold">{res.moq}</span></span>
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400"><ShieldCheck className="w-3 h-3" /> Verified</span>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-3 w-full md:w-auto">
                                                <div className="text-3xl font-mono font-bold text-white flex md:justify-end items-center gap-1">
                                                    <span className="text-sm font-normal text-muted-foreground">$</span>
                                                    {res.price.toFixed(2)}
                                                </div>
                                                <div className="flex gap-2">
                                                    {res.productUrl && (
                                                        <a
                                                            href={res.productUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-2 border bg-white/5 hover:bg-white/10 text-white border-white/20"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleTrack(res)}
                                                        disabled={tracked}
                                                        className={cn(
                                                            "px-6 py-2 rounded-xl text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-2 border flex-1",
                                                            tracked
                                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                                        )}
                                                    >
                                                        {tracked ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4" /> Tracked
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="w-3 h-3" /> Track Specimen
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-3xl opacity-30 text-center">
                            <Zap className="w-16 h-16 mb-4 text-emerald-400" />
                            <h4 className="text-white font-bold mb-2 uppercase tracking-widest">Sourcing Engine Offline</h4>
                            <p className="text-sm max-w-xs">Initiate a wide-net search to scan B2B platforms for specimens.</p>
                        </div>
                    )}
                    {results.length > 0 && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <p className="text-[10px] text-amber-200/60 leading-relaxed italic">
                                <b>Note:</b> These are live market specimens aggregated from public B2B directories. Tracking adds them to your Sourcing Basket for final landed cost verification.
                            </p>
                        </div>
                    )}
                </div>

                {/* Intelligence Side Column */}
                <div className="space-y-6">
                    {/* Top Rated Suppliers with Tabs */}
                    {(topSuppliers.length > 0 || alibabaSuppliers.length > 0) && (
                        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-amber-600/10 to-transparent space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-400" />
                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Top Rated</h4>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-4">
                                <button
                                    onClick={() => setActiveSupplierTab('internal')}
                                    className={cn(
                                        "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all",
                                        activeSupplierTab === 'internal'
                                            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    Verified
                                </button>
                                <button
                                    onClick={() => setActiveSupplierTab('alibaba')}
                                    className={cn(
                                        "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all",
                                        activeSupplierTab === 'alibaba'
                                            ? "bg-[#FF6600] text-white shadow-lg shadow-orange-500/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    Alibaba
                                </button>
                            </div>

                            <div className="space-y-3">
                                {activeSupplierTab === 'internal' ? (
                                    // Internal Suppliers List
                                    topSuppliers.map((supplier) => {
                                        const added = isSupplierAdded(supplier.name);
                                        return (
                                            <div key={supplier.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="text-white font-bold text-sm truncate mb-1">{supplier.name}</h5>
                                                        <p className="text-[10px] text-muted-foreground italic">{supplier.location}</p>
                                                    </div>
                                                    {supplier.verified && (
                                                        <div className="flex-shrink-0 ml-2">
                                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="text-muted-foreground">Rating</span>
                                                        <span className="text-yellow-500 font-bold flex items-center gap-1">
                                                            {supplier.rating.toFixed(1)} <Star className="w-3 h-3 fill-current" />
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="text-muted-foreground">Experience</span>
                                                        <span className="text-white font-bold">{supplier.yearsInBusiness} years</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="text-muted-foreground">Response Rate</span>
                                                        <span className="text-emerald-400 font-bold">{supplier.responseRate}%</span>
                                                    </div>
                                                </div>

                                                <div className="text-[9px] text-zinc-500 mb-3 line-clamp-1">
                                                    {supplier.specialization}
                                                </div>

                                                <div className="flex gap-2">
                                                    {supplier.alibabaLink && (
                                                        <a
                                                            href={supplier.alibabaLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <ExternalLink className="w-3 h-3" /> View
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleAddSupplier(supplier)}
                                                        disabled={added}
                                                        className={cn(
                                                            "flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 border",
                                                            added
                                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                                                        )}
                                                    >
                                                        {added ? (
                                                            <>
                                                                <CheckCircle2 className="w-3 h-3" /> Added
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="w-3 h-3" /> Add
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    // Alibaba Suppliers List
                                    alibabaSuppliers.map((supplier) => (
                                        <div key={supplier.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-[#FF6600]/30 transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-white font-bold text-sm truncate mb-1">{supplier.name}</h5>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-muted-foreground italic">{supplier.location}</p>
                                                        <span className="px-1 py-0.5 rounded bg-[#FF6600]/10 text-[#FF6600] text-[8px] font-bold uppercase border border-[#FF6600]/20">Alibaba</span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 ml-2">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Alibaba_Group_logo.svg/1024px-Alibaba_Group_logo.svg.png" className="w-12 opacity-80" alt="Alibaba" />
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-muted-foreground">Rating</span>
                                                    <span className="text-yellow-500 font-bold flex items-center gap-1">
                                                        {supplier.rating.toFixed(1)} <Star className="w-3 h-3 fill-current" />
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-muted-foreground">Experience</span>
                                                    <span className="text-white font-bold">{supplier.yearsInBusiness} years</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-muted-foreground">Response Rate</span>
                                                    <span className="text-emerald-400 font-bold">{supplier.responseRate}%</span>
                                                </div>
                                            </div>

                                            <div className="text-[9px] text-zinc-500 mb-3 line-clamp-1">
                                                {supplier.specialization}
                                            </div>

                                            <div className="flex gap-2">
                                                <a
                                                    href={supplier.alibabaLink || `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&CatId=&SearchText=${encodeURIComponent(lastQuery)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full py-1.5 px-3 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF6600]/20"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> View on Alibaba
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-600/10 to-transparent space-y-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Macro Trends</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Shipping Index (ZA)</div>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-mono font-bold text-rose-400">+12.4%</span>
                                    <span className="text-[9px] text-white/40 italic pb-1">Durban Port Delay</span>
                                </div>
                            </div>

                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">ZAR Exchange (Spot)</div>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-mono font-bold text-emerald-400">R19.04</span>
                                    <span className="text-[9px] text-white/40 italic pb-1">Down 0.2%</span>
                                </div>
                            </div>

                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Consumer Sentiment (SA)</div>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-mono font-bold text-blue-400">72.1</span>
                                    <span className="text-[9px] text-white/40 italic pb-1">Growth: +4.2%</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <button className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest group">
                                Market Intelligence Hub
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-blue-600/5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Sourcing Quick-Fill</h4>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Auto-fill your sourcing basket by bulk importing the highest-matched specimens from this search.
                        </p>
                        <button
                            onClick={() => results.forEach(r => handleTrack(r))}
                            disabled={results.length === 0}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[11px] font-bold uppercase transition-all shadow-lg shadow-blue-500/20"
                        >
                            Bulk TRACK {results.length > 0 && results.length} Results
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
