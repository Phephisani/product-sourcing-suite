import { Info, Brain, ExternalLink } from 'lucide-react';
import { Product } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * PROTECTED LOGIC - DEEP INTELLIGENCE OVERLAY
 * This component contains critical business intelligence formatting and logic.
 * Please do not modify the layout or metrics without explicit verification.
 */

interface DeepIntelligenceOverlayProps {
    product: Product;
    onClose: () => void;
}

export const DeepIntelligenceOverlay = ({ product, onClose }: DeepIntelligenceOverlayProps) => {
    if (!product) return null;

    return (
        <div
            className="absolute inset-0 z-[100] bg-zinc-950 border border-white/10 p-4 md:p-6 overflow-y-auto animate-in fade-in zoom-in duration-300 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onMouseLeave={onClose}
        >
            <div className="flex flex-col h-full text-zinc-200">
                {/* Header Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-zinc-900 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">BSR</span>
                        <span className="text-sm font-bold text-amber-500">#{product.bsr?.toLocaleString() || '--'}</span>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Mo. Revenue</span>
                        <span className="text-sm font-bold text-emerald-500">{product.monthlyRevenueText || '--'}</span>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Units Sold</span>
                        <span className="text-sm font-bold text-sky-500">{product.salesVelocity || '--'}</span>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Price</span>
                        <span className="text-sm font-bold text-white font-mono">{product.displayPrice || `R ${product.currentPrice.toFixed(2)}`}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 flex-1">
                    {/* Sidebar Details */}
                    <div className="w-full md:w-1/2 space-y-4">
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                            <Info className="w-3 h-3 text-amber-500/80" />
                            Product Details
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3 text-xs">
                            <span className="text-zinc-500">Sellers:</span>
                            <span className="text-white text-right font-mono">{product.sellerCount || '1'}</span>

                            <span className="text-zinc-400 font-medium">Fulfillment:</span>
                            <span className={cn(
                                "text-right font-bold",
                                (product.fulfillment === 'FBA' || product.fulfillment === 'Takealot') ? "text-amber-400" : "text-zinc-400"
                            )}>{product.fulfillment || 'FBM'}</span>

                            <span className="text-zinc-500">Dimensions:</span>
                            <span className="text-white text-right truncate pl-2">{product.dimensions || '--'}</span>

                            <span className="text-zinc-500">Weight:</span>
                            <span className="text-white text-right">{product.weight || '--'}</span>

                            <span className="text-zinc-500 text-xs flex items-center gap-1">
                                LQS <Info className="w-3 h-3 text-zinc-600" />
                            </span>
                            <div className="flex justify-end items-center gap-1">
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                    (product.lqs || 0) >= 7 ? "bg-emerald-500 text-black" : (product.lqs || 0) >= 4 ? "bg-amber-500 text-black" : "bg-red-500 text-white"
                                )}>
                                    {product.lqs || '7'}
                                </div>
                            </div>

                            <span className="text-zinc-500">Available Since:</span>
                            <span className="text-white text-right truncate pl-2">{product.dateFirstAvailable || '--'}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-4">
                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                            <Brain className="w-3 h-3 text-purple-500/80" />
                            Deep Intelligence
                        </h4>
                        <div className="space-y-3">
                            <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 mt-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Est. Net Profit</span>
                                    <span className="text-xs font-black text-emerald-500">
                                        R {(product.currentPrice - (product.fees?.total || 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500/80 w-[75%]" />
                                </div>
                            </div>
                            <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                <p className="text-[11px] text-zinc-400 italic leading-relaxed px-1">
                                    <span className="text-amber-500/80 not-italic font-bold mr-1">ANALYSIS:</span>
                                    Competitive landscape analysis suggests high demand with moderate seller overlap. Recommended for portfolio tracking.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 flex gap-2">
                    <button
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(product.url, '_blank');
                        }}
                    >
                        <ExternalLink className="w-3 h-3" /> OPEN ON {product.source.toUpperCase()}
                    </button>
                    <button
                        className="flex-1 bg-amber-500 text-black text-[10px] font-bold py-2 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        CLOSE DETAILS
                    </button>
                </div>
            </div>
        </div>
    );
};
