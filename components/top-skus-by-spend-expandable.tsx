"use client"

import { useState, useEffect } from "react"
import { FlaskRoundIcon as Flask, Wrench, PenToolIcon as Tool, Cog, Hammer, Maximize2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchTopSkusBySpend, fetchAllLocations, fetchAllCategories } from "@/lib/server-actions/skus"
import { formatCurrency } from "@/lib/utils"

interface TopSkusBySpendExpandableProps {
  dateFrom?: string
  dateTo?: string
  location?: string
  category?: string
  expanded?: boolean
  _t?: number // Timestamp for cache busting
}

export function TopSkusBySpendExpandable({
  dateFrom,
  dateTo,
  location,
  category,
  expanded = false,
  _t,
}: TopSkusBySpendExpandableProps) {
  // State for data
  const [data, setData] = useState<Array<{ sku: string; description: string; total: number; category?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maxTotal, setMaxTotal] = useState(0)

  // State for filters
  const [locations, setLocations] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>(location || "")
  const [selectedCategory, setSelectedCategory] = useState<string>(category || "")

  // State for dialog
  const [isOpen, setIsOpen] = useState(expanded)

  // Load filter options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        // Load locations
        const locationsData = await fetchAllLocations()
        setLocations(["All Locations", ...locationsData])

        // Load categories
        const categoriesData = await fetchAllCategories()
        setCategories(["All Categories", ...categoriesData])
      } catch (error) {
        console.error("Error loading filter options:", error)
      }
    }

    loadFilterOptions()
  }, [])

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Generate a timestamp for cache busting
        const timestamp = _t || Date.now()

        const skuData = await fetchTopSkusBySpend({
          dateFrom,
          dateTo,
          location: selectedLocation === "All Locations" ? undefined : selectedLocation || location,
          category: selectedCategory === "All Categories" ? undefined : selectedCategory || category,
          limit: 100, // Show up to 100 SKUs
          _t: timestamp, // Add timestamp to prevent caching
        })

        console.log(`Loaded ${skuData.length} SKUs for expandable component`)

        if (skuData.length === 0) {
          setData([])
          setMaxTotal(0)
          return
        }

        setData(skuData)

        // Find the maximum total for scaling the progress bars
        if (skuData.length > 0) {
          setMaxTotal(Math.max(...skuData.map((item) => item.total)))
        }
      } catch (error) {
        console.error("Error loading top SKUs by spend:", error)
        setError("Failed to load SKU data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dateFrom, dateTo, location, category, selectedLocation, selectedCategory, _t])

  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  // Function to determine if a SKU is a chemical or equipment
  const isChemical = (sku: string): boolean => {
    return sku.startsWith("P") || sku.startsWith("S") || sku.includes("CARBO")
  }

  // Function to get appropriate icon for equipment items based on SKU
  const getEquipmentIcon = (sku: string) => {
    if (sku.startsWith("B")) return Tool
    if (sku.startsWith("CAR")) return Cog
    if (sku.startsWith("LB")) return Hammer
    return Wrench // Default equipment icon
  }

  // Function to extract descriptive part from SKU names
  const extractDescriptiveName = (sku: string): string => {
    if (!sku) return "Unknown SKU"

    // Skip the prefix and numerical part to get only the descriptive text
    const match = sku.match(/^[A-Z0-9]+-(.+)$/)
    if (match && match[1]) {
      return match[1]
    } else if (sku.includes(" ")) {
      // If there's a space, take everything after the first space
      return sku.substring(sku.indexOf(" ") + 1)
    }
    // If no pattern matches, just return the original SKU with leading numbers removed
    return sku.replace(/^\d+/, "")
  }

  // Render SKU items
  const renderItems = () => {
    if (loading) {
      return (
        <div className="space-y-4 mt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                <div className="h-3 bg-slate-700 rounded w-full"></div>
              </div>
              <div className="w-24 h-6 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-400">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    }

    if (data.length === 0) {
      return <div className="text-center py-8 text-slate-400">No SKUs found for the selected filters</div>
    }

    return (
      <div className="space-y-4">
        {data.map((item) => {
          if (!item.sku) return null // Skip items without SKU

          const isChemicalItem = isChemical(item.sku)
          const Icon = isChemicalItem ? Flask : getEquipmentIcon(item.sku)
          const descriptiveName = extractDescriptiveName(item.sku)

          return (
            <div key={item.sku} className="flex items-center gap-3 mb-4">
              <div
                className={`min-w-[40px] w-10 h-10 flex items-center justify-center rounded-full ${
                  isChemicalItem ? "text-emerald-400 bg-emerald-950/30" : "text-blue-400 bg-blue-950/30"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium text-white truncate">{descriptiveName}</div>
                <div className="text-xs text-slate-400 truncate">
                  {item.sku} {item.category ? `- ${item.category}` : ""}
                </div>
                <div className="w-full bg-slate-700 rounded-md h-2.5 mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-md transition-all duration-300"
                    style={{ width: `${maxTotal > 0 ? (item.total / maxTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-400 whitespace-nowrap">{formatCurrency(item.total)}</div>
            </div>
          )
        })}
      </div>
    )
  }

  // If not expanded, render a card with a button to expand
  if (!expanded && !isOpen) {
    return (
      <Card className="bg-[#0f172a] border-slate-800">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white">Top SKUs by Spend</CardTitle>
              <CardDescription className="text-sm text-slate-400">Highest expense items this period</CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              onClick={() => handleDialogOpenChange(true)}
              aria-label="Expand"
              title="Expand"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2">
          <div className="space-y-4">
            <div className="overflow-y-auto pr-2 max-h-[400px]">{renderItems()}</div>
            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                className="text-sm text-slate-400 hover:text-white"
                onClick={() => handleDialogOpenChange(true)}
              >
                View all SKUs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render the expanded view
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-full sm:max-w-[100vw] md:max-w-[90vw] lg:max-w-[80vw] h-[90vh] p-0 overflow-hidden bg-[#0f172a] border-slate-700 text-white">
        <DialogHeader className="sticky top-0 z-50 bg-[#0f172a] p-4 border-b border-slate-700 shadow">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">All SKUs by Spend</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
              onClick={() => handleDialogOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-1">Showing {loading ? "..." : data.length} SKUs by spend</p>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select value={selectedLocation || "All Locations"} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory || "All Categories"} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-y-auto pr-2 pb-4" style={{ maxHeight: "calc(90vh - 180px)" }}>
              {renderItems()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
