import { useState } from "react";
import { MessageSquare, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface VettingAgentProps {
    supplierName: string;
    onAddNote: (note: string) => void;
}

export function VettingAgent({ supplierName, onAddNote }: VettingAgentProps) {
    const [urlInput, setUrlInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<{
        score: number;
        summary: string;
        points: string[];
        status: 'trusted' | 'caution' | 'danger';
    } | null>(null);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate AI Analysis of external URLs (Reddit, Trustpilot, etc.)
        setTimeout(() => {
            setResults({
                score: 84,
                summary: `Analysis of recent discussions on Reddit and industry forums suggests ${supplierName} is a highly reliable direct manufacturer.`,
                points: [
                    "Consistently high build quality reported for 2024 models.",
                    "Quick resolution of sample quality issues.",
                    "Noted for transparent communication regarding material shortages.",
                    "Caution: Shipping times can vary during peak seasons."
                ],
                status: 'trusted'
            });
            setIsAnalyzing(false);
        }, 1500);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Sourcing Agent</h3>
                </div>
                <div className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] text-muted-foreground font-mono">
                    BETA: SOCIAL PROOF VETTING
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Analyze Social Proof (Reddit/Trustpilot Url)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste review URL here..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={!urlInput || isAnalyzing}
                            className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all"
                        >
                            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {results && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2",
                                results.status === 'trusted' ? "text-emerald-400 border-emerald-400/30" :
                                    results.status === 'caution' ? "text-amber-400 border-amber-400/30" : "text-rose-400 border-rose-400/30"
                            )}>
                                {results.score}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Social Credibility Score</div>
                                <div className="text-[10px] text-emerald-400 font-bold uppercase">Strong Positive Sentiment</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-white leading-relaxed">
                                {results.summary}
                            </p>
                            <ul className="space-y-2">
                                {results.points.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => onAddNote(`AI VETTING SUMMARY: ${results.summary}`)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest transition-all"
                        >
                            ATTACH ANALYSIS TO SUPPLIER NOTES
                        </button>
                    </div>
                )}

                {!results && !isAnalyzing && (
                    <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-40">
                        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Paste a URL to analyze supplier feedback from across the web.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
