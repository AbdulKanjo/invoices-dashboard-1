"use server"

import { supabase } from "@/lib/supabase"
import { applyDateFilter } from "./utils"

/**
 * Applies location filter to the query.
 */
function applyLocationFilter(query: any, locations?: string[]) {
  if (locations && locations.length > 0) {
    query = query.in("location", locations)
  }
  return query
}

/**
 * Fetches dashboard statistics
 */
export async function fetchDashboardStats({
  dateFrom,
  dateTo,
  locations,
  categories,
}: {
  dateFrom?: string
  dateTo?: string
  locations?: string[]
  categories?: string[]
} = {}) {
  // Fetch invoices with date filtering
  let invoiceQuery = supabase.from("invoices").select("id, invoice_total, invoice_date, location")

  invoiceQuery = applyDateFilter(invoiceQuery, dateFrom, dateTo)
  invoiceQuery = applyLocationFilter(invoiceQuery, locations)

  const { data: invoices, error: invoiceError } = await invoiceQuery

  if (invoiceError) {
    console.error("Error fetching invoices:", invoiceError)
    throw new Error("Failed to fetch dashboard stats")
  }

  // Get invoice IDs for fetching lines
  const invoiceIds = invoices.map((invoice) => invoice.id)

  // If no invoices found, return empty data
  if (invoiceIds.length === 0) {
    // No invoices found, return empty data
    return {
      totalExpenses: 0,
      expensesByCategory: {},
      expensesByLocation: {},
    }
  }

  // Fetch invoice lines for these invoices, excluding "ignore" category
  let linesQuery = supabase
    .from("invoice_lines")
    .select("invoice_id, category, line_total")
    .in("invoice_id", invoiceIds)
    .not("category", "ilike", "%ignore%") // Filter out ignore categories

  // Apply category filter if provided
  if (categories && categories.length > 0) {
    linesQuery = linesQuery.in("category", categories)
  }

  const { data: lines, error: linesError } = await linesQuery

  if (linesError) {
    console.error("Error fetching invoice lines:", linesError)
    throw new Error("Failed to fetch dashboard stats")
  }

  // Group lines by invoice_id to calculate adjusted invoice totals
  const linesByInvoiceId = lines.reduce(
    (acc, line) => {
      if (!acc[line.invoice_id]) {
        acc[line.invoice_id] = 0
      }
      acc[line.invoice_id] += line.line_total
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate total expenses excluding "Ignore" categories
  const totalExpenses = Object.values(linesByInvoiceId).reduce((sum, total) => sum + total, 0)

  // Calculate expenses by category (excluding "Ignore" categories)
  const expensesByCategory = lines.reduce(
    (acc, line) => {
      if (!line.category) return acc

      const category = line.category.trim()
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += line.line_total
      return acc
    },
    {} as Record<string, number>,
  )

  // Get expenses by location (we need to recalculate based on filtered lines)
  const { data: locationData, error: locationError } = await supabase
    .from("invoices")
    .select("id, location")
    .in("id", invoiceIds)

  if (locationError) {
    console.error("Error fetching location data:", locationError)
    throw new Error("Failed to fetch location data")
  }

  // Create a map of invoice_id to location
  const invoiceLocationMap = locationData.reduce(
    (acc, invoice) => {
      acc[invoice.id] = invoice.location
      return acc
    },
    {} as Record<string, string>,
  )

  // Calculate expenses by location using filtered lines
  const expensesByLocation = lines.reduce(
    (acc, line) => {
      const location = invoiceLocationMap[line.invoice_id]
      if (!location) return acc

      if (!acc[location]) {
        acc[location] = 0
      }
      acc[location] += line.line_total
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalExpenses,
    expensesByCategory,
    expensesByLocation,
  }
}

/**
 * Fetches monthly trends data
 */
export async function fetchMonthlyTrends() {
  try {
    // Mock data for demonstration purposes
    const data = [
      { month: "2024-01", chemical: 1200, equipment: 800 },
      { month: "2024-02", chemical: 1500, equipment: 900 },
      { month: "2024-03", chemical: 1300, equipment: 1000 },
      { month: "2024-04", chemical: 1600, equipment: 1100 },
      { month: "2024-05", chemical: 1400, equipment: 1200 },
    ]

    return data
  } catch (error) {
    console.error("Error in fetchMonthlyTrends:", error)
    return []
  }
}
