"use client"

import { Suspense } from "react"
import { LocationCategoryHeatmapExpandable } from "@/components/location-category-heatmap-expandable"
import { MostExpensiveInvoicesExpandable } from "@/components/most-expensive-invoices-expandable"
import { TopSkusBySpend } from "@/components/top-skus-by-spend"
import { UniversalFilterBar } from "@/components/universal-filter-bar"
import { addMonths, format } from "date-fns"

// Create client component that uses hooks
const DashboardContent = () => {
  // Import hooks inside the client component
  const { useSearchParams } = require("next/navigation");
  const { useEffect, useState } = require("react");
  
  // Get search params using the hook for client components
  const searchParams = useSearchParams()

  // Calculate Month-to-Date default values
  const today = new Date()
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const defaultFromDate = format(startOfCurrentMonth, "yyyy-MM-dd")
  const defaultToDate = format(today, "yyyy-MM-dd")
  
  // State to hold date values - initialize with defaults to prevent empty initial values
  const [dateFrom, setDateFrom] = useState<string>(defaultFromDate)
  const [dateTo, setDateTo] = useState<string>(defaultToDate)
  const [timestamp, setTimestamp] = useState<string>(Date.now().toString())
  const [filtersInitialized, setFiltersInitialized] = useState<boolean>(false)

  // Process URL parameters on component mount and when search params change
  useEffect(() => {
    // Get parameters safely
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    
    // Use parameters or default values
    setDateFrom(fromParam || defaultFromDate)
    setDateTo(toParam || defaultToDate)
    
    // Update timestamp for cache busting
    setTimestamp(Date.now().toString())
    
    // Mark filters as initialized after the first update
    setFiltersInitialized(true)
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 pb-8 pt-4">
      <div className="mb-8 border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>

          
          <div className="w-[70%] ml-0 sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[30%] mt-3">
            <UniversalFilterBar defaultDateFrom={dateFrom} defaultDateTo={dateTo} />
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-6">
        {/* Location Category Analysis - Now at the top */}
        <div className="grid grid-cols-1 gap-6">
          <Suspense fallback={<div className="h-96 animate-pulse rounded bg-slate-800"></div>}>
            <LocationCategoryHeatmapExpandable dateFrom={dateFrom} dateTo={dateTo} />
          </Suspense>
        </div>

        {/* Top SKUs by Spend - Full Width */}
        <div className="grid grid-cols-1 gap-6">
          <Suspense fallback={<div className="h-96 animate-pulse rounded bg-slate-800"></div>}>
            <TopSkusBySpend dateFrom={dateFrom} dateTo={dateTo} />
          </Suspense>
        </div>

        {/* Most Expensive Invoices - Full Width */}
        <div className="grid grid-cols-1 gap-6">
          <Suspense fallback={<div className="h-96 animate-pulse rounded bg-slate-800"></div>}>
            <MostExpensiveInvoicesExpandable dateFrom={dateFrom} dateTo={dateTo} />
          </Suspense>
        </div>


      </div>
    </div>
  )
}

// Main component that uses Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 pb-8 pt-4">
        <div className="mb-8 border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="w-[70%] ml-0 sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[30%] mt-3">
              <div className="flex items-center justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                <span className="ml-2 text-slate-300">Loading filters...</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div className="h-96 animate-pulse rounded bg-slate-800"></div>
          <div className="h-96 animate-pulse rounded bg-slate-800"></div>
          <div className="h-96 animate-pulse rounded bg-slate-800"></div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
