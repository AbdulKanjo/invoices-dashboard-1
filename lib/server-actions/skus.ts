"use server"

import { supabase } from "@/lib/supabase"
import { log } from "@/lib/logger"
import type { CategoryFilter, DateRangeFilter, LocationFilter } from "./types"

/**
 * Fetches all unique SKUs
 */
export async function fetchAllSkus() {
  try {
    const { data, error } = await supabase
      .from("invoice_lines")
      .select("sku, description, category")
      .not("category", "ilike", "%ignore%") // Filter out ignore categories

    if (error) {
      console.error("Error fetching SKUs:", error)
      throw new Error("Failed to fetch SKUs")
    }

    // Filter for unique SKUs in JavaScript and handle null descriptions
    const skuMap = new Map()
    data.forEach((item) => {
      if (!skuMap.has(item.sku)) {
        // Set a default description if it's null or undefined
        skuMap.set(item.sku, {
          description: item.description || "No description",
          category: item.category || "Other",
        })
      }
    })

    return Array.from(skuMap.entries()).map(([sku, info]) => ({
      sku,
      description: info.description,
      category: info.category,
    }))
  } catch (error) {
    console.error("Error in fetchAllSkus:", error)
    return []
  }
}

/**
 * Fetches top SKUs by spend
 */
export async function fetchTopSkusBySpend({
  dateFrom,
  dateTo,
  location,
  category,
  limit = 100,
  _t, // Timestamp for cache busting
}: DateRangeFilter & LocationFilter & CategoryFilter & { limit?: number; _t?: number } = {}) {
  // Fetch top SKUs by spend with limit and filters
  log(`fetchTopSkusBySpend called with filters:`, { dateFrom, dateTo, location, category, limit, _t })
  
  try {
    // Validate required filters - early return if we don't have date range
    if (!dateFrom || !dateTo) {
      log("Missing required date filters, returning empty result")
      return []
    }
    
    // First, get all invoices with filters - only query what we need
    let invoiceQuery = supabase.from("invoices").select("id")

    // Apply date filters
    invoiceQuery = invoiceQuery.gte("invoice_date", dateFrom)
    invoiceQuery = invoiceQuery.lte("invoice_date", dateTo)

    // Apply location filter if provided
    if (location) {
      log(`Applying location filter: ${location}`)
      // First try exact match
      invoiceQuery = invoiceQuery.eq("location", location)
    }

    const { data: invoices, error: invoiceError } = await invoiceQuery

    if (invoiceError) {
      console.error("Error fetching invoices:", invoiceError)
      throw new Error("Failed to fetch top SKUs by spend")
    }

    // Early return if no invoices match the filters
    const invoiceIds = invoices.map((invoice) => invoice.id)
    log(`Found ${invoiceIds.length} invoices matching filters`)
    
    if (invoiceIds.length === 0) {
      return [] // No invoices found, return empty result
    }

    // Optimize query for invoice lines by batching if needed
    const batchSize = 100 // Reasonable batch size for IN clause
    let allLines: any[] = []
    
    // Process invoices in batches if there are many
    if (invoiceIds.length > batchSize) {
      log(`Processing ${invoiceIds.length} invoices in batches`)
      
      for (let i = 0; i < invoiceIds.length; i += batchSize) {
        const batchIds = invoiceIds.slice(i, i + batchSize)
        let batchQuery = supabase
          .from("invoice_lines")
          .select("sku, description, category, line_total")
          .in("invoice_id", batchIds)
          .not("category", "ilike", "%ignore%") // Filter out ignore categories

        if (category) {
          batchQuery = batchQuery.eq("category", category)
        }

        const { data: batchLines, error: batchError } = await batchQuery
        
        if (batchError) {
          console.error(`Error fetching batch ${i/batchSize + 1}:`, batchError)
          continue // Skip this batch but continue processing others
        }
        
        allLines = [...allLines, ...batchLines]
      }
    } else {
      // Process all invoices in one query
      let linesQuery = supabase
        .from("invoice_lines")
        .select("sku, description, category, line_total")
        .in("invoice_id", invoiceIds)
        .not("category", "ilike", "%ignore%") // Filter out ignore categories

      if (category) {
        log(`Applying category filter: ${category}`)
        linesQuery = linesQuery.eq("category", category)
      }

      const { data: lines, error: linesError } = await linesQuery

      if (linesError) {
        console.error("Error fetching invoice lines:", linesError)
        throw new Error("Failed to fetch top SKUs by spend")
      }
      
      allLines = lines || []
    }
    
    log(`Found ${allLines.length} invoice lines across all invoices`)
    
    // Group by SKU - use a Map for better performance with large datasets
    const skuSpend = new Map<string, { sku: string; description: string; category: string; total: number }>()

    allLines.forEach((line) => {
      const key = line.sku
      if (!skuSpend.has(key)) {
        skuSpend.set(key, {
          sku: line.sku,
          description: line.description || "No description",
          category: line.category || "Unknown",
          total: 0,
        })
      }
      const item = skuSpend.get(key)!
      item.total += line.line_total
    })

    // Convert to array and sort by total spend
    const result = Array.from(skuSpend.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
    
    log(`Returning ${result.length} top SKUs by spend`)
    return result
  } catch (error) {
    console.error("Error in fetchTopSkusBySpend:", error)
    return []
  }
}

/**
 * Fetches all locations
 */
export async function fetchAllLocations() {
  try {
    const { data, error } = await supabase.from("invoices").select("location")

    if (error) {
      console.error("Error fetching locations:", error)
      throw new Error("Failed to fetch locations")
    }

    // Filter for unique locations in JavaScript
    const uniqueLocations = [...new Set(data.map((item) => item.location).filter(Boolean))]
    return uniqueLocations.sort()
  } catch (error) {
    console.error("Error in fetchAllLocations:", error)
    return []
  }
}

/**
 * Fetches all categories
 */
export async function fetchAllCategories() {
  try {
    const { data, error } = await supabase.from("invoice_lines").select("category").not("category", "ilike", "%ignore%")

    if (error) {
      console.error("Error fetching categories:", error)
      throw new Error("Failed to fetch categories")
    }

    // Filter for unique categories in JavaScript
    const uniqueCategories = [...new Set(data.map((item) => item.category).filter(Boolean))]
    return uniqueCategories.sort()
  } catch (error) {
    console.error("Error in fetchAllCategories:", error)
    return []
  }
}

/**
 * Fetches SKU replenishment cadence data
 */
export async function fetchSkuReplenishmentCadence({
  dateFrom,
  dateTo,
  location,
  category,
}: DateRangeFilter & LocationFilter & CategoryFilter = {}) {
  try {
    // First, get all invoices with filters
    let invoiceQuery = supabase.from("invoices").select("id, location, invoice_date")

    if (dateFrom) {
      invoiceQuery = invoiceQuery.gte("invoice_date", dateFrom)
    }

    if (dateTo) {
      invoiceQuery = invoiceQuery.lte("invoice_date", dateTo)
    }

    if (location && location !== "All Locations") {
      invoiceQuery = invoiceQuery.eq("location", location)
    }

    const { data: invoices, error: invoiceError } = await invoiceQuery

    if (invoiceError) {
      console.error("Error fetching invoices:", invoiceError)
      throw new Error("Failed to fetch SKU replenishment cadence")
    }

    // Get all invoice lines for these invoices
    const invoiceIds = invoices.map((invoice) => invoice.id)

    if (invoiceIds.length === 0) {
      return [] // No invoices found, return empty result
    }

    let linesQuery = supabase
      .from("invoice_lines")
      .select("invoice_id, sku, description, category, created_at")
      .in("invoice_id", invoiceIds)
      .not("category", "ilike", "%ignore%") // Filter out ignore categories

    if (category && category !== "All Categories") {
      linesQuery = linesQuery.eq("category", category)
    }

    const { data: lines, error: linesError } = await linesQuery

    if (linesError) {
      console.error("Error fetching invoice lines:", linesError)
      throw new Error("Failed to fetch SKU replenishment cadence")
    }

    // Group by SKU
    const skuData: Record<string, { sku: string; description: string; purchaseDates: Date[]; purchaseCount: number }> =
      {}

    lines.forEach((line) => {
      const sku = line.sku
      const createdAt = new Date(line.created_at)

      if (!skuData[sku]) {
        skuData[sku] = {
          sku: sku,
          description: line.description || "No description",
          purchaseDates: [createdAt],
          purchaseCount: 1,
        }
      } else {
        skuData[sku].purchaseDates.push(createdAt)
        skuData[sku].purchaseCount++
      }
    })

    // Calculate average days between purchases
    const result = Object.values(skuData).map((item) => {
      item.purchaseDates.sort((a, b) => a.getTime() - b.getTime())

      let totalDaysBetween = 0
      for (let i = 1; i < item.purchaseDates.length; i++) {
        totalDaysBetween += (item.purchaseDates[i].getTime() - item.purchaseDates[i - 1].getTime()) / (1000 * 3600 * 24)
      }

      const avgDaysBetween = item.purchaseCount > 1 ? totalDaysBetween / (item.purchaseCount - 1) : null

      return {
        sku: item.sku,
        description: item.description,
        avgDaysBetween: avgDaysBetween,
        purchaseCount: item.purchaseCount,
      }
    })

    return result
  } catch (error) {
    console.error("Error in fetchSkuReplenishmentCadence:", error)
    return []
  }
}
