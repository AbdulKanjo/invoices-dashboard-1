"use server"

import { supabase } from "@/lib/supabase"
import { applyDateFilter, getIgnoreInvoiceIds } from "./utils"
import { safeSupabaseRequest } from "@/lib/supabase-utils"

/**
 * Fetches all unique locations
 */
export async function fetchAllLocations() {
  try {
    // Use our safe request utility with caching and retries
    const data = await safeSupabaseRequest<any[]>("all-locations", () => supabase.from("invoices").select("location"), {
      fallbackData: [{ location: "Location 1" }, { location: "Location 2" }, { location: "Location 3" }],
    })

    // Filter for unique locations in JavaScript
    const uniqueLocations = [...new Set(data.map((item) => item.location).filter(Boolean))]
    return uniqueLocations.sort()
  } catch (error) {
    console.error("Error in fetchAllLocations:", error)
    // Return default locations if all else fails
    return ["Location 1", "Location 2", "Location 3"]
  }
}

/**
 * Fetches location data for visualization
 */
export async function fetchLocationData() {
  try {
    // Mock data for demonstration purposes
    const data = [
      { location: "Eastlake", x: 50, y: 30, z: 2000 },
      { location: "Westside", x: 70, y: 50, z: 1500 },
      { location: "Northtown", x: 30, y: 80, z: 1800 },
    ]

    return data
  } catch (error) {
    console.error("Error in fetchLocationData:", error)
    return []
  }
}

/**
 * Fetches cost per location
 */
export async function fetchCostPerLocation() {
  try {
    // First, get all invoices
    const invoices = await safeSupabaseRequest<any[]>(
      "cost-per-location-invoices",
      () => supabase.from("invoices").select("id, location"),
      {
        fallbackData: [],
      },
    )

    if (invoices.length === 0) {
      return []
    }

    // Get all invoice IDs
    const invoiceIds = invoices.map((invoice) => invoice.id)

    // Get ignore invoice IDs
    const ignoreInvoiceIds = await getIgnoreInvoiceIds(invoiceIds)

    // Filter out invoices that have "ignore" category lines
    const filteredInvoices = invoices.filter((invoice) => !ignoreInvoiceIds.has(invoice.id))

    // Count locations
    const locationCounts: { [location: string]: number } = {}

    filteredInvoices.forEach((invoice) => {
      locationCounts[invoice.location] = (locationCounts[invoice.location] || 0) + 1
    })

    const data = Object.entries(locationCounts).map(([name, value]) => ({ name, value }))

    return data
  } catch (error) {
    console.error("Error in fetchCostPerLocation:", error)
    return []
  }
}

/**
 * Fetches monthly costs by location
 */
export async function fetchMonthlyLocationCosts() {
  try {
    // Mock data for demonstration purposes
    const data = [
      { month: "2024-01", Eastlake: 1200, Westside: 800 },
      { month: "2024-02", Eastlake: 1500, Westside: 900 },
      { month: "2024-03", Eastlake: 1300, Westside: 1000 },
      { month: "2024-04", Eastlake: 1600, Westside: 1100 },
      { month: "2024-05", Eastlake: 1400, Westside: 1200 },
    ]

    return data
  } catch (error) {
    console.error("Error in fetchMonthlyLocationCosts:", error)
    return []
  }
}

function applyLocationFilter(query: any, locations?: string[]) {
  if (locations && locations.length > 0) {
    query = query.in("location", locations)
  }
  return query
}

/**
 * Fetches location-category heatmap data
 */
export async function fetchLocationCategoryHeatMap({
  dateFrom,
  dateTo,
  locations: filterLocations,
  categories: filterCategories,
}: {
  dateFrom?: string
  dateTo?: string
  locations?: string[]
  categories?: string[]
} = {}) {
  try {
    // First, get all invoices with date filtering
    let invoiceQuery = supabase.from("invoices").select("id, location, invoice_date")

    invoiceQuery = applyDateFilter(invoiceQuery, dateFrom, dateTo)
    invoiceQuery = applyLocationFilter(invoiceQuery, filterLocations)

    const invoices = await safeSupabaseRequest<any[]>(
      `location-heatmap-invoices-${dateFrom}-${dateTo}-${filterLocations?.join(",")}`,
      () => invoiceQuery,
      { fallbackData: [] },
    )

    // Get all invoice lines for these invoices
    const invoiceIds = invoices.map((invoice) => invoice.id)

    if (invoiceIds.length === 0) {
      return { locations: [], categories: [], data: [] } // No invoices found, return empty result
    }

    let linesQuery = supabase
      .from("invoice_lines")
      .select("invoice_id, category, line_total")
      .in("invoice_id", invoiceIds)
      .not("category", "ilike", "%ignore%") // Filter out ignore categories

    // Apply category filter if provided
    if (filterCategories && filterCategories.length > 0) {
      linesQuery = linesQuery.in("category", filterCategories)
    }

    const lines = await safeSupabaseRequest<any[]>(
      `location-heatmap-lines-${invoiceIds.join(",")}-${filterCategories?.join(",")}`,
      () => linesQuery,
      { fallbackData: [] },
    )

    // Create a map of invoice_id to location for easy lookup
    const invoiceLocationMap = invoices.reduce(
      (map, invoice) => {
        map[invoice.id] = invoice.location
        return map
      },
      {} as Record<string, string>,
    )

    // Get unique locations and categories
    const locations = [...new Set(invoices.map((invoice) => invoice.location))].sort()
    const categories = [...new Set(lines.map((line) => line.category))].sort()

    // Group by location and category
    const locationCategorySpend: Record<string, Record<string, number>> = {}

    // Initialize all location-category combinations to 0
    locations.forEach((location) => {
      locationCategorySpend[location] = {}
      categories.forEach((category) => {
        locationCategorySpend[location][category] = 0
      })
    })

    // Sum up the line_total for each location-category combination
    lines.forEach((line) => {
      const location = invoiceLocationMap[line.invoice_id]
      if (location && locationCategorySpend[location]) {
        if (!locationCategorySpend[location][line.category]) {
          locationCategorySpend[location][line.category] = 0
        }
        locationCategorySpend[location][line.category] += line.line_total
      }
    })

    // Convert to array format for the heatmap
    const heatMapData = Object.entries(locationCategorySpend).map(([location, categories]) => ({
      location,
      ...categories,
    }))

    return {
      locations,
      categories,
      data: heatMapData,
    }
  } catch (error) {
    console.error("Error in fetchLocationCategoryHeatMap:", error)
    return { locations: [], categories: [], data: [] }
  }
}
