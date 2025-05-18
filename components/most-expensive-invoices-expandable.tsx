"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ExpandableComponent } from "@/components/expandable-component"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { log } from "@/lib/logger"
import { fetchAllLocations, fetchAllCategories } from "@/lib/server-actions"

interface MostExpensiveInvoicesExpandableProps {
  dateFrom?: string
  dateTo?: string
  locations?: string[]
  categories?: string[]
}

export function MostExpensiveInvoicesExpandable({
  dateFrom,
  dateTo,
  locations,
  categories,
}: MostExpensiveInvoicesExpandableProps) {
  const [data, setData] = useState<
    Array<{
      id: string
      invoice_date: string
      invoice_number: string
      source: string
      location: string
      invoice_total: number
      pdf_url?: string
    }>
  >([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // Load locations & categories
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [locationsData, categoriesData] = await Promise.all([
          fetchAllLocations(),
          fetchAllCategories(),
        ])
        setAvailableLocations(["All Locations", ...locationsData])
        setAvailableCategories(["All Categories", ...categoriesData])
      } catch (error) {
        console.error("Error loading filter options:", error)
      }
    }

    loadFilterOptions()
  }, [])

  // Load invoice data with filters
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Prepare location and category filters to match how TopSkusBySpend works
        // If 'All Locations' is selected, pass undefined instead of an array
        const locationFilter = selectedLocation && selectedLocation !== "All Locations" ? selectedLocation : undefined
        // Same for category - pass a single string or undefined, not an array
        const categoryFilter = selectedCategory && selectedCategory !== "All Categories" ? selectedCategory : undefined
        
        log("Sending filters to API:", {
          dateFrom,
          dateTo,
          location: locationFilter,
          category: categoryFilter
        });
        
        // Fetch data from the API route instead of directly calling the server action
        const response = await fetch('/api/invoices/most-expensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateFrom,
            dateTo,
            location: locationFilter,  // Use the singular form to match the server
            category: categoryFilter,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const invoicesData = await response.json();
        log("Received invoices data:", invoicesData.length);
        setData(invoicesData)
      } catch (error) {
        console.error("Error loading most expensive invoices:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dateFrom, dateTo, locations, categories, selectedLocation, selectedCategory])

  return (
    <ExpandableComponent title="Most Expensive Invoices" description="Top invoices by total amount">
      {/* Filter controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 text-slate-200">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            {availableLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
          
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 text-slate-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
        
      
      {loading ? (
        <div className="grid h-full w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="min-h-48 h-48 animate-pulse bg-gray-900 rounded-lg" />
          ))}
        </div>
      ) : data.length > 0 ? (
        <div className="grid h-full w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-auto">
          {data.map((invoice) => (
            invoice.pdf_url ? (
              <a
                key={invoice.id}
                href={invoice.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer flex-col rounded-lg border border-slate-700 bg-[#0f172a] p-3 transition-colors hover:bg-slate-800 no-underline w-full h-full"
                style={{ display: 'block' }}
                title="View PDF"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{formatDate(invoice.invoice_date)}</span>
                  <span className="rounded-full bg-emerald-950/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    {invoice.invoice_number || "N/A"}
                  </span>
                </div>
                <div className="mb-1 text-sm font-medium text-white truncate">{invoice.source}</div>
                <div className="text-xs text-slate-400 truncate">{invoice.location}</div>
                <div className="mt-auto pt-2 text-base font-bold text-emerald-400">
                  {formatCurrency(invoice.invoice_total)}
                </div>
              </a>
            ) : (
              <div
                key={invoice.id}
                className="flex flex-col rounded-lg border border-slate-700 bg-[#0f172a] p-3 opacity-60 cursor-not-allowed"
                title="No PDF available"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{formatDate(invoice.invoice_date)}</span>
                  <span className="rounded-full bg-emerald-950/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    {invoice.invoice_number || "N/A"}
                  </span>
                </div>
                <div className="mb-1 text-sm font-medium text-white truncate">{invoice.source}</div>
                <div className="text-xs text-slate-400 truncate">{invoice.location}</div>
                <div className="mt-auto pt-2 text-base font-bold text-emerald-400">
                  {formatCurrency(invoice.invoice_total)}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-slate-400">
          No invoices found matching your filter criteria.
        </div>
      )}
    </ExpandableComponent>
  )
}
