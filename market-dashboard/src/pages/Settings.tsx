import { useProductStore } from "@/lib/store"
import { Save, Trash2, Download, Upload } from "lucide-react"
import { useState } from "react"

export function Settings() {
    const { settings, updateSettings, clearAllData, products, importData } = useProductStore()
    const [jsonInput, setJsonInput] = useState("")

    const handleExport = () => {
        const dataStr = JSON.stringify(products, null, 2)
        const blob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `source-suite-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonInput)
            if (Array.isArray(parsed)) {
                importData(parsed)
                setJsonInput("")
                alert("Products imported successfully!")
            } else {
                alert("Invalid JSON format. Expected an array of products.")
            }
        } catch (e) {
            alert("Failed to parse JSON.")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-muted-foreground mt-2">Manage your preferences and data.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* General Preferences */}
                <div className="glass-panel p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Save className="w-5 h-5 text-emerald-500" />
                        General Preferences
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Display Name</label>
                            <input
                                type="text"
                                value={settings.userName}
                                onChange={(e) => updateSettings({ userName: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Auto-Refresh Interval</label>
                            <select
                                value={settings.refreshInterval}
                                onChange={(e) => updateSettings({ refreshInterval: Number(e.target.value) })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                            >
                                <option value={3600000}>Every 1 Hour</option>
                                <option value={7200000}>Every 2 Hours (Default)</option>
                                <option value={21600000}>Every 6 Hours</option>
                                <option value={86400000}>Every 24 Hours</option>
                            </select>
                            <p className="text-xs text-muted-foreground">How often to check for price updates.</p>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="glass-panel p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-500" />
                        Data Management
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                            <h4 className="text-sm font-medium text-white">Backup & Restore</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Export JSON
                                </button>
                            </div>

                            <div className="pt-2 border-t border-white/10">
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder="Paste JSON content here to import..."
                                    className="w-full h-20 bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-mono text-white/70 focus:outline-none mb-2"
                                />
                                <button
                                    onClick={handleImport}
                                    disabled={!jsonInput}
                                    className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Upload className="w-4 h-4" /> Import Data
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-3">
                            <h4 className="text-sm font-medium text-rose-400">Danger Zone</h4>
                            <button
                                onClick={clearAllData}
                                className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Clear All Tracked Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
