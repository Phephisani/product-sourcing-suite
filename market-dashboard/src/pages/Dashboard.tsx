import { ArrowUpRight, ArrowDownRight, Package, DollarSign, Activity, TrendingUp } from "lucide-react"
import { TrendChart } from "@/components/TrendChart"
import { useProductStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Dashboard() {
    const { products } = useProductStore()

    const totalProducts = products.length
    const amazonCount = products.filter(p => p.source === "Amazon").length
    const takealotCount = products.filter(p => p.source === "Takealot").length

    const avgPrice = products.length > 0
        ? Math.round(products.reduce((acc, p) => acc + p.currentPrice, 0) / products.length)
        : 0

    // Calculate potential winners (High Opportunity Score)
    const potentialWinners = products.filter(p => {
        // Simple heuristic for "Winner" based on loose metrics for now
        return (p.bsr && p.bsr < 5000) || (p.notes && p.notes.includes("Rating: 4.5"))
    }).length

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Products"
                    value={totalProducts.toString()}
                    description="+2 from yesterday"
                    icon={Package}
                    color="text-blue-500"
                    trend="up"
                />
                <StatsCard
                    title="Potential Winners"
                    value={potentialWinners.toString()}
                    description="High opportunity items"
                    icon={TrendingUp}
                    color="text-emerald-500"
                    trend="up"
                />
                <StatsCard
                    title="Avg. Market Price"
                    value={`R ${avgPrice}`}
                    description="Across all categories"
                    icon={DollarSign}
                    color="text-violet-500"
                    trend="down"
                />
                <StatsCard
                    title="Active Sources"
                    value={(amazonCount > 0 && takealotCount > 0) ? "2" : "1"}
                    description={`Amz: ${amazonCount} | Tak: ${takealotCount}`}
                    icon={Activity}
                    color="text-amber-500"
                    trend="neutral"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                {/* Chart Section */}
                <div className="glass-panel col-span-1 lg:col-span-4 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Price Trends</h3>
                            <p className="text-sm text-muted-foreground">Average category performance over time</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 rounded-lg text-xs p-1.5 text-white focus:outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <TrendChart />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-panel col-span-1 lg:col-span-3 rounded-2xl p-6 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <p className="text-sm text-muted-foreground">Latest tracked products and updates</p>
                    </div>

                    <div className="space-y-4 flex-1 overflow-auto pr-2">
                        {products.slice(0, 5).map((product, i) => (
                            <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="w-10 h-10 rounded-lg bg-white p-1 flex-shrink-0">
                                    <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className={cn(
                                            "capitalize",
                                            product.source === "Amazon" ? "text-amber-500" : "text-blue-500"
                                        )}>{product.source}</span>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-medium">R {product.currentPrice}</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {i === 0 ? "Just now" : `${i * 2}h ago`}
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No activity yet. Start tracking!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface StatsCardProps {
    title: string
    value: string
    description: string
    icon: any
    color: string
    trend: "up" | "down" | "neutral"
}

function StatsCard({ title, value, description, icon: Icon, color, trend }: StatsCardProps) {
    return (
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 ${color}`}>
                <Icon className="w-16 h-16" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg bg-white/5 ${color} bg-opacity-10 backdrop-blur-sm border border-white/5`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
                    <span className={cn(
                        "flex items-center text-xs font-medium",
                        trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-gray-400"
                    )}>
                        {trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : trend === "down" ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : null}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    )
}
