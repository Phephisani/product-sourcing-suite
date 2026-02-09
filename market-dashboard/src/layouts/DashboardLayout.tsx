import { LayoutDashboard, Package, LineChart, Settings, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
    children: React.ReactNode
    currentPage: string
    onNavigate: (page: string) => void
    onBackToHub?: () => void
}

export function DashboardLayout({ children, currentPage, onNavigate, onBackToHub }: DashboardLayoutProps) {
    const navItems = [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
        { id: "products", label: "Product Tracker", icon: Package },
        { id: "analysis", label: "Market Intelligence", icon: LineChart },
        { id: "settings", label: "Settings", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full opacity-10 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[150px] rounded-full opacity-10 animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative z-10 flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 glass-panel border-r border-white/10 hidden md:flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div
                                onClick={onBackToHub}
                                className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-transform"
                                title="Back to Hub"
                            >
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                SourceSuite
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4">
                            Main Menu
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
                                            ? "text-primary shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl" />
                                    )}
                                    <Icon className={cn("w-4 h-4 relative z-10", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
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
                                <Home className="w-3 h-3" /> Back to Hub
                            </button>
                        )}
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                                    P
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">Pheph</p>
                                    <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 bg-black/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            {/* Mobile Back Button */}
                            <button
                                onClick={onBackToHub}
                                className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
                            >
                                <Home className="w-5 h-5" />
                            </button>
                            <h1 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                                {navItems.find(i => i.id === currentPage)?.label || "Dashboard"}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                System Online
                            </div>
                        </div>
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
                                            "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200",
                                            isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[10px] font-medium">{item.label}</span>
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
