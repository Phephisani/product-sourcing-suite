import { useState } from 'react';
import { Calculator, DollarSign, Ship, Percent, FileText, TrendingUp, AlertCircle, Info, Sparkles, MessageSquare, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LandedCostCalculation } from '@/types';

export function AdvancedCalculator() {
    const [inputs, setInputs] = useState({
        productCost: 100,
        exchangeRate: 18.5,
        shippingCost: 15,
        dutyRate: 15,
        importVatRate: 15,
        clearanceFees: 50,
        targetMargin: 30
    });

    const [calculation, setCalculation] = useState<LandedCostCalculation | null>(null);

    const calculateLandedCost = () => {
        const productCostZAR = inputs.productCost * inputs.exchangeRate;
        const shippingZAR = inputs.shippingCost * inputs.exchangeRate;
        const duties = productCostZAR * (inputs.dutyRate / 100);
        const importVat = (productCostZAR + shippingZAR + duties) * (inputs.importVatRate / 100);

        const totalLandedCost = productCostZAR + shippingZAR + duties + importVat + inputs.clearanceFees;
        const breakEvenPrice = totalLandedCost;
        const suggestedRetailPrice = totalLandedCost / (1 - inputs.targetMargin / 100);

        setCalculation({
            productCost: productCostZAR,
            exchangeRate: inputs.exchangeRate,
            shippingCost: shippingZAR,
            duties,
            importVat,
            clearanceFees: inputs.clearanceFees,
            totalLandedCost,
            breakEvenPrice,
            suggestedRetailPrice,
            targetMargin: inputs.targetMargin
        });
    };

    const formatCurrency = (amount: number) => {
        return `R ${amount.toFixed(2)}`;
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Section */}
                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-100">
                            <Calculator className="h-5 w-5 text-blue-500" />
                            Advanced Landed Cost Calculator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label className="flex items-center gap-2 text-slate-300">
                                    <DollarSign className="h-4 w-4" />
                                    Product Cost (USD)
                                </Label>
                                <Input
                                    type="number"
                                    value={inputs.productCost}
                                    onChange={(e) => setInputs({ ...inputs, productCost: parseFloat(e.target.value) || 0 })}
                                    className="border-slate-700 bg-slate-800 text-slate-100"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-2 text-slate-300">
                                    <TrendingUp className="h-4 w-4" />
                                    Exchange Rate (USD/ZAR)
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={inputs.exchangeRate}
                                    onChange={(e) => setInputs({ ...inputs, exchangeRate: parseFloat(e.target.value) || 0 })}
                                    className="border-slate-700 bg-slate-800 text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label className="flex items-center gap-2 text-slate-300">
                                    <Ship className="h-4 w-4" />
                                    Shipping Cost (USD)
                                </Label>
                                <Input
                                    type="number"
                                    value={inputs.shippingCost}
                                    onChange={(e) => setInputs({ ...inputs, shippingCost: parseFloat(e.target.value) || 0 })}
                                    className="border-slate-700 bg-slate-800 text-slate-100"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-2 text-slate-300">
                                    <FileText className="h-4 w-4" />
                                    Clearance Fees (ZAR)
                                </Label>
                                <Input
                                    type="number"
                                    value={inputs.clearanceFees}
                                    onChange={(e) => setInputs({ ...inputs, clearanceFees: parseFloat(e.target.value) || 0 })}
                                    className="border-slate-700 bg-slate-800 text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label className="flex items-center gap-2 text-slate-300">
                                    <Percent className="h-4 w-4" />
                                    Duty Rate (%)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-slate-500" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-800 border-slate-700">
                                                <p className="max-w-xs text-xs">Import duties vary by product category. Electronics typically 0-15%, clothing 40-45%.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    type="number"
                                    value={inputs.dutyRate}
                                    onChange={(e) => setInputs({ ...inputs, dutyRate: parseFloat(e.target.value) || 0 })}
                                    className="border-slate-700 bg-slate-800 text-slate-100"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-2 text-slate-300">
                                    <Percent className="h-4 w-4" />
                                    Import VAT Rate (%)
                                </Label>
                                <Input
                                    type="number"
                                    value={inputs.importVatRate}
                                    onChange={(e) => setInputs({ ...inputs, importVatRate: parseFloat(e.target.value) || 0 })}
                                    className="border-slate-700 bg-slate-800 text-slate-100"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Target Margin
                                </span>
                                <span className="text-blue-400 font-bold">{inputs.targetMargin}%</span>
                            </Label>
                            <Slider
                                value={[inputs.targetMargin]}
                                onValueChange={(value) => setInputs({ ...inputs, targetMargin: value[0] })}
                                max={100}
                                step={1}
                                className="mt-2"
                            />
                        </div>

                        <Button onClick={calculateLandedCost} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                            <Calculator className="mr-2 h-5 w-5" />
                            Calculate Landed Cost
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-slate-100">Calculation Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {calculation ? (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-slate-800/50 p-4 border border-white/5 space-y-3">
                                    <h4 className="text-sm font-medium text-slate-400 border-b border-white/5 pb-2">Cost Breakdown</h4>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Product Cost (ZAR)</span>
                                        <span className="text-slate-200">{formatCurrency(calculation.productCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Shipping Cost (ZAR)</span>
                                        <span className="text-slate-200">{formatCurrency(calculation.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Duties ({inputs.dutyRate}%)</span>
                                        <span className="text-slate-200">{formatCurrency(calculation.duties)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Import VAT ({inputs.importVatRate}%)</span>
                                        <span className="text-slate-200">{formatCurrency(calculation.importVat)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Clearance Fees</span>
                                        <span className="text-slate-200">{formatCurrency(calculation.clearanceFees)}</span>
                                    </div>

                                    <div className="border-t border-slate-700 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-300">Total Landed Cost</span>
                                            <span className="text-2xl font-bold text-blue-400 shadow-sm">{formatCurrency(calculation.totalLandedCost)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card className="border-slate-700 bg-slate-800/50 overflow-hidden">
                                        <CardContent className="pt-4 pb-4">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                                                <span className="text-sm text-slate-400">Break-even Price</span>
                                            </div>
                                            <p className="mt-2 text-2xl font-bold text-yellow-500">
                                                {formatCurrency(calculation.breakEvenPrice)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-slate-700 bg-slate-800/50 overflow-hidden">
                                        <CardContent className="pt-4 pb-4">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-green-500" />
                                                <span className="text-sm text-slate-400">Suggested Retail</span>
                                            </div>
                                            <p className="mt-2 text-2xl font-bold text-green-500">
                                                {formatCurrency(calculation.suggestedRetailPrice)}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">at {calculation.targetMargin}% margin</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                                    <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        Pricing Summary
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                            <span className="text-slate-400">Cost per unit</span>
                                            <span className="text-slate-200 font-medium">{formatCurrency(calculation.totalLandedCost)}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/10">
                                            <span className="text-slate-400">Recommended selling price</span>
                                            <span className="text-emerald-400 font-bold">{formatCurrency(calculation.suggestedRetailPrice)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-slate-400">Gross profit per unit</span>
                                            <span className="text-green-400 font-bold">
                                                {formatCurrency(calculation.suggestedRetailPrice - calculation.totalLandedCost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs pt-1">
                                            <span className="text-slate-500 italic">Markup percentage</span>
                                            <span className="text-slate-400 font-mono">
                                                {((calculation.suggestedRetailPrice / calculation.totalLandedCost - 1) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 h-full">
                                <Calculator className="h-16 w-16 mb-4 opacity-20" />
                                <p className="text-sm font-medium">Enter your costs and click calculate to see results</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {calculation && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Negotiator Agent */}
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-400">
                                <Sparkles className="h-5 w-5" />
                                AI Negotiator Agent
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Target Price Analysis</h4>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">READY</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Target className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Ideal Target (FOB)</div>
                                            <div className="text-2xl font-mono font-bold text-white">${(inputs.productCost * 0.92).toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        Based on a target margin of {inputs.targetMargin}% and current logistics costs in South Africa,
                                        we recommend negotiating a <span className="text-emerald-400 font-bold">8-12% discount</span> if volume exceeds 500 units.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Negotiation Strategy</div>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5" />
                                            Mention the exchange rate volatility as a reason for needing a tighter margin.
                                        </li>
                                        <li className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5" />
                                            Request a "shipping-ready" price breakdown to verify clearance fee inclusion.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sourcing Note Generator */}
                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-400 font-bold">
                                <MessageSquare className="h-5 w-5" />
                                Inquiry Draft (AI Generated)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
                                <div className="text-xs text-muted-foreground italic leading-relaxed">
                                    "Dear Supplier, we've analyzed the landed cost for the SA market. To meet our target retail of {formatCurrency(calculation.suggestedRetailPrice)}, we'd need to achieve a unit price of ${(inputs.productCost * 0.94).toFixed(2)} for our first trial order. Is there flexibility at our MOQ?"
                                </div>
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-xs font-bold uppercase py-1 h-8">
                                    Copy Draft to Clipboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Reference Information */}
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        South Africa Import Reference (Estimated)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <Percent className="w-4 h-4 text-emerald-500" />
                                Duty Rates
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-400">
                                <li className="flex justify-between"><span>Electronics:</span> <span className="text-white">0 - 15%</span></li>
                                <li className="flex justify-between"><span>Clothing:</span> <span className="text-white">40 - 45%</span></li>
                                <li className="flex justify-between"><span>Footwear:</span> <span className="text-white">30 - 40%</span></li>
                                <li className="flex justify-between"><span>Home Goods:</span> <span className="text-white">15 - 25%</span></li>
                                <li className="flex justify-between"><span>Toys:</span> <span className="text-white">15 - 20%</span></li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-500" />
                                Standard Fees
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-400">
                                <li className="flex justify-between"><span>Customs (EDI):</span> <span className="text-white">R50 - R150</span></li>
                                <li className="flex justify-between"><span>Storage (Daily):</span> <span className="text-white">R25 - R75</span></li>
                                <li className="flex justify-between"><span>Examination:</span> <span className="text-white">R100 - R300</span></li>
                                <li className="flex justify-between"><span>Agent Fee:</span> <span className="text-white">R200 - R500</span></li>
                                <li className="flex justify-between"><span>Delivery:</span> <span className="text-white">R150 - R400</span></li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <Info className="w-4 h-4 text-amber-500" />
                                VAT Info
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-400">
                                <li className="flex justify-between"><span>Standard VAT:</span> <span className="text-white">15%</span></li>
                                <li className="flex justify-between"><span>Calculated On:</span> <span className="text-white italic">Base + 10% + Duties</span></li>
                                <li className="flex justify-between"><span>VAT Recoverable:</span> <span className="text-emerald-400 font-bold">Yes (Registered)</span></li>
                                <li className="flex justify-between"><span>Import Duty:</span> <span className="text-rose-400 font-bold">No (Not Recoverable)</span></li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
