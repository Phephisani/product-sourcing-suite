import { useState, useEffect } from "react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Dashboard } from "@/pages/Dashboard"
import { ProductTracker } from "@/pages/ProductTracker"
import { MarketAnalysis } from "@/pages/MarketAnalysis"
import { Settings } from "@/pages/Settings"
import { LandingPage } from "@/pages/LandingPage"
import { SourcingLayout } from "@/layouts/SourcingLayout"
import { SupplierDatabase } from "@/pages/sourcing/SupplierDatabase"
import { CostingCalculator } from "@/pages/sourcing/CostingCalculator"
import { AdvancedCalculator } from "@/pages/sourcing/AdvancedCalculator"
import { AutomationIntelligence } from "@/pages/sourcing/AutomationIntelligence"
import { SourcingCart } from "@/pages/sourcing/SourcingCart"
import { SourcingIntelligence } from "@/pages/sourcing/SourcingIntelligence"
import { ErrorBoundary } from "@/components/ErrorBoundary"

type Module = "hub" | "research" | "sourcing" | "launch" | "scale"

function App() {
  const [currentModule, setCurrentModule] = useState<Module>(() => {
    // Robust check to avoid "null" string or invalid values
    const saved = localStorage.getItem("activeModule") as Module
    return (saved === "research" || saved === "sourcing" || saved === "hub") ? saved : "hub"
  })

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("activePage") || "dashboard"
  })

  // Persistence
  useEffect(() => {
    if (currentModule) localStorage.setItem("activeModule", currentModule)
  }, [currentModule])

  useEffect(() => {
    if (currentPage) localStorage.setItem("activePage", currentPage)
  }, [currentPage])

  // Module Router
  const handleModuleNavigation = (module: Module) => {
    setCurrentModule(module)
    // Reset page logic
    if (module === "research") {
      setCurrentPage("dashboard")
    } else if (module === "sourcing") {
      setCurrentPage("suppliers")
    } else if (module === "hub") {
      // Clear page persistence when going back to hub? Maybe not.
    }
  }

  // Render Hub
  if (currentModule === "hub") {
    return <LandingPage onNavigate={handleModuleNavigation} />
  }

  // Render Phase 1: Research & Validation
  if (currentModule === "research") {
    return (
      <DashboardLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onBackToHub={() => setCurrentModule("hub")}
      >
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "products" && <ProductTracker />}
        {currentPage === "analysis" && <MarketAnalysis />}
        {currentPage === "settings" && <Settings />}
        {/* Fallback for research module */}
        {(currentPage !== "dashboard" && currentPage !== "products" && currentPage !== "analysis" && currentPage !== "settings") && <Dashboard />}
      </DashboardLayout>
    )
  }

  // Render Phase 2: Sourcing
  if (currentModule === "sourcing") {
    return (
      <ErrorBoundary>
        <SourcingLayout
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onBackToHub={() => setCurrentModule("hub")}
        >
          {currentPage === "suppliers" && <SupplierDatabase />}
          {currentPage === "cart" && <SourcingCart />}
          {currentPage === "calculator" && <CostingCalculator />}
          {currentPage === "advanced-calculator" && <AdvancedCalculator />}
          {currentPage === "automation" && <AutomationIntelligence />}
          {currentPage === "intelligence" && <SourcingIntelligence />}
          {/* Fallback for sourcing module */}
          {(currentPage !== "suppliers" && currentPage !== "cart" && currentPage !== "calculator" && currentPage !== "advanced-calculator" && currentPage !== "automation" && currentPage !== "intelligence") && <SupplierDatabase />}
        </SourcingLayout>
      </ErrorBoundary>
    )
  }

  // Fallback / Safety Net (Prevents Blank Screen)
  return <LandingPage onNavigate={handleModuleNavigation} />
}

export default App
