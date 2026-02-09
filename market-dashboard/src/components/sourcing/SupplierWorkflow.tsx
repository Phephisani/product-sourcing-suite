
import { useState } from 'react';
import { Supplier, useProductStore } from '@/lib/store';
import {
    Plus,
    Mail,
    FileText,
    CheckCircle2,
    ClipboardCopy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SupplierWorkflowProps {
    supplier: Supplier;
}

const WORKFLOW_STEPS = [
    { id: 'Researching', label: 'Researching', color: 'bg-zinc-500' },
    { id: 'Sample Requested', label: 'Sample Requested', color: 'bg-amber-500' },
    { id: 'Negotiating', label: 'Negotiating', color: 'bg-blue-500' },
    { id: 'PO Issued', label: 'PO Issued', color: 'bg-emerald-500' },
    { id: 'Completed', label: 'Active Partner', color: 'bg-purple-500' }
];

export function SupplierWorkflow({ supplier }: SupplierWorkflowProps) {
    const { updateSupplier } = useProductStore();
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isPOOpen, setIsPOOpen] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);
    // PO State
    const [poItems, setPoItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([]);
    const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0 });
    const [poNumber, setPoNumber] = useState(`PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);

    // Import dynamically to avoid SSR issues if any, but standard import is fine usually. 
    // We need to import the generator function at the top of the file, but for this edit block 
    // I will assume I can just use a helper function or import it. 
    // ACTUALLY, I need to add the import statement at the top. 
    // I will perform a separate edit for imports. 
    // For now, let's implement the UI and logic assuming the import exists.

    const handleAddItem = () => {
        if (!newItem.description || newItem.quantity <= 0) return;
        setPoItems([...poItems, newItem]);
        setNewItem({ description: '', quantity: 1, unitPrice: 0 });
    };

    const handleGeneratePO = async () => {
        // Dynamic import to be safe? Or assume top-level import. 
        // Let's assume top-level import for 'generatePurchaseOrder'
        const { generatePurchaseOrder } = await import('@/lib/pdf-generator');
        generatePurchaseOrder(supplier, poItems, poNumber);
        handleStatusUpdate('PO Issued');
        setIsPOOpen(false);
    };

    const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === (supplier.workflowStatus || 'Researching'));

    const handleStatusUpdate = (status: any) => {
        updateSupplier(supplier.id, { workflowStatus: status });
    };

    const sampleEmailTemplate = `Subject: Sample Request - ${supplier.name} - Inquiry from[Your Company]

Dear ${supplier.contactPerson || 'Sales Manager'},

I hope this email finds you well.

My name is[Name] from[Your Company], based in South Africa.We are currently reviewing suppliers for [Product Category] and are very interested in your products.

We would like to request a sample of the following items to verify quality before proceeding with a bulk order:
-[Item Name 1]
    - [Item Name 2]

Could you please provide:
1. Sample cost and shipping cost to[Address / Forwarder].
2. Your best MOQ for a trial order.
3. Lead time for production.

Looking forward to your swift response.

Best regards,
    [Your Name]
    [Your Company]`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sampleEmailTemplate);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
        handleStatusUpdate('Sample Requested');
    };

    return (
        <div className="space-y-6">
            {/* Status Tracker */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
                <div className="relative flex justify-between">
                    {WORKFLOW_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleStatusUpdate(step.id)}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                                    isCompleted ? `${step.color} border - ${step.color.replace('bg-', '')} text - white` : "bg-zinc-950 border-white/20 text-muted-foreground",
                                    isCurrent && "ring-4 ring-white/10 scale-110"
                                )}>
                                    {idx + 1}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium uppercase tracking-wider bg-zinc-950 px-1",
                                    isCompleted ? "text-white" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Generator */}
                <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                    <DialogTrigger asChild>
                        <div className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-white">Request Sample</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">Generate contact email template</p>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Sample Request Email</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-zinc-900 p-4 rounded-lg text-sm text-zinc-300 font-mono whitespace-pre-wrap h-64 overflow-y-auto border border-white/5">
                                {sampleEmailTemplate}
                            </div>
                            <Button onClick={copyToClipboard} className="w-full gap-2">
                                {emailCopied ? <CheckCircle2 className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                                {emailCopied ? 'Copied & Status Updated!' : 'Copy to Clipboard'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* PO Generator */}
                <Dialog open={isPOOpen} onOpenChange={setIsPOOpen}>
                    <DialogTrigger asChild>
                        <div className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-white">Draft PO</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">Generate PDF Purchase Order</p>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Purchase Order</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            {/* PO info */}
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">PO Number</label>
                                <input
                                    type="text"
                                    value={poNumber}
                                    onChange={(e) => setPoNumber(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Line Items List */}
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                {poItems.length === 0 && (
                                    <div className="text-sm text-muted-foreground text-center py-4 italic border border-dashed border-white/10 rounded-md">
                                        No items added
                                    </div>
                                )}
                                {poItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm bg-zinc-900/50 p-2 rounded border border-white/5">
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{item.description}</div>
                                            <div className="text-xs text-muted-foreground">{item.quantity} x ${item.unitPrice}</div>
                                        </div>
                                        <div className="font-bold text-emerald-400 mr-3">
                                            ${(item.quantity * item.unitPrice).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Item Form */}
                            <div className="grid grid-cols-4 gap-2 items-end pt-2 border-t border-white/5">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase text-muted-foreground">Item</label>
                                    <input
                                        placeholder="Description"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-muted-foreground">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-muted-foreground">Price ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newItem.unitPrice}
                                        onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleAddItem} variant="secondary" className="w-full text-xs h-8">
                                + Add Line Item
                            </Button>

                            {/* Saved Products Selector */}
                            {supplier.savedProducts && supplier.savedProducts.length > 0 && (
                                <div className="pt-2 border-t border-white/5">
                                    <label className="text-[10px] uppercase text-muted-foreground block mb-1">Quick Add from Catalog</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                        {supplier.savedProducts.map(prod => (
                                            <button
                                                key={prod.id}
                                                onClick={() => setPoItems([...poItems, { description: prod.name, quantity: prod.moq, unitPrice: prod.price }])}
                                                className="flex-shrink-0 bg-zinc-900 border border-white/10 hover:border-emerald-500/50 rounded-lg p-2 text-left w-32 transition-colors relative group"
                                            >
                                                {prod.image && (
                                                    <div className="h-16 w-full mb-2 rounded bg-black/50 overflow-hidden">
                                                        <img src={prod.image} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="text-xs font-bold text-white truncate">{prod.name}</div>
                                                <div className="text-[10px] text-emerald-400">${prod.price}</div>
                                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <Plus className="w-6 h-6 text-white" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="pt-2">
                                <Button
                                    onClick={handleGeneratePO}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                    disabled={poItems.length === 0}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download PDF Order
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
