import { useState } from 'react';
import { Workflow, MessageSquare, Sparkles, Zap, ClipboardPaste, TrendingUp, Package, CheckCircle, Clock, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuppliers } from '@/hooks/useSuppliers';
import { cn } from "@/lib/utils";
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker using a local URL that Vite can resolve
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface InternalSupplierWorkflow {
    id: string;
    supplierName: string;
    status: 'researching' | 'sample_ordered' | 'po_issued' | 'active' | 'inactive';
    lastUpdated: string;
    notes: string;
}

export function AutomationIntelligence() {
    const { suppliers, updateSupplier } = useSuppliers();
    const [smartPasteInput, setSmartPasteInput] = useState('');
    const [parsedProducts, setParsedProducts] = useState<any[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const extractTextFromPdf = async (file: File | string) => {
        setIsParsing(true);
        setUploadProgress(10);
        try {
            let data: Uint8Array;
            if (typeof file === 'string') {
                const response = await fetch(file);
                const arrayBuffer = await response.arrayBuffer();
                data = new Uint8Array(arrayBuffer);
            } else {
                const arrayBuffer = await file.arrayBuffer();
                data = new Uint8Array(arrayBuffer);
            }

            const loadingTask = pdfjs.getDocument({ data });
            const pdf = await loadingTask.promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n';
                setUploadProgress(Math.round((i / pdf.numPages) * 90) + 10);
            }

            setSmartPasteInput(prev => prev + (prev ? '\n' : '') + fullText);
        } catch (error) {
            console.error('PDF Error:', error);
            alert('Failed to extract text from PDF. Please try copying and pasting manually.');
        } finally {
            setIsParsing(false);
            setUploadProgress(0);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            extractTextFromPdf(file);
        } else {
            alert('Please select a valid PDF file.');
        }
    };

    const handleSmartPaste = () => {
        // Parse pasted text for product information
        const lines = smartPasteInput.split('\n').filter(line => line.trim());
        const products: any[] = [];

        lines.forEach((line, index) => {
            // Try to extract product info from common formats (Tab, Comma, Pipe)
            const parts = line.split(/[\t,|]/);
            if (parts.length >= 2) {
                // If we have many parts, it might be a structured export
                products.push({
                    id: `SP${Date.now()}${index}`,
                    model: parts[1]?.trim() || parts[0]?.trim(), // Model/SKU
                    name: parts[0]?.trim() || '', // Product Name
                    image: '', // Placeholder for thumbnail
                    packingImage: '',
                    rmbPrice: parts.length > 4 ? parseFloat(parts[4]?.replace(/[^0-9.]/g, '')) || 0 : 0,
                    price: parseFloat(parts[2]?.replace(/[^0-9.]/g, '')) || 0, // USD Price
                    color: parts.length > 5 ? parts[5]?.trim() : 'Standard',
                    moq: parseInt(parts[3]) || 1,
                    pkgSize: parts.length > 7 ? parts[7]?.trim() : '',
                    carton: parts.length > 8 ? parts[8]?.trim() : '',
                    weight: parts.length > 9 ? parts[9]?.trim() : '',
                    description: parts.length > 10 ? parts[10]?.trim() : (parts[4] || '')
                });
            } else if (line.trim()) {
                products.push({
                    id: `SP${Date.now()}${index}`,
                    model: '',
                    name: line.trim(),
                    image: '',
                    packingImage: '',
                    rmbPrice: 0,
                    price: 0,
                    color: 'Standard',
                    moq: 1,
                    pkgSize: '',
                    carton: '',
                    weight: '',
                    description: ''
                });
            }
        });

        setParsedProducts(products);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'researching': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'sample_ordered': return <Package className="h-4 w-4 text-yellow-500" />;
            case 'po_issued': return <FileText className="h-4 w-4 text-orange-500" />;
            case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'inactive': return <Clock className="h-4 w-4 text-slate-500" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'researching': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'sample_ordered': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'po_issued': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
            case 'active': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'inactive': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    const updateSupplierStatus = (supplierId: string, newStatus: InternalSupplierWorkflow['status']) => {
        updateSupplier(supplierId, { status: newStatus });
    };

    // Mock review keywords data
    const reviewKeywords = {
        positive: [
            { word: 'excellent quality', count: 245, trend: 'up' },
            { word: 'fast shipping', count: 189, trend: 'up' },
            { word: 'great value', count: 156, trend: 'stable' },
            { word: 'easy setup', count: 134, trend: 'up' },
            { word: 'customer service', count: 98, trend: 'down' },
            { word: 'durable', count: 87, trend: 'stable' },
            { word: 'perfect fit', count: 76, trend: 'up' },
            { word: 'highly recommend', count: 65, trend: 'stable' }
        ],
        negative: [
            { word: 'poor quality', count: 45, trend: 'down' },
            { word: 'broken on arrival', count: 23, trend: 'down' },
            { word: 'difficult setup', count: 34, trend: 'up' },
            { word: 'not as described', count: 28, trend: 'stable' },
            { word: 'slow delivery', count: 19, trend: 'down' },
            { word: 'missing parts', count: 15, trend: 'down' }
        ]
    };

    return (
        <Tabs defaultValue="workflow" className="space-y-6 animate-in fade-in duration-500">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                <TabsTrigger value="workflow" className="rounded-lg px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                    <Workflow className="mr-2 h-4 w-4" />
                    Supplier Workflow
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Review Intelligence
                </TabsTrigger>
                <TabsTrigger value="smartimport" className="rounded-lg px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Smart Import
                </TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="space-y-6 outline-none">
                <Card className="border-white/5 bg-[#0A0A0A] overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Workflow className="w-5 h-5 text-emerald-400" />
                            Supplier Pipeline Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {suppliers.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
                                    <Clock className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                    <p className="text-slate-500 text-sm font-medium">No suppliers in your database. Add suppliers to track their workflow status.</p>
                                </div>
                            ) : (
                                suppliers.map((supplier) => (
                                    <div key={supplier.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-white/10 group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-white/5">
                                                {getStatusIcon(supplier.status)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{supplier.name}</h4>
                                                <p className="text-xs text-slate-400">{supplier.country} • Last updated: {new Date(supplier.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className={cn("px-3 py-1 font-bold tracking-wider", getStatusColor(supplier.status))}>
                                                {supplier.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                            <Select
                                                value={supplier.status}
                                                onValueChange={(value) => updateSupplierStatus(supplier.id, value as InternalSupplierWorkflow['status'])}
                                            >
                                                <SelectTrigger className="w-[160px] border-white/5 bg-black/40 text-white rounded-lg focus:ring-emerald-500/20">
                                                    <SelectValue placeholder="Update status..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0F0F0F] border-white/10 text-white">
                                                    <SelectItem value="researching">Researching</SelectItem>
                                                    <SelectItem value="sample_ordered">Sample Ordered</SelectItem>
                                                    <SelectItem value="po_issued">PO Issued</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-4">
                    <PipelineCard title="Researching" count={suppliers.filter(s => s.status === 'researching').length} color="text-blue-400" icon={Clock} />
                    <PipelineCard title="Sample Ordered" count={suppliers.filter(s => s.status === 'sample_ordered').length} color="text-yellow-400" icon={Package} />
                    <PipelineCard title="PO Issued" count={suppliers.filter(s => s.status === 'po_issued').length} color="text-orange-400" icon={FileText} />
                    <PipelineCard title="Active" count={suppliers.filter(s => s.status === 'active').length} color="text-green-400" icon={CheckCircle} />
                </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6 outline-none">
                <Card className="border-white/5 bg-[#0A0A0A]">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            Review Keyword Intelligence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Top Positive Keywords
                                </h4>
                                <div className="space-y-2">
                                    {reviewKeywords.positive.map((kw, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3 hover:bg-emerald-500/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-slate-100">{kw.word}</span>
                                                {kw.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{kw.count} mentions</span>
                                                <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                                                    +{Math.floor(Math.random() * 15)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 rotate-180" /> Top Negative Keywords
                                </h4>
                                <div className="space-y-2">
                                    {reviewKeywords.negative.map((kw, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 hover:bg-rose-500/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-slate-100">{kw.word}</span>
                                                {kw.trend === 'up' && <TrendingUp className="h-3 w-3 text-rose-400" />}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{kw.count} mentions</span>
                                                <Badge variant="outline" className="text-[10px] border-rose-500/20 text-rose-400 bg-rose-500/5">
                                                    {kw.trend === 'down' ? '-' : '+'}{Math.floor(Math.random() * 10)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/5 bg-[#0A0A0A]">
                    <CardHeader>
                        <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sentiment Analysis Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-8">
                            <SentimentBar label="Positive" percentage={68} color="bg-emerald-500" textColor="text-emerald-400" />
                            <SentimentBar label="Neutral" percentage={24} color="bg-amber-500" textColor="text-amber-400" />
                            <SentimentBar label="Negative" percentage={8} color="bg-rose-500" textColor="text-rose-400" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="smartimport" className="space-y-6 outline-none">
                <Card className="border-white/5 bg-[#0A0A0A]">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <ClipboardPaste className="h-5 w-5 text-blue-400" />
                            Smart Paste - Supplier Product Import
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <Label className="text-slate-300 text-sm font-medium mb-1 inline-block">Paste product data from supplier</Label>
                            <p className="text-xs text-slate-500 mb-3 italic">
                                Copy and paste product lists from emails, PDFs, or spreadsheets. We'll automatically parse the key data points.
                            </p>
                            <Textarea
                                value={smartPasteInput}
                                onChange={(e) => setSmartPasteInput(e.target.value)}
                                placeholder={`Example formats:\nProduct Name, SKU, Price, MOQ\nWireless Headphones, WH-001, $15.50, 100\nOr simply paste a list of product names...`}
                                className="min-h-[160px] border-white/10 bg-black/40 text-white rounded-xl focus:ring-emerald-500/20 resize-none font-mono text-xs p-4"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-[10px] font-bold uppercase">Option 1: Direct File Upload</Label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="pdf-upload"
                                        disabled={isParsing}
                                    />
                                    <label
                                        htmlFor="pdf-upload"
                                        className={cn(
                                            "flex items-center justify-center gap-3 w-full h-12 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                                            isParsing ? "opacity-50 cursor-wait" : "border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 group"
                                        )}
                                    >
                                        <FileText className={cn("w-4 h-4", isParsing ? "animate-pulse" : "text-blue-400")} />
                                        <span className="text-sm font-medium text-slate-300">
                                            {isParsing ? `Extracting... ${uploadProgress}%` : "Upload Supplier PDF"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-[10px] font-bold uppercase">Option 2: Scan Saved Catalog</Label>
                                <Select
                                    disabled={!selectedSupplier || isParsing}
                                    onValueChange={(value) => extractTextFromPdf(value)}
                                >
                                    <SelectTrigger className="w-full h-12 border-white/10 bg-black/40 text-white rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <FolderOpen className="w-4 h-4 text-emerald-400" />
                                            <SelectValue placeholder={selectedSupplier ? "Select saved PDF..." : "Select supplier first"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0F0F0F] border-white/10 text-white">
                                        {suppliers.find(s => s.id === selectedSupplier)?.catalogs?.filter(c => c.type === 'pdf').map((catalog) => (
                                            <SelectItem key={catalog.id} value={catalog.url}>
                                                {catalog.name}
                                            </SelectItem>
                                        )) || <div className="p-4 text-xs text-slate-500 italic">No PDF catalogs found for this supplier.</div>}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                <SelectTrigger className="w-[280px] border-white/10 bg-black/40 text-white rounded-xl">
                                    <SelectValue placeholder="Select destination supplier" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0F0F0F] border-white/10 text-white">
                                    {suppliers.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSmartPaste} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 transition-all">
                                <Zap className="mr-2 h-4 w-4" />
                                Auto-Parse Products
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {parsedProducts.length > 0 && (
                    <Card className="border-white/5 bg-[#0A0A0A] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02] py-4">
                            <CardTitle className="text-white text-sm font-bold">Smart Import Results ({parsedProducts.length})</CardTitle>
                            <div className="flex gap-2">
                                <Button size="sm" className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/20 rounded-lg">
                                    <CheckCircle className="mr-2 h-3 w-3" />
                                    Review & Save All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-white/[0.03] border-b border-white/5">
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">No.</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Model</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Products</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Packing</th>
                                        <th className="p-3 text-[10px] font-bold text-rose-500 uppercase text-center">RMB Price</th>
                                        <th className="p-3 text-[10px] font-bold text-rose-500 uppercase text-center">USD Price</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Colour</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase text-center">QTY PCS</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Carton (CM)</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Weight (KG)</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedProducts.map((product, idx) => (
                                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                                            <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                                            <td className="p-3 text-xs font-bold text-white whitespace-pre-line leading-relaxed max-w-[120px]">
                                                {product.model}
                                            </td>
                                            <td className="p-3">
                                                <div className="w-16 h-16 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                    {product.image ? (
                                                        <img src={product.image} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-slate-600" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="w-16 h-16 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                    <Package className="w-6 h-6 text-slate-700" />
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="text-sm font-bold text-rose-500">
                                                    {product.rmbPrice > 0 ? `¥${product.rmbPrice.toFixed(2)}` : '-'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="text-sm font-bold text-rose-500">
                                                    {product.price > 0 ? `$${product.price.toFixed(2)}` : '-'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-slate-400">{product.color}</td>
                                            <td className="p-3 text-center text-xs text-white font-bold">{product.moq}</td>
                                            <td className="p-3 text-xs text-slate-500 font-mono">{product.carton || '-'}</td>
                                            <td className="p-3 text-xs text-slate-500 font-mono">{product.weight || '-'}</td>
                                            <td className="p-3">
                                                <p className="text-[10px] text-slate-400 leading-normal max-w-[200px] line-clamp-3">
                                                    {product.description || 'No description extracted'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
    );
}

function PipelineCard({ title, count, color, icon: Icon }: any) {
    return (
        <Card className="border-white/5 bg-[#0A0A0A] transition-all hover:border-white/10 group">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                        <p className={cn("text-3xl font-bold transition-all group-hover:scale-110 origin-left", color)}>
                            {count}
                        </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Icon className={cn("h-6 w-6 opacity-40 group-hover:opacity-100 transition-opacity", color)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SentimentBar({ label, percentage, color, textColor }: any) {
    return (
        <div className="flex-1">
            <div className="mb-3 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className={textColor}>{label}</span>
                <span className="text-white">{percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
