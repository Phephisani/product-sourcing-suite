import { useState } from "react"
import { useProductStore, Supplier } from "@/lib/store"
import { Plus, Search, ExternalLink, Trash2, Edit2, Star, CheckSquare, History, ClipboardCheck, X, FolderOpen, FileText, FileSpreadsheet, MessageSquare, ShoppingCart, Send, Upload, Package, Sparkles } from "lucide-react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SupplierWorkflow } from '@/components/sourcing/SupplierWorkflow';
import { VettingAgent } from "@/components/sourcing/VettingAgent"


export function SupplierDatabase() {
    const { suppliers, addSupplier, deleteSupplier, updateSupplier } = useProductStore()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || null

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
                >
                    <Plus className="w-4 h-4" /> Add Supplier
                </button>
            </div>

            {/* Empty State */}
            {suppliers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <HandshakeIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Build Your Network</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Start adding suppliers from Alibaba or other sources to track your sourcing journey.
                    </p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors text-sm"
                    >
                        + Add First Supplier
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredSuppliers.map(supplier => (
                    <SupplierCard
                        key={supplier.id}
                        supplier={supplier}
                        onDelete={() => deleteSupplier(supplier.id)}
                        onView={() => setSelectedSupplierId(supplier.id)}
                    />
                ))}
            </div>

            {isAddModalOpen && (
                <AddSupplierModal onClose={() => setIsAddModalOpen(false)} onAdd={addSupplier} />
            )}

            {selectedSupplier && (
                <SupplierDetailsModal
                    supplier={selectedSupplier}
                    onClose={() => setSelectedSupplierId(null)}
                    onUpdate={updateSupplier}
                />
            )}
        </div>
    )
}

function SupplierCard({ supplier, onDelete, onView }: { supplier: Supplier, onDelete: () => void, onView: () => void }) {
    const rating = supplier.ratings ?
        (supplier.ratings.quality + supplier.ratings.communication + supplier.ratings.price) / 3 : 0

    return (
        <div className="glass-panel p-6 rounded-2xl group hover:border-emerald-500/30 transition-all duration-300 relative flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white cursor-pointer hover:text-emerald-400 transition-colors" onClick={onView}>
                            {supplier.name}
                        </h3>
                        {supplier.alibabaLink && (
                            <a href={supplier.alibabaLink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald-400 transition-colors">
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={supplier.status} />
                        {rating > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500 border border-yellow-500/20">
                                <Star className="w-3 h-3 fill-yellow-500" />
                                {rating.toFixed(1)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onDelete} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3 mb-6 flex-1">
                {supplier.contactPerson && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{supplier.contactPerson[0]}</span>
                        </div>
                        {supplier.contactPerson}
                    </div>
                )}
                {supplier.leadTime && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <History className="w-4 h-4" />
                        <span>{supplier.leadTime} days lead time</span>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-2">
                {/* Chat Actions */}
                {supplier.wechat && (
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(supplier.wechat!)
                            alert(`WeChat ID copied: ${supplier.wechat}`)
                        }}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors border border-emerald-500/20"
                        title="Copy WeChat ID"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                )}

                {/* @ts-ignore */}
                {supplier.alibabaChatUrl && (
                    <a href={supplier.alibabaChatUrl} target="_blank" rel="noreferrer" className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors border border-orange-500/20" title="Chat on Alibaba">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}

                <button
                    onClick={onView}
                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-emerald-500/20"
                >
                    <Edit2 className="w-3 h-3" /> Manage Supplier
                </button>
            </div>
        </div>
    )
}

function SupplierDetailsModal({ supplier, onClose, onUpdate }: { supplier: Supplier, onClose: () => void, onUpdate: (id: string, s: Partial<Supplier>) => void }) {
    const [activeTab, setActiveTab] = useState<"overview" | "vetting" | "quotes" | "catalogs" | "workflow" | "products" | "agent">("overview")



    // Ratings Helpers
    const updateRating = (field: "quality" | "communication" | "price", value: number) => {
        const currentRatings = supplier.ratings || { quality: 0, communication: 0, price: 0 };
        const newRatings = { ...currentRatings, [field]: value }
        // @ts-ignore
        onUpdate(supplier.id, { ratings: newRatings })
    }

    // Vetting Helpers
    const toggleVetting = (field: string) => {
        const currentVetting = supplier.vetting || { hasTradeAssurance: false, acceptsPaypal: false, isVerifiedManufacturer: false, samplesVerified: false };
        // @ts-ignore
        const newVetting = { ...currentVetting, [field]: !currentVetting[field] }
        onUpdate(supplier.id, { vetting: newVetting })
    }

    // Catalog Helpers
    const addCatalog = (name: string, url: string, type: "pdf" | "excel" | "other") => {
        const newCatalog = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            url,
            type,
            dateAdded: new Date().toISOString()
        }
        const updatedCatalogs = [...(supplier.catalogs || []), newCatalog]
        onUpdate(supplier.id, { catalogs: updatedCatalogs })
    }

    const removeCatalog = (catalogId: string) => {
        const updatedCatalogs = (supplier.catalogs || []).filter(c => c.id !== catalogId)
        // @ts-ignore
        onUpdate(supplier.id, { catalogs: updatedCatalogs })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-white">{supplier.name}</h2>
                            <StatusBadge status={supplier.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {supplier.contactPerson && <span>{supplier.contactPerson}</span>}
                            {supplier.email && <span>{supplier.email}</span>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 px-6 overflow-x-auto scrollbar-none">
                    <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Scorecard" icon={ClipboardCheck} />
                    <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")} label="Products" icon={Package} />
                    <TabButton active={activeTab === "quotes"} onClick={() => setActiveTab("quotes")} label="Quotes" icon={History} />
                    <TabButton active={activeTab === "catalogs"} onClick={() => setActiveTab("catalogs")} label="Catalogs" icon={FolderOpen} />
                    <TabButton active={activeTab === "workflow"} onClick={() => setActiveTab("workflow")} label="Workflow" icon={Send} />
                    <TabButton active={activeTab === "agent"} onClick={() => setActiveTab("agent")} label="Vetting Agent" icon={Sparkles} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            {/* Contact & Chat Info (New) */}
                            <div className="glass-panel p-5 rounded-xl border border-white/5">
                                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                                    Contact & Communication
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">WeChat ID</label>
                                        <input
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                                            value={supplier.wechat || ""}
                                            onChange={(e) => onUpdate(supplier.id, { wechat: e.target.value })}
                                            placeholder="e.g. wxid_123456"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Alibaba Chat Link</label>
                                        <input
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                                            value={supplier.alibabaChatUrl || ""}
                                            onChange={(e) => onUpdate(supplier.id, { alibabaChatUrl: e.target.value })}
                                            placeholder="https://messenger.alibaba.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Alibaba Store Link</label>
                                        <input
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                                            value={supplier.alibabaLink || ""}
                                            onChange={(e) => onUpdate(supplier.id, { alibabaLink: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Contact Person</label>
                                        <input
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                                            value={supplier.contactPerson || ""}
                                            onChange={(e) => onUpdate(supplier.id, { contactPerson: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Ratings */}
                            <div className="glass-panel p-5 rounded-xl border border-white/5">
                                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Performance Scorecard</h3>
                                <div className="space-y-4">
                                    <RatingRow label="Product Quality" value={supplier.ratings?.quality || 0} onChange={(v) => updateRating("quality", v)} />
                                    <RatingRow label="Communication" value={supplier.ratings?.communication || 0} onChange={(v) => updateRating("communication", v)} />
                                    <RatingRow label="Price Competitiveness" value={supplier.ratings?.price || 0} onChange={(v) => updateRating("price", v)} />
                                </div>
                            </div>

                            <TabsList className="w-full bg-white/5 p-1 border border-white/10 overflow-x-auto">
                                <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Details</TabsTrigger>
                                <TabsTrigger value="products" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Products</TabsTrigger>
                                <TabsTrigger value="catalogs" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Catalogs</TabsTrigger>
                                <TabsTrigger value="workflow" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">Workflow</TabsTrigger>
                            </TabsList>
                            <div className="glass-panel p-5 rounded-xl border border-white/5">
                                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Logistics</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Average Lead Time (Days)</span>
                                    <input
                                        type="number"
                                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-white w-24 text-center focus:border-emerald-500/50 outline-none"
                                        value={supplier.leadTime || ""}
                                        onChange={(e) => onUpdate(supplier.id, { leadTime: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "vetting" && (
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-white mb-2">Verification Checklist</h3>
                            <VettingItem label="Trade Assurance Available" checked={supplier.vetting?.hasTradeAssurance} onChange={() => toggleVetting("hasTradeAssurance")} />
                            <VettingItem label="Accepts PayPal / Secure Payment" checked={supplier.vetting?.acceptsPaypal} onChange={() => toggleVetting("acceptsPaypal")} />
                            <VettingItem label="Verified Manufacturer (Gold Supplier)" checked={supplier.vetting?.isVerifiedManufacturer} onChange={() => toggleVetting("isVerifiedManufacturer")} />
                            <VettingItem label="Samples Verified & Approved" checked={supplier.vetting?.samplesVerified} onChange={() => toggleVetting("samplesVerified")} />
                        </div>
                    )}

                    {activeTab === "quotes" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-bold text-white">Price History</h3>
                                <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors">
                                    + Add New Quote
                                </button>
                            </div>

                            <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                                <History className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No quotes recorded yet.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "products" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold text-white">Supplier Product Catalog</h3>
                                    <p className="text-xs text-muted-foreground">Save products here for quick Purchase Order creation.</p>
                                </div>
                                <button
                                    onClick={() => document.getElementById('add-product-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-3 h-3" /> Add Product
                                </button>
                            </div>

                            {/* Product List */}
                            <div className="grid grid-cols-1 gap-3">
                                {supplier.savedProducts && supplier.savedProducts.length > 0 ? (
                                    supplier.savedProducts.map(prod => (
                                        <div key={prod.id} className="flex gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.02] group hover:border-emerald-500/20">
                                            {/* Image */}
                                            <div className="w-16 h-16 rounded-lg bg-black/40 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {prod.image ? (
                                                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-bold text-white truncate pr-2">{prod.name}</h4>
                                                    <span className="text-sm font-mono text-emerald-400 font-bold">${prod.price}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-1">{prod.sku || 'No SKU'}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">MOQ: {prod.moq}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        const newProducts = (supplier.savedProducts || []).filter(p => p.id !== prod.id);
                                                        // @ts-ignore
                                                        onUpdate(supplier.id, { savedProducts: newProducts });
                                                    }}
                                                    className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                        <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-sm text-muted-foreground">No saved products.</p>
                                    </div>
                                )}
                            </div>

                            {/* Add Product Form */}
                            <div id="add-product-form" className="glass-panel p-4 rounded-xl border border-white/5 bg-emerald-900/5 mt-4">
                                <h4 className="text-sm font-bold text-white mb-3">Add New Item</h4>
                                <AddProductForm onAdd={(product) => {
                                    const newProducts = [...(supplier.savedProducts || []), { ...product, id: Math.random().toString(36).substr(2, 9), dateAdded: new Date().toISOString() }];
                                    // @ts-ignore
                                    onUpdate(supplier.id, { savedProducts: newProducts });
                                }} />
                            </div>
                        </div>
                    )}

                    {activeTab === "catalogs" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-white">Supplier Catalogs</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{supplier.catalogs?.length || 0} files</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {supplier.catalogs && supplier.catalogs.length > 0 ? (
                                    supplier.catalogs.map(catalog => (
                                        <div key={catalog.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] group hover:border-emerald-500/20 transition-all">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400">
                                                {catalog.type === 'pdf' ? <FileText className="w-5 h-5" /> :
                                                    catalog.type === 'excel' ? <FileSpreadsheet className="w-5 h-5" /> :
                                                        <ExternalLink className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">{catalog.name}</h4>
                                                <a href={catalog.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline truncate block">
                                                    {catalog.url}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={catalog.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => removeCatalog(catalog.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                                        <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-sm text-muted-foreground">No catalogs added yet.</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-sm font-bold text-white mb-3">Add New Catalog</h4>
                                <CatalogUploader onUpload={addCatalog} />
                            </div>
                        </div>
                    )}

                    {activeTab === "workflow" && (
                        <SupplierWorkflow supplier={supplier} />
                    )}

                    {activeTab === "agent" && (
                        <VettingAgent
                            supplierName={supplier.name}
                            onAddNote={(note) => {
                                const currentNotes = supplier.notes || "";
                                onUpdate(supplier.id, { notes: currentNotes + (currentNotes ? "\n\n" : "") + note });
                                setActiveTab("overview");
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

function CatalogUploader({ onUpload }: { onUpload: (name: string, url: string, type: "pdf" | "excel" | "other") => void }) {
    const [url, setUrl] = useState("")
    const [name, setName] = useState("")
    const [type, setType] = useState<"pdf" | "excel" | "other">("pdf")

    const handleAdd = () => {
        if (!url || !name) return
        onUpload(name, url, type)
        setName("")
        setUrl("")
    }

    return (
        <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                    placeholder="Catalog Name (e.g. 2024 Collection)"
                    className="sm:col-span-2 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <select
                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                >
                    <option value="pdf">PDF Document</option>
                    <option value="excel">Excel Sheet</option>
                    <option value="other">Other Link</option>
                </select>
                <button
                    onClick={handleAdd}
                    disabled={!name}
                    className="bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 rounded-lg text-xs font-bold uppercase disabled:opacity-50 transition-all"
                >
                    Add Link
                </button>
            </div>
            <input
                placeholder="Paste Link (Google Drive, Dropbox, Website...)"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground focus:text-white focus:border-emerald-500/50 outline-none"
                value={url}
                onChange={e => setUrl(e.target.value)}
            />
        </div>
    )
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${active
                ? "border-emerald-500 text-white"
                : "border-transparent text-muted-foreground hover:text-white hover:border-white/10"
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    )
}

function RatingRow({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`p-1 transition-transform hover:scale-110 ${star <= value ? "text-yellow-500" : "text-white/10 hover:text-yellow-500/50"}`}
                    >
                        <Star className="w-5 h-5 fill-current" />
                    </button>
                ))}
            </div>
        </div>
    )
}

function VettingItem({ label, checked, onChange }: { label: string, checked?: boolean, onChange: () => void }) {
    return (
        <div
            onClick={onChange}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${checked
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
        >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20"
                }`}>
                {checked && <CheckSquare className="w-3.5 h-3.5" />}
            </div>
            <span className={checked ? "text-white font-medium" : "text-muted-foreground"}>{label}</span>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        "New": "bg-blue-500/10 text-blue-400 border-blue-500/20",
        "Contacted": "bg-amber-500/10 text-amber-400 border-amber-500/20",
        "Sample Ordered": "bg-purple-500/10 text-purple-400 border-purple-500/20",
        "Vetted": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        "Blacklisted": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    }
    const colorClass = colors[status] || colors["New"]

    return (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
            {status}
        </span>
    )
}

function AddSupplierModal({ onClose, onAdd }: { onClose: () => void, onAdd: (s: any) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        alibabaLink: "",
        status: "New"
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAdd(formData)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Add New Supplier</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Company Name</label>
                        <input required className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500/50 outline-none"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Contact Person</label>
                            <input className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500/50 outline-none"
                                value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
                            <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500/50 outline-none"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">WeChat ID</label>
                            <input className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500/50 outline-none"
                                // @ts-ignore
                                value={formData.wechat || ""} onChange={e => setFormData({ ...formData, wechat: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Alibaba Chat Link</label>
                            <input className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500/50 outline-none"
                                // @ts-ignore
                                value={formData.alibabaChatUrl || ""} onChange={e => setFormData({ ...formData, alibabaChatUrl: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Alibaba Store Link</label>
                        <input className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500/50 outline-none"
                            value={formData.alibabaLink} onChange={e => setFormData({ ...formData, alibabaLink: e.target.value })} />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-medium text-white transition-colors">Add Supplier</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function HandshakeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m11 17 2 2a1 1 0 1 0 3-3" />
            <path d="m22 2-1.58 2.99C19.98 5.86 19 8 19 11v5a4 4 0 0 1-4 4h-2.022a1 1 0 0 1-.954-.775l-1-4a1 1 0 0 0-1.04-.754h-1a1 1 0 0 0-1.026.83l-.704 4.092a1 1 0 0 1-.986.83H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3" />
            <path d="m8 11 1.6-3.2A2 2 0 0 1 11.4 7h4.3a2 2 0 0 1 1.77 1.25L19 11" />
        </svg>
    )
}

function AddProductForm({ onAdd }: { onAdd: (p: any) => void }) {
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [moq, setMoq] = useState("")
    const [sku, setSku] = useState("")
    const [image, setImage] = useState<string | null>(null)
    const [isPasting, setIsPasting] = useState(false)

    // Handle paste events for images
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile()
                if (blob) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        setImage(event.target?.result as string)
                    }
                    reader.readAsDataURL(blob)
                    setIsPasting(true)
                    setTimeout(() => setIsPasting(false), 1000)
                }
            }
        }
    }

    const handleSubmit = () => {
        if (!name || !price) return
        onAdd({
            name,
            price: parseFloat(price),
            moq: parseInt(moq) || 1,
            sku,
            image
        })
        // Reset form
        setName("")
        setPrice("")
        setMoq("")
        setSku("")
        setImage(null)
    }

    return (
        <div className="space-y-4" onPaste={handlePaste}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Product Name</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                            placeholder="e.g. Wireless Mouse M1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Price ($)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">MOQ</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                                placeholder="1"
                                value={moq}
                                onChange={(e) => setMoq(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">SKU / Ref</label>
                            <input
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 outline-none"
                                placeholder="Optional"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Image Paste Area */}
                <div
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden group ${image ? 'border-emerald-500/30 bg-emerald-500/5' :
                        isPasting ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10 bg-black/20 hover:border-white/20'
                        }`}
                >
                    {image ? (
                        <>
                            <img src={image} className="absolute inset-0 w-full h-full object-contain p-2" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => setImage(null)} className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-white mb-1">Paste Image</p>
                                <p className="text-[10px] text-muted-foreground">Click here & Press Ctrl+V</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!name || !price}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
                <Package className="w-4 h-4" />
                Save Product
            </button>
        </div>
    )
}
