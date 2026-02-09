import { useState } from "react"
import { Calculator, DollarSign, Ship, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function CostingCalculator() {
    // Inputs (All in source currency usually, assume USD for simplicity or convert)
    const [exchangeRate, setExchangeRate] = useState(19.00) // ZAR/USD
    const [unitCostUSD, setUnitCostUSD] = useState(5.00)
    const [moq, setMoq] = useState(100)
    const [shippingCostUSD, setShippingCostUSD] = useState(250) // Total Shipment
    const [dutyRate, setDutyRate] = useState(10) // Percent
    const [clearanceFeesZAR, setClearanceFeesZAR] = useState(3500) // Local agent fees
    const [targetMargin, setTargetMargin] = useState(40) // Percent

    // Calculations
    const totalProductCostUSD = unitCostUSD * moq

    // Convert to ZAR
    const productCostZAR = totalProductCostUSD * exchangeRate
    const shippingCostZAR = shippingCostUSD * exchangeRate

    // Duty Calculation (Usually on (Product + Shipping) * 1.1 or similar, roughly simplified here as per SARS usually on FOB or CIF+10% uplift)
    // SARS Formula typical: (ATV) Added Tax Value = (FOB + 10%) or CIF. Duty is on ATV.
    // Simplified for tool: (Product Cost) * Duty Rate
    const dutyPayableZAR = productCostZAR * (dutyRate / 100)

    // VAT Import: 15% of (ATV + Duty). 
    // ATV for VAT = Product + Shipping + 10% uplift often.
    // Simple version: 15% of (Product + Shipping + Duty)
    const vatPayableZAR = (productCostZAR + shippingCostZAR + dutyPayableZAR) * 0.15

    const totalLandedCostZAR = productCostZAR + shippingCostZAR + dutyPayableZAR + vatPayableZAR + clearanceFeesZAR
    const landedCostPerUnitZAR = totalLandedCostZAR / moq

    // Pricing
    const suggestedPrice = landedCostPerUnitZAR / (1 - (targetMargin / 100))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Calculator className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Landed Cost Calculator</h2>
                    <p className="text-muted-foreground">Calculate the true cost to import and check profitability.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Inputs Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Variables</h3>

                        <InputGroup label="Exchange Rate (R)" value={exchangeRate} onChange={setExchangeRate} icon={RefreshCw} step={0.1} />
                        <InputGroup label="Unit Cost (USD)" value={unitCostUSD} onChange={setUnitCostUSD} icon={DollarSign} step={0.01} />
                        <InputGroup label="Order Quantity (MOQ)" value={moq} onChange={setMoq} step={10} />
                        <InputGroup label="Shipping Quote (USD)" value={shippingCostUSD} onChange={setShippingCostUSD} icon={Ship} />

                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Duties & Taxes</h3>
                            <InputGroup label="Duty Rate (%)" value={dutyRate} onChange={setDutyRate} step={1} />
                            <InputGroup label="Local Agent Fees (R)" value={clearanceFeesZAR} onChange={setClearanceFeesZAR} step={100} />
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Targeting</h3>
                            <InputGroup label="Target Margin (%)" value={targetMargin} onChange={setTargetMargin} step={5} />
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Big Stats */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <ResultCard
                            label="True Landed Cost / Unit"
                            value={`R ${landedCostPerUnitZAR.toFixed(2)}`}
                            subtext="Includes Product, Logistics, Duty, VAT"
                            color="text-white"
                            bg="bg-emerald-600"
                        />
                        <ResultCard
                            label="Suggested Retail Price"
                            value={`R ${suggestedPrice.toFixed(2)}`}
                            subtext={`To achieve ${targetMargin}% Margin`}
                            color="text-emerald-400"
                            bg="bg-white/5"
                        />
                    </div>

                    {/* Breakdown Table */}
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                            <h3 className="font-semibold text-white">Cost Breakdown (Total Shipment)</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <CostRow label="Product Cost (FOB)" valZAR={productCostZAR} percent={productCostZAR / totalLandedCostZAR} />
                            <CostRow label="International Freight" valZAR={shippingCostZAR} percent={shippingCostZAR / totalLandedCostZAR} />
                            <CostRow label="Customs Duties" valZAR={dutyPayableZAR} percent={dutyPayableZAR / totalLandedCostZAR} />
                            <CostRow label="Import VAT" valZAR={vatPayableZAR} percent={vatPayableZAR / totalLandedCostZAR} />
                            <CostRow label="Local Logistics & Fees" valZAR={clearanceFeesZAR} percent={clearanceFeesZAR / totalLandedCostZAR} />

                            <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="text-sm font-bold text-muted-foreground">TOTAL INVESTMENT</span>
                                <span className="text-2xl font-bold text-white">R {totalLandedCostZAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InputGroup({ label, value, onChange, icon: Icon, step = 1 }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />}
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    step={step}
                    className={cn(
                        "w-full bg-black/20 border border-white/10 rounded-lg py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors",
                        Icon ? "pl-9 pr-3" : "px-3"
                    )}
                />
            </div>
        </div>
    )
}

function ResultCard({ label, value, subtext, color, bg }: any) {
    return (
        <div className={cn("p-6 rounded-2xl border border-white/5 box-border", bg)}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2 text-white">{label}</p>
            <h2 className={cn("text-4xl font-bold tracking-tight mb-2", color)}>{value}</h2>
            <p className="text-xs opacity-70 text-white">{subtext}</p>
        </div>
    )
}

function CostRow({ label, valZAR, percent }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-sm text-white">{label}</span>
                    <span className="text-sm font-mono text-muted-foreground">R {valZAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: `${percent * 100}%` }} />
                </div>
            </div>
            <div className="w-12 text-right text-xs text-muted-foreground font-mono">
                {Math.round(percent * 100)}%
            </div>
        </div>
    )
}
