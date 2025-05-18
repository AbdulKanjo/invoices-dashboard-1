"use client"

import { useState, useEffect } from "react"
import { CalendarRange, Download, MapPin, Tag, Columns } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { exportInvoices, fetchAllLocations, fetchAllCategories } from "@/lib/server-actions"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TABLE_COLUMNS, useColumnVisibility } from "@/context/column-visibility-context"

// Using TABLE_COLUMNS from context

export function InvoicesHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use the column visibility context
  const { visibleColumns, toggleColumnVisibility, toggleAllColumns } = useColumnVisibility();
  
  // Calculate actual Month-to-Date dates based on current date
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const mtdFromDate = format(firstDayOfMonth, "yyyy-MM-dd");
  const mtdToDate = format(today, "yyyy-MM-dd");
  
  // Use URL parameters if available, otherwise use Month-to-Date defaults
  let defaultFrom = searchParams.get('dateFrom') || searchParams.get('from') || mtdFromDate;
  let defaultTo = searchParams.get('dateTo') || searchParams.get('to') || mtdToDate;
  let defaultLocation = searchParams.get('location') || '';
  let defaultCategory = searchParams.get('category') || '';
  
  const [exporting, setExporting] = useState(false)
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(defaultLocation);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  
  // Pagination limit state - default to 50 if not in URL
  const defaultLimit = searchParams.get('limit') || '50';
  const [selectedLimit, setSelectedLimit] = useState<string>(defaultLimit);  
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
  
  // Update URL when filters change
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "All Locations" && value !== "All Categories") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Add timestamp to force data refresh
    params.set("_t", Date.now().toString());
    
    router.push(`/invoices?${params.toString()}`);
  }
  
  // Initialize with Month-to-Date if no date filters are in URL
  useEffect(() => {
    // Only run this on initial load when both date params are missing
    if (!searchParams.has('dateFrom') && !searchParams.has('from') && 
        !searchParams.has('dateTo') && !searchParams.has('to')) {
      console.log('No date params found, initializing with MTD dates');
      
      // Use a small timeout to ensure this runs after initial render
      // This prevents the race condition where data loads with empty params first
      setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('dateFrom', mtdFromDate);
        params.set('dateTo', mtdToDate);
        params.set('_t', Date.now().toString());
        console.log('Setting initial date params:', mtdFromDate, 'to', mtdToDate);
        router.push(`/invoices?${params.toString()}`);
      }, 100);
    }
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true)
      
      // Use all the currently applied filters for export
      const filters = {
        location: selectedLocation !== 'All Locations' ? selectedLocation : '',
        category: selectedCategory !== 'All Categories' ? selectedCategory : '',
        dateFrom: searchParams.get('dateFrom') || mtdFromDate,
        dateTo: searchParams.get('dateTo') || mtdToDate,
        limit: selectedLimit || '50'
      };
      
      console.log('Exporting invoices with filters:', filters);
      const data = await exportInvoices(filters)

      // Convert data to CSV
      const headers = Object.keys(data[0]).join(",")
      const rows = data.map((row) => Object.values(row).join(","))
      const csv = [headers, ...rows].join("\n")

      // Create and download the file
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wash-masters-invoices-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting invoices:", error)
    } finally {
      setExporting(false)
    }
  }

  console.log('Date range in InvoicesHeader:', { defaultFrom, defaultTo, searchParams: Object.fromEntries([...searchParams.entries()]) });
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="text-sm text-slate-400">View and filter all your vendor invoices</p>
        </div>
      </div>
      
      {/* Consistent filter layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Date picker */}
        <div className="md:col-span-1 h-10">
          <div className="flex items-center h-full">
            <CalendarRange className="h-4 w-4 text-slate-400 mr-2" />
            <div className="w-full">
              <DateRangePicker 
                defaultFrom={defaultFrom}
                defaultTo={defaultTo}
                onApply={(range) => {
                  if (range.from && range.to) {
                    // Format the dates for URL parameters
                    const fromStr = format(range.from, "yyyy-MM-dd");
                    const toStr = format(range.to, "yyyy-MM-dd");
                    
                    // Update URL with new date range
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('dateFrom', fromStr);
                    params.set('dateTo', toStr);
                    params.set('_t', Date.now().toString());
                
                console.log("Applying new date range:", fromStr, "to", toStr);
                router.push(`/invoices?${params.toString()}`);
              }
            }}
          />
            </div>
          </div>
        </div>
        
        {/* Location filter */}
        <div className="md:col-span-1 h-10">
          <div className="flex items-center h-full">
            <MapPin className="h-4 w-4 text-slate-400 mr-2" />
            <Select 
              value={selectedLocation} 
              onValueChange={(value) => {
                setSelectedLocation(value);
                updateFilters('location', value);
              }}
            >
              <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 h-10">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location} className="text-sm">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Category filter */}
        <div className="md:col-span-1 h-10">
          <div className="flex items-center h-full">
            <Tag className="h-4 w-4 text-slate-400 mr-2" />
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                setSelectedCategory(value);
                updateFilters('category', value);
              }}
            >
              <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-sm">
                  <div className="flex items-center gap-2">
                    {category && category.toLowerCase().includes('chemical') && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 2v7.31" />
                        <path d="M14 9.3V1.99" />
                        <path d="M8.5 2h7" />
                        <path d="M14 9.3a6 6 0 1 1-4 0" />
                      </svg>
                    )}
                    {category && category.toLowerCase().includes('equipment') && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    )}
                    {category && category.toLowerCase().includes('labor') && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <polyline points="16 16 18 18 22 14" /> {/* Adding a work checkmark gesture */}
                      </svg>
                    )}
                    {category && (
                      !category.toLowerCase().includes('chemical') && 
                      !category.toLowerCase().includes('equipment') && 
                      !category.toLowerCase().includes('labor') && 
                      category !== 'All Categories') && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    )}
                    {category === 'All Categories' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                      </svg>
                    )}
                    {category}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
        
        {/* Limit selector */}
        <div className="md:col-span-1 h-10">
          <div className="flex items-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400 mr-2">
              <line x1="6" y1="6" x2="18" y2="6"></line>
              <line x1="6" y1="12" x2="14" y2="12"></line>
              <line x1="6" y1="18" x2="10" y2="18"></line>
            </svg>
            <Select 
              value={selectedLimit} 
              onValueChange={(value) => {
                setSelectedLimit(value);
                updateFilters('limit', value);
              }}
            >
              <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 h-10">
                <SelectValue placeholder="Max 50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50" className="text-sm">Max 50</SelectItem>
                <SelectItem value="60" className="text-sm">Max 60</SelectItem>
                <SelectItem value="80" className="text-sm">Max 80</SelectItem>
                <SelectItem value="100" className="text-sm">Max 100</SelectItem>
                <SelectItem value="1000" className="text-sm">Max 1000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
    {/* Controls row - Export button and column selector */}
<div className="col-span-1 md:col-span-4 flex flex-col sm:flex-row justify-center md:justify-end gap-2">
  {/* Column visibility toggle */}
  <div className="md:col-span-1 h-10 w-full sm:w-[163px]">
    <div className="flex items-center h-full">
      <Columns className="h-4 w-4 text-slate-400 mr-2" />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="bg-slate-800 border border-slate-700 rounded-md w-full h-10 text-slate-200 hover:bg-slate-700 hover:text-white flex justify-between">
            <span>Columns</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" aria-hidden="true"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 bg-slate-900 border-slate-700">
          <div className="space-y-2 p-2">
            <div className="text-sm font-medium text-slate-200 mb-4 flex items-center justify-between">
              <span>Toggle Columns</span>
              <div className="flex items-center">
                <Checkbox 
                  id="selectAll" 
                  checked={visibleColumns.length === TABLE_COLUMNS.length} 
                  onCheckedChange={(checked) => toggleAllColumns(!!checked)}
                  className="mr-2 border-slate-700"
                />
                <Label htmlFor="selectAll" className="text-sm text-slate-300">Select All</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {TABLE_COLUMNS.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`col-${column.id}`} 
                    checked={visibleColumns.includes(column.id)}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                    className="border-slate-700"
                  />
                  <Label 
                    htmlFor={`col-${column.id}`}
                    className="text-sm text-slate-300"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
  
  {/* Export button */}
  <div className="md:col-span-1 h-10 w-full sm:w-[163px]">
    <div className="flex items-center h-full">
      <Download className="h-4 w-4 text-slate-400 mr-2" />
      <Button
        variant="ghost"
        className="bg-slate-800 border border-slate-700 rounded-md w-full h-10 text-slate-200 hover:bg-slate-700 hover:text-white flex justify-between"
        onClick={handleExport}
        disabled={exporting}
      >
        <span>{exporting ? "Exporting..." : "Export"}</span>
        {exporting ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
        ) : (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" aria-hidden="true"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        )}
      </Button>
    </div>
  </div>
</div>
{/* Close the grid container */}
</div>
{/* Close the main flex container */}
</div>
);
}
