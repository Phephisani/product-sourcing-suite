import { useProductStore, SourcingItem } from "@/lib/store"
import { ShoppingCart, Send, Archive, Trash2, CheckCircle2, Scale } from "lucide-react"
import { useState } from "react"
import { SourcingComparison } from "@/components/sourcing/SourcingComparison"

export function SourcingCart() {
    const { sourcingCart, removeFromCart, updateCartItem } = useProductStore()
    const [isComparing, setIsComparing] = useState(false)

    const itemsByStatus = {
        "Selected": sourcingCart.filter(i => i.status === "Selected"),
        "Inquiry Sent": sourcingCart.filter(i => i.status === "Inquiry Sent"),
        "Sample Ordered": sourcingCart.filter(i => i.status === "Sample Ordered"),
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <ShoppingCart className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Sourcing Basket</h2>
                    <p className="text-muted-foreground">Manage selected products and sample requests.</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setIsComparing(true)}
                        disabled={sourcingCart.length < 2}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-muted-foreground text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        <Scale className="w-4 h-4" />
                        ADVANCED COMPARISON ({sourcingCart.length})
                    </button>
                </div>
            </div>

            {isComparing && (
                <SourcingComparison
                    items={sourcingCart}
                    onClose={() => setIsComparing(false)}
                />
            )}

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Column 1: Selected (New) */}
                <StatusColumn
                    title="Selection List"
                    count={itemsByStatus["Selected"].length}
                    items={itemsByStatus["Selected"]}
                    onDelete={removeFromCart}
                    onMove={(id) => updateCartItem(id, { status: "Inquiry Sent" })}
                    moveLabel="Mark Inquiry Sent"
                    moveIcon={Send}
                />

                {/* Column 2: Inquiry Sent */}
                <StatusColumn
                    title="Inquiry / Negotiating"
                    count={itemsByStatus["Inquiry Sent"].length}
                    items={itemsByStatus["Inquiry Sent"]}
                    onDelete={removeFromCart}
                    onMove={(id) => updateCartItem(id, { status: "Sample Ordered" })}
                    moveLabel="Sample Ordered"
                    moveIcon={CheckCircle2}
                />

                {/* Column 3: Sample Ordered */}
                <StatusColumn
                    title="Samples Incoming"
                    count={itemsByStatus["Sample Ordered"].length}
                    items={itemsByStatus["Sample Ordered"]}
                    onDelete={removeFromCart}
                    isFinal
                />
            </div>
        </div>
    )
}

interface StatusColumnProps {
    title: string
    count: number
    items: SourcingItem[]
    onDelete: (id: string) => void
    onMove?: (id: string) => void
    moveLabel?: string
    moveIcon?: any
    isFinal?: boolean
}

function StatusColumn({ title, count, items, onDelete, onMove, moveLabel, moveIcon: MoveIcon, isFinal }: StatusColumnProps) {
    return (
        <div className="flex-1 flex flex-col h-[70vh] bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-bold text-white flex items-center gap-2">
                    {title}
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-muted-foreground">{count}</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <Archive className="w-8 h-8 mb-2" />
                        <span className="text-xs">No items</span>
                    </div>
                )}
                {items.map((item: SourcingItem) => (
                    <div key={item.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-white leading-tight mb-1">{item.name}</h4>
                                <p className="text-xs text-emerald-400 font-medium">{item.supplierName}</p>
                            </div>
                            <button onClick={() => onDelete(item.id)} className="text-muted-foreground hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            {item.reference && <span>Ref: {item.reference}</span>}
                            {item.targetPrice && <span>Target: ${item.targetPrice}</span>}
                            {item.moq && <span>MOQ: {item.moq}</span>}
                        </div>

                        {!isFinal && onMove && (
                            <button
                                onClick={() => onMove(item.id)}
                                className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                            >
                                <MoveIcon className="w-3 h-3" /> {moveLabel}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
