import { SourcingItem } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Scale, Info, TrendingUp, AlertCircle, Calculator } from "lucide-react";
import { useState } from "react";

interface SourcingComparisonProps {
    items: SourcingItem[];
    onClose: () => void;
}

export function SourcingComparison({ items, onClose }: SourcingComparisonProps) {
    const [exchangeRate, setExchangeRate] = useState(19.2); // Current USD/ZAR
    const [standardDuty, setStandardDuty] = useState(15);
    const [shippingOption, setShippingOption] = useState<'air' | 'sea'>('air');

    // Landed Cost Formula logic (simplified for comparison)
    const calculateLandedCost = (usdPrice: number, moq: number) => {
        const zarPrice = usdPrice * exchangeRate;
        const shippingRate = shippingOption === 'air' ? 120 : 35; // R/kg approx or simplified per unit logic
        const shipping = shippingRate; // Placeholder logic
        const duties = zarPrice * (standardDuty / 100);
        const vat = (zarPrice + shipping + duties) * 1.1 * 0.15; // VAT on (Base + 10%)
        const clearance = 150 / moq; // Shared across MOQ

        return zarPrice + shipping + duties + vat + clearance;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col p-4 md:p-8">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Scale className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Deep Match Comparison</h2>
                        </div>
                        <p className="text-muted-foreground">Detailed specimen analysis for profitability in the South African market.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-bold"
                    >
                        ESC TO CLOSE
                    </button>
                </div>

                {/* Global Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block tracking-widest">Exchange Rate (USD/ZAR)</label>
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">R</span>
                            <input
                                type="number"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(Number(e.target.value))}
                                className="bg-transparent border-none text-2xl font-bold text-white w-full focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block tracking-widest">Est. Duty Rate (%)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={standardDuty}
                                onChange={(e) => setStandardDuty(Number(e.target.value))}
                                className="bg-transparent border-none text-2xl font-bold text-white w-full focus:outline-none text-blue-400"
                            />
                            <span className="text-blue-400 font-bold">%</span>
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.02] col-span-1 md:col-span-2 flex items-center justify-between">
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block tracking-widest">Global Shipping Method</label>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setShippingOption('air')}
                                    className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", shippingOption === 'air' ? "bg-emerald-500 text-white" : "bg-white/5 text-muted-foreground")}
                                >
                                    AIR FREIGHT (Express)
                                </button>
                                <button
                                    onClick={() => setShippingOption('sea')}
                                    className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", shippingOption === 'sea' ? "bg-emerald-500 text-white" : "bg-white/5 text-muted-foreground")}
                                >
                                    SEA FREIGHT (LCL)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison Matrix */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-6 pb-8 h-full min-w-max">
                        {items.map((item) => {
                            const landedCost = calculateLandedCost(item.targetPrice || 0, item.moq || 1);
                            const profitMargin = 30; // Placeholder target
                            const suggestedRetail = landedCost / (1 - profitMargin / 100);

                            return (
                                <div key={item.id} className="w-[340px] flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-right-10">
                                    {/* Item Head */}
                                    <div className="p-6 bg-white/[0.05] border-b border-white/5 relative">
                                        <div className="aspect-square w-full bg-white rounded-xl mb-4 p-4 flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 font-bold">IMAGE</div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-white line-clamp-2 min-h-[3.5rem]">{item.name}</h3>
                                        <p className="text-sm text-emerald-400 font-semibold">{item.supplierName}</p>
                                    </div>

                                    {/* Spec Grid */}
                                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">FOB Price</span>
                                                <div className="text-xl font-mono font-bold text-white">${item.targetPrice}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Min. MOQ</span>
                                                <div className="text-xl font-mono font-bold text-white">{item.moq} units</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-6">
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Calculator className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-sm font-medium text-white">Landed Cost (ZAR)</span>
                                                </div>
                                                <span className="text-xl font-mono font-bold text-emerald-400">R{landedCost.toFixed(2)}</span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Base (ZAR)</span>
                                                    <span>R{(item.targetPrice || 0 * exchangeRate).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Duties & VAT</span>
                                                    <span className="text-blue-400">R{(landedCost - (item.targetPrice || 0 * exchangeRate)).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-6">
                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                                Market Projection
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                                <div className="text-xs text-blue-400 font-bold uppercase mb-1">Suggested Retail</div>
                                                <div className="text-2xl font-mono font-bold text-white">R{suggestedRetail.toFixed(2)}</div>
                                                <p className="text-[9px] text-blue-300 mt-2 italic leading-relaxed">
                                                    Calculated at {profitMargin}% gross margin based on current exchange and duty levels.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                                                <AlertCircle className="w-3 h-3" />
                                                Negotiation Note
                                            </div>
                                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                                Supplier is a verified manufacturer. Target reduction: <span className="text-white font-bold">5-8%</span> possible if MOQ is doubled.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Foot */}
                                    <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/20">
                                        <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
                                            PROCEED WITH THIS SAMPLE
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
