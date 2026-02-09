import { useState } from "react";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";

export function ClearDataUtility() {
    const [cleared, setCleared] = useState(false);

    const handleClearData = () => {
        try {
            localStorage.removeItem('suppliers');
            localStorage.removeItem('sourcingCart');
            setCleared(true);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-rose-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-rose-500/20 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-rose-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Data Corruption Detected</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-muted-foreground">
                        The error <span className="font-mono text-rose-400">"Speakers is not defined"</span> indicates corrupted data in your browser's storage.
                    </p>
                    <p className="text-muted-foreground">
                        Click below to clear the corrupted data and restart the application. Your settings will be preserved.
                    </p>
                </div>

                {!cleared ? (
                    <button
                        onClick={handleClearData}
                        className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-500/20"
                    >
                        <Trash2 className="w-5 h-5" />
                        Clear Corrupted Data & Restart
                    </button>
                ) : (
                    <div className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        Data Cleared - Restarting...
                    </div>
                )}

                <p className="text-xs text-zinc-600 mt-4 text-center">
                    This will remove suppliers and sourcing cart data only
                </p>
            </div>
        </div>
    );
}
