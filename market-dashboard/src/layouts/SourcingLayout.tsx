import { Handshake, Calculator, Home, ArrowLeft, ShoppingCart, Zap, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

interface SourcingLayoutProps {
    children: React.ReactNode
    currentPage: string
    onNavigate: (page: string) => void
    onBackToHub?: () => void
}

export function SourcingLayout({ children, currentPage, onNavigate, onBackToHub }: SourcingLayoutProps) {
    const navItems = [
        { id: "suppliers", label: "Supplier Database", icon: Handshake },
        { id: "cart", label: "Sourcing Basket", icon: ShoppingCart },
        { id: "intelligence", label: "Command Center", icon: Terminal },
        { id: "calculator", label: "Basic Calculator", icon: Calculator },
        { id: "advanced-calculator", label: "Advanced Calculator", icon: Calculator },
        { id: "automation", label: "Automation & Intel", icon: Zap },
    ]

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-emerald-500/20">
            {/* Background Gradients (Distinct for Sourcing Phase - More Emerald/Gold) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-emerald-900/20 blur-[150px] rounded-full opacity-20 animate-pulse" />
                <div className="absolute bottom-[0%] left-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[150px] rounded-full opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative z-10 flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 glass-panel border-r border-white/10 hidden md:flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div
                                onClick={onBackToHub}
                                className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform"
                                title="Back to Hub"
                            >
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm tracking-tight text-white leading-none">
                                    The Negotiator
                                </span>
                                <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                                    Phase 2
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4">
                            Sourcing Tools
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = currentPage === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] bg-emerald-500/10 border border-emerald-500/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 relative z-10", isActive ? "text-emerald-400" : "text-muted-foreground group-hover:text-foreground")} />
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="p-4 border-t border-white/10">
                        {onBackToHub && (
                            <button
                                onClick={onBackToHub}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors mb-2"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back to Hub
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 bg-black/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            {/* Mobile/Quick Back Button */}
                            <button
                                onClick={onBackToHub}
                                className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <h1 className="text-lg md:text-xl font-semibold text-white tracking-tight flex items-center gap-3">
                                {navItems.find(i => i.id === currentPage)?.label || "Sourcing"}
                            </h1>
                        </div>

                        {/* Desktop Quick Home Action */}
                        <button
                            onClick={onBackToHub}
                            className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-emerald-400 uppercase tracking-widest transition-colors"
                        >
                            <Home className="w-4 h-4" /> Hub
                        </button>
                    </header>

                    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32 md:pb-20">
                        {children}
                    </div>

                    {/* Mobile Bottom Nav */}
                    <div className="md:hidden fixed bottom-6 inset-x-4 z-50">
                        <div className="glass-panel border border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-2xl shadow-black/50 overflow-hidden">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = currentPage === item.id
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        className={cn(
                                            "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all duration-200",
                                            isActive ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[9px] font-medium text-center">{item.label.split(' ')[0]}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
