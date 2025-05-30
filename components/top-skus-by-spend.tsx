"use client"

import { useEffect, useState, useRef } from "react"
import { Droplets, Wrench, PenToolIcon as Tool, Cog, Hammer, Maximize2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchTopSkusBySpend, fetchAllLocations, fetchAllCategories } from "@/lib/server-actions" // Using the fixed server action
import { log } from "@/lib/logger"
import { formatCurrency } from "@/lib/utils"

interface TopSkusBySpendProps {
  dateFrom?: string
  dateTo?: string
}

// Define the SKU data interface with category field
interface SkuData {
  sku: string;
  description: string;
  total: number;
  category?: string; // Category might be provided by the API
}

export function TopSkusBySpend({ dateFrom, dateTo }: TopSkusBySpendProps) {
  // State for card view (unexpanded)
  const [cardData, setCardData] = useState<Array<SkuData>>([]);
  const [cardLoading, setCardLoading] = useState(true);
  const [cardMaxTotal, setCardMaxTotal] = useState(0);

  // State for dialog view (expanded)
  const [dialogData, setDialogData] = useState<Array<SkuData>>([]);
  const [dialogLoading, setDialogLoading] = useState(true);
  const [dialogMaxTotal, setDialogMaxTotal] = useState(0);

  // Shared state
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cardLocation, setCardLocation] = useState<string>("");
  const [dialogLocation, setDialogLocation] = useState<string>("");
  const [cardCategory, setCardCategory] = useState<string>("");
  const [dialogCategory, setDialogCategory] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Ref to track if dialog data has been loaded
  const dialogDataLoaded = useRef(false);

  // Load locations & categories
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [locationsData, categoriesData] = await Promise.all([
          fetchAllLocations(),
          fetchAllCategories(),
        ])
        setLocations(["All Locations", ...locationsData])
        setCategories(["All Categories", ...categoriesData])
      } catch (error) {
        console.error("Error loading filter options:", error)
      }
    }

    loadFilterOptions()
  }, [])

  // Load card data (unexpanded view) - optimized to be filter-driven
  useEffect(() => {
    async function loadCardData() {
      try {
        setCardLoading(true)
        log("Loading card data with filters:", { dateFrom, dateTo, cardLocation, cardCategory })
        
        // Only fetch data when we have valid date filters
        // The dateFrom/dateTo should now always be initialized with Month-to-Date values
        if (!dateFrom || !dateTo) {
          log("Skipping fetch - missing date filters")
          setCardData([])
          setCardLoading(false)
          return
        }
        
        log(`Fetching data for date range: ${dateFrom} to ${dateTo}`)
        const timestamp = new Date().getTime()
        const skuData = await fetchTopSkusBySpend({
          dateFrom,
          dateTo,
          location: cardLocation === "All Locations" ? undefined : cardLocation,
          category: cardCategory === "All Categories" ? undefined : cardCategory,
          limit: 20, // Get 20 items for the card view
          _t: timestamp, // Add timestamp to prevent caching
        })

        log('Top SKUs data loaded:', skuData.length, 'items');
        if (skuData.length > 0) {
          // Log the full structure of the first SKU to see all available properties
          log('Sample SKU data structure:', JSON.stringify(skuData[0], null, 2));
          
          // Log all properties in first SKU item
          const sampleSku = skuData[0];
          log('Available properties in SKU data:', Object.keys(sampleSku));
          
          // Log SKU descriptions to see if they contain category information
          log('SKU descriptions:');
          skuData.slice(0, 5).forEach((sku, index) => {
            log(`  ${index + 1}. ${sku.sku}: ${sku.description}`);
          });
        }

        log(`Loaded ${skuData.length} SKUs for card view`)
        
        // Process the loaded SKU data
        setCardData(skuData)

        // Find the maximum total for scaling the progress bars
        if (skuData.length > 0) {
          setCardMaxTotal(Math.max(...skuData.map((item) => item.total)))
        }
      } catch (error) {
        console.error("Error loading top SKUs by spend (card view):", error)
      } finally {
        setCardLoading(false)
      }
    }

    loadCardData()
  }, [dateFrom, dateTo, cardLocation, cardCategory])

  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open)

    // Reset the ref when dialog closes
    if (!open) {
      dialogDataLoaded.current = false
    }
  }

  // Load dialog data when dialog opens or when filters change - optimized to be filter-driven
  useEffect(() => {
    if (isOpen) {
      async function loadDialogData() {
        try {
          setDialogLoading(true)
          log("Loading dialog data with filters:", { dateFrom, dateTo, dialogLocation, dialogCategory })
          
          // Only fetch data when we have valid date filters
          if (!dateFrom || !dateTo) {
            log("Skipping dialog fetch - missing date filters")
            setDialogData([])
            dialogDataLoaded.current = true
            return
          }

          // Force a direct server call by adding a timestamp
          const timestamp = new Date().getTime()
          const skuData = await fetchTopSkusBySpend({
            dateFrom,
            dateTo,
            location: dialogLocation === "All Locations" ? undefined : dialogLocation,
            category: dialogCategory === "All Categories" ? undefined : dialogCategory,
            limit: 100, // Get up to 100 SKUs for expanded view
            _t: timestamp, // Add timestamp for cache busting
          })

          log(`Loaded ${skuData.length} SKUs for dialog view`)

          // Process the loaded SKU data
          setDialogData(skuData)

          // Find the maximum total for scaling the progress bars
          if (skuData.length > 0) {
            setDialogMaxTotal(Math.max(...skuData.map((item) => item.total)))
          }

          // Mark dialog data as loaded
          dialogDataLoaded.current = true
        } catch (error) {
          console.error("Error loading top SKUs by spend (dialog view):", error)
        } finally {
          setDialogLoading(false)
        }
      }

      // Always load dialog data when dialog is open or filters change
      loadDialogData()
    }
  }, [isOpen, dateFrom, dateTo, dialogLocation, dialogCategory])

  // Function to render the appropriate SVG icon based on category
  function getCategoryIcon(item: { sku: string; description: string; total: number; category?: string }) {
    // Use the category field from the database if available
    const category = (item.category || "").toLowerCase();
    
    // Define SVG icons as JSX elements to match the other components
    // Chemical category
    if (category.includes("chemical")) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31" />
            <path d="M14 9.3V1.99" />
            <path d="M8.5 2h7" />
            <path d="M14 9.3a6 6 0 1 1-4 0" />
          </svg>
        </div>
      );
    }
    
    // Equipment category
    if (category.includes("equipment") || category.includes("tool")) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-950/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
      );
    }
    
    // Labor category - updated with the new worker icon
    if (category.includes("labor") || category.includes("service")) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-950/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <polyline points="16 16 18 18 22 14" />
          </svg>
        </div>
      );
    }
    
    // Default icon for unknown categories
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
    );
  }

  // Function to extract descriptive part from SKU names
  function extractDescriptiveName(sku: string): string {
    // Remove SKU prefix pattern (like P4013225, S0552225, etc.)
    // This pattern matches:
    // - Leading letter(s) followed by digits, OR
    // - Just leading digits
    // - Followed by optional hyphen or space
    return sku.replace(/^[A-Z]+\d+[-\s]?|^\d+[-\s]?/, "").trim()
  }

  // Render card view SKU items
  function renderCardItems() {
    if (cardLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse bg-slate-800/50 p-3 rounded-lg">
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

    if (cardData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-slate-400">No data available for the selected filters</p>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {cardData.map((item) => {
          const descriptiveName = extractDescriptiveName(item.sku)
          
          return (
            <a
              key={item.sku}
              href={`/invoices?sku=${encodeURIComponent(item.sku)}${cardLocation && cardLocation !== 'All Locations' ? `&location=${encodeURIComponent(cardLocation)}` : ''}${cardCategory && cardCategory !== 'All Categories' ? `&category=${encodeURIComponent(cardCategory)}` : ''}${dateFrom ? `&dateFrom=${encodeURIComponent(dateFrom)}` : ''}${dateTo ? `&dateTo=${encodeURIComponent(dateTo)}` : ''}`}
              className="flex items-center gap-3 group bg-slate-800/50 rounded-lg transition-colors hover:bg-emerald-950/20 focus:bg-emerald-950/30 outline-none no-underline p-3"
              title={`${item.sku}${item.category ? ` - ${item.category}` : ''}`}
              tabIndex={0}
            >
              {getCategoryIcon(item)}
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium text-emerald-400 group-hover:underline group-hover:text-emerald-300 transition-colors cursor-pointer truncate">
                  {descriptiveName}
                </div>
                <div className="w-full bg-slate-700 rounded-md h-2.5 mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-md transition-all duration-300"
                    style={{ width: `${(item.total / cardMaxTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-400 whitespace-nowrap">{formatCurrency(item.total)}</div>
            </a>
          )
        })}
      </div>
    )
  }

  // Render dialog view SKU items
  function renderDialogItems() {
    if (dialogLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse bg-slate-800/50 p-3 rounded-lg">
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

    if (dialogData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-slate-400">No data available for the selected filters</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {dialogData.map((item) => {
          const descriptiveName = extractDescriptiveName(item.sku)

          return (
            <a
              key={item.sku}
              href={`/invoices?sku=${encodeURIComponent(item.sku)}${dialogLocation && dialogLocation !== 'All Locations' ? `&location=${encodeURIComponent(dialogLocation)}` : ''}${dialogCategory && dialogCategory !== 'All Categories' ? `&category=${encodeURIComponent(dialogCategory)}` : ''}${dateFrom ? `&dateFrom=${encodeURIComponent(dateFrom)}` : ''}${dateTo ? `&dateTo=${encodeURIComponent(dateTo)}` : ''}`}
              className="flex items-center gap-3 group bg-slate-800/50 rounded-lg transition-colors hover:bg-emerald-950/20 focus:bg-emerald-950/30 outline-none no-underline p-3"
              title={`${item.sku}${item.category ? ` - ${item.category}` : ''}`}
              tabIndex={0}
            >
              {getCategoryIcon(item)}
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium text-emerald-400 group-hover:underline group-hover:text-emerald-300 transition-colors cursor-pointer truncate">
                  {descriptiveName}
                </div>
                <div className="w-full bg-slate-700 rounded-md h-2.5 mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-md transition-all duration-300"
                    style={{ width: `${(item.total / dialogMaxTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-lg font-bold text-emerald-400 whitespace-nowrap">{formatCurrency(item.total)}</div>
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <>
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
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2">
          <div className="space-y-4">
            <div className="w-full flex flex-col md:flex-row gap-2 mb-2">
              <Select value={cardLocation} onValueChange={setCardLocation}>
                <SelectTrigger className="w-full md:w-64 bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cardCategory} onValueChange={setCardCategory}>
                <SelectTrigger className="w-full md:w-64 bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-y-auto pr-2 max-h-[500px]">{renderCardItems()}</div>

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

      {/* Full-screen dialog for expanded view */}
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-full sm:max-w-[100vw] md:max-w-[90vw] lg:max-w-[80vw] max-h-[100vh] sm:max-h-[90vh] p-0 overflow-hidden bg-[#0f172a] border-slate-700 text-white">
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
            <p className="text-sm text-slate-400 mt-1">
              Showing all {dialogLoading ? "..." : dialogData.length} SKUs by spend
            </p>
          </DialogHeader>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Select value={dialogLocation} onValueChange={setDialogLocation}>
                  <SelectTrigger className="w-full sm:w-64 bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dialogCategory} onValueChange={setDialogCategory}>
                  <SelectTrigger className="w-full sm:w-64 bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-y-auto pr-2 pb-4" style={{ maxHeight: "calc(100vh - 180px)" }}>
                {renderDialogItems()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
