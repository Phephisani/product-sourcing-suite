import { ArrowRight, Search, Handshake, Megaphone, TrendingUp, Lock, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingPageProps {
    onNavigate: (module: "research" | "sourcing" | "launch" | "scale") => void
}

export function LandingPage({ onNavigate }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/20 overflow-hidden relative font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />

            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col justify-center">
                <header className="mb-20 text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Product Sourcing Suite v2.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Master the Marketplace.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Your end-to-end command center for building a profitable e-commerce empire in South Africa using the 4-Phase Strategy.
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Phase 1: Research (Active) */}
                    <PhaseCard
                        phase="Phase 1"
                        title="Validation"
                        subtitle="The Detective"
                        description="Identify validated opportunities with proven demand."
                        icon={Search}
                        color="text-blue-400"
                        actionLabel="Enter Lab"
                        onClick={() => onNavigate("research")}
                        isActive
                    />

                    {/* Phase 2: Sourcing (Next) */}
                    <PhaseCard
                        phase="Phase 2"
                        title="Sourcing"
                        subtitle="The Negotiator"
                        description="Secure reliable suppliers and calculate true landed costs."
                        icon={Handshake}
                        color="text-emerald-400"
                        actionLabel="Open Negotiator"
                        onClick={() => onNavigate("sourcing")}
                        isActive={false}
                        isComingSoon={false}
                    />

                    {/* Phase 3: Pre-Launch (Future) */}
                    <PhaseCard
                        phase="Phase 3"
                        title="Pre-Launch"
                        subtitle="The Marketer"
                        description="Test market appetite and build assets before bulk ordering."
                        icon={Megaphone}
                        color="text-amber-400"
                        actionLabel="Locked"
                        isActive={false}
                        isComingSoon
                    />

                    {/* Phase 4: Launch (Future) */}
                    <PhaseCard
                        phase="Phase 4"
                        title="Scale"
                        subtitle="The CEO"
                        description="Execute launch, track metrics, and optimize for profit."
                        icon={TrendingUp}
                        color="text-purple-400"
                        actionLabel="Locked"
                        isActive={false}
                        isComingSoon
                    />

                    {/* Phase 5: Automation (New) */}
                    <PhaseCard
                        phase="Phase 5"
                        title="Automate"
                        subtitle="The Architect"
                        description="Build self-sustaining workflows and intelligent systems."
                        icon={Bot}
                        color="text-cyan-400"
                        actionLabel="Open Intelligence"
                        onClick={() => onNavigate("research")}
                        isActive={true}
                        isComingSoon={false}
                    />
                </div>
            </div>
        </div>
    )
}

interface PhaseCardProps {
    phase: string
    title: string
    subtitle: string
    description: string
    icon: any
    color: string
    actionLabel?: string
    onClick?: () => void
    isActive?: boolean
    isComingSoon?: boolean
}

function PhaseCard({ phase, title, subtitle, description, icon: Icon, color, actionLabel, onClick, isActive, isComingSoon }: PhaseCardProps) {
    return (
        <div
            onClick={!isComingSoon ? onClick : undefined}
            className={cn(
                "group relative p-6 md:p-8 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col",
                isActive
                    ? "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
                    : isComingSoon
                        ? "bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed grayscale-[0.5]"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 cursor-pointer hover:-translate-y-2"
            )}
        >
            <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 ${color}`}>
                <Icon className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">{phase}</div>
                    <div className={cn("text-sm font-semibold mb-1 uppercase tracking-wider", color)}>{subtitle}</div>
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-8 flex-1 leading-relaxed">
                    {description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    {isComingSoon ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-white/20 uppercase tracking-widest">
                            <Lock className="w-4 h-4" />
                            Coming Soon
                        </div>
                    ) : (
                        <div className={cn(
                            "flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3",
                            isActive ? "text-white" : "text-emerald-400"
                        )}>
                            {actionLabel} <ArrowRight className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
