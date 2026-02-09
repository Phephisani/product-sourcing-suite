import { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCcw, Trash2 } from "lucide-react"

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    isDataCorruption: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        isDataCorruption: false
    }

    public static getDerivedStateFromError(error: Error): State {
        // Check if this is a localStorage corruption error
        const isDataCorruption = error.message?.includes('is not defined') ||
            error.message?.includes('undefined') ||
            error.message?.includes('Cannot read');

        return { hasError: true, error, isDataCorruption }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    private handleClearData = () => {
        try {
            // Clear potentially corrupted data
            localStorage.removeItem('suppliers');
            localStorage.removeItem('sourcingCart');
            localStorage.removeItem('products');
            localStorage.removeItem("activeModule");
            localStorage.removeItem("activePage");

            // Reload the application
            window.location.reload();
        } catch (error) {
            console.error('Error clearing data:', error);
            // Force reload anyway
            window.location.reload();
        }
    }

    public render() {
        if (this.state.hasError) {
            // Show specialized UI for data corruption errors
            if (this.state.isDataCorruption) {
                return (
                    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-rose-500/20 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Data Corruption Detected</h2>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-muted-foreground">
                                    The error <span className="font-mono text-rose-400 text-sm">"{this.state.error?.message}"</span> indicates corrupted data in your browser's storage.
                                </p>
                                <p className="text-muted-foreground">
                                    Click below to clear the corrupted data and restart the application. Your settings will be preserved.
                                </p>
                            </div>

                            <button
                                onClick={this.handleClearData}
                                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-500/20"
                            >
                                <Trash2 className="w-5 h-5" />
                                Clear Corrupted Data & Restart
                            </button>

                            <p className="text-xs text-zinc-600 mt-4 text-center">
                                This will remove suppliers, products, and sourcing cart data
                            </p>
                        </div>
                    </div>
                );
            }

            // Default error UI for other errors
            return (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="bg-rose-500/10 p-4 rounded-full mb-6">
                        <AlertTriangle className="w-12 h-12 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="text-muted-foreground max-w-md mb-6">
                        {this.state.error?.message || "An unexpected error occurred in this module."}
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem("activeModule")
                            localStorage.removeItem("activePage")
                            window.location.reload()
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" /> Reset Application
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
